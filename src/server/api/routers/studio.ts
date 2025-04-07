import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import axios from "axios";
import { z } from "zod";
import { env } from "~/env";

export const studioRouter = createTRPCRouter({
    allowedTraits: publicProcedure
        .input(z.object({ nftAddress: z.string() }))
        .output(
            z.object({
                head: z.array(
                    z.object({ trait: z.string(), collection: z.string() }),
                ),
                clothes: z.array(
                    z.object({ trait: z.string(), collection: z.string() }),
                ),
                eyewear: z.array(
                    z.object({ trait: z.string(), collection: z.string() }),
                ),
                background: z.array(
                    z.object({ trait: z.string(), collection: z.string() }),
                ),
                fur: z.array(
                    z.object({ trait: z.string(), collection: z.string() }),
                ),
                eyes: z.array(
                    z.object({ trait: z.string(), collection: z.string() }),
                ),
                mouth: z.array(
                    z.object({ trait: z.string(), collection: z.string() }),
                ),
                extra: z.array(
                    z.object({ trait: z.string(), collection: z.string() }),
                ),
            }),
        )
        .query(async ({ input }) => {
            try {
                const response = await axios.post(
                    `${env.STUDIO_API_URL}/generator/allowedTraits`,
                    {
                        nftAddress: input.nftAddress,
                    },
                );

                return response.data;
            } catch (error) {
                console.error(error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "unknown error",
                });
            }
        }),
    generate: publicProcedure
        .input(
            z.object({
                nftAddress: z.string(),
                traits: z.array(
                    z.object({ type: z.string(), trait: z.string() }),
                ),
                size: z.number(),
            }),
        )
        .output(z.string())
        .query(async ({ input }) => {
            try {
                const filteredTraits = input.traits.filter(
                    (trait) => trait.trait.length > 0,
                );

                const response = await axios.post(
                    `${env.STUDIO_API_URL}/generator/create`,
                    {
                        nftAddress: input.nftAddress,
                        traits: filteredTraits,
                        size: input.size,
                    },
                    { responseType: "arraybuffer" },
                );

                const convertedImage = Buffer.from(
                    response.data,
                    "binary",
                ).toString("base64");

                return convertedImage;
            } catch (error) {
                console.error(error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "unknown error",
                });
            }
        }),
    download: publicProcedure
        .input(
            z.object({
                nftAddress: z.string(),
                traits: z.array(
                    z.object({ type: z.string(), trait: z.string() }),
                ),
            }),
        )
        .output(z.string())
        .mutation(async ({ input }) => {
            try {
                const filteredTraits = input.traits.filter(
                    (trait) => trait.trait.length > 0,
                );

                await axios.post(
                    `${env.STUDIO_API_URL}/generator/create`,
                    {
                        nftAddress: input.nftAddress,
                        traits: filteredTraits,
                    },
                    { responseType: "arraybuffer" },
                );

                const response = await axios.post(
                    `${env.STUDIO_API_URL}/generator/download`,
                    {
                        nftAddress: input.nftAddress,
                        traits: filteredTraits,
                    },
                );

                return response.data;
            } catch (error) {
                console.error(error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "unknown error",
                });
            }
        }),
});
