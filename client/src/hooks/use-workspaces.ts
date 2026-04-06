import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { api as routes, buildUrl } from "@shared/routes";
import { type CreateWorkspaceRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

function useAxios() {
  const { getToken } = useAuth();
  
  const getHeaders = async () => {
    const token = await getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return {
    get: async (url: string) => {
      const headers = await getHeaders();
      const res = await api.get(url, { headers });
      return res.data;
    },
    post: async (url: string, data: any) => {
      const headers = await getHeaders();
      const res = await api.post(url, data, { headers });
      return res.data;
    }
  };
}

export function useWorkspaces() {
  const axiosApi = useAxios();
  const { isLoaded, isSignedIn } = useAuth();

  return useQuery({
    queryKey: [routes.workspaces.list.path],
    queryFn: async () => {
      const data = await axiosApi.get(routes.workspaces.list.path);
      return routes.workspaces.list.responses[200].parse(data);
    },
    enabled: isLoaded && isSignedIn,
  });
}

export function useWorkspace(slug: string) {
  const axiosApi = useAxios();
  const { isLoaded, isSignedIn } = useAuth();

  return useQuery({
    queryKey: [routes.workspaces.get.path, slug],
    queryFn: async () => {
      const url = buildUrl(routes.workspaces.get.path, { slug });
      const data = await axiosApi.get(url);
      return routes.workspaces.get.responses[200].parse(data);
    },
    enabled: isLoaded && isSignedIn && !!slug,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  const axiosApi = useAxios();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateWorkspaceRequest) => {
      const response = await axiosApi.post(routes.workspaces.create.path, data);
      return routes.workspaces.create.responses[201].parse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [routes.workspaces.list.path] });
      toast({
        title: "Workspace created",
        description: "Your new workspace is ready.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create workspace",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    },
  });
}

// --- RESTORED CHUNK 2.6 HOOKS BELOW ---

export function useUploadMeeting() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ workspaceId, file, title }: { workspaceId: string, file: File, title: string }) => {
      const token = await getToken();
      
      const formData = new FormData();
      formData.append("audio", file);
      formData.append("workspaceId", workspaceId);
      formData.append("title", title);

      const response = await fetch("/api/meetings/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, 
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload meeting");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/meetings/workspace/${variables.workspaceId}`] });
      toast({
        title: "Upload Started",
        description: "Your meeting is being processed in the background.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useMeetings(workspaceId: string) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useQuery({
    queryKey: [`/api/meetings/workspace/${workspaceId}`],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(`/api/meetings/workspace/${workspaceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch meetings");
      return res.json();
    },
    enabled: isLoaded && isSignedIn && !!workspaceId,
  });
}

export function useMeeting(meetingId: string) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useQuery({
    queryKey: [`/api/meetings/${meetingId}`],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(`/api/meetings/${meetingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch meeting");
      return res.json();
    },
    enabled: isLoaded && isSignedIn && !!meetingId,
  });
}

export function useUpdateActionItemStatus() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status, meetingId }: { id: string, status: "pending" | "in_progress" | "done", meetingId: string }) => {
      const token = await getToken();
      const res = await fetch(`/api/action-items/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate the meeting query so the detail page automatically refreshes the task list!
      queryClient.invalidateQueries({ queryKey: [`/api/meetings/${variables.meetingId}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update task",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (workspaceId: string) => {
      const token = await getToken();
      const res = await fetch(`/api/workspaces/${workspaceId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to delete workspace");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [routes.workspaces.list.path] });
      toast({
        title: "Workspace deleted",
      });
      window.location.href = "/dashboard";
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

export function useDeleteMeeting() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ meetingId, workspaceId }: { meetingId: string, workspaceId: string }) => {
      const token = await getToken();
      const res = await fetch(`/api/meetings/${meetingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to delete meeting");
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/meetings/workspace/${variables.workspaceId}`] });
      toast({
        title: "Meeting deleted",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

export function useRenameWorkspace() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ workspaceId, name }: { workspaceId: string, name: string }) => {
      const token = await getToken();
      const res = await fetch(`/api/workspaces/${workspaceId}`, {
        method: "PATCH",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to rename workspace");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [routes.workspaces.list.path] });
      // Invalidate specific workspace if slug matches or just general
      // It's safer to invalidate both the list and any GET endpoints
      queryClient.invalidateQueries({ queryKey: [routes.workspaces.get.path] });
      toast({ title: "Workspace renamed" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to rename", description: error.message, variant: "destructive" });
    }
  });
}

export function useRenameMeeting() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ meetingId, title }: { meetingId: string, title: string }) => {
      const token = await getToken();
      const res = await fetch(`/api/meetings/${meetingId}`, {
        method: "PATCH",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to rename meeting");
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/meetings/${variables.meetingId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/meetings/workspace`] }); 
      toast({ title: "Meeting renamed" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to rename", description: error.message, variant: "destructive" });
    }
  });
}