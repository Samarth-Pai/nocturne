import type { NextApiRequest, NextApiResponse } from "next";
import { Server as IOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import { setIOServer } from "@/lib/socket";

type NextApiResponseWithSocket = NextApiResponse & {
  socket: NextApiResponse["socket"] & {
    server: HTTPServer & {
      io?: IOServer;
    };
  };
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(_req: NextApiRequest, res: NextApiResponseWithSocket): void {
  if (res.socket.server.io) {
    res.status(200).json({ ok: true });
    return;
  }

  const io = new IOServer(res.socket.server, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  res.socket.server.io = io;
  setIOServer(io);

  io.on("connection", (socket) => {
    socket.on("duel:join", ({ duelId, userId }: { duelId: string; userId: string }) => {
      socket.join(duelId);
      io.to(duelId).emit("duel:presence", {
        duelId,
        userId,
        socketId: socket.id,
        status: "joined",
      });
    });

    socket.on("duel:leave", ({ duelId, userId }: { duelId: string; userId: string }) => {
      socket.leave(duelId);
      io.to(duelId).emit("duel:presence", {
        duelId,
        userId,
        socketId: socket.id,
        status: "left",
      });
    });
  });

  res.status(200).json({ ok: true });
}
