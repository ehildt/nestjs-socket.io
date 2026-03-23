// src/constants/socket-io.constants.ts
var SOCKET_IO_SERVER = /* @__PURE__ */ Symbol("SOCKET.IO");
var SOCKET_IO_EVENT = Object.freeze({
  TOPIC: "topic",
  THREAD: "thread",
  POST: "post",
  VISION: "vision",
  TOOL: "tool"
});

export { SOCKET_IO_EVENT, SOCKET_IO_SERVER };
