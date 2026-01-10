import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Public query - list all active species for scanner UI
export const list = query({
  args: {},
  handler: async (ctx) => {
    const species = await ctx.db
      .query("species")
      .collect();
    return species
      .filter((s) => s.display.isActive)
      .sort((a, b) => a.display.sortOrder - b.display.sortOrder);
  },
});

// Public query - list all species (including inactive) for admin
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const species = await ctx.db
      .query("species")
      .collect();
    return species.sort((a, b) => a.display.sortOrder - b.display.sortOrder);
  },
});

// Get single species by ID
export const get = query({
  args: { id: v.id("species") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create new species (admin only - auth checked by frontend)
export const create = mutation({
  args: {
    sessionToken: v.string(),
    species: v.object({
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
  },
  handler: async (ctx, args) => {
    // Verify session
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    const speciesId = await ctx.db.insert("species", args.species);

    // Log the action
    await ctx.db.insert("auditLog", {
      action: "create",
      speciesId,
      speciesName: args.species.commonName,
      timestamp: Date.now(),
    });

    return speciesId;
  },
});

// Update species (admin only)
export const update = mutation({
  args: {
    sessionToken: v.string(),
    id: v.id("species"),
    species: v.object({
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
  },
  handler: async (ctx, args) => {
    // Verify session
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Species not found");
    }

    await ctx.db.patch(args.id, args.species);

    // Log the action
    await ctx.db.insert("auditLog", {
      action: "update",
      speciesId: args.id,
      speciesName: args.species.commonName,
      changes: JSON.stringify({
        before: existing.commonName,
        after: args.species.commonName,
      }),
      timestamp: Date.now(),
    });

    return args.id;
  },
});

// Delete species (admin only)
export const remove = mutation({
  args: {
    sessionToken: v.string(),
    id: v.id("species"),
  },
  handler: async (ctx, args) => {
    // Verify session
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Species not found");
    }

    await ctx.db.delete(args.id);

    // Log the action
    await ctx.db.insert("auditLog", {
      action: "delete",
      speciesName: existing.commonName,
      timestamp: Date.now(),
    });

    return true;
  },
});

// Seed default species (one-time setup)
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query("species").first();
    if (existing) {
      return { message: "Species already seeded", count: 0 };
    }

    const defaultSpecies = [
      {
        commonName: "Queensland Fruit Fly",
        scientificName: "Bactrocera tryoni",
        abbreviation: "QFly",
        characteristics: {
          sizeRange: "~7mm",
          primaryColor: "reddish-brown",
          keyFeatures: [
            "Yellow scutellum (shield on rear thorax)",
            "Clear wings with dark brown costal band",
            "Wasp-like narrow waist",
            "Abdomen with yellow and brown banding",
          ],
          distinguishingMarks:
            "Yellow scutellum (shield on rear thorax) - KEY FEATURE",
        },
        detection: {
          alertThreshold: 2,
          matchingCriteria: [
            "Body size ~7mm (smaller than housefly)",
            "Reddish-brown coloring with distinctive yellow markings",
            "Clear wings with dark brown costal band",
            "Yellow scutellum - KEY FEATURE",
            "Wasp-like narrow waist",
            "Abdomen with yellow and brown banding",
          ],
          exclusionCriteria: [
            "Metallic blue/green coloring (blow fly)",
            "Much larger than 7mm (house fly)",
            "Grey body color",
          ],
        },
        biosecurity: {
          threatLevel: "critical" as const,
          isReportable: true,
          recentDetections: "Mt Roskill, Auckland",
          primaryHosts: ["stone fruit", "citrus", "tomatoes", "peppers"],
        },
        mpiInfo: {
          infoUrl:
            "https://www.mpi.govt.nz/biosecurity/pest-and-disease-threats-to-new-zealand/horticultural-pest-and-disease-threats-to-new-zealand/queensland-fruit-fly",
          reportingPhone: "0800 80 99 66",
        },
        display: {
          iconColor: "red-500",
          sortOrder: 1,
          isActive: true,
        },
      },
      {
        commonName: "Oriental Fruit Fly",
        scientificName: "Bactrocera dorsalis",
        abbreviation: "OFF",
        characteristics: {
          sizeRange: "~8mm",
          primaryColor: "dark/black",
          keyFeatures: [
            "Mostly dark/black thorax with yellow markings",
            "Clear wings with dark costal band",
            'Distinct dark "T" shaped marking on abdomen',
            "Yellow scutellum",
            "Yellow lateral stripes on thorax",
          ],
          distinguishingMarks:
            'Dark "T" shaped marking on abdomen - KEY FEATURE',
        },
        detection: {
          alertThreshold: 2,
          matchingCriteria: [
            "Body size ~8mm (slightly larger than Queensland Fruit Fly)",
            "Mostly dark/black thorax with yellow markings",
            "Clear wings with dark costal band",
            'Distinct dark "T" shaped marking on abdomen',
            "Yellow scutellum",
            "Yellow lateral stripes on thorax",
          ],
          exclusionCriteria: [
            "Metallic blue/green coloring",
            "Grey body without yellow markings",
            "No wing markings",
          ],
        },
        biosecurity: {
          threatLevel: "critical" as const,
          isReportable: true,
          primaryHosts: ["mango", "papaya", "citrus", "stone fruit"],
        },
        mpiInfo: {
          infoUrl:
            "https://www.mpi.govt.nz/biosecurity/pest-and-disease-threats-to-new-zealand/horticultural-pest-and-disease-threats-to-new-zealand",
          reportingPhone: "0800 80 99 66",
        },
        display: {
          iconColor: "amber-500",
          sortOrder: 2,
          isActive: true,
        },
      },
      {
        commonName: "Spotted-wing Drosophila",
        scientificName: "Drosophila suzukii",
        abbreviation: "SWD",
        characteristics: {
          sizeRange: "2-3mm",
          primaryColor: "light brown/tan",
          keyFeatures: [
            "Small body ~2-3mm (vinegar fly size)",
            "Males: distinctive dark spot on each wing",
            "Light brown/tan body with red eyes",
            "Females: large serrated ovipositor",
          ],
          distinguishingMarks:
            "Males: dark spot on each wing - KEY FEATURE for males",
        },
        detection: {
          alertThreshold: 2,
          matchingCriteria: [
            "Small body ~2-3mm (vinegar fly size)",
            "Males: distinctive dark spot on each wing - KEY FEATURE",
            "Light brown/tan body with red eyes",
            "Attacks FRESH soft fruit (unlike other vinegar flies)",
            "Females: large serrated ovipositor",
            "Found on berries, cherries, grapes, stone fruit",
          ],
          exclusionCriteria: [
            "No wing spots (common vinegar fly)",
            "Attacks only rotting fruit",
            "Much larger than 3mm",
          ],
        },
        biosecurity: {
          threatLevel: "high" as const,
          isReportable: true,
          primaryHosts: ["berries", "cherries", "grapes", "stone fruit"],
        },
        mpiInfo: {
          infoUrl:
            "https://www.mpi.govt.nz/biosecurity/pest-and-disease-threats-to-new-zealand/horticultural-pest-and-disease-threats-to-new-zealand",
          reportingPhone: "0800 80 99 66",
        },
        display: {
          iconColor: "orange-500",
          sortOrder: 3,
          isActive: true,
        },
      },
    ];

    for (const species of defaultSpecies) {
      await ctx.db.insert("species", species);
    }

    return { message: "Seeded successfully", count: defaultSpecies.length };
  },
});

// Get audit log (admin only)
export const getAuditLog = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("auditLog")
      .order("desc")
      .take(args.limit ?? 50);
    return logs;
  },
});
