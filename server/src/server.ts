import app from "./app";
import { ensureDatabaseSetup } from "./config/db";
import { env } from "./config/env";

async function bootstrap(): Promise<void> {
  app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
  });

  ensureDatabaseSetup().catch((error) => {
    console.error("Database setup failed", error);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
