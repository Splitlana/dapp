import { desc, eq } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { tweets } from "~/server/db/schema";

export const tweetRouter = createTRPCRouter({
    getVisibleTweets: publicProcedure.query(async ({ ctx }) => {
        const visibleTweets = await ctx.db
            .select()
            .from(tweets)
            .where(eq(tweets.show, true))
            .orderBy(desc(tweets.createdAt));

        return visibleTweets;
    }),
});
