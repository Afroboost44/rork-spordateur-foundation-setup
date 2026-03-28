import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";
import { TRPCError } from "@trpc/server";
import { randomBytes } from "crypto";

const getMessagesSchema = z.object({
  chatId: z.string(),
  userId: z.string().optional(),
  guestToken: z.string().optional(),
});

const sendMessageSchema = z.object({
  chatId: z.string(),
  content: z.string().min(1),
  senderId: z.string(),
  guestToken: z.string().optional(),
});

const generateExternalLinkSchema = z.object({
  chatId: z.string(),
  userId: z.string(),
});

export const chatRouter = createTRPCRouter({
  getMessages: publicProcedure
    .input(getMessagesSchema)
    .query(async ({ ctx, input }) => {
      console.log('[CHAT] Fetching messages for chat:', input.chatId);

      let chat;

      if (input.guestToken) {
        chat = await ctx.prisma.chat.findUnique({
          where: { guestToken: input.guestToken },
          include: {
            creator: true,
            participant: true,
          },
        });
      } else {
        chat = await ctx.prisma.chat.findUnique({
          where: { id: input.chatId },
          include: {
            creator: true,
            participant: true,
          },
        });
      }

      if (!chat) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chat not found",
        });
      }

      let hasAccess = false;

      if (input.guestToken) {
        console.log('[CHAT] Validating guest token');
        hasAccess = chat.guestToken === input.guestToken;
        
        if (!hasAccess) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Invalid guest token",
          });
        }
      } else if (input.userId) {
        console.log('[CHAT] Validating user access');
        hasAccess = 
          chat.creatorId === input.userId || 
          chat.participantId === input.userId;

        if (!hasAccess) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have access to this chat",
          });
        }
      } else {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Authentication required",
        });
      }

      console.log('[CHAT] Access granted, fetching messages');

      const messages = await ctx.prisma.message.findMany({
        where: { chatId: input.chatId },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              images: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      console.log('[CHAT] Found messages:', messages.length);

      return {
        messages,
        chat: {
          id: chat.id,
          type: chat.type,
          creator: {
            id: chat.creator.id,
            name: chat.creator.name,
            images: chat.creator.images,
          },
          participant: chat.participant ? {
            id: chat.participant.id,
            name: chat.participant.name,
            images: chat.participant.images,
          } : null,
        },
      };
    }),

  sendMessage: publicProcedure
    .input(sendMessageSchema)
    .mutation(async ({ ctx, input }) => {
      console.log('[CHAT] Sending message to chat:', input.chatId);

      const chat = await ctx.prisma.chat.findUnique({
        where: { id: input.chatId },
      });

      if (!chat) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chat not found",
        });
      }

      let hasAccess = false;

      if (input.guestToken) {
        console.log('[CHAT] Validating guest token for send');
        hasAccess = chat.guestToken === input.guestToken;
        
        if (!hasAccess) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Invalid guest token",
          });
        }
      } else {
        console.log('[CHAT] Validating user access for send');
        hasAccess = 
          chat.creatorId === input.senderId || 
          chat.participantId === input.senderId;

        if (!hasAccess) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have access to this chat",
          });
        }
      }

      const message = await ctx.prisma.message.create({
        data: {
          chatId: input.chatId,
          senderId: input.senderId,
          content: input.content,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              images: true,
            },
          },
        },
      });

      console.log('[CHAT] Message created:', message.id);

      return message;
    }),

  generateExternalLink: publicProcedure
    .input(generateExternalLinkSchema)
    .mutation(async ({ ctx, input }) => {
      console.log('[CHAT] Generating external link for chat:', input.chatId);

      const chat = await ctx.prisma.chat.findUnique({
        where: { id: input.chatId },
      });

      if (!chat) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chat not found",
        });
      }

      const hasAccess = 
        chat.creatorId === input.userId || 
        chat.participantId === input.userId;

      if (!hasAccess) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this chat",
        });
      }

      if (chat.guestToken) {
        console.log('[CHAT] Guest token already exists');
        return {
          url: `https://spordateur.com/chat/external/${chat.guestToken}`,
          token: chat.guestToken,
        };
      }

      const guestToken = randomBytes(32).toString('hex');

      await ctx.prisma.chat.update({
        where: { id: input.chatId },
        data: { guestToken },
      });

      console.log('[CHAT] Guest token generated and saved');

      return {
        url: `https://spordateur.com/chat/external/${guestToken}`,
        token: guestToken,
      };
    }),
});
