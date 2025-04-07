import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
    getActivePresales,
    getAllowedPresalesByUser,
} from "~/server/queries/presales";

export const presalesRouter = createTRPCRouter({
    getAllowedPresales: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.session.user.id;
        return await getAllowedPresalesByUser(ctx.db).execute({ userId });
    }),
    getActivePresales: protectedProcedure.query(async ({ ctx }) => {
        return await getActivePresales(ctx.db);
    }),
});
