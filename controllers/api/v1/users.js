const router = require("express").Router()
const db = require("../../../models")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { requireUser } = require("../../../middleware/authMiddleware")

const createJWT = (user) => {
  const payload = {
    username: user.username,
    id: user.id,
    role: user.role,
  }
  // sign the token and send it back
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" }) // expires in one day
  return token
}

// POST /users/register -- CREATE a new user
router.post("/register", async (req, res) => {
  try {
    // check if the user exists already
    const findUser = await db.User.findOne({
      username: req.body.username,
    })

    // disallow users from registering twice
    if (findUser) {
      // stop the route and send a response saying the user exists
      return res.status(400).json({ msg: "username exists already 🤦‍♂️" })
    }

    // hash the user's password
    const password = req.body.password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // create a new user with the hashed password
    const newUser = new db.User({
      username: req.body.username,
      password: hashedPassword,
    })
    await newUser.save()

    const token = createJWT(newUser)
    res.json({ token })
  } catch (err) {
    console.warn(err)
    // handle validation errors
    if (err.name === "ValidationError") {
      res.status(400).json({ error: err.message })
    } else {
      // handle all other errors
      res.status(500).json({ error: "server error 500" })
    }
  }
})

// POST /users/login -- validate login credentials
router.post("/login", async (req, res) => {
  try {
    // all the data will come in on the req.body
    // try to find the user in the database
    const foundUser = await db.User.findOne({
      username: req.body.username,
    })
    const noLoginMessage = "Incorrect username or password."

    // if the user is not found, return send a status of 400 let the user know login failed
    if (!foundUser) {
      console.log("incorrect username", req.body)
      return res.status(400).json({ error: noLoginMessage })
    }

    // check if the supplied password matches the hash in the db
    const passwordCheck = await bcrypt.compare(
      req.body.password,
      foundUser.password
    )
    // if they do not match, return and let the user know that login has failed
    if (!passwordCheck) {
      console.log("incorrect password", req.body)
      return res.status(400).json({ error: noLoginMessage })
    }

    const token = createJWT(foundUser)

    res.json({ token })
  } catch (err) {
    // don't forget to handle your errors
    console.warn(err)
    res.status(500).json({ msg: "Server room is on fire 🔥" })
  }
})

// GET /users/auth-locked -- checks users credentials and only send back information if the user is logged in properly
router.get("/auth-locked", requireUser, (req, res) => {
  console.log("current user is:", res.locals.user)
  res.json({ msg: "welcome to the secret auth-locked route 👋" })
})

module.exports = router
