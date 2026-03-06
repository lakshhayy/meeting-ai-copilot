import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { clerkMiddleware, requireAuth } from "@clerk/express";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Use Clerk middleware for all /api routes to extract auth state
  app.use("/api", clerkMiddleware());

  // Middleware to sync Clerk user to our DB
  app.use("/api", async (req, res, next) => {
    // req.auth should be populated by clerkMiddleware
    const auth = req.auth;
    if (auth?.userId) {
      try {
        let user = await storage.getUserByClerkId(auth.userId);
        if (!user) {
          // If user doesn't exist in our DB, create them
          // We don't have the full details here unless we query Clerk API,
          // but we can create a basic profile or expect frontend to sync.
          // For now, we create a placeholder user object
          user = await storage.createUser({
            clerkId: auth.userId,
            email: "placeholder@email.com", // Replace with real webhook data in production
            name: "User",
            avatarUrl: null
          });
        }
        (req as any).dbUser = user;
      } catch (err) {
        console.error("Error syncing user:", err);
      }
    }
    next();
  });

  // GET /api/workspaces
  app.get(api.workspaces.list.path, requireAuth(), async (req, res) => {
    const dbUser = (req as any).dbUser;
    if (!dbUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const workspaces = await storage.getWorkspacesForUser(dbUser.id);
      res.json(workspaces);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // POST /api/workspaces
  app.post(api.workspaces.create.path, requireAuth(), async (req, res) => {
    const dbUser = (req as any).dbUser;
    if (!dbUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const input = api.workspaces.create.input.parse(req.body);
      const workspace = await storage.createWorkspace(input, dbUser.id);
      res.status(201).json(workspace);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // GET /api/workspaces/:slug
  app.get(api.workspaces.get.path, requireAuth(), async (req, res) => {
    const dbUser = (req as any).dbUser;
    if (!dbUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const workspace = await storage.getWorkspaceBySlug(req.params.slug);
      if (!workspace) {
        return res.status(404).json({ message: "Workspace not found" });
      }

      // Check if user is a member
      const isMember = workspace.members.some(m => m.userId === dbUser.id);
      if (!isMember) {
        return res.status(403).json({ message: "Forbidden" });
      }

      res.json(workspace);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // POST /api/workspaces/:id/invite
  app.post(api.workspaces.invite.path, requireAuth(), async (req, res) => {
    const dbUser = (req as any).dbUser;
    if (!dbUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { id } = req.params;
      const { email } = api.workspaces.invite.input.parse(req.body);

      // Verify user is admin
      const member = await storage.getWorkspaceMember(id, dbUser.id);
      if (!member || member.role !== "admin") {
        return res.status(403).json({ message: "Forbidden - Requires admin role" });
      }

      // Find user to invite
      const invitee = await storage.getUserByEmail(email);
      if (!invitee) {
        return res.status(404).json({ message: "User with this email not found" });
      }

      const newMember = await storage.addMemberToWorkspace(id, invitee.id, "member");
      res.status(201).json(newMember);
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // DELETE /api/workspaces/:id/members/:userId
  app.delete(api.workspaces.removeMember.path, requireAuth(), async (req, res) => {
    const dbUser = (req as any).dbUser;
    if (!dbUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { id, userId } = req.params;

      // Verify current user is admin
      const adminMember = await storage.getWorkspaceMember(id, dbUser.id);
      if (!adminMember || adminMember.role !== "admin") {
        return res.status(403).json({ message: "Forbidden - Requires admin role" });
      }

      await storage.removeMember(id, userId);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
