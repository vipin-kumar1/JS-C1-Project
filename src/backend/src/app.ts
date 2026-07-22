import cors from "cors";
import express from "express";
import { ALLOWED_TRANSITIONS } from "./lib/stateMachine.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { ticketsRouter } from "./routes/tickets.js";
import { usersRouter } from "./routes/users.js";

// Builds the Express app. Exported separately from the server so tests can
// import the app without binding to a port.
export function createApp() {
  const app = express();

  const origins = (process.env.CORS_ORIGIN ?? "http://localhost:5173")
    .split(",")
    .map((o) => o.trim());
  app.use(cors({ origin: origins }));
  app.use(express.json());

  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

  // Exposes the state machine so the frontend shares one source of truth.
  app.get("/api/meta/transitions", (_req, res) =>
    res.json(ALLOWED_TRANSITIONS),
  );

  app.use("/api/users", usersRouter);
  app.use("/api/tickets", ticketsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
