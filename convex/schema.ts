import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Detection submissions from the public app
  detections: defineTable({
    // Image storage
    storageId: v.id("_storage"),
    imageUrl: v.optional(v.string()),

    // Analysis results
    species: v.optional(v.string()),
    confidence: v.number(),
    isThreat: v.boolean(),
    threatLevel: v.union(v.literal("safe"), v.literal("low"), v.literal("medium"), v.literal("high")),

    // Geographic data (reduced precision for privacy)
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),

    // AI analysis details
    aiResponse: v.string(),
    analysisFeatures: v.optional(v.array(v.string())),
    referenceImages: v.optional(v.array(v.object({
      url: v.string(),
      description: v.string(),
      source: v.optional(v.string())
    }))),

    // Metadata
    submittedAt: v.number(),
    sessionId: v.optional(v.string()),

    // Privacy consent
    privacyConsentGiven: v.optional(v.boolean()),
    locationSharingConsent: v.optional(v.boolean()),
  })
  .index("by_threat", ["isThreat"])
  .index("by_submitted", ["submittedAt"]),
});
