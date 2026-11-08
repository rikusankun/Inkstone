import NextAuth from "next-auth";
import Nodemailer from "next-auth/providers/nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAIL = "lushanjun@proton.me";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  session: { strategy: "database" }, // 走 Session 表；改成 "jwt" 时下方 jwt callback 生效
  pages: { signIn: "/login", verifyRequest: "/login" },
  providers: [
    Nodemailer({
      // 覆盖默认 id "nodemailer"，保证 signIn("email", ...) 能命中
      id: "email",
      name: "Email",
      // 占位配置：sendVerificationRequest 被重写，不会真的连 SMTP / 发邮件
      server: { host: "localhost", port: 1025, auth: { user: "", pass: "" } },
      from: "Inkstone <noreply@inkstone.dev>",
      async sendVerificationRequest({ identifier, url, expires }) {
        console.log("\n========== Inkstone 登录链接 ==========");
        console.log(`邮箱: ${identifier}`);
        console.log(`链接: ${url}`);
        console.log(`过期: ${expires.toISOString()}`);
        console.log("把上面的链接粘贴到浏览器即可完成登录");
        console.log("======================================\n");
      },
    }),
  ],
  callbacks: {
    // 首次登录时把管理员角色落库；普通用户保持 schema 默认值 "USER"
    async signIn({ user }) {
      if (user.email === ADMIN_EMAIL) {
        try {
          await prisma.user.update({
            where: { email: ADMIN_EMAIL },
            data: { role: "ADMIN" },
          });
        } catch (error) {
          console.error("[auth] 设置 ADMIN 角色失败", error);
        }
      }
      return true;
    },
    // 用统一 params 取值，兼容 database / jwt 两种 strategy 的类型签名
    async session(params) {
      const { session } = params;
      const dbUser = (params as { user?: { id?: string; role?: string } }).user;
      const token = (params as { token?: { sub?: string; role?: string } }).token;
      const email = session.user?.email;

      session.user.id = dbUser?.id ?? token?.sub ?? "";
      const role = dbUser?.role ?? token?.role ?? "USER";
      session.user.role = email === ADMIN_EMAIL ? "ADMIN" : role;
      return session;
    },
    // 仅当 session.strategy 改为 "jwt" 时生效
    async jwt({ token, user }) {
      if (user) {
        token.role =
          (user as { role?: string }).role ?? (user.email === ADMIN_EMAIL ? "ADMIN" : "USER");
      }
      return token;
    },
  },
});
