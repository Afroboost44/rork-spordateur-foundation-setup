import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";
import { TRPCError } from "@trpc/server";

const createOfferSchema = z.object({
  partnerId: z.string(),
  title: z.string().min(3),
  price: z.number().positive(),
  description: z.string().min(10),
  datetime: z.string().datetime(),
  location: z.string().min(3),
  imageUrl: z.string().url(),
  sport: z.string().min(2),
});

const deleteOfferSchema = z.object({
  partnerId: z.string(),
  offerId: z.string(),
});

const getOffersSchema = z.object({
  partnerId: z.string(),
});

const requireApprovedPartner = async (prisma: any, partnerId: string) => {
  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
  });

  if (!partner) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Partenaire introuvable",
    });
  }

  if (partner.status !== "APPROVED") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Votre compte doit être approuvé pour effectuer cette action",
    });
  }

  return partner;
};

export const offersRouter = createTRPCRouter({
  createOffer: publicProcedure
    .input(createOfferSchema)
    .mutation(async ({ ctx, input }) => {
      await requireApprovedPartner(ctx.prisma, input.partnerId);

      try {
        new URL(input.imageUrl);
      } catch {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "L'URL de l'image n'est pas valide",
        });
      }

      const offer = await ctx.prisma.offer.create({
        data: {
          partnerId: input.partnerId,
          title: input.title,
          price: input.price,
          description: input.description,
          datetime: new Date(input.datetime),
          location: input.location,
          imageUrl: input.imageUrl,
          sport: input.sport,
          isActive: true,
        },
      });

      return {
        id: offer.id,
        title: offer.title,
        price: offer.price,
        description: offer.description,
        datetime: offer.datetime,
        location: offer.location,
        imageUrl: offer.imageUrl,
        sport: offer.sport,
      };
    }),

  getMyOffers: publicProcedure
    .input(getOffersSchema)
    .query(async ({ ctx, input }) => {
      const offers = await ctx.prisma.offer.findMany({
        where: { partnerId: input.partnerId },
        orderBy: { createdAt: "desc" },
      });

      return offers;
    }),

  deleteOffer: publicProcedure
    .input(deleteOfferSchema)
    .mutation(async ({ ctx, input }) => {
      await requireApprovedPartner(ctx.prisma, input.partnerId);

      const offer = await ctx.prisma.offer.findUnique({
        where: { id: input.offerId },
        include: {
          reservations: true,
        },
      });

      if (!offer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Offre introuvable",
        });
      }

      if (offer.partnerId !== input.partnerId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Vous n'êtes pas autorisé à supprimer cette offre",
        });
      }

      if (offer.reservations.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Impossible de supprimer une offre avec des réservations existantes",
        });
      }

      await ctx.prisma.offer.delete({
        where: { id: input.offerId },
      });

      return { success: true };
    }),
});
