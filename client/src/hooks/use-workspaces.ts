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

// ... keep your existing imports and hooks up top

export function useUploadMeeting() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ workspaceId, file, title }: { workspaceId: string, file: File, title: string }) => {
      const token = await getToken();
      
      // When sending files, we MUST use FormData, not standard JSON
      const formData = new FormData();
      formData.append("audio", file);
      formData.append("workspaceId", workspaceId);
      formData.append("title", title);

      const response = await fetch("/api/meetings/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // We don't set Content-Type; the browser handles it for FormData
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
      // Refresh the meetings list for this workspace once the upload starts
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

// Add this hook too so we can fetch the list of meetings later
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