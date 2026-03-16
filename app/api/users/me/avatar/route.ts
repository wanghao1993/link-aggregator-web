import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, getAuthUser } from '@/lib/supabase/server';

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

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${authUser.id}/${Date.now()}.${fileExt}`;
    const bucketName = "avatars";

    // Check if bucket exists, create if not
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.name === bucketName);

    if (!bucketExists) {
      await supabaseAdmin.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: maxSize,
      });
    }

    // Upload file to Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload avatar" },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(uploadData.path);

    const avatarUrl = urlData.publicUrl;

    // Check if profile exists
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .eq("user_id", authUser.id)
      .single();

    let updateError;
    if (existingProfile) {
      // Update existing profile
      const result = await supabaseAdmin
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("user_id", authUser.id);
      updateError = result.error;
    } else {
      // Ensure user record exists before creating profile (foreign key constraint)
      const userExists = await ensureUserRecord(authUser);
      if (!userExists) {
        return NextResponse.json(
          { error: "Failed to create user record" },
          { status: 500 }
        );
      }

      // Create profile if it doesn't exist (for OAuth users)
      const result = await supabaseAdmin
        .from("profiles")
        .insert({
          user_id: authUser.id,
          avatar_url: avatarUrl,
          username: authUser.email?.split("@")[0] || "",
          display_name: (authUser.user_metadata?.name as string) || "",
        });
      updateError = result.error;
    }

    if (updateError) {
      console.error("Update profile error:", updateError);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    // Also update user metadata in auth
    await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
      user_metadata: {
        ...authUser.user_metadata,
        avatar_url: avatarUrl,
      },
    });

    return NextResponse.json({
      message: "Avatar uploaded successfully",
      avatarUrl,
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
