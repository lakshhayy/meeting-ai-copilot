import { Server as SocketServer } from "socket.io";
import type { Server as HttpServer } from "http";

let io: SocketServer;

export function setupSocket(httpServer: HttpServer) {
  io = new SocketServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Client requests to join a specific workspace room
    socket.on("join_workspace", (workspaceId: string) => {
      console.log(`[Socket.io] Client ${socket.id} joining workspace: ${workspaceId}`);
      socket.join(workspaceId);
    });

    socket.on("leave_workspace", (workspaceId: string) => {
      socket.leave(workspaceId);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

// Helper function to allow background Bull MQ workers to emit directly to UI!
export function emitToWorkspace(workspaceId: string, event: string, payload: any) {
  if (io) {
    io.to(workspaceId).emit(event, payload);
  } else {
    console.warn("[Socket.io] Cannot emit, io is not initialized yet.");
  }
}
