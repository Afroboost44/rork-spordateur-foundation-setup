import { createTRPCRouter } from "./create-context";
import { exampleRouter } from "./routes/example";
import { authRouter } from "./routes/auth";
import { offersRouter } from "./routes/offers";
import { matchingRouter } from "./routes/matching";

export const appRouter = createTRPCRouter({
  example: exampleRouter,
  auth: authRouter,
  offers: offersRouter,
  matching: matchingRouter,
});

export type AppRouter = typeof appRouter;
