import Joi from 'joi';
import { SocketIOConfig } from '../models/index.js';
import 'socket.io';

declare const SocketIOConfigSchema: Joi.ObjectSchema<SocketIOConfig>;

export { SocketIOConfigSchema };
