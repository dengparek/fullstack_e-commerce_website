import { app } from "./index";
import { NODE_ENV, PORT } from "./config/env";
import { connectDB, pool } from "./database/db";

export const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${NODE_ENV} mode`);
    });

    // Graceful Shutdown Logic
    const shutdown = async (signal: string) => {
      console.log(
        `\n${signal} received. Closing HTTP server and DB connections...`,
      );
      server.close(async () => {
        await pool.end();
        console.log("Server and database connections closed gracefully.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

void startServer();
