import { LoggerService } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

import { SOCKET_IO_CONFIG, SOCKET_IO_LOGGER, SocketIOServerConfig } from "../models/socket-io.model.ts";
import { SocketIOService } from "../service/socket-io.service.ts";

import { SocketIOModule } from "./socket-io.module.ts";

const mockLogger: LoggerService = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
  verbose: vi.fn(),
};

describe("SocketIOModule", () => {
  let app: TestingModule;

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  describe("registerAsync", () => {
    const mockConfig: SocketIOServerConfig = {
      port: 8080,
      opts: {
        transports: ["websocket"],
      },
    };

    it("should return dynamic module configuration", () => {
      const result = SocketIOModule.registerAsync({
        useFactory: async () => mockConfig,
      });

      expect(result.module).toBe(SocketIOModule);
      expect(result.providers).toContain(SocketIOService);
      expect(result.providers?.some((p: any) => p?.provide === SOCKET_IO_CONFIG)).toBe(true);
      expect(result.providers?.some((p: any) => p?.provide === SOCKET_IO_LOGGER)).toBe(true);
    });

    it("should handle global option", () => {
      const result = SocketIOModule.registerAsync({
        global: true,
        useFactory: async () => mockConfig,
      });

      expect(result.global).toBe(true);
    });

    it("should handle non-global option", () => {
      const result = SocketIOModule.registerAsync({
        global: false,
        useFactory: async () => mockConfig,
      });

      expect(result.global).toBe(false);
    });

    it("should include inject option", () => {
      const result = SocketIOModule.registerAsync({
        inject: ["CONFIG_SERVICE"],
        useFactory: async () => mockConfig,
      });

      expect(result).toBeDefined();
    });

    it("should pass injected dependencies to useFactory", () => {
      const result = SocketIOModule.registerAsync({
        inject: ["DEPENDENCY"],
        useFactory: (dep: { value: string }) => ({
          port: 3000,
          opts: { cors: { origin: dep.value } },
        }),
      });

      const configProvider = result.providers?.find((p: any) => p?.provide === SOCKET_IO_CONFIG);
      expect(configProvider).toBeDefined();
      expect(result.module).toBe(SocketIOModule);
    });
  });

  describe("integration", () => {
    it("should create NestJS app with SocketIOModule", async () => {
      app = await Test.createTestingModule({
        imports: [
          SocketIOModule.registerAsync({
            useFactory: () => ({
              port: 3000,
              opts: { cors: { origin: "*" }, transports: ["websocket", "polling"] },
            }),
          }),
        ],
        providers: [
          { provide: SOCKET_IO_LOGGER, useValue: mockLogger },
          {
            provide: SOCKET_IO_CONFIG,
            useValue: { port: 3000, opts: { cors: { origin: "*" }, transports: ["websocket", "polling"] } },
          },
        ],
      }).compile();

      const service = app.get<SocketIOService>(SocketIOService);
      expect(service).toBeDefined();
      expect(service.io).toBeDefined();
    });

    it("should provide SocketIOService when module is global", async () => {
      app = await Test.createTestingModule({
        imports: [
          SocketIOModule.registerAsync({
            global: true,
            useFactory: () => ({
              port: 3000,
              opts: { cors: { origin: "*" }, transports: ["websocket", "polling"] },
            }),
          }),
        ],
        providers: [
          { provide: SOCKET_IO_LOGGER, useValue: mockLogger },
          {
            provide: SOCKET_IO_CONFIG,
            useValue: { port: 3000, opts: { cors: { origin: "*" }, transports: ["websocket", "polling"] } },
          },
        ],
      }).compile();

      const service = app.get<SocketIOService>(SocketIOService);
      expect(service).toBeDefined();
    });

    it("should use injected dependencies in useFactory", async () => {
      type MockConfigService = { getPort: () => number; getOptions: () => { cors: { origin: string } } };
      const result = SocketIOModule.registerAsync({
        inject: ["CONFIG_SERVICE"],
        useFactory: (configService: MockConfigService) => ({
          port: configService.getPort(),
          opts: configService.getOptions(),
        }),
      });

      const configProvider = result.providers?.find((p: any) => p?.provide === SOCKET_IO_CONFIG);
      expect(configProvider).toBeDefined();
      expect(configProvider?.inject).toContain("CONFIG_SERVICE");
    });
  });
});
