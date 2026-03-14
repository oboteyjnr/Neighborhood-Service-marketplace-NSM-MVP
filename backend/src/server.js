require("dotenv").config();
const connectDb = require("./config/db");
const app = require("./app");

const PORT = Number(process.env.PORT || 3000);

async function bootstrap() {
  await connectDb();

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server", error);
  process.exit(1);
});
