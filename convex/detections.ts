import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { sanitizeString, sanitizeSpeciesName, sanitizeReferenceImages, roundCoordinate } from "./lib/security";

// Internal mutation for storing detections (called from actions)
export const storeDetectionInternal = internalMutation({
  args: {
    storageId: v.id("_storage"),
    species: v.optional(v.string()),
    confidence: v.number(),
    isThreat: v.boolean(),
    threatLevel: v.union(v.literal("safe"), v.literal("low"), v.literal("medium"), v.literal("high")),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    aiResponse: v.string(),
    analysisFeatures: v.optional(v.array(v.string())),
    referenceImages: v.optional(v.array(v.object({
      url: v.string(),
      description: v.string(),
      source: v.optional(v.string())
    }))),
    userAgent: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    privacyConsentGiven: v.optional(v.boolean()),
    locationSharingConsent: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Sanitize inputs
    const sanitizedSpecies = args.species ? sanitizeSpeciesName(args.species) : undefined;
    const sanitizedFeatures = args.analysisFeatures?.map(f => sanitizeString(f, 100)).slice(0, 10);
    const sanitizedRefImages = args.referenceImages ? sanitizeReferenceImages(args.referenceImages) : undefined;

    // Round coordinates for privacy
    const shouldStoreLocation = args.locationSharingConsent ?? true;
    const sanitizedLat = shouldStoreLocation && args.latitude ? roundCoordinate(args.latitude) : undefined;
    const sanitizedLng = shouldStoreLocation && args.longitude ? roundCoordinate(args.longitude) : undefined;

    const detectionId = await ctx.db.insert("detections", {
      storageId: args.storageId,
      species: sanitizedSpecies,
      confidence: Math.min(Math.max(args.confidence, 0), 1),
      isThreat: args.isThreat,
      threatLevel: args.threatLevel,
      latitude: sanitizedLat,
      longitude: sanitizedLng,
      aiResponse: args.aiResponse.substring(0, 10000),
      analysisFeatures: sanitizedFeatures,
      referenceImages: sanitizedRefImages,
      sessionId: args.sessionId,
      privacyConsentGiven: args.privacyConsentGiven ?? false,
      locationSharingConsent: args.locationSharingConsent ?? false,
      submittedAt: Date.now(),
    });

    return detectionId;
  },
});

// Internal mutation to update reference images after async fetch
export const updateReferenceImages = internalMutation({
  args: {
    detectionId: v.id("detections"),
    referenceImages: v.array(v.object({
      url: v.string(),
      description: v.string(),
      source: v.optional(v.string())
    })),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.detectionId, {
      referenceImages: args.referenceImages,
    });
  },
});

// Get a detection with the image URL resolved
export const getDetectionWithImage = query({
  args: { id: v.id("detections") },
  handler: async (ctx, args) => {
    const detection = await ctx.db.get(args.id);
    if (!detection) return null;

    // Get the image URL from storage
    const imageUrl = await ctx.storage.getUrl(detection.storageId);

    return {
      _id: detection._id,
      _creationTime: detection._creationTime,
      species: detection.species,
      confidence: detection.confidence,
      isThreat: detection.isThreat,
      threatLevel: detection.threatLevel,
      latitude: detection.locationSharingConsent ? detection.latitude : undefined,
      longitude: detection.locationSharingConsent ? detection.longitude : undefined,
      aiResponse: detection.aiResponse,
      analysisFeatures: detection.analysisFeatures,
      referenceImages: detection.referenceImages,
      submittedAt: detection.submittedAt,
      uploadedImageUrl: imageUrl,
    };
  },
});

// Get recent public detections (for potential future feed)
export const getRecentDetections = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 20, 100);

    const detections = await ctx.db
      .query("detections")
      .withIndex("by_submitted")
      .order("desc")
      .take(limit);

    return detections.map(d => ({
      _id: d._id,
      _creationTime: d._creationTime,
      species: d.species,
      confidence: d.confidence,
      isThreat: d.isThreat,
      threatLevel: d.threatLevel,
      latitude: d.locationSharingConsent ? d.latitude : undefined,
      longitude: d.locationSharingConsent ? d.longitude : undefined,
      analysisFeatures: d.analysisFeatures,
      submittedAt: d.submittedAt,
    }));
  },
});
