import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";

const swipeSchema = z.object({
  targetUserId: z.string(),
  direction: z.enum(["LIKE", "PASS"]),
  currentUserId: z.string(),
});

const getFeedSchema = z.object({
  currentUserId: z.string(),
  limit: z.number().default(20),
});

const getMatchesSchema = z.object({
  currentUserId: z.string(),
});

export const matchingRouter = createTRPCRouter({
  getFeed: publicProcedure
    .input(getFeedSchema)
    .query(async ({ ctx, input }) => {
      console.log('[MATCHING] Fetching feed for user:', input.currentUserId);

      const swipedUserIds = await ctx.prisma.swipe.findMany({
        where: {
          fromUserId: input.currentUserId,
        },
        select: {
          toUserId: true,
        },
      });

      const excludedIds = [
        input.currentUserId,
        ...swipedUserIds.map((s: { toUserId: string }) => s.toUserId),
      ];

      console.log('[MATCHING] Excluded user IDs:', excludedIds.length);

      const users = await ctx.prisma.user.findMany({
        where: {
          id: {
            notIn: excludedIds,
          },
          status: {
            notIn: ["BLOCKED", "INVISIBLE"],
          },
        },
        select: {
          id: true,
          name: true,
          age: true,
          bio: true,
          images: true,
          sports: true,
          location: true,
        },
        take: input.limit,
        orderBy: {
          createdAt: "desc",
        },
      });

      console.log('[MATCHING] Found users for feed:', users.length);
      return users;
    }),

  swipe: publicProcedure
    .input(swipeSchema)
    .mutation(async ({ ctx, input }) => {
      console.log('[MATCHING] Processing swipe:', {
        from: input.currentUserId,
        to: input.targetUserId,
        direction: input.direction,
      });

      await ctx.prisma.swipe.create({
        data: {
          fromUserId: input.currentUserId,
          toUserId: input.targetUserId,
          direction: input.direction,
        },
      });

      console.log('[MATCHING] Swipe recorded');

      if (input.direction === "LIKE") {
        console.log('[MATCHING] Checking for mutual like...');

        const reverseLike = await ctx.prisma.swipe.findFirst({
          where: {
            fromUserId: input.targetUserId,
            toUserId: input.currentUserId,
            direction: "LIKE",
          },
        });

        if (reverseLike) {
          console.log('[MATCHING] MUTUAL LIKE DETECTED! Creating match and chat...');

          const existingMatch = await ctx.prisma.match.findFirst({
            where: {
              OR: [
                {
                  fromUserId: input.currentUserId,
                  toUserId: input.targetUserId,
                },
                {
                  fromUserId: input.targetUserId,
                  toUserId: input.currentUserId,
                },
              ],
            },
          });

          if (existingMatch) {
            console.log('[MATCHING] Match already exists');
            return {
              isMatch: true,
              matchId: existingMatch.id,
              chatId: existingMatch.chatId,
            };
          }

          const chat = await ctx.prisma.chat.create({
            data: {
              type: "INTERNAL",
              creatorId: input.currentUserId,
              participantId: input.targetUserId,
            },
          });

          console.log('[MATCHING] Chat created:', chat.id);

          const match = await ctx.prisma.match.create({
            data: {
              fromUserId: input.currentUserId,
              toUserId: input.targetUserId,
              chatId: chat.id,
            },
          });

          console.log('[MATCHING] Match created:', match.id);

          return {
            isMatch: true,
            matchId: match.id,
            chatId: chat.id,
          };
        }

        console.log('[MATCHING] No mutual like yet');
      }

      return {
        isMatch: false,
      };
    }),

  getMatches: publicProcedure
    .input(getMatchesSchema)
    .query(async ({ ctx, input }) => {
      console.log('[MATCHING] Fetching matches for user:', input.currentUserId);

      const matches = await ctx.prisma.match.findMany({
        where: {
          OR: [
            { fromUserId: input.currentUserId },
            { toUserId: input.currentUserId },
          ],
        },
        include: {
          fromUser: {
            select: {
              id: true,
              name: true,
              images: true,
              bio: true,
              age: true,
            },
          },
          toUser: {
            select: {
              id: true,
              name: true,
              images: true,
              bio: true,
              age: true,
            },
          },
          chat: {
            select: {
              id: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const formattedMatches = matches.map((match: any) => {
        const matchedUser =
          match.fromUserId === input.currentUserId
            ? match.toUser
            : match.fromUser;

        return {
          id: match.id,
          chatId: match.chatId,
          matchedUser,
          createdAt: match.createdAt,
        };
      });

      console.log('[MATCHING] Found matches:', formattedMatches.length);
      return formattedMatches;
    }),
});
