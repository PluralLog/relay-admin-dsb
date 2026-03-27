/**
 * Admin authentication.
 * 
 * The admin logs into the dashboard with a password. The password hash
 * is stored in ADMIN_PASSWORD_HASH (bcrypt). On successful login, we
 * issue a short-lived JWT stored in an httpOnly cookie.
 * 
 * Generate a password hash:
 *   node -e "const b=require('bcryptjs');console.log(b.hashSync('yourpassword',12))"
 */
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";


const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.ADMIN_TOKEN || "change-me-in-production"
);
const COOKIE_NAME = "polylog_admin_session";
const SESSION_DURATION = 60 * 60 * 8; // 8 hours

export async function createSession() {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(JWT_SECRET);

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  });
}

export async function verifySession() {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;

  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function destroySession() {
  cookies().delete(COOKIE_NAME);
}

export async function checkPassword(password) {
  const bcryptModule = await import("bcryptjs");
  const bcrypt = bcryptModule.default || bcryptModule;


  const hash = process.env.ADMIN_PASSWORD_HASH;
  console.log(hash)

  if (!hash) {
    return password === (process.env.ADMIN_TOKEN || "");
  }

  return await bcrypt.compare(password, hash);
}