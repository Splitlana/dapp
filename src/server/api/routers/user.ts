import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  getUserProfile: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user;
    console.log("userId:", userId);
    try {
      const profile = { testProfile: "testValue" };
      return profile;
    } catch (error) {
      console.error(error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "unknown error",
      });
    }
  }),
  testPublicEndpoint: publicProcedure.query(() => {
    return "test works";
  }),
});
