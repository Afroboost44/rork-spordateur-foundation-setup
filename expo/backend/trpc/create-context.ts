import { initTRPC } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import superjson from "superjson";

let prisma: any = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient } = require("@prisma/client");
  prisma = new PrismaClient();
} catch {
  console.warn("Prisma client not generated. Run 'npx prisma generate' after setting DATABASE_URL");
}

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  if (!prisma) {
    throw new Error(
      'Database not configured. Please set DATABASE_URL environment variable and run: npx prisma generate && npx prisma db push'
    );
  }
  
  return {
    req: opts.req,
    prisma,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
