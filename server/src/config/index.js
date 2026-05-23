require("dotenv").config()

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  isDev: process.env.NODE_ENV === "development",
  isProd: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
  jwtSecret: process.env.JWT_SECRET || "fallback-secret-do-not-use-in-production",
  databaseUrl: process.env.DATABASE_URL,
}

module.exports = config
