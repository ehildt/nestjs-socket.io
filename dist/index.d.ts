import { ServerOptions, Socket, DefaultEventsMap, Server } from 'socket.io';
import { DynamicModule, OnModuleInit, Logger } from '@nestjs/common';
import Joi from 'joi';

type SocketIOConfig = {
    event: string;
    port: number;
    opts: Partial<ServerOptions>;
};
type SocketIOModuleProps = {
    global?: boolean;
};
type SocketIOListener<S = Socket, T = any> = (obj: {
    socket: S;
    data: T;
    ack: (ok: boolean, error?: string) => void;
}) => Promise<void> | void;
type SocketIORecord<S = Socket, T = any> = {
    [key: PropertyKey]: SocketIOListener<S, T>;
};
type SocketListener = {
    data: string;
    ack: (ok: boolean, error?: string) => void;
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, unknown>;
};

declare class SocketIOModule {
    static registerAsync(options: SocketIOModuleProps): DynamicModule;
}

declare const SocketIOConfigSchema: Joi.ObjectSchema<SocketIOConfig>;

declare class SocketIOService implements OnModuleInit {
    private readonly logger;
    private _server;
    constructor(logger: Logger);
    onModuleInit(): void;
    set server(server: Server);
    get server(): Server;
    emit<T = unknown>(event: string, message: T): this;
    emitTo<T = unknown>(event: string, room: string, message: T): this;
    joinRoom({ socket, data, ack }: SocketListener): Promise<void>;
    leaveRoom({ socket, data, ack }: SocketListener): Promise<void>;
    on<T = any>(event: string | SocketIORecord, cb?: SocketIOListener<Socket, T>): this;
}

export { type SocketIOConfig, SocketIOConfigSchema, type SocketIOListener, SocketIOModule, type SocketIOModuleProps, type SocketIORecord, SocketIOService, type SocketListener };
