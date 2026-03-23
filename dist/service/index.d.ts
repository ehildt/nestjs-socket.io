import { OnModuleInit, Logger } from '@nestjs/common';
import { Server, DefaultEventsMap, Socket } from 'socket.io';
import { SocketIORecord, SocketIOListener } from '../models/index.js';

declare class SocketIOService implements OnModuleInit {
    private readonly logger;
    private readonly _server;
    constructor(logger: Logger, _server: Server);
    onModuleInit(): void;
    get server(): Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
    emit<T = unknown>(event: string, message: T): this;
    emitTo<T = unknown>(event: string, room: string, message: T): this;
    joinRoom({ socket, data, ack }: SocketListener): Promise<void>;
    leaveRoom({ socket, data, ack }: SocketListener): Promise<void>;
    on<T = any>(event: string | SocketIORecord, cb?: SocketIOListener<Socket, T>): this;
}
type SocketListener = {
    data: string;
    ack: (ok: boolean, error?: string) => void;
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, unknown>;
};

export { SocketIOService };
