const express = require("express")
const cors = require("cors")

const config = require("./config")
const requestLogger = require("./middleware/logger")

const app = express()

app.use(cors())
app.use(express.json())
app.use(requestLogger)

app.get("/health", (req, res) => {
  res.json({ status: "ok", environment: config.nodeEnv })
})

module.exports = app
