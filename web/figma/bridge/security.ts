import { timingSafeEqual } from "node:crypto";
import { BRIDGE_PROTOCOL } from "../protocol/messages.ts";

export { BRIDGE_PROTOCOL };

export function authorizeBridgeRequest(
  request: Request,
  port: number,
  token: string
): Response | null {
  const host = request.headers.get("host") ?? new URL(request.url).host;
  if (host !== `127.0.0.1:${port}` && host !== `localhost:${port}`) {
    return new Response("Invalid host", { status: 403 });
  }

  const isSocket = new URL(request.url).pathname === "/ws";
  const origin = request.headers.get("origin");
  if (
    origin !== null &&
    (!isSocket || !["https://www.figma.com", "https://figma.com", "null"].includes(origin))
  ) {
    return new Response("Invalid origin", { status: 403 });
  }

  const protocols = request.headers.get("sec-websocket-protocol")?.split(",").map((value) => value.trim());
  const supplied = isSocket
    ? protocols?.[0] === BRIDGE_PROTOCOL ? protocols[1] : undefined
    : request.headers.get("authorization")?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
  if (
    !supplied ||
    !/^[a-f0-9]{64}$/.test(supplied) ||
    !timingSafeEqual(Buffer.from(supplied), Buffer.from(token))
  ) {
    return new Response("Pairing required", { status: 401 });
  }
  return null;
}
