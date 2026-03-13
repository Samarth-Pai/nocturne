import type { Server as IOServer } from "socket.io";

declare global {
  // eslint-disable-next-line no-var
  var __ioServer: IOServer | undefined;
}

export function setIOServer(io: IOServer): void {
  global.__ioServer = io;
}

export function getIOServer(): IOServer | undefined {
  return global.__ioServer;
}
