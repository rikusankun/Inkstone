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
