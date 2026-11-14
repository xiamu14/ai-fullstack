"""Deterministic checks for outbound request data."""
import ipaddress
from collections import OrderedDict
import hashlib
import base64
import binascii
import json
import os
import re
from urllib.parse import unquote

import httpx2

from integrations.network import NetworkDenied, origin

MAX_PAYLOAD = 1024 * 1024
SECRET_FIELD = re.compile(
    r'(?i)(?:\b(?:api[_-]?key|access[_-]?token|token|password|secret|authorization|cookie)\b)'
    r'["\s]*[:=]\s*["\']?[^\s"\'&,;}]+'
)
SECRET_VALUE = re.compile(
    r'-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----|\b(?:gh[pousr]_[A-Za-z0-9]{20,}'
    r'|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9_-]{20,}|AKIA[A-Z0-9]{16}'
    r'|eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,})\b'
)
ENCODED = re.compile(r'(?<![A-Za-z0-9_/-])[A-Za-z0-9_/-]{24,}={0,2}(?![A-Za-z0-9_/-])')
SENSITIVE_PATH = re.compile(r'(?:^|[/\s])(?:\.env(?:[./\s?&]|$)|\.ssh(?:/|$)|\.aws(?:/|$))')
SCANNER_VERSION = "5"
MAX_SCANNED = 4096
MODEL_BINARY = re.compile(rb'data:[^"\s]+;base64,|"kind":"binary(?:-content)?"')
_SCANNED: OrderedDict[tuple, None] = OrderedDict()


def check_content(value: str | bytes, *, protect_paths=True, max_bytes=MAX_PAYLOAD, forbid_binary=False) -> None:
    if isinstance(value, str):
        value = value.encode()
    if len(value) > max_bytes:
        raise NetworkDenied("请求超出外发检查预算")
    secrets = tuple(sorted(secret for key, secret in os.environ.items()
                           if len(secret) >= 8 and re.search(r"KEY|TOKEN|PASSWORD|SECRET", key, re.I)))
    credential_version = hashlib.sha256(json.dumps(secrets).encode()).digest()
    cache_key = (SCANNER_VERSION, protect_paths, forbid_binary, credential_version, hashlib.sha256(value).digest())
    if cache_key in _SCANNED:
        _SCANNED.move_to_end(cache_key)
        return
    _scan_content(value, secrets, protect_paths, forbid_binary)
    _SCANNED[cache_key] = None
    if len(_SCANNED) > MAX_SCANNED:
        _SCANNED.popitem(last=False)


def _scan_content(value: bytes, secrets: tuple[str, ...], protect_paths: bool, forbid_binary: bool) -> None:
    if forbid_binary and MODEL_BINARY.search(value):
        raise NetworkDenied("附件需要对应格式的外发扫描")
    try:
        content = value.decode("utf-8")
    except UnicodeDecodeError:
        raise NetworkDenied("请求内容无法完整检查") from None
    for _ in range(3):
        if any(ord(char) < 32 and char not in "\t\r\n" for char in content):
            raise NetworkDenied("不支持不透明或二进制请求")
        if SECRET_FIELD.search(content) or SECRET_VALUE.search(content) or (protect_paths and SENSITIVE_PATH.search(content)):
            raise NetworkDenied("请求含受保护的数据")
        if any(secret in content for secret in secrets):
            raise NetworkDenied("请求含已知凭据")
        for encoded in ENCODED.findall(content):
            try:
                decoded_text = base64.b64decode(encoded + "=" * (-len(encoded) % 4), altchars=b"-_", validate=True).decode("utf-8")
            except (binascii.Error, UnicodeError):
                if content.strip('" \r\n') == encoded or ";base64," in content:
                    raise NetworkDenied("不支持不透明的编码载荷") from None
                continue
            if SECRET_FIELD.search(decoded_text) or SECRET_VALUE.search(decoded_text) or any(
                secret in decoded_text for secret in secrets
            ) or (protect_paths and SENSITIVE_PATH.search(decoded_text)):
                raise NetworkDenied("请求含 Base64 编码的受保护数据")
            if ENCODED.fullmatch(decoded_text):
                raise NetworkDenied("不支持多层不透明编码")
        if content.lstrip().startswith(("{", "[", '"')):
            try:
                canonical = json.dumps(json.loads(content), ensure_ascii=False)
            except (ValueError, RecursionError):
                canonical = content
            if canonical != content:
                if SECRET_FIELD.search(canonical) or SECRET_VALUE.search(canonical) or any(
                    secret in canonical for secret in secrets
                ) or (protect_paths and SENSITIVE_PATH.search(canonical)):
                    raise NetworkDenied("请求含编码的受保护数据")
        decoded = unquote(content)
        if decoded == content:
            return
        content = decoded
    raise NetworkDenied("请求编码层数超出检查预算")


def check_values(value: object) -> None:
    check_content(json.dumps(value, ensure_ascii=False, separators=(",", ":")))


def public_https(url: str) -> httpx2.URL:
    try:
        target = httpx2.URL(url)
        origin(str(target))
    except (ValueError, httpx2.InvalidURL):
        raise NetworkDenied("请求需要有效的 HTTPS 地址") from None
    if target.scheme != "https":
        raise NetworkDenied("公开网页请求仅允许 HTTPS")
    try:
        address = ipaddress.ip_address(target.host)
    except ValueError:
        if "." not in target.host.rstrip(".") or target.host.rstrip(".").endswith((".localhost", ".local")):
            raise NetworkDenied("公开网页请求需要公网地址") from None
    else:
        if not address.is_global or address.is_multicast:
            raise NetworkDenied("公开网页请求需要公网地址")
    check_content(str(target))
    return target
