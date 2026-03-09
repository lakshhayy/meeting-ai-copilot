import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom"; // <-- Changed from wouter to react-router-dom
import { createWorkspaceSchema, type CreateWorkspaceRequest } from "@shared/schema";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateWorkspace } from "@/hooks/use-workspaces";
import { Building2, Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function CreateWorkspace() {
  const navigate = useNavigate(); // <-- Initialized useNavigate
  const createMutation = useCreateWorkspace();

  const form = useForm<CreateWorkspaceRequest>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue("name", name);
    if (!form.formState.dirtyFields.slug) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      form.setValue("slug", slug, { shouldValidate: true });
    }
  };

  const onSubmit = (data: CreateWorkspaceRequest) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        navigate(`/workspace/${data.slug}`); // <-- Fixed to use navigate
      },
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto mt-8">
        <Card className="shadow-card border-border/60">
          <CardHeader className="space-y-1">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
              <Building2 className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-display">Create a workspace</CardTitle>
            <CardDescription className="text-base">
              Workspaces contain all your meeting recordings, summaries, and team members.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workspace Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Acme Corp" 
                          {...field} 
                          onChange={handleNameChange}
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Slug</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <span className="flex items-center px-3 h-11 bg-muted border border-r-0 border-input rounded-l-md text-muted-foreground text-sm">
                            app.com/
                          </span>
                          <Input 
                            placeholder="acme-corp" 
                            {...field} 
                            className="h-11 rounded-l-none"
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        This is your unique workspace URL identifier.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4 flex gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full h-11"
                    onClick={() => navigate("/dashboard")} // <-- Fixed Cancel button navigation
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="w-full h-11"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    Create Workspace
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}