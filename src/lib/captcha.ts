import crypto from "crypto";

const CAPTCHA_SECRET =
  process.env.CAPTCHA_SECRET || "linkhub-captcha-secret-key-change-in-prod";
const CAPTCHA_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function generateCaptchaCode(length = 4): string {
  const digits = "0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += digits[crypto.randomInt(0, digits.length)];
  }
  return code;
}

export function signCaptcha(code: string): string {
  const expiresAt = Date.now() + CAPTCHA_TTL_MS;
  const payload = `${code}:${expiresAt}`;
  const hmac = crypto
    .createHmac("sha256", CAPTCHA_SECRET)
    .update(payload)
    .digest("hex");
  const data = Buffer.from(JSON.stringify({ code, expiresAt, hmac })).toString(
    "base64url"
  );
  return data;
}

export function verifyCaptcha(token: string, userInput: string): boolean {
  try {
    const json = JSON.parse(Buffer.from(token, "base64url").toString("utf-8"));
    const { code, expiresAt, hmac } = json;

    if (Date.now() > expiresAt) return false;

    const expectedHmac = crypto
      .createHmac("sha256", CAPTCHA_SECRET)
      .update(`${code}:${expiresAt}`)
      .digest("hex");

    if (!crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac))) {
      return false;
    }

    return userInput.trim() === code;
  } catch {
    return false;
  }
}

function randomInt(min: number, max: number): number {
  return crypto.randomInt(min, max);
}

export function generateCaptchaSvg(code: string): string {
  const width = 160;
  const height = 56;
  const fontSize = 30;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
  svg += `<rect width="100%" height="100%" fill="#f0f0f0"/>`;

  // Noise lines
  for (let i = 0; i < 6; i++) {
    const x1 = randomInt(0, width);
    const y1 = randomInt(0, height);
    const x2 = randomInt(0, width);
    const y2 = randomInt(0, height);
    const r = randomInt(100, 200);
    const g = randomInt(100, 200);
    const b = randomInt(100, 200);
    svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgb(${r},${g},${b})" stroke-width="1"/>`;
  }

  // Noise dots
  for (let i = 0; i < 30; i++) {
    const cx = randomInt(0, width);
    const cy = randomInt(0, height);
    const r = randomInt(120, 200);
    const g = randomInt(120, 200);
    const b = randomInt(120, 200);
    svg += `<circle cx="${cx}" cy="${cy}" r="1.5" fill="rgb(${r},${g},${b})"/>`;
  }

  // Characters
  const charWidth = width / (code.length + 1);
  for (let i = 0; i < code.length; i++) {
    const x = charWidth * (i + 0.5) + randomInt(-4, 4);
    const y = height / 2 + fontSize / 3 + randomInt(-4, 4);
    const rotate = randomInt(-20, 20);
    const r = randomInt(20, 100);
    const g = randomInt(20, 100);
    const b = randomInt(20, 100);
    svg += `<text x="${x}" y="${y}" font-size="${fontSize}" font-family="monospace" font-weight="bold" fill="rgb(${r},${g},${b})" transform="rotate(${rotate}, ${x}, ${y})">${code[i]}</text>`;
  }

  // Curved noise lines
  for (let i = 0; i < 2; i++) {
    const y1 = randomInt(10, height - 10);
    const y2 = randomInt(10, height - 10);
    const cpx = randomInt(40, width - 40);
    const cpy = randomInt(0, height);
    const r = randomInt(130, 200);
    const g = randomInt(130, 200);
    const b = randomInt(130, 200);
    svg += `<path d="M0,${y1} Q${cpx},${cpy} ${width},${y2}" fill="none" stroke="rgb(${r},${g},${b})" stroke-width="1.5"/>`;
  }

  svg += `</svg>`;
  return svg;
}
