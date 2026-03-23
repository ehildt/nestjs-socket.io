export const SOCKET_IO_SERVER = Symbol("SOCKET.IO");

export type SOCKET_IO_EVENT_TYPE = "topic" | "thread" | "post" | "vision" | "tool";

export const SOCKET_IO_EVENT: Record<string, SOCKET_IO_EVENT_TYPE> = Object.freeze({
  TOPIC: "topic",
  THREAD: "thread",
  POST: "post",
  VISION: "vision",
  TOOL: "tool",
});
