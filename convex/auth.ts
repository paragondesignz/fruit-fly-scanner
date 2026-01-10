import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// 24 hours in milliseconds
const SESSION_DURATION = 24 * 60 * 60 * 1000;

// Generate a random session token
function generateSessionToken(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Login with admin token
export const login = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    // Get admin token from environment
    const adminToken = process.env.ADMIN_TOKEN;

    if (!adminToken) {
      throw new Error("Admin token not configured");
    }

    // Timing-safe comparison (basic implementation)
    if (args.token.length !== adminToken.length) {
      throw new Error("Invalid token");
    }

    let valid = true;
    for (let i = 0; i < args.token.length; i++) {
      if (args.token[i] !== adminToken[i]) {
        valid = false;
      }
    }

    if (!valid) {
      throw new Error("Invalid token");
    }

    // Create session
    const sessionToken = generateSessionToken();
    const expiresAt = Date.now() + SESSION_DURATION;

    await ctx.db.insert("sessions", {
      token: sessionToken,
      expiresAt,
    });

    return {
      sessionToken,
      expiresAt,
    };
  },
});

// Verify session token
export const verifySession = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .first();

    if (!session) {
      return { valid: false, expiresAt: null };
    }

    if (session.expiresAt < Date.now()) {
      return { valid: false, expiresAt: null };
    }

    return { valid: true, expiresAt: session.expiresAt };
  },
});

// Logout - delete session
export const logout = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }

    return { success: true };
  },
});

// Cleanup expired sessions (can be called periodically)
export const cleanupExpiredSessions = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const sessions = await ctx.db.query("sessions").collect();

    let deleted = 0;
    for (const session of sessions) {
      if (session.expiresAt < now) {
        await ctx.db.delete(session._id);
        deleted++;
      }
    }

    return { deleted };
  },
});
