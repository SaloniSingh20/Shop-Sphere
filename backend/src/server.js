const app = require("./app");
const env = require("./config/env");
const connectDatabase = require("./config/db");

async function startServer() {
  try {
    await connectDatabase();
    app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`Shop-Sphere API listening on http://localhost:${env.port}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

startServer();
