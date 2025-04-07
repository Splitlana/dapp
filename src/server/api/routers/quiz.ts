import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { userAnswers, users } from "~/server/db/schema";
import {
    type QuestionWithAnswers,
    getUnansweredQuestions,
    getUserQuestionAnswers,
    getQuestionByOrderNumber,
    getAllQuestions,
} from "~/server/queries/quiz";

interface GroupedQuestion {
    id: string;
    question: string;
    type: string;
    userMcqAnswerIds: string[];
    userOpenTextAnswer: string | null;
    answers: Answer[];
}

interface Answer {
    answerId: string;
    answer: string;
}

// questionNumber, maximumAnswers
const maxAnswersMap: Record<number, number> = {
    1: 2,
    2: 4,
};

const getAnswerProcedure = (questionNumber: number) =>
    protectedProcedure
        .input(
            z.union([
                z.object({
                    questionId: z.string(),
                    mcqAnswerIds: z
                        .array(z.string())
                        .max(
                            maxAnswersMap[questionNumber] ?? 4,
                            `Choose only up to ${maxAnswersMap[questionNumber] ?? 4} answers`,
                        ),
                    openTextAnswer: z.undefined(), // Ensure this combination doesn't have openTextAnswer
                }),
                z.object({
                    questionId: z.string(),
                    mcqAnswerIds: z.undefined(), // Ensure this combination doesn't have mcqAnswerId
                    openTextAnswer: z.string().max(255), // Limit text answer to 255 chars
                }),
            ]),
        )
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;
            const { questionId, mcqAnswerIds, openTextAnswer } = input;

            const existingAnswer = await getUserQuestionAnswers(ctx.db).execute(
                {
                    questionId,
                    userId,
                },
            );

            if (existingAnswer) {
                console.log("User has already answered this question.");
                // TODO: dont send error like this, find a better way
                return new TRPCError({
                    code: "BAD_REQUEST",
                    message: "question already answered",
                });
            }

            const values = mcqAnswerIds
                ? mcqAnswerIds.map((mcqAnswerId) => ({
                      userId,
                      questionId,
                      mcqAnswerId,
                      openTextAnswer,
                  }))
                : [];

            const inserted = await ctx.db.insert(userAnswers).values(values);

            type OnboardignStep = typeof users.$inferSelect.onboardingStep;

            let onboardingStep: OnboardignStep | undefined = undefined;
            if (questionNumber === 1) {
                // question "who are you" completed, move to next step "experience_web"
                onboardingStep = "experience_web";
            } else if (questionNumber === 2) {
                // question "experience_web" completed, move to next step "boost_page"
                onboardingStep = "boost_page";
                // await processBoostsScores.trigger({
                //     userId,
                //     singleBoostType: "application_done",
                // });
            }
            if (onboardingStep !== undefined) {
                console.log("updating step to:", onboardingStep);
                const updatedStep = await ctx.db
                    .update(users)
                    .set({ onboardingStep })
                    .where(eq(users.id, userId));
                console.log("updatedStep row count:", updatedStep.rowCount);
            }

            return inserted.rowCount;
        });

export const quizRouter = createTRPCRouter({
    getUnansweredQuestions: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.session.user.id;

        const questionsWithAnswers = await getUnansweredQuestions(
            ctx.db,
        ).execute({
            userId,
        });

        const groupedQuestions = questionsWithAnswers.reduce<
            Record<string, QuestionWithAnswers>
        >((acc, current) => {
            const {
                id,
                question,
                type,
                answer,
                answerId,
                userAnswersText,
                userAnswersMcq,
            } = current;

            if (!acc[id]) {
                acc[id] = {
                    id: id,
                    question: question,
                    type: type,
                    answers: [],
                    userAnswersText,
                    userAnswersMcq,
                };
            }

            if (answerId && answer) {
                acc[id]?.answers.push({ id: answerId, answer: answer });
            }

            return acc;
        }, {});

        return Object.values(groupedQuestions);
    }),
    getQuestion: protectedProcedure
        .input(z.object({ number: z.number() }))
        .query(async ({ ctx, input }) => {
            const { number } = input;

            const questionsWithAnswers = await getQuestionByOrderNumber(
                ctx.db,
            ).execute({ orderNumber: number });

            if (questionsWithAnswers.length === 0) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                });
            }

            // console.log(questionsWithAnswers);

            const groupedData = questionsWithAnswers.reduce(
                (acc, item) => {
                    const {
                        questionId,
                        questionText,
                        type,
                        answerId,
                        answer,
                        userOpenTextAnswer,
                        userMcqAnswerId,
                    } = item;

                    if (!acc[questionId]) {
                        acc[questionId] = {
                            id: questionId,
                            question: questionText,
                            type,
                            userMcqAnswerIds: [],
                            userOpenTextAnswer: userOpenTextAnswer,
                            answers: [],
                        };
                    }

                    // Add userMcqAnswerId to the list if it's not already there
                    if (
                        userMcqAnswerId &&
                        !acc[questionId]?.userMcqAnswerIds.includes(
                            userMcqAnswerId,
                        )
                    ) {
                        acc[questionId]?.userMcqAnswerIds.push(userMcqAnswerId);
                    }

                    // Add answer to the answers array if it's not already there
                    if (
                        !acc[questionId]?.answers.find(
                            (ans) => ans.answerId === answerId,
                        ) &&
                        answerId &&
                        answer
                    ) {
                        acc[questionId]?.answers.push({ answerId, answer });
                    }

                    return acc;
                },
                {} as Record<string, GroupedQuestion>,
            );
            return Object.values(groupedData)[0];
        }),
    getAllQuestions: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.session.user.id;

        const questionsWithAnswers = await getAllQuestions(ctx.db).execute({
            userId,
        });

        if (questionsWithAnswers.length === 0) {
            throw new TRPCError({
                code: "NOT_FOUND",
            });
        }

        // console.log(questionsWithAnswers);

        const groupedData = questionsWithAnswers.reduce(
            (acc, item) => {
                const {
                    questionId,
                    questionText,
                    type,
                    answerId,
                    answer,
                    userOpenTextAnswer,
                    userMcqAnswerId,
                } = item;

                if (!acc[questionId]) {
                    acc[questionId] = {
                        id: questionId,
                        question: questionText,
                        type,
                        userMcqAnswerIds: [],
                        userOpenTextAnswer: userOpenTextAnswer,
                        answers: [],
                    };
                }

                // Add userMcqAnswerId to the list if it's not already there
                if (
                    userMcqAnswerId &&
                    !acc[questionId]?.userMcqAnswerIds.includes(userMcqAnswerId)
                ) {
                    acc[questionId]?.userMcqAnswerIds.push(userMcqAnswerId);
                }

                // Add answer to the answers array if it's not already there
                if (
                    !acc[questionId]?.answers.find(
                        (ans) => ans.answerId === answerId,
                    ) &&
                    answerId &&
                    answer
                ) {
                    acc[questionId]?.answers.push({ answerId, answer });
                }

                return acc;
            },
            {} as Record<string, GroupedQuestion>,
        );
        return Object.values(groupedData);
    }),
    answerWhoAreYou: getAnswerProcedure(1),
    answerExperienceWeb: getAnswerProcedure(2),
});
