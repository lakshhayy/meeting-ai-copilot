import { db } from "./db";
import {
  users, workspaces, workspaceMembers,
  type User, type InsertUser,
  type Workspace, type InsertWorkspace,
  type WorkspaceMember, type InsertWorkspaceMember,
  type WorkspaceResponse, type WorkspaceDetailResponse
} from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

export interface IStorage {
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
}

export class DatabaseStorage implements IStorage {
  async getUserByClerkId(clerkId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getWorkspacesForUser(userId: string): Promise<WorkspaceResponse[]> {
    // Get workspaces where the user is a member, along with member count
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
      .select({
        member: workspaceMembers,
        user: users
      })
      .from(workspaceMembers)
      .innerJoin(users, eq(workspaceMembers.userId, users.id))
      .where(eq(workspaceMembers.workspaceId, workspace.id));

    return {
      ...workspace,
      members: members.map(m => ({ ...m.member, user: m.user }))
    };
  }

  async getWorkspaceById(id: string): Promise<Workspace | undefined> {
    const [workspace] = await db.select().from(workspaces).where(eq(workspaces.id, id));
    return workspace;
  }

  async createWorkspace(insertWorkspace: InsertWorkspace, ownerId: string): Promise<WorkspaceResponse> {
    return await db.transaction(async (tx) => {
      const [workspace] = await tx
        .insert(workspaces)
        .values({ ...insertWorkspace, ownerId })
        .returning();

      await tx
        .insert(workspaceMembers)
        .values({
          workspaceId: workspace.id,
          userId: ownerId,
          role: "admin"
        });

      return { ...workspace, memberCount: 1 };
    });
  }

  async addMemberToWorkspace(workspaceId: string, userId: string, role: "admin" | "member"): Promise<WorkspaceMember> {
    const [member] = await db
      .insert(workspaceMembers)
      .values({ workspaceId, userId, role })
      .returning();
    return member;
  }

  async getWorkspaceMember(workspaceId: string, userId: string): Promise<WorkspaceMember | undefined> {
    const [member] = await db
      .select()
      .from(workspaceMembers)
      .where(and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userId)
      ));
    return member;
  }

  async removeMember(workspaceId: string, userId: string): Promise<void> {
    await db
      .delete(workspaceMembers)
      .where(and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userId)
      ));
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
}

export const storage = new DatabaseStorage();
