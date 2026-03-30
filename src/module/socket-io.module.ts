import { DynamicModule, Module } from "@nestjs/common";

import { SOCKET_IO_CONFIG, SocketIOModuleProps } from "../models/socket-io.model.ts";
import { SocketIOService } from "../service/socket-io.service.ts";

@Module({})
export class SocketIOModule {
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
