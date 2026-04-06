import meetingsRouter from "./routes/meetings";
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { clerkMiddleware, requireAuth, getAuth } from "@clerk/express";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Use Clerk middleware for all /api routes to extract auth state
  app.use("/api", clerkMiddleware());

  // 🔍 X-RAY MIDDLEWARE 
  app.use("/api", async (req, res, next) => {
    const auth = getAuth(req); 
    console.log("\n🔍 [CLERK X-RAY] Request to:", req.path);
    console.log("   - Has Auth Header?", !!req.headers.authorization);
    console.log("   - Clerk User ID:", auth?.userId || "UNDEFINED ❌");

    if (auth?.userId) {
      try {
        let user = await storage.getUserByClerkId(auth.userId);
        if (!user) {
          console.log("   - User not in DB. Creating fresh row...");
          user = await storage.createUser({
            clerkId: auth.userId,
            email: "placeholder@email.com",
            name: "User",
            avatarUrl: null
          });
        }
        (req as any).dbUser = user;
        console.log("   - ✅ dbUser attached successfully!");
      } catch (err) {
        console.error("   - 🔥 DATABASE CRASH while syncing user:", err);
      }
    }
    next();
  });

  // GET /api/workspaces
  app.get(api.workspaces.list.path, requireAuth(), async (req, res) => {
    const dbUser = (req as any).dbUser;
    if (!dbUser) {
      console.error("❌ [GET /workspaces] No dbUser found! Auth middleware may have failed.");
      return res.status(401).json({ message: "Unauthorized - User not authenticated" });
    }
    
    try {
      console.log(`[GET /workspaces] Fetching workspaces for user: ${dbUser.id}`);
      const workspaces = await storage.getWorkspacesForUser(dbUser.id);
      res.json(workspaces);
    } catch (err) {
      // 👇 ADDED THIS CONSOLE.ERROR 👇
      console.error("🔥 [GET /workspaces] DATABASE ERROR:", err);
      if (err instanceof Error) {
        console.error(`Error message: ${err.message}`);
        console.error(`Error stack: ${err.stack}`);
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // POST /api/workspaces
  app.post(api.workspaces.create.path, requireAuth(), async (req, res) => {
    const dbUser = (req as any).dbUser;
    if (!dbUser) {
      console.error("❌ [POST /workspaces] No dbUser found! Auth middleware may have failed.");
      return res.status(401).json({ message: "Unauthorized - User not authenticated" });
    }

    try {
      console.log(`[POST /workspaces] Creating workspace for user: ${dbUser.id}`);
      const input = api.workspaces.create.input.parse(req.body);
      const workspace = await storage.createWorkspace(input, dbUser.id);
      console.log(`[POST /workspaces] Workspace created successfully: ${workspace.id}`);
      res.status(201).json(workspace);
    } catch (err) {
      // 👇 ADDED THIS CONSOLE.ERROR 👇
      console.error("🔥 [POST /workspaces] DATABASE ERROR:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      if (err instanceof Error) {
        console.error(`Error message: ${err.message}`);
        console.error(`Error stack: ${err.stack}`);
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
      const slugParam = req.params.slug;
      if (Array.isArray(slugParam)) {
        return res.status(400).json({ message: "Invalid workspace slug" });
      }
      const workspace = await storage.getWorkspaceBySlug(slugParam);
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
      const idParam = req.params.id;
      if (Array.isArray(idParam)) {
        return res.status(400).json({ message: "Invalid workspace id" });
      }
      const { email } = api.workspaces.invite.input.parse(req.body);

      // Verify user is admin
      const member = await storage.getWorkspaceMember(idParam, dbUser.id);
      if (!member || member.role !== "admin") {
        return res.status(403).json({ message: "Forbidden - Requires admin role" });
      }

      // Find user to invite
      const invitee = await storage.getUserByEmail(email);
      if (!invitee) {
        return res.status(404).json({ message: "User with this email not found" });
      }

      const newMember = await storage.addMemberToWorkspace(idParam, invitee.id, "member");
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
      const idParam = req.params.id;
      const userIdParam = req.params.userId;
      if (Array.isArray(idParam) || Array.isArray(userIdParam)) {
        return res.status(400).json({ message: "Invalid workspace/member id" });
      }

      // Verify current user is admin
      const adminMember = await storage.getWorkspaceMember(idParam, dbUser.id);
      if (!adminMember || adminMember.role !== "admin") {
        return res.status(403).json({ message: "Forbidden - Requires admin role" });
      }

      await storage.removeMember(idParam, userIdParam);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // DELETE /api/workspaces/:id
  app.delete("/api/workspaces/:id", requireAuth(), async (req, res) => {
    const dbUser = (req as any).dbUser;
    if (!dbUser) return res.status(401).json({ message: "Unauthorized" });

    try {
      const workspaceId = req.params.id as string;

      // Verify current user is admin
      const member = await storage.getWorkspaceMember(workspaceId, dbUser.id);
      if (!member || member.role !== "admin") {
        return res.status(403).json({ message: "Forbidden - Requires admin role to delete workspace" });
      }

      await storage.deleteWorkspace(workspaceId);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // PATCH /api/workspaces/:id
  app.patch("/api/workspaces/:id", requireAuth(), async (req, res) => {
    const dbUser = (req as any).dbUser;
    if (!dbUser) return res.status(401).json({ message: "Unauthorized" });

    try {
      const workspaceId = req.params.id as string;
      const { name } = req.body;

      if (!name || typeof name !== "string") {
        return res.status(400).json({ message: "Invalid workspace name" });
      }

      // Verify current user is admin
      const member = await storage.getWorkspaceMember(workspaceId, dbUser.id);
      if (!member || member.role !== "admin") {
        return res.status(403).json({ message: "Forbidden - Requires admin role to rename workspace" });
      }

      await storage.updateWorkspaceName(workspaceId, name);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // --- NEW: Mount the meetings router ---
  app.use("/api/meetings", meetingsRouter);
  app.use("/api/action-items", (await import("./routes/actionItems")).default);
  app.use("/api/chat", (await import("./routes/chat")).default);

  return httpServer;
}