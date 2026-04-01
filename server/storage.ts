import { db } from "./db";
import {
  users, workspaces, workspaceMembers, meetings, transcripts, summaries, actionItems, // <-- meetings/transcripts tables
  type User, type InsertUser,
  type Workspace, type InsertWorkspace,
  type WorkspaceMember, type InsertWorkspaceMember,
  type WorkspaceResponse, type WorkspaceDetailResponse,
  type Meeting, type InsertMeeting, type Transcript, 
  type Summary, type InsertSummary, type ActionItem, type InsertActionItem
} from "@shared/schema";
import { eq, and, sql, desc } from "drizzle-orm"; // <-- ADDED desc for sorting

export interface IStorage {

  // ... existing interface methods
  updateMeetingStatus(id: string, status: "uploading" | "transcribing" | "analysing" | "ready" | "failed"): Promise<void>;
  createTranscript(meetingId: string, text: string): Promise<void>;
  getUserByClerkId(clerkId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getWorkspacesForUser(userId: string): Promise<WorkspaceResponse[]>;
  getWorkspaceBySlug(slug: string): Promise<WorkspaceDetailResponse | undefined>;
  getWorkspaceById(id: string): Promise<Workspace | undefined>;
  createWorkspace(workspace: InsertWorkspace, ownerId: string): Promise<WorkspaceResponse>;
  
  addMemberToWorkspace(workspaceId: string, userId: string, role: "admin" | "member"): Promise<WorkspaceMember>;
  getWorkspaceMember(workspaceId: string, userId: string): Promise<WorkspaceMember | undefined>;
  removeMember(workspaceId: string, userId: string): Promise<void>;
  getUserByEmail(email: string): Promise<User | undefined>;

  // --- NEW MEETING METHODS ---
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  getMeetingsByWorkspace(workspaceId: string): Promise<Meeting[]>;
  getMeetingById(id: string): Promise<{ meeting: Meeting, transcript: Transcript | null, summary?: Summary | null, actionItems?: ActionItem[] } | undefined>;
  
  // AI INSIGHTS METHODS
  createSummary(summary: InsertSummary): Promise<Summary>;
  createActionItems(items: InsertActionItem[]): Promise<ActionItem[]>;
  getActionItemsByWorkspace(workspaceId: string): Promise<{ item: ActionItem, meeting: Meeting }[]>;
  updateActionItemStatus(id: string, status: "pending" | "in_progress" | "done"): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // ... Keep all your existing user and workspace methods here! ...

  async getUserByClerkId(clerkId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getWorkspacesForUser(userId: string): Promise<WorkspaceResponse[]> {
    const userWorkspaces = await db
      .select({
        workspace: workspaces,
        memberCount: sql<number>`count(${workspaceMembers.id})::int`
      })
      .from(workspaces)
      .innerJoin(workspaceMembers, eq(workspaces.id, workspaceMembers.workspaceId))
      .leftJoin(
        db.select().from(workspaceMembers).as("all_members"),
        eq(workspaces.id, sql`"all_members"."workspace_id"`)
      )
      .where(eq(workspaceMembers.userId, userId))
      .groupBy(workspaces.id);
      

    return userWorkspaces.map(w => ({
      ...w.workspace,
      memberCount: w.memberCount
    }));
  }

  async getWorkspaceBySlug(slug: string): Promise<WorkspaceDetailResponse | undefined> {
    const [workspace] = await db.select().from(workspaces).where(eq(workspaces.slug, slug));
    if (!workspace) return undefined;

    const members = await db
      .select({ member: workspaceMembers, user: users })
      .from(workspaceMembers)
      .innerJoin(users, eq(workspaceMembers.userId, users.id))
      .where(eq(workspaceMembers.workspaceId, workspace.id));

    return { ...workspace, members: members.map(m => ({ ...m.member, user: m.user })) };
  }

  async getWorkspaceById(id: string): Promise<Workspace | undefined> {
    const [workspace] = await db.select().from(workspaces).where(eq(workspaces.id, id));
    return workspace;
  }

  async createWorkspace(insertWorkspace: InsertWorkspace, ownerId: string): Promise<WorkspaceResponse> {
    return await db.transaction(async (tx) => {
      const [workspace] = await tx.insert(workspaces).values({ ...insertWorkspace, ownerId }).returning();
      await tx.insert(workspaceMembers).values({ workspaceId: workspace.id, userId: ownerId, role: "admin" });
      return { ...workspace, memberCount: 1 };
    });
  }

  async addMemberToWorkspace(workspaceId: string, userId: string, role: "admin" | "member"): Promise<WorkspaceMember> {
    const [member] = await db.insert(workspaceMembers).values({ workspaceId, userId, role }).returning();
    return member;
  }

  async getWorkspaceMember(workspaceId: string, userId: string): Promise<WorkspaceMember | undefined> {
    const [member] = await db.select().from(workspaceMembers).where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId)));
    return member;
  }

  async removeMember(workspaceId: string, userId: string): Promise<void> {
    await db.delete(workspaceMembers).where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId)));
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  // --- NEW MEETING METHODS IMPLEMENTATION ---
  async createMeeting(insertMeeting: InsertMeeting): Promise<Meeting> {
    const [meeting] = await db.insert(meetings).values(insertMeeting).returning();
    return meeting;
  }

  async getMeetingsByWorkspace(workspaceId: string): Promise<Meeting[]> {
    return await db.select()
      .from(meetings)
      .where(eq(meetings.workspaceId, workspaceId))
      .orderBy(desc(meetings.createdAt)); // Newest first
  }
  // ... existing class methods
  
  async updateMeetingStatus(id: string, status: "uploading" | "transcribing" | "analysing" | "ready" | "failed"): Promise<void> {
    await db.update(meetings)
      .set({ status })
      .where(eq(meetings.id, id));
  }

  async createTranscript(meetingId: string, rawText: string): Promise<void> {
    await db.insert(transcripts).values({
      meetingId,
      rawText
    });
  }

  async getMeetingById(id: string): Promise<{ meeting: Meeting, transcript: Transcript | null, summary?: Summary | null, actionItems?: ActionItem[] } | undefined> {
    const rows = await db
      .select({
        meeting: meetings,
        transcript: transcripts,
        summary: summaries // Fetch the summary too!
      })
      .from(meetings)
      .leftJoin(transcripts, eq(meetings.id, transcripts.meetingId))
      .leftJoin(summaries, eq(meetings.id, summaries.meetingId))
      .where(eq(meetings.id, id));
    
    if (rows.length === 0) return undefined;

    // Fetch action items separately since it's one-to-many
    const tasks = await db.select().from(actionItems).where(eq(actionItems.meetingId, id));

    return {
      meeting: rows[0].meeting,
      transcript: rows[0].transcript || null,
      summary: rows[0].summary || null,
      actionItems: tasks
    };
  }

  // --- AI INSIGHTS METHODS ---
  async createSummary(insertSummary: InsertSummary): Promise<Summary> {
    const [summary] = await db.insert(summaries).values(insertSummary).returning();
    return summary;
  }

  async createActionItems(items: InsertActionItem[]): Promise<ActionItem[]> {
    if (items.length === 0) return [];
    return await db.insert(actionItems).values(items).returning();
  }

  async getActionItemsByWorkspace(workspaceId: string): Promise<{ item: ActionItem, meeting: Meeting }[]> {
    const results = await db
      .select({
        item: actionItems,
        meeting: meetings
      })
      .from(actionItems)
      .innerJoin(meetings, eq(actionItems.meetingId, meetings.id))
      .where(eq(meetings.workspaceId, workspaceId))
      .orderBy(desc(actionItems.createdAt));
      
    return results;
  }

  async updateActionItemStatus(id: string, status: "pending" | "in_progress" | "done"): Promise<void> {
    await db.update(actionItems)
      .set({ status })
      .where(eq(actionItems.id, id));
  }
}

export const storage = new DatabaseStorage();