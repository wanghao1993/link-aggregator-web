import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { verifyCaptcha } from "@/lib/captcha";

const verifyCredentialsSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  captchaToken: z.string().min(1, "Captcha token is required"),
  captchaInput: z.string().min(1, "Captcha input is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = verifyCredentialsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, captchaToken, captchaInput } = parsed.data;

    if (!verifyCaptcha(captchaToken, captchaInput)) {
      return NextResponse.json(
        { error: "captcha_invalid" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    await supabase.auth.signOut();

    return NextResponse.json(
      {
        message: "Credentials verified",
        user: {
          id: data.user.id,
          name: data.user.user_metadata?.name,
          email: data.user.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verify credentials error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
