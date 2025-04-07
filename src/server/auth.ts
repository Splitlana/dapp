// import { DrizzleAdapter } from "@auth/drizzle-adapter";
// import {
//   getServerSession,
//   type DefaultSession,
//   type NextAuthOptions,
// } from "next-auth";
// import { type Adapter } from "next-auth/adapters";

// import { db } from "~/server/db";
// import { accounts, sessions, users } from "~/server/db/schema";

// /**
//  * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
//  * object and keep type safety.
//  *
//  * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
//  */
// declare module "next-auth" {
//   interface Session extends DefaultSession {
//     user: {
//       id: string;
//       provider: string;
//       // ...other properties
//       // role: UserRole;
//     } & DefaultSession["user"];
//   }

//   // interface User {
//   //   // ...other properties
//   //   // role: UserRole;
//   // }
// }

// export interface TokenResponse {
//   access_token: string;
//   token_type: string;
//   expires_in: number;
//   refresh_token: string;
//   scope: string;
// }

// const adapter = DrizzleAdapter(db, {
//   usersTable: users as any,
//   accountsTable: accounts as any,
//   sessionsTable: sessions,
// }) as Adapter;

// /**
//  * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
//  *
//  * @see https://next-auth.js.org/configuration/options
//  */
// export const getAuthOptions = (
//   referralCode: string | undefined
// ): NextAuthOptions => ({
//   adapter,
//   pages: {
//     signIn: "/",
//     error: "/?callbackerror=signinerror",
//   },
//   callbacks: {
//     session: ({ session, token }) => {
//       if (token) {
//         session.user.id = token.id as string;
//         session.user.image = token.image as string;
//       }
//       return session;
//     },
//     async jwt({ token, user, account }) {
//       if (account && user) {
//         token.id = user.id;
//       }
//       return token;
//     },
//   },
//   session: {
//     strategy: "jwt",
//     maxAge: 1 * 24 * 60 * 60, // 1 day
//   },
//   providers: [],
// });

// /**
//  * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
//  *
//  * @see https://next-auth.js.org/configuration/nextjs
//  */
// export const getServerAuthSession = () =>
//   getServerSession(getAuthOptions(undefined));

export const auth = "";
