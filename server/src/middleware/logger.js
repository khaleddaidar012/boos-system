function requestLogger(req, res, next) {
  const start = Date.now()
  const { method, url } = req

  res.on("finish", () => {
    const duration = Date.now() - start
    console.log(
      `${new Date().toISOString()} | ${method} ${url} | ${res.statusCode} | ${duration}ms`
    )
  })

  next()
}

module.exports = requestLogger
