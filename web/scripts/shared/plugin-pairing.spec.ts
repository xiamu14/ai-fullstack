import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BRIDGE_PROTOCOL } from "../../figma/protocol/messages.ts";

class FakeElement extends EventTarget {
  value = "";
  hidden = false;
  textContent = "";
  classList = { toggle: vi.fn() };
}

class FakeSocket {
  static CLOSED = 3;
  static OPEN = 1;
  static instances: FakeSocket[] = [];
  readyState = 0;
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  send = vi.fn();

  constructor(readonly url: string, readonly protocols: string[]) {
    FakeSocket.instances.push(this);
  }

  open() {
    this.readyState = FakeSocket.OPEN;
    this.onopen?.();
  }

  close() {
    this.readyState = FakeSocket.CLOSED;
    this.onclose?.();
  }
}

let form: FakeElement;
let input: FakeElement;
let status: FakeElement;
let browser: EventTarget;

function submit(code: string) {
  input.value = code;
  form.dispatchEvent(new Event("submit", { cancelable: true }));
}

beforeEach(async () => {
  vi.useFakeTimers();
  vi.resetModules();
  FakeSocket.instances = [];
  const elements = new Map<string, FakeElement>(
    ["pairing", "token", "dot", "status", "meta", "announcements"]
      .map((id) => [`#${id}`, new FakeElement()] as const)
  );
  form = elements.get("#pairing")!;
  input = elements.get("#token")!;
  status = elements.get("#status")!;
  browser = new EventTarget();
  vi.stubGlobal("document", { querySelector: (selector: string) => elements.get(selector) });
  vi.stubGlobal("window", browser);
  vi.stubGlobal("parent", { postMessage: vi.fn() });
  vi.stubGlobal("WebSocket", FakeSocket);
  vi.stubGlobal("Worker", class {
    constructor() { throw new Error("Worker unavailable"); }
  });
  await import("../../figma/plugin/ui.ts");
});

afterEach(() => {
  browser.dispatchEvent(new Event("pagehide"));
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("plugin pairing", () => {
  it("connects with a six-character code and clears the input after pairing", () => {
    submit("Ab3xY9");
    const socket = FakeSocket.instances[0]!;
    expect(socket.protocols).toEqual([BRIDGE_PROTOCOL, "Ab3xY9"]);
    expect(new URL(socket.url).search).toBe("");
    socket.open();
    expect(form.hidden).toBe(true);
    expect(input.value).toBe("");
    expect(status.textContent).toBe("已连接");
  });

  it.each(["", "short", "a".repeat(64), "配对码123", "Ab3xY!"])("rejects an invalid code: %s", (code) => {
    submit(code);
    expect(FakeSocket.instances).toHaveLength(0);
  });

  it("keeps retrying through failed reconnects after a successful pairing", () => {
    submit("Ab3xY9");
    FakeSocket.instances[0]!.open();
    FakeSocket.instances[0]!.close();
    vi.advanceTimersByTime(800);
    expect(FakeSocket.instances).toHaveLength(2);
    FakeSocket.instances[1]!.close();
    vi.advanceTimersByTime(800);
    expect(FakeSocket.instances).toHaveLength(3);
    expect(FakeSocket.instances[2]!.protocols).toEqual([BRIDGE_PROTOCOL, "Ab3xY9"]);
  });

  it("stops retrying when the first pairing fails", () => {
    submit("Ab3xY9");
    FakeSocket.instances[0]!.close();
    vi.advanceTimersByTime(1600);
    expect(FakeSocket.instances).toHaveLength(1);
    expect(form.hidden).toBe(false);
    expect(status.textContent).toBe("连接失败");
  });

  it("treats a replacement code as a fresh pairing", () => {
    submit("Ab3xY9");
    FakeSocket.instances[0]!.open();
    FakeSocket.instances[0]!.close();
    submit("Cd4zW8");
    FakeSocket.instances[1]!.close();
    vi.advanceTimersByTime(1600);
    expect(FakeSocket.instances).toHaveLength(2);
    expect(status.textContent).toBe("连接失败");
  });
});
