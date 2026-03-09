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