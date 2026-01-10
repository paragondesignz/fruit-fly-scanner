import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  species: defineTable({
    commonName: v.string(),
    scientificName: v.string(),
    abbreviation: v.optional(v.string()),
    characteristics: v.object({
      sizeRange: v.string(),
      primaryColor: v.string(),
      keyFeatures: v.array(v.string()),
      distinguishingMarks: v.string(),
    }),
    detection: v.object({
      alertThreshold: v.number(),
      matchingCriteria: v.array(v.string()),
      exclusionCriteria: v.array(v.string()),
    }),
    biosecurity: v.object({
      threatLevel: v.union(
        v.literal("critical"),
        v.literal("high"),
        v.literal("moderate")
      ),
      isReportable: v.boolean(),
      recentDetections: v.optional(v.string()),
      primaryHosts: v.array(v.string()),
    }),
    mpiInfo: v.object({
      infoUrl: v.string(),
      reportingPhone: v.string(),
    }),
    display: v.object({
      iconColor: v.string(),
      sortOrder: v.number(),
      isActive: v.boolean(),
    }),
  }),

  sessions: defineTable({
    token: v.string(),
    expiresAt: v.number(),
  }).index("by_token", ["token"]),

  auditLog: defineTable({
    action: v.string(),
    speciesId: v.optional(v.id("species")),
    speciesName: v.string(),
    changes: v.optional(v.string()),
    timestamp: v.number(),
  }),
});
