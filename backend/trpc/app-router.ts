import { createTRPCRouter } from "./create-context";
import { exampleRouter } from "./routes/example";
import { authRouter } from "./routes/auth";
import { offersRouter } from "./routes/offers";

export const appRouter = createTRPCRouter({
  example: exampleRouter,
  auth: authRouter,
  offers: offersRouter,
});

export type AppRouter = typeof appRouter;
