import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { api, buildUrl } from "@shared/routes";
import { type CreateWorkspaceRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Helper hook to inject Clerk token into API requests
function useApi() {
  const { getToken } = useAuth();
  
  return async (path: string, options: RequestInit = {}) => {
    const token = await getToken();
    const headers = new Headers(options.headers);
    
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    headers.set("Content-Type", "application/json");

    const res = await fetch(path, { ...options, headers });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${res.status}`);
    }
    
    if (res.status === 204) return undefined;
    return res.json();
  };
}

export function useWorkspaces() {
  const fetchApi = useApi();
  const { isLoaded, isSignedIn } = useAuth();

  return useQuery({
    queryKey: [api.workspaces.list.path],
    queryFn: async () => {
      const data = await fetchApi(api.workspaces.list.path);
      return api.workspaces.list.responses[200].parse(data);
    },
    enabled: isLoaded && isSignedIn,
  });
}

export function useWorkspace(slug: string) {
  const fetchApi = useApi();
  const { isLoaded, isSignedIn } = useAuth();

  return useQuery({
    queryKey: [api.workspaces.get.path, slug],
    queryFn: async () => {
      const url = buildUrl(api.workspaces.get.path, { slug });
      const data = await fetchApi(url);
      return api.workspaces.get.responses[200].parse(data);
    },
    enabled: isLoaded && isSignedIn && !!slug,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  const fetchApi = useApi();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateWorkspaceRequest) => {
      const response = await fetchApi(api.workspaces.create.path, {
        method: api.workspaces.create.method,
        body: JSON.stringify(data),
      });
      return api.workspaces.create.responses[201].parse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.workspaces.list.path] });
      toast({
        title: "Workspace created",
        description: "Your new workspace is ready.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create workspace",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useInviteMember(workspaceId: string) {
  const queryClient = useQueryClient();
  const fetchApi = useApi();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (email: string) => {
      const url = buildUrl(api.workspaces.invite.path, { id: workspaceId });
      const response = await fetchApi(url, {
        method: api.workspaces.invite.method,
        body: JSON.stringify({ email }),
      });
      return api.workspaces.invite.responses[201].parse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.workspaces.get.path] });
      toast({
        title: "Invite sent",
        description: "The user has been invited to the workspace.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to invite member",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
