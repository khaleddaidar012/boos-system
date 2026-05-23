const prisma = require("../prisma")

async function testConnection() {
  try {
    await prisma.$connect()
    console.log("Database connected successfully")
    return true
  } catch (error) {
    console.error("Database connection failed:", error.message)
    return false
  }
}

module.exports = { testConnection }
