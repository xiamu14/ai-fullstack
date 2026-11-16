import { BRIDGE_PROTOCOL, isBridgeRequest, PAIRING_CODE_PATTERN, readParentResponse } from "../protocol/messages.ts";

const WS_URL = "ws://localhost:38450/ws";
const form = document.querySelector<HTMLFormElement>("#pairing")!;
const tokenInput = document.querySelector<HTMLInputElement>("#token")!;
const dot = document.querySelector<HTMLElement>("#dot")!;
const status = document.querySelector<HTMLElement>("#status")!;
const meta = document.querySelector<HTMLElement>("#meta")!;
const announcements = document.querySelector<HTMLElement>("#announcements")!;
const pending = new Set<string>();
let socket: WebSocket | null = null;
let token = "";
let paired = false;

function setStatus(connected: boolean, text: string, detail: string, announce = true) {
  dot.classList.toggle("bg-success-500", connected);
  dot.classList.toggle("bg-warning-500", !connected);
  status.textContent = text;
  meta.textContent = detail;
  if (announce && announcements.textContent !== text) announcements.textContent = text;
}

function connect() {
  if (!token || (socket && socket.readyState !== WebSocket.CLOSED)) return;
  let current: WebSocket;
  try {
    current = new WebSocket(WS_URL, [BRIDGE_PROTOCOL, token]);
  } catch {
    setStatus(false, "连接失败", "请检查本机服务是否启动");
    return;
  }
  socket = current;
  current.onopen = () => {
    if (socket !== current) return;
    paired = true;
    form.hidden = true;
    tokenInput.value = "";
    setStatus(true, "已连接", "仅连接本机，只读访问");
  };
  current.onmessage = (event) => {
    if (socket !== current) return;
    try {
      const request: unknown = JSON.parse(event.data);
      if (!isBridgeRequest(request) || pending.has(request.requestId)) return;
      pending.add(request.requestId);
      setStatus(true, "读取中", `请求 ${request.requestId}`, false);
      // Figma's sandbox parent can have an opaque origin; responses are pinned to its Window.
      parent.postMessage({ pluginMessage: request }, "*");
    } catch {
      setStatus(true, "读取失败", "收到的请求格式错误");
    }
  };
  current.onclose = () => {
    if (socket !== current) return;
    socket = null;
    pending.clear();
    form.hidden = false;
    if (!paired) {
      token = "";
      setStatus(false, "连接失败", "请检查配对码与本机服务");
      return;
    }
    setStatus(false, "连接断开", "正在重连本机服务");
  };
  current.onerror = () => current.close();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const nextToken = tokenInput.value.trim();
  if (!PAIRING_CODE_PATTERN.test(nextToken)) return;
  token = nextToken;
  paired = false;
  const previous = socket;
  socket = null;
  previous?.close();
  pending.clear();
  setStatus(false, "连接中", "正在连接本机服务", false);
  connect();
});

window.addEventListener("message", (event) => {
  const response = readParentResponse(event, parent);
  if (!response || !pending.has(response.requestId) || socket?.readyState !== WebSocket.OPEN) return;
  pending.delete(response.requestId);
  socket.send(JSON.stringify(response));
  setStatus(true, response.ok ? pending.size ? "读取中" : "已连接" : "读取失败", response.ok ? `已完成 ${response.requestId}` : response.error, !response.ok);
});

try {
  const url = URL.createObjectURL(new Blob(["setInterval(() => postMessage('tick'), 800);"], { type: "application/javascript" }));
  const worker = new Worker(url);
  URL.revokeObjectURL(url);
  worker.onmessage = connect;
  window.addEventListener("pagehide", () => worker.terminate(), { once: true });
} catch {
  const interval = setInterval(connect, 800);
  window.addEventListener("pagehide", () => clearInterval(interval), { once: true });
}
window.addEventListener("pagehide", () => socket?.close(), { once: true });
