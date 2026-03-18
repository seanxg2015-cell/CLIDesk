import { eq, and } from 'drizzle-orm'

import { DatabaseManager } from '../agents/database/DatabaseManager'
import { InsertSkillRow, skillsTable, userSelectedSkillsTable, type SkillRow } from './schema'

class SkillService {
  private static instance: SkillService | null = null

  static getInstance(): SkillService {
    if (!SkillService.instance) {
      SkillService.instance = new SkillService()
    }
    return SkillService.instance
  }

  private async getDatabase() {
    const dbManager = await DatabaseManager.getInstance()
    return dbManager.getDatabase()
  }

  async listPublicSkills(): Promise<SkillRow[]> {
    const database = await this.getDatabase()
    return database.select().from(skillsTable).where(eq(skillsTable.is_public, true))
  }

  async listAllSkills(): Promise<SkillRow[]> {
    const database = await this.getDatabase()
    return database.select().from(skillsTable)
  }

  async getSkill(id: string): Promise<SkillRow | undefined> {
    const database = await this.getDatabase()
    const result = await database.select().from(skillsTable).where(eq(skillsTable.id, id))
    return result[0]
  }

  async createSkill(data: Omit<InsertSkillRow, 'created_at' | 'updated_at'>): Promise<SkillRow> {
    const database = await this.getDatabase()
    const now = new Date().toISOString()
    const skillData = {
      ...data,
      created_at: now,
      updated_at: now
    }
    await database.insert(skillsTable).values(skillData as any)
    return (await this.getSkill(data.id as string)) as SkillRow
  }

  async updateSkill(
    id: string,
    updates: Partial<Omit<InsertSkillRow, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<SkillRow> {
    const database = await this.getDatabase()
    const now = new Date().toISOString()
    await database
      .update(skillsTable)
      .set({ ...updates, updated_at: now })
      .where(eq(skillsTable.id, id))
    return (await this.getSkill(id)) as SkillRow
  }

  async deleteSkill(id: string): Promise<void> {
    const database = await this.getDatabase()
    await database.delete(skillsTable).where(eq(skillsTable.id, id))
  }

  // User selected skills
  async listUserSelectedSkills(userId: string): Promise<SkillRow[]> {
    const database = await this.getDatabase()
    const selected = await database
      .select()
      .from(userSelectedSkillsTable)
      .where(eq(userSelectedSkillsTable.user_id, userId))

    if (selected.length === 0) return []

    const skillIds = selected.map((s) => s.skill_id)
    const allSkills = await database.select().from(skillsTable)
    return allSkills.filter((s) => skillIds.includes(s.id))
  }

  async selectSkill(userId: string, skillId: string): Promise<void> {
    const database = await this.getDatabase()
    const now = new Date().toISOString()
    await database
      .insert(userSelectedSkillsTable)
      .values({ user_id: userId, skill_id: skillId, enabled: true, created_at: now })
      .onConflictDoUpdate({
        target: [userSelectedSkillsTable.user_id, userSelectedSkillsTable.skill_id],
        set: { enabled: true }
      })
  }

  async deselectSkill(userId: string, skillId: string): Promise<void> {
    const database = await this.getDatabase()
    await database
      .delete(userSelectedSkillsTable)
      .where(and(eq(userSelectedSkillsTable.user_id, userId), eq(userSelectedSkillsTable.skill_id, skillId)))
  }

  async toggleSkill(userId: string, skillId: string, enabled: boolean): Promise<void> {
    const database = await this.getDatabase()
    await database
      .update(userSelectedSkillsTable)
      .set({ enabled })
      .where(and(eq(userSelectedSkillsTable.user_id, userId), eq(userSelectedSkillsTable.skill_id, skillId)))
  }
}

export const skillService = SkillService.getInstance()
