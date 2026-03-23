declare const SOCKET_IO_SERVER: unique symbol;
type SOCKET_IO_EVENT_TYPE = "topic" | "thread" | "post" | "vision" | "tool";
declare const SOCKET_IO_EVENT: Record<string, SOCKET_IO_EVENT_TYPE>;

export { SOCKET_IO_EVENT, type SOCKET_IO_EVENT_TYPE, SOCKET_IO_SERVER };
