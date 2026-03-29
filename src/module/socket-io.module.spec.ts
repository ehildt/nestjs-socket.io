import { LoggerService } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

import { SocketIOServerConfig } from "../models/socket-io.model.ts";
import { SOCKET_IO_LOGGER, SocketIOService } from "../service/socket-io.service.ts";

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
  });

  describe("integration", () => {
    it("should create NestJS app with SocketIOModule", async () => {
      app = await Test.createTestingModule({
        imports: [
          SocketIOModule.registerAsync({
            useFactory: () => ({
              event: "test",
              port: 3000,
              opts: { transports: ["websocket"] },
            }),
          }),
        ],
        providers: [{ provide: SOCKET_IO_LOGGER, useValue: mockLogger }],
      }).compile();

      const service = app.get<SocketIOService>(SocketIOService);
      expect(service).toBeDefined();
      expect(service.server).toBeDefined();
    });

    it("should provide SocketIOService when module is global", async () => {
      app = await Test.createTestingModule({
        imports: [
          SocketIOModule.registerAsync({
            global: true,
            useFactory: () => ({
              event: "test",
              port: 3000,
              opts: { transports: ["websocket"] },
            }),
          }),
        ],
        providers: [{ provide: SOCKET_IO_LOGGER, useValue: mockLogger }],
      }).compile();

      const service = app.get<SocketIOService>(SocketIOService);
      expect(service).toBeDefined();
    });
  });
});
