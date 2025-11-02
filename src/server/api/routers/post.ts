import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getLatestCall: publicProcedure.query(async ({ ctx }) => {
    const call = await ctx.db.call.findFirst({
      orderBy: { createdAt: "desc" },
    });

    return call ?? null;
  }),
});
