import { Logger } from "@nestjs/common";

import { SocketIOService } from "./socket-io.service.ts";

describe("SocketIOService", () => {
  let mockServer: any;
  let mockLogger: any;
  let service: SocketIOService;
  let mockSocket: any;

  beforeEach(() => {
    mockSocket = {
      id: "socket-123",
      join: vi.fn().mockResolvedValue(undefined),
      leave: vi.fn().mockResolvedValue(undefined),
      on: vi.fn(),
    };

    mockServer = {
      emit: vi.fn(),
      to: vi.fn().mockReturnThis(),
      on: vi.fn(),
    };

    mockLogger = {
      log: vi.fn(),
    };

    service = new SocketIOService(mockLogger as Logger, mockServer);
  });

  describe("server getter", () => {
    it("should return the server instance", () => {
      expect(service.server).toBe(mockServer);
    });
  });

  describe("emit", () => {
    it("should broadcast event to all clients", () => {
      const message = { text: "Hello World" };

      service.emit("test-event", message);

      expect(mockServer.emit).toHaveBeenCalledWith("test-event", message);
    });

    it("should return this for method chaining", () => {
      const result = service.emit("event", {});

      expect(result).toBe(service);
    });

    it("should emit with different event names", () => {
      service.emit("notification", { title: "Test" });
      service.emit("message", { content: "Hello" });

      expect(mockServer.emit).toHaveBeenCalledTimes(2);
    });
  });

  describe("emitTo", () => {
    it("should emit event to specific room", () => {
      const message = { text: "Room message" };

      service.emitTo("chat", "room-123", message);

      expect(mockServer.to).toHaveBeenCalledWith("room-123");
      expect(mockServer.emit).toHaveBeenCalledWith("chat", message);
    });

    it("should return this for method chaining", () => {
      const result = service.emitTo("event", "room", {});

      expect(result).toBe(service);
    });

    it("should handle multiple rooms", () => {
      service.emitTo("msg", "room-a", { data: 1 });
      service.emitTo("msg", "room-b", { data: 2 });

      expect(mockServer.to).toHaveBeenCalledTimes(2);
    });
  });

  describe("joinRoom", () => {
    it("should join room successfully", async () => {
      const ack = vi.fn();

      await service.joinRoom({
        socket: mockSocket,
        data: "test-room",
        ack,
      });

      expect(mockSocket.join).toHaveBeenCalledWith("test-room");
      expect(ack).toHaveBeenCalledWith(true);
      expect(mockLogger.log).toHaveBeenCalledWith("attempting to join room", "test-room");
    });

    it("should call ack with false on error", async () => {
      const ack = vi.fn();
      const error = new Error("Join failed");
      mockSocket.join = vi.fn().mockRejectedValue(error);

      await service.joinRoom({
        socket: mockSocket,
        data: "bad-room",
        ack,
      });

      expect(ack).toHaveBeenCalledWith(false, "Join failed");
    });

    it("should handle unknown error types", async () => {
      const ack = vi.fn();
      mockSocket.join = vi.fn().mockRejectedValue("string error");

      await service.joinRoom({
        socket: mockSocket,
        data: "room",
        ack,
      });

      expect(ack).toHaveBeenCalledWith(false, undefined);
    });
  });

  describe("leaveRoom", () => {
    it("should leave room successfully", async () => {
      const ack = vi.fn();

      await service.leaveRoom({
        socket: mockSocket,
        data: "test-room",
        ack,
      });

      expect(mockSocket.leave).toHaveBeenCalledWith("test-room");
      expect(ack).toHaveBeenCalledWith(true);
      expect(mockLogger.log).toHaveBeenCalledWith("attempting to leave room", "test-room");
    });

    it("should call ack with false on error", async () => {
      const ack = vi.fn();
      const error = new Error("Leave failed");
      mockSocket.leave = vi.fn().mockRejectedValue(error);

      await service.leaveRoom({
        socket: mockSocket,
        data: "bad-room",
        ack,
      });

      expect(ack).toHaveBeenCalledWith(false, "Leave failed");
    });
  });

  describe("on", () => {
    it("should subscribe to single event with string name", () => {
      const callback = vi.fn();

      service.on("test-event", callback);

      expect(mockLogger.log).toHaveBeenCalledWith('Subscribed to event: "test-event"', "Socket.IO");
      expect(mockServer.on).toHaveBeenCalledWith("connection", expect.any(Function));
    });

    it("should subscribe to multiple events with object", () => {
      const handlers = {
        event1: vi.fn(),
        event2: vi.fn(),
      };

      service.on(handlers);

      expect(mockLogger.log).toHaveBeenCalledWith('Subscribed to messages: ["event1","event2"]', "Socket.IO");
      expect(mockServer.on).toHaveBeenCalledWith("connection", expect.any(Function));
    });

    it("should return this for method chaining", () => {
      const result = service.on("event", vi.fn());

      expect(result).toBe(service);
    });

    it("should handle connection and incoming events", () => {
      const callback = vi.fn();
      service.on("my-event", callback);

      const connectionHandler = mockServer.on.mock.calls[0][1];
      connectionHandler(mockSocket);

      expect(mockSocket.on).toHaveBeenCalledWith("my-event", expect.any(Function));
    });

    it("should handle object events on connection", () => {
      const handlers = { event1: vi.fn(), event2: vi.fn() };
      service.on(handlers);

      const connectionHandler = mockServer.on.mock.calls[0][1];
      connectionHandler(mockSocket);

      expect(mockSocket.on).toHaveBeenCalledTimes(2);
    });
  });

  describe("onModuleInit", () => {
    it("should register joinRoom and leaveRoom handlers", () => {
      service.onModuleInit();

      expect(mockServer.on).toHaveBeenCalledWith("connection", expect.any(Function));
    });
  });
});
