import { connectDb } from "./config/db";
import { env } from "./config/env";
import { createApp } from "./app";

async function main() {
  await connectDb();

  const app = createApp();
  const port = env.PORT ?? 4000;

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on :${port}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

