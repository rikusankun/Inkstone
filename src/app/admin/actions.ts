"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function createPost(formData: FormData) {
  // Server Action 内二次鉴权，防止绕过页面直接调用
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const isPremium = formData.get("isPremium") === "on";
  const priceRaw = formData.get("price");
  const price = isPremium && priceRaw ? Math.max(1, Math.floor(Number(priceRaw))) : 1;

  if (!title || !excerpt || !content) {
    throw new Error("标题、摘要、正文均不能为空");
  }

  // 优先按邮箱查库拿真实 user.id，避免 session 里的 id 为空或不合法导致外键失败
  const email = session.user.email;
  let authorId = "";
  if (email) {
    const dbUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    authorId = dbUser?.id ?? "";
  }
  authorId = authorId || session.user.id || "";

  if (!authorId) {
    throw new Error("无法解析当前登录用户，请重新登录后再发布");
  }

  await prisma.post.create({
    data: {
      title,
      excerpt,
      content,
      isPremium,
      price,
      published: true,
      authorId,
    },
  });

  revalidatePath("/");
  redirect("/");
}

export async function updatePost(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const isPremium = formData.get("isPremium") === "on";
  const priceRaw = formData.get("price");
  const price = isPremium && priceRaw ? Math.max(1, Math.floor(Number(priceRaw))) : 1;

  if (!id || !title || !excerpt || !content) {
    throw new Error("文章 ID、标题、摘要、正文均不能为空");
  }

  await prisma.post.update({
    where: { id },
    data: { title, excerpt, content, isPremium, price },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function deletePost(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    throw new Error("缺少文章 ID");
  }

  await prisma.post.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/admin");
}

// 兑换码字符集：去掉 I / O / 0 / 1 等易混淆字符
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode() {
  let body = "";
  for (let i = 0; i < 8; i += 1) {
    body += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return `INK-${body.slice(0, 4)}-${body.slice(4)}`;
}

// 批量为某篇文章生成兑换码
export async function generateRedeemCodes(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  const postId = String(formData.get("postId") ?? "").trim();
  const count = Math.min(50, Math.max(1, Number(formData.get("count")) || 1));

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, title: true, price: true },
  });
  if (!post) throw new Error("请选择要生成兑换码的文章");

  const codes: string[] = [];
  for (let i = 0; i < count; i += 1) {
    let code = randomCode();
    // 极小概率撞库，重试直到唯一
    while (await prisma.redeemCode.findUnique({ where: { code } })) {
      code = randomCode();
    }
    codes.push(code);
  }

  await prisma.redeemCode.createMany({
    data: codes.map((code) => ({ code, postId: post.id, amount: post.price })),
  });

  revalidatePath("/admin");
  redirect("/admin");
}

// 作废尚未使用的兑换码
export async function revokeRedeemCode(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const code = await prisma.redeemCode.findUnique({ where: { id } });
  if (!code || code.usedAt) return; // 已使用的码不可作废

  await prisma.redeemCode.delete({ where: { id } });
  revalidatePath("/admin");
}
