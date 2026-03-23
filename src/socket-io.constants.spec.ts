import { SOCKET_IO_EVENT, SOCKET_IO_SERVER } from "./socket-io.constants.ts";

describe("SocketIO Constants", () => {
  describe("SOCKET_IO_SERVER", () => {
    it("should be a Symbol", () => {
      expect(typeof SOCKET_IO_SERVER).toBe("symbol");
    });

    it("should have descriptive description", () => {
      expect(SOCKET_IO_SERVER.toString()).toBe("Symbol(SOCKET.IO)");
    });

    it("should be unique", () => {
      const anotherSymbol = Symbol("SOCKET.IO");
      expect(SOCKET_IO_SERVER).not.toBe(anotherSymbol);
    });
  });

  describe("SOCKET_IO_EVENT", () => {
    it("should be frozen", () => {
      expect(Object.isFrozen(SOCKET_IO_EVENT)).toBe(true);
    });

    it("should have TOPIC event type", () => {
      expect(SOCKET_IO_EVENT.TOPIC).toBe("topic");
    });

    it("should have THREAD event type", () => {
      expect(SOCKET_IO_EVENT.THREAD).toBe("thread");
    });

    it("should have POST event type", () => {
      expect(SOCKET_IO_EVENT.POST).toBe("post");
    });

    it("should have VISION event type", () => {
      expect(SOCKET_IO_EVENT.VISION).toBe("vision");
    });

    it("should have TOOL event type", () => {
      expect(SOCKET_IO_EVENT.TOOL).toBe("tool");
    });

    it("should not allow modification", () => {
      expect(() => {
        (SOCKET_IO_EVENT as any).NEW_EVENT = "new";
      }).toThrow();
    });

    it("should have all expected keys", () => {
      const keys = Object.keys(SOCKET_IO_EVENT);
      expect(keys).toContain("TOPIC");
      expect(keys).toContain("THREAD");
      expect(keys).toContain("POST");
      expect(keys).toContain("VISION");
      expect(keys).toContain("TOOL");
      expect(keys).toHaveLength(5);
    });

    it("should have string values", () => {
      Object.values(SOCKET_IO_EVENT).forEach((value) => {
        expect(typeof value).toBe("string");
      });
    });
  });
});
