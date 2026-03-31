import { DynamicModule, Module } from "@nestjs/common";

import { SOCKET_IO_CONFIG, SocketIOModuleProps } from "../models/socket-io.model.ts";
import { SocketIOService } from "../service/socket-io.service.ts";

@Module({})
export class SocketIOModule {
  /**
   * Attaches Socket.IO to the NestJS application. \
   * Auto-detects Fastify or Express adapter.
   * @see https://github.com/ehildt/nestjs-socket.io/wiki/socket-io.module
   * @param app - NestJS application instance
   * @param fsio - Optional explicit fastify-socket.io adapter for fallback
   */
  static async attach(app: any, fsio?: any) {
    const service = app.get(SocketIOService);
    const adapter = app.getHttpAdapter();
    const instance = adapter.getInstance?.();

    const isFastify = instance && typeof (instance as any).register === "function";

    if (isFastify) {
      const FSIO = (await import("fastify-socket.io")).default;
      await app.register(FSIO, service.config.opts);
      service.io = (instance as any).io;
      return;
    }

    const isExpress = instance && typeof (instance as any).listen === "function";

    if (isExpress) {
      const httpServer = app.getHttpServer();
      const { Server } = await import("socket.io");
      service.io = new Server(httpServer, service.config.opts);
      return;
    }

    if (fsio) {
      await app.register(fsio, service.config.opts);
      const fastifyInstance = adapter.getInstance();
      service.io = (fastifyInstance as any).io;
      return;
    }

    throw new Error(
      "Could not detect Fastify or Express adapter. " +
        "Please open an issue at https://github.com/ehildt/nestjs-socket.io",
    );
  }

  /**
   * Creates a dynamic SocketIOModule with async configuration.
   * @see https://github.com/ehildt/nestjs-socket.io/wiki/socket-io.module
   * @param options - Module configuration options
   */
  static registerAsync(options: SocketIOModuleProps): DynamicModule {
    return {
      module: SocketIOModule,
      global: options.global,
      exports: [SocketIOService],
      providers: [
        SocketIOService,
        {
          inject: options.inject,
          provide: SOCKET_IO_CONFIG,
          useFactory: options.useFactory,
        },
      ],
    };
  }
}
