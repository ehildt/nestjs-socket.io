import { SocketIOConfigSchema } from "./socket-io.schema.ts";

describe("SocketIOConfigSchema", () => {
  const getValidConfig = () => ({
    event: "test-event",
    port: 8080,
    opts: {
      cleanupEmptyChildNamespaces: true,
      maxHttpBufferSize: 262144,
      pingInterval: 25000,
      pingTimeout: 5000,
      allowEIO3: false,
      connectTimeout: 30000,
      transports: ["websocket", "polling"],
      cors: {
        origin: "*",
        credentials: true,
        methods: ["GET", "POST"],
      },
    },
  });

  describe("valid configurations", () => {
    it("should accept minimal valid config", () => {
      const result = SocketIOConfigSchema.validate(getValidConfig());

      expect(result.error).toBeUndefined();
    });

    it("should accept config with webtransport", () => {
      const config = getValidConfig();
      config.opts.transports = ["websocket", "polling", "webtransport"];

      const result = SocketIOConfigSchema.validate(config);
      expect(result.error).toBeUndefined();
    });

    it("should accept config with custom CORS origin", () => {
      const config = getValidConfig();
      config.opts.cors.origin = "https://example.com";

      const result = SocketIOConfigSchema.validate(config);
      expect(result.error).toBeUndefined();
    });

    it("should accept config with only websocket transport", () => {
      const config = getValidConfig();
      config.opts.transports = ["websocket"];

      const result = SocketIOConfigSchema.validate(config);
      expect(result.error).toBeUndefined();
    });
  });

  describe("invalid configurations", () => {
    it("should reject missing port", () => {
      const config = getValidConfig();
      delete (config as any).port;

      const result = SocketIOConfigSchema.validate(config);
      expect(result.error).toBeDefined();
    });

    it("should coerce string port to number", () => {
      const config = getValidConfig();
      (config as any).port = "8080";

      const result = SocketIOConfigSchema.validate(config);
      expect(result.error).toBeUndefined();
      expect(result.value.port).toBe(8080);
    });

    it("should reject invalid transport type", () => {
      const config = getValidConfig();
      config.opts.transports = ["invalid-transport"];

      const result = SocketIOConfigSchema.validate(config);
      expect(result.error).toBeDefined();
      expect(result.error?.details[0].message).toMatch(/transports/);
    });

    it("should reject missing cors object", () => {
      const config = getValidConfig();
      delete (config.opts as any).cors;

      const result = SocketIOConfigSchema.validate(config);
      expect(result.error).toBeDefined();
    });

    it("should reject invalid CORS method", () => {
      const config = getValidConfig();
      config.opts.cors.methods = ["PUT", "DELETE"];

      const result = SocketIOConfigSchema.validate(config);
      expect(result.error).toBeDefined();
      expect(result.error?.details[0].message).toMatch(/methods/);
    });

    it("should reject missing cleanupEmptyChildNamespaces", () => {
      const config = getValidConfig();
      delete (config.opts as any).cleanupEmptyChildNamespaces;

      const result = SocketIOConfigSchema.validate(config);
      expect(result.error).toBeDefined();
    });

    it("should coerce string 'true' to boolean", () => {
      const config = getValidConfig();
      (config.opts as any).cleanupEmptyChildNamespaces = "true";

      const result = SocketIOConfigSchema.validate(config);
      expect(result.error).toBeUndefined();
      expect(result.value.opts.cleanupEmptyChildNamespaces).toBe(true);
    });

    it("should accept negative maxHttpBufferSize", () => {
      const config = getValidConfig();
      config.opts.maxHttpBufferSize = -1;

      const result = SocketIOConfigSchema.validate(config);
      expect(result.error).toBeUndefined();
    });

    it("should reject missing allowEIO3", () => {
      const config = getValidConfig();
      delete (config.opts as any).allowEIO3;

      const result = SocketIOConfigSchema.validate(config);
      expect(result.error).toBeDefined();
    });
  });

  describe("edge cases", () => {
    it("should accept large port numbers", () => {
      const config = getValidConfig();
      config.port = 65535;

      const result = SocketIOConfigSchema.validate(config);
      expect(result.error).toBeUndefined();
    });

    it("should accept event as optional", () => {
      const config = getValidConfig();
      delete (config as any).event;

      const result = SocketIOConfigSchema.validate(config);
      expect(result.error).toBeUndefined();
    });

    it("should accept pingTimeout as optional", () => {
      const config = getValidConfig();
      delete (config.opts as any).pingTimeout;

      const result = SocketIOConfigSchema.validate(config);
      expect(result.error).toBeUndefined();
    });
  });
});
