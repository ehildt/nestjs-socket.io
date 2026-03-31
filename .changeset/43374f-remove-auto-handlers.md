---
"@ehildt/nestjs-socket.io": minor
---

Remove automatic registration of joinRoom/leaveRoom handlers and remove built-in logger. 
Added new attach method to SocketIOModule
Auto-detects Fastify or Express adapter and attaches Socket.IO to the NestJS application.