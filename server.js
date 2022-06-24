// required packages
const express = require("express")
const cors = require("cors")
const chalk = require("chalk")
const rowdy = require("rowdy-logger")

require("dotenv").config()
require("./models") // connect to the db

// app config/middlewares
const app = express()
const PORT = process.env.PORT || 8000

app.use(cors())
app.use(express.json()) //json req.bodies
app.use(require("./helpers/requestLogger"))
const rowdyResults = rowdy.begin(app)

// routes and controllers
app.get("/", (req, res) => {
  res.json({ msg: "Welcome to the MERN POS" })
})

app.use("/api/v1/users", require("./controllers/api/v1/users"))
app.use("/api/v1/products", require("./controllers/api/v1/products"))
app.use("/api/v1/categories", require("./controllers/api/v1/categories"))
app.use("/api/v1/orders", require("./controllers/api/v1/orders"))

// listen on a port
app.listen(PORT, () => {
  rowdyResults.print()
  console.log(
    chalk.bgGreen.bold(` 🤖 Server listening on http://localhost:${PORT} `)
  )
})
