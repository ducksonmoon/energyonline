"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  verifyPasswordConstantTime,
  createSession,
  checkLoginRateLimit,
  recordFailedLogin,
  clearLoginAttempts,
} from "@/lib/auth";
import { toFa } from "@/lib/format";

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export type LoginState = { error: string } | undefined;

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = schema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "نام کاربری و رمز عبور را وارد کنید" };
  }

  const { username, password } = parsed.data;

  const rateLimit = checkLoginRateLimit(username);
  if (!rateLimit.allowed) {
    const minutes = Math.max(1, Math.ceil(rateLimit.retryAfterMs / 60000));
    return { error: `تلاش‌های ناموفق زیاد بود. ${toFa(minutes)} دقیقه دیگر دوباره امتحان کن` };
  }

  const user = await db.adminUser.findUnique({ where: { username } });
  const passwordOk = await verifyPasswordConstantTime(password, user?.passwordHash ?? null);
  if (!user || !passwordOk) {
    recordFailedLogin(username);
    return { error: "نام کاربری یا رمز عبور اشتباه است" };
  }

  clearLoginAttempts(username);
  await createSession(user.id, user.username);
  redirect("/admin");
}
