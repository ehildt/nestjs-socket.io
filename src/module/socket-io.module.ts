import { DynamicModule, Logger, Module } from "@nestjs/common";
import { Server } from "socket.io";

import { SOCKET_IO_SERVER } from "../constants/socket-io.constants.ts";
import { SocketIOModuleProps } from "../models/socket-io.model.ts";
import { SocketIOService } from "../service/socket-io.service.ts";

@Module({})
export class SocketIOModule {
  static registerAsync(options: SocketIOModuleProps): DynamicModule {
    return {
      module: SocketIOModule,
      global: options.global,
      exports: [SOCKET_IO_SERVER, SocketIOService],
      providers: [
        Logger,
        SocketIOService,
        {
          provide: SOCKET_IO_SERVER,
          inject: options.inject,
          useFactory: async (...deps) => {
            const { port, opts } = await options.useFactory(...deps);
            const server = new Server(opts);
            server.listen(port);
            return server;
          },
        },
      ],
    };
  }
}
