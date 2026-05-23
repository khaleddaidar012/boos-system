const config = require("./config")
const app = require("./app")
const { testConnection } = require("./utils/db")

async function start() {
  await testConnection()

  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port} [${config.nodeEnv}]`)
  })
}

start().catch((err) => {
  console.error("Failed to start server:", err)
  process.exit(1)
})
