import { DynamicModule } from '@nestjs/common';
import { SocketIOModuleProps } from '../models/index.js';
import 'socket.io';

declare class SocketIOModule {
    static registerAsync(options: SocketIOModuleProps): DynamicModule;
}

export { SocketIOModule };
