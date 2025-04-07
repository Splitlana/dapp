import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { getUserClubs } from "~/server/queries/club";

export const clubRouter = createTRPCRouter({
    groups: protectedProcedure
        .input(
            z
                .object({
                    type: z.array(z.enum(["CLUB", "SQUAD"])),
                })
                .optional(),
        )
        .output(z.any())
        .query(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;
            const type = input?.type;

            try {
                return getUserClubs(ctx.db, userId, type);
            } catch (error) {
                console.error(error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "unknown error",
                });
            }
        }),
});
