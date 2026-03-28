import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";

const userRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  age: z.number().min(18),
  gender: z.string(),
  bio: z.string().optional(),
  location: z.string(),
  sports: z.array(z.string()).min(1),
  images: z.array(z.string().url()).min(1).max(5),
});

const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const partnerRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  companyName: z.string().min(2),
  description: z.string().optional(),
  websiteLink: z.string().url().optional(),
  address: z.string(),
});

const partnerLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const authRouter = createTRPCRouter({
  userRegister: publicProcedure
    .input(userRegisterSchema)
    .mutation(async ({ ctx, input }) => {
      const existingUser = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Un utilisateur avec cet email existe déjà",
        });
      }

      input.images.forEach((imageUrl, index) => {
        try {
          new URL(imageUrl);
        } catch {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `L'image ${index + 1} n'est pas une URL valide`,
          });
        }
      });

      const passwordHash = await bcrypt.hash(input.password, 10);

      const user = await ctx.prisma.user.create({
        data: {
          email: input.email,
          passwordHash,
          name: input.name,
          age: input.age,
          gender: input.gender,
          bio: input.bio,
          location: input.location,
          sports: input.sports,
          images: input.images,
          status: "ACTIVE",
        },
      });

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        status: user.status,
      };
    }),

  userLogin: publicProcedure
    .input(userLoginSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email ou mot de passe incorrect",
        });
      }

      if (user.status === "BLOCKED") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Votre compte a été bloqué. Contactez le support.",
        });
      }

      const isValidPassword = await bcrypt.compare(
        input.password,
        user.passwordHash
      );

      if (!isValidPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email ou mot de passe incorrect",
        });
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        status: user.status,
        bio: user.bio,
        location: user.location,
        sports: user.sports,
        images: user.images,
      };
    }),

  partnerRegister: publicProcedure
    .input(partnerRegisterSchema)
    .mutation(async ({ ctx, input }) => {
      const existingPartner = await ctx.prisma.partner.findUnique({
        where: { email: input.email },
      });

      if (existingPartner) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Un partenaire avec cet email existe déjà",
        });
      }

      const passwordHash = await bcrypt.hash(input.password, 10);

      const partner = await ctx.prisma.partner.create({
        data: {
          email: input.email,
          passwordHash,
          companyName: input.companyName,
          description: input.description,
          websiteLink: input.websiteLink,
          address: input.address,
          status: "PENDING",
        },
      });

      return {
        id: partner.id,
        email: partner.email,
        companyName: partner.companyName,
        status: partner.status,
      };
    }),

  partnerLogin: publicProcedure
    .input(partnerLoginSchema)
    .mutation(async ({ ctx, input }) => {
      const partner = await ctx.prisma.partner.findUnique({
        where: { email: input.email },
      });

      if (!partner) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email ou mot de passe incorrect",
        });
      }

      const isValidPassword = await bcrypt.compare(
        input.password,
        partner.passwordHash
      );

      if (!isValidPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email ou mot de passe incorrect",
        });
      }

      return {
        id: partner.id,
        email: partner.email,
        companyName: partner.companyName,
        status: partner.status,
        description: partner.description,
        websiteLink: partner.websiteLink,
        address: partner.address,
      };
    }),

  adminLogin: publicProcedure
    .input(adminLoginSchema)
    .mutation(async ({ ctx, input }) => {
      const admin = await ctx.prisma.admin.findUnique({
        where: { email: input.email },
      });

      if (!admin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Accès refusé",
        });
      }

      const isValidPassword = await bcrypt.compare(
        input.password,
        admin.passwordHash
      );

      if (!isValidPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Accès refusé",
        });
      }

      return {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      };
    }),
});
