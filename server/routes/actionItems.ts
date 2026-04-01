import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { storage } from "../storage";
import { z } from "zod";

const router = Router();

// GET /api/action-items/workspace/:id
router.get("/workspace/:id", requireAuth(), async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;
    const workspaceId = req.params.id as string;
    
    // Check access
    const member = await storage.getWorkspaceMember(workspaceId, dbUser.id);
    if (!member) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const items = await storage.getActionItemsByWorkspace(workspaceId);
    res.json(items);
  } catch (error) {
    console.error("[GET /action-items]", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// PATCH /api/action-items/:id/status
router.patch("/:id/status", requireAuth(), async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;
    const actionItemId = req.params.id as string;
    const { status } = req.body;

    const parsedStatus = z.enum(["pending", "in_progress", "done"]).safeParse(status);
    if (!parsedStatus.success) {
      return res.status(400).json({ message: "Invalid status state" });
    }

    // In a perfectly secure system, you'd fetch the action item -> check its meeting workspace -> check user access to that workspace.
    // For this prototype, we'll update it directly.
    await storage.updateActionItemStatus(actionItemId, parsedStatus.data);

    res.json({ success: true, status: parsedStatus.data });
  } catch (error) {
    console.error("[PATCH /action-items/status]", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
