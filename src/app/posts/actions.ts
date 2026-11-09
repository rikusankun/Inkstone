"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type RedeemResult =
  | { ok: false; error: string }
  | { ok: true; alreadyUnlocked: boolean };

// 读者兑换：校验兑换码 -> 核销 -> 记录权益（幂等）
export async function redeemCode(postId: string, rawCode: string): Promise<RedeemResult> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return { ok: false, error: "请先登录后再兑换" };

  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, error: "请输入兑换码" };

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) return { ok: false, error: "账号不存在，请重新登录" };

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, title: true, price: true },
  });
  if (!post) return { ok: false, error: "文章不存在" };

  const redeem = await prisma.redeemCode.findUnique({ where: { code } });
  if (!redeem) return { ok: false, error: "兑换码无效" };
  if (redeem.usedAt) return { ok: false, error: "该兑换码已被使用" };
  if (redeem.postId !== postId) return { ok: false, error: "该兑换码不适用于本篇文章" };

  // 已解锁过：直接返回，不核销新码（避免用户白丢兑换码）
  const existed = await prisma.unlock.findUnique({
    where: { userId_postId: { userId: user.id, postId } },
  });
  if (existed) {
    return { ok: true, alreadyUnlocked: true };
  }

  await prisma.$transaction([
    prisma.redeemCode.update({
      where: { id: redeem.id },
      data: { usedById: user.id, usedAt: new Date() },
    }),
    prisma.unlock.upsert({
      where: { userId_postId: { userId: user.id, postId } },
      create: {
        userId: user.id,
        postId,
        code,
        amount: redeem.amount || post.price,
      },
      update: {},
    }),
  ]);

  revalidatePath(`/posts/${postId}`);
  revalidatePath("/");
  return { ok: true, alreadyUnlocked: Boolean(existed) };
}
