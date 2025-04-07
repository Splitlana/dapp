import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getVisibleBoosts } from "~/server/queries/boosts";

export const boostsRouter = createTRPCRouter({
    getBoosts: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.session.user.id;
        const boosts = await getVisibleBoosts(ctx.db).execute({ userId });
        return boosts
            .map((boost) => {
                if (boost.hiddenPoints) {
                    boost.points = 0;
                }

                const completed = boost.boostsCompleted.length > 0;
                return { ...boost, completed };
            })
            .sort(
                (a, b) =>
                    Number(b.completed) - Number(a.completed) ||
                    b.points - a.points,
            );
    }),
});
