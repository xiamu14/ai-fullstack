import { describe, expect, it } from "vitest";
import { getHealthStatus } from "./health-status.ts";

describe("health status", () => {
  it("reports a first request failure without cached data", () => {
    expect(getHealthStatus({ isPending: false, isError: true })).toEqual({ state: "error", label: "未连接" });
  });
  it("does not present cached success after a failed refresh", () => {
    expect(getHealthStatus({ isPending: false, isError: true, data: { status: "ok", service: "backend" } }).state).toBe("error");
  });
  it("waits for the initial response", () => {
    expect(getHealthStatus({ isPending: true, isError: false }).state).toBe("pending");
  });
  it("shows the returned service status", () => {
    expect(getHealthStatus({ isPending: false, isError: false, data: { status: "ok", service: "backend" } })).toEqual({ state: "ok", label: "ok (backend)" });
  });
});
