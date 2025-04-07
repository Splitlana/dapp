import { TRPCError } from "@trpc/server";
import { getListings } from "~/blockchain/get-listings";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import axios from "axios";
import { z } from "zod";
import { Helius } from "helius-sdk";
import { env } from "~/env";
import { VersionedTransaction } from "@solana/web3.js";

const helius = new Helius(env.SOL_SCORE_CHECKER_API_KEY);

export const collectionRouter = createTRPCRouter({
    listed: publicProcedure.query(async () => {
        try {
            const collection = await getListings();

            return collection;
        } catch (error) {
            console.error(error);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "unknown error",
            });
        }
    }),
    getBuyTransactions: publicProcedure
        .input(
            z.object({
                buyer: z.string(),
                mint: z.string(),
                owner: z.string(),
                maxPrice: z.string(),
            }),
        )
        .mutation(async ({ input }) => {
            const buyUrl = "https://api.mainnet.tensordev.io/api/v1/tx/buy";
            try {
                const blockhash = await helius.connection.getLatestBlockhash();
                const response = await axios.get(buyUrl, {
                    params: { ...input, blockhash: blockhash.blockhash },
                    headers: {
                        accept: "application/json",
                        "x-tensor-api-key": process.env.TENSOR_API_KEY,
                    },
                });

                return response.data;
            } catch (error) {
                console.error("Error proxying request to Tensor API:", error);
                throw new Error(
                    "An error occurred while processing your request",
                );
            }
        }),
    sendBuyTransaction: publicProcedure
        .input(
            z.object({
                transaction: z.string(),
            }),
        )
        .mutation(async ({ input }) => {
            try {
                const blockhash = await helius.connection.getLatestBlockhash();
                const tx = VersionedTransaction.deserialize(
                    Buffer.from(input.transaction, "base64"),
                );

                const signature = await helius.connection.sendRawTransaction(
                    tx.serialize(),
                    {
                        maxRetries: 0,
                        skipPreflight: true,
                        preflightCommitment: "confirmed",
                    },
                );

                const abortSignal = AbortSignal.timeout(15000);
                await helius.connection.confirmTransaction(
                    {
                        abortSignal,
                        signature,
                        blockhash: blockhash.blockhash,
                        lastValidBlockHeight:
                            blockhash.lastValidBlockHeight + 150,
                    },
                    "confirmed",
                );

                abortSignal.removeEventListener("abort", () => {});

                return signature;
            } catch (error) {
                console.error("Error proxying request to Tensor API:", error);
                throw new Error(
                    "An error occurred while processing your request",
                );
            }
        }),
});
