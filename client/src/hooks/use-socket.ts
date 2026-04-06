import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function useWorkspaceSocket(workspaceId: string | undefined) {
  const [liveTranscript, setLiveTranscript] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;

  // Stable callback so the useEffect dependency array doesn't change every render
  const showToast = useCallback((...args: Parameters<typeof toast>) => {
    toastRef.current(...args);
  }, []);

  useEffect(() => {
    if (!workspaceId) return;

    // Prevent double-connections
    if (socketRef.current?.connected) return;

    const socket = io();
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log(`[Socket.io] Connected, joining room: ${workspaceId}`);
      socket.emit("join_workspace", workspaceId);
    });

    // When the status changes to transcribing, analysing, or failed
    socket.on("meeting_updated", (data: { meetingId: string, status: string }) => {
      console.log("[Socket.io] Live update:", data);
      queryClient.invalidateQueries({ queryKey: [`/api/meetings/workspace/${workspaceId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/meetings/${data.meetingId}`] });
    });

    // Live transcript chunks from the Chrome Extension!
    socket.on("meeting:live_transcript_chunk", (data: { workspaceId: string, text: string }) => {
      console.log("[Socket.io] Live WebM Text:", data.text);
      setLiveTranscript((prev) => [...prev, data.text]);
    });

    // When Gemini is completely done processing!
    socket.on("meeting_ready", (data: { meetingId: string, status: string }) => {
      console.log("[Socket.io] Analysis complete!", data);
      queryClient.invalidateQueries({ queryKey: [`/api/meetings/workspace/${workspaceId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/meetings/${data.meetingId}`] });

      showToast({
        title: "Meeting Analysis Complete! 🎉",
        description: "Your transcript and AI action items are ready.",
      });
    });

    return () => {
      socket.emit("leave_workspace", workspaceId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [workspaceId, queryClient, showToast]);

  return { socket: socketRef.current, liveTranscript };
}
