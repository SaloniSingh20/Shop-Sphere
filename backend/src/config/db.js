const mongoose = require("mongoose");
const env = require("./env");

async function connectDatabase() {
  await mongoose.connect(env.mongoUri, {
    autoIndex: true,
  });
  // eslint-disable-next-line no-console
  console.log("MongoDB connected");
}

module.exports = connectDatabase;
