import { Logger } from "@nestjs/common";

import { SOCKET_IO_SERVER, SocketIOService } from "./index.ts";
import type { SocketIOConfig } from "./socket-io.model.ts";
import { SocketIOModule } from "./socket-io.module.ts";

describe("SocketIOModule", () => {
  describe("registerAsync", () => {
    const mockConfig: SocketIOConfig = {
      event: "test",
      port: 8080,
      opts: {
        transports: ["websocket"],
      },
    };

    it("should return dynamic module configuration", () => {
      const result = SocketIOModule.registerAsync({
        inject: [],
        useFactory: async () => mockConfig,
      });

      expect(result.module).toBe(SocketIOModule);
      expect(result.exports).toContain(SOCKET_IO_SERVER);
      expect(result.exports).toContain(SocketIOService);
    });

    it("should handle global option", () => {
      const result = SocketIOModule.registerAsync({
        global: true,
        inject: [],
        useFactory: async () => mockConfig,
      });

      expect(result.global).toBe(true);
    });

    it("should handle non-global option", () => {
      const result = SocketIOModule.registerAsync({
        global: false,
        inject: [],
        useFactory: async () => mockConfig,
      });

      expect(result.global).toBe(false);
    });

    it("should include Logger and SocketIOService as providers", () => {
      const result = SocketIOModule.registerAsync({
        inject: [],
        useFactory: async () => mockConfig,
      });

      const providerTokens = result.providers?.map((p: any) => (typeof p === "function" ? p : p.provide));

      expect(providerTokens).toContain(Logger);
      expect(providerTokens).toContain(SocketIOService);
      expect(providerTokens).toContain(SOCKET_IO_SERVER);
    });

    it("should configure SOCKET_IO_SERVER provider with factory", () => {
      const result = SocketIOModule.registerAsync({
        inject: ["CONFIG_SERVICE"],
        useFactory: async (_configService: any) => {
          void _configService;
          return mockConfig;
        },
      });

      const serverProvider = result.providers?.find((p: any) => (p as any).provide === SOCKET_IO_SERVER) as any;

      expect(serverProvider).toBeDefined();
      expect(serverProvider.inject).toEqual(["CONFIG_SERVICE"]);
      expect(serverProvider.useFactory).toBeDefined();
    });

    it("should work with multiple injected dependencies", () => {
      const result = SocketIOModule.registerAsync({
        inject: ["CONFIG_SERVICE", "LOGGER_SERVICE"],
        useFactory: async (_config: any, _logger: any) => {
          void _config;
          void _logger;
          return mockConfig;
        },
      });

      const serverProvider = result.providers?.find((p: any) => (p as any).provide === SOCKET_IO_SERVER) as any;

      expect(serverProvider.inject).toHaveLength(2);
    });

    it("should return correct DynamicModule type", () => {
      const result = SocketIOModule.registerAsync({
        inject: [],
        useFactory: async () => mockConfig,
      });

      expect(result).toHaveProperty("module");
      expect(result).toHaveProperty("providers");
      expect(result).toHaveProperty("exports");
    });
  });
});
