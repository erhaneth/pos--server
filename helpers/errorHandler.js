const chalk = require("chalk")

const logAndSendError = (errorMessage, errorObject, res) => {
  if (errorObject.name === "ValidationError") {
    console.error(
      chalk.red(`Validation Error: ${errorMessage}`),
      chalk.red(errorObject)
    )
    res.status(400).json({ error: errorObject.message })
    return
  }

  if (errorObject.name === "CastError") {
    console.warn(chalk.yellow("Invalid ID"), chalk.yellow(errorObject))
    res.status(400).json({ error: "Invalid ID" })
  }

  console.error(chalk.red(`Error: ${errorMessage}`), chalk.red(errorObject))
  res.status(500).json({ error: "server error 500" })
}

module.exports = logAndSendError
