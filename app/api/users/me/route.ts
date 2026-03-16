import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin, getAuthUser } from "@/lib/supabase/server";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("user_id", authUser.id)
      .single();

    const { data: user } = await supabaseAdmin
      .from("users")
      .select("name, email")
      .eq("id", authUser.id)
      .single();

    return NextResponse.json({
      id: authUser.id,
      email: user?.email || authUser.email,
      name: user?.name || "",
      displayName: profile?.display_name || user?.name || "",
      username: profile?.username || "",
      bio: profile?.bio || "",
      website: profile?.website || "",
      location: profile?.location || "",
      avatarUrl: profile?.avatar_url || "",
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

const updateProfileSchema = z.object({
  displayName: z.string().max(50).optional(),
  bio: z.string().max(200).optional(),
  website: z.string().url().or(z.literal("")).optional(),
  location: z.string().max(100).optional(),
});

/**
 * Ensure user record exists in users table before creating profile
 */
async function ensureUserRecord(authUser: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}) {
  // Check if user exists
  const { data: existingUser } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("id", authUser.id)
    .single();

  if (existingUser) {
    return true;
  }

  // Create user record
  const name = (authUser.user_metadata?.name as string) ||
    authUser.email?.split("@")[0] || "";

  const { error } = await supabaseAdmin
    .from("users")
    .upsert({
      id: authUser.id,
      name,
      email: authUser.email || "",
      email_verified: true,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "id",
      ignoreDuplicates: false,
    });

  if (error) {
    console.error("Failed to ensure user record:", error);
    return false;
  }

  return true;
}

export async function PUT(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { displayName, bio, website, location } = parsed.data;

    const updates: Record<string, string | null | undefined> = {};
    if (displayName !== undefined) updates.display_name = displayName;
    if (bio !== undefined) updates.bio = bio;
    if (website !== undefined) updates.website = website || null;
    if (location !== undefined) updates.location = location;

    // Check if profile exists
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .eq("user_id", authUser.id)
      .single();

    let error;
    if (existingProfile) {
      // Update existing profile
      const result = await supabaseAdmin
        .from("profiles")
        .update(updates)
        .eq("user_id", authUser.id);
      error = result.error;
    } else {
      // Ensure user record exists before creating profile (foreign key constraint)
      const userExists = await ensureUserRecord(authUser);
      if (!userExists) {
        return NextResponse.json(
          { error: "Failed to create user record" },
          { status: 500 }
        );
      }

      // Insert new profile
      const result = await supabaseAdmin
        .from("profiles")
        .insert({
          user_id: authUser.id,
          username: authUser.email?.split("@")[0] || "",
          ...updates,
        });
      error = result.error;
    }

    if (error) {
      console.error("Update profile error:", error);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    // Update name in users table if displayName changed
    if (displayName !== undefined) {
      await supabaseAdmin
        .from("users")
        .update({ name: displayName, updated_at: new Date().toISOString() })
        .eq("id", authUser.id);
    }

    return NextResponse.json({ message: "Profile updated" });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
