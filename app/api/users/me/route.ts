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

    const { error } = await supabaseAdmin
      .from("profiles")
      .update(updates)
      .eq("user_id", authUser.id);

    if (error) {
      console.error("Update profile error:", error);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    if (displayName !== undefined) {
      await supabaseAdmin
        .from("users")
        .update({ name: displayName })
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
