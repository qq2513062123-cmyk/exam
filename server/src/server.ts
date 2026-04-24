import app from "./app";
import { ensureDatabaseSetup } from "./config/db";
import { env } from "./config/env";

async function bootstrap(): Promise<void> {
  await ensureDatabaseSetup();

  app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
