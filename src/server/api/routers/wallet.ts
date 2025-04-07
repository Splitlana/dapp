import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { env } from "~/env";
import { TRPCError } from "@trpc/server";

const SIMPLEHASH_BASE_URL =
    "https://api.simplehash.com/api/v0/fungibles/balances";
const SOLANA_USDC_ADDRESS =
    "solana.EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

interface WalletBalance {
    address: string;
    quantity: number;
    quantity_string: string;
    first_transferred_date: string;
    last_transferred_date: string;
    subaccounts: Array<{
        account: string;
        quantity: number;
        quantity_string: string;
    }>;
}

interface FungibleToken {
    fungible_id: string;
    name: string;
    symbol: string;
    decimals: number;
    chain: string;
    total_quantity: number;
    total_quantity_string: string;
    queried_wallet_balances: WalletBalance[];
}

interface SimpleHashFungiblesResponse {
    next_cursor: string | null;
    fungibles: FungibleToken[];
}

export const walletRouter = createTRPCRouter({
    getBalance: publicProcedure
        .input(
            z.object({
                address: z.string(),
            }),
        )
        .query(async ({ input }) => {
            try {
                const url = new URL(SIMPLEHASH_BASE_URL);
                url.searchParams.append("chains", "solana");
                url.searchParams.append("wallet_addresses", input.address);
                url.searchParams.append("fungible_ids", SOLANA_USDC_ADDRESS);
                url.searchParams.append("include_prices", "0");

                const response = await fetch(url, {
                    headers: {
                        accept: "application/json",
                        "X-API-KEY": env.BTC_SCORE_CHECKER_API_KEY,
                    },
                });

                if (!response.ok) {
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Failed to fetch wallet data",
                    });
                }

                const data =
                    (await response.json()) as SimpleHashFungiblesResponse;

                const usdcToken = data.fungibles.find(
                    (token) => token.fungible_id === SOLANA_USDC_ADDRESS,
                );

                if (!usdcToken) {
                    return {
                        balance: "0",
                        rawBalance: "0",
                        decimals: 6,
                        lastTransferred: null,
                    };
                }

                const walletBalance = usdcToken.queried_wallet_balances.find(
                    (balance) => balance.address === input.address,
                );

                if (!walletBalance) {
                    return {
                        balance: "0",
                        rawBalance: "0",
                        decimals: usdcToken.decimals,
                        lastTransferred: null,
                    };
                }

                // Format the balance with proper decimals
                const balance = (
                    Number(walletBalance.quantity_string) /
                    Math.pow(10, usdcToken.decimals)
                ).toString();

                return {
                    balance,
                    rawBalance: walletBalance.quantity_string,
                    decimals: usdcToken.decimals,
                    lastTransferred: walletBalance.last_transferred_date,
                };
            } catch (error) {
                if (error instanceof TRPCError) throw error;

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to fetch wallet balance",
                });
            }
        }),
});
