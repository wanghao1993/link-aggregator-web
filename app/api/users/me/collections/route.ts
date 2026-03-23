import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, getAuthUser } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: collections, error } = await supabaseAdmin
      .from("collections")
      .select("id, title, category")
      .eq("user_id", authUser.id)
      .order("updated_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Failed to fetch user collections:", error);
      return NextResponse.json(
        { error: "Failed to fetch collections" },
        { status: 500 }
      );
    }

    return NextResponse.json({ collections: collections || [] });
  } catch (error) {
    console.error("Get user collections error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
