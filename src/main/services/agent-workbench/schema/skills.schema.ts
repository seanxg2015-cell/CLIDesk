/**
 * Drizzle ORM schema for agent workbench tables: skills and user_selected_skills
 */

import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const skillsTable = sqliteTable('skills', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  icon: text('icon'), // Emoji or icon for the skill
  trigger_config: text('trigger_config').notNull(), // JSON - trigger conditions
  instruction: text('instruction').notNull(), // System prompt for the skill
  steps: text('steps'), // JSON - optional step definitions
  owner_id: text('owner_id'), // User who created the skill
  is_shared: integer('is_shared', { mode: 'boolean' }).default(false),
  is_public: integer('is_public', { mode: 'boolean' }).default(false), // Public skill visible to all users

  sort_order: integer('sort_order').notNull().default(0),

  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull()
})

export const userSelectedSkillsTable = sqliteTable('user_selected_skills', {
  user_id: text('user_id').notNull(),
  skill_id: text('skill_id').notNull(),
  enabled: integer('enabled', { mode: 'boolean' }).default(true),
  created_at: text('created_at').notNull()
})

// Indexes for skills table
export const skillsNameIdx = index('idx_skills_name').on(skillsTable.name)
export const skillsPublicIdx = index('idx_skills_public').on(skillsTable.is_public)
export const skillsOwnerIdx = index('idx_skills_owner').on(skillsTable.owner_id)
export const skillsCreatedAtIdx = index('idx_skills_created_at').on(skillsTable.created_at)

// Indexes for user_selected_skills table
export const userSelectedSkillsUserIdx = index('idx_user_selected_skills_user').on(userSelectedSkillsTable.user_id)
export const userSelectedSkillsSkillIdx = index('idx_user_selected_skills_skill').on(userSelectedSkillsTable.skill_id)

export type SkillRow = typeof skillsTable.$inferSelect
export type InsertSkillRow = typeof skillsTable.$inferInsert
export type UserSelectedSkillRow = typeof userSelectedSkillsTable.$inferSelect
export type InsertUserSelectedSkillRow = typeof userSelectedSkillsTable.$inferInsert
