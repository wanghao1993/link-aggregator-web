import { NextResponse } from "next/server";
import {
  generateCaptchaCode,
  generateCaptchaSvg,
  signCaptcha,
} from "@/lib/captcha";

export async function GET() {
  const code = generateCaptchaCode(4);
  const svg = generateCaptchaSvg(code);
  const token = signCaptcha(code);

  return NextResponse.json({ svg, token });
}
