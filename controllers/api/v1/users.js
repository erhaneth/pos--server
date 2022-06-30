const router = require("express").Router()
const db = require("../../../models")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const {
  requireUser,
  requireAdmin,
  requireCashier,
} = require("../../../middleware/authMiddleware")
const logAndSendError = require("../../../helpers/errorHandler")

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

const hashPassword = async (password) => {
  const saltRounds = 12
  const hash = await bcrypt.hash(password, saltRounds)
  return hash
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
      return res.status(400).json({ error: "username exists already 🤦‍♂️" })
    }

    // hash the user's password
    const hashedPassword = await hashPassword(req.body.password)

    // create a new user with the hashed password
    const newUser = new db.User({
      username: req.body.username,
      password: hashedPassword,
    })
    await newUser.save()

    const token = createJWT(newUser)
    res.json({ token })
  } catch (error) {
    logAndSendError("Cannot update user", error, res)
  }
})

// PUT /users/:id -- UPDATE a user
router.put("/:id", requireCashier, async (req, res) => {
  try {
    // find the user by id
    const user = await db.User.findById(req.params.id)

    // if the user doesn't exist, stop the route and send a response saying the user doesn't exist
    if (!user) {
      return res.status(404).json({ error: "user not found" })
    }

    if (req.body.username) {
      user.username = req.body.username
    }

    if (req.body.password) {
      // if the user exists, and a password was sent, update the user's password
      user.password = await hashPassword(req.body.password)
    }

    if (res.locals.user.role === "admin" && req.body.role) {
      user.role = req.body.role
    }

    await user.save()

    const userCopy = { ...user }
    delete userCopy.password

    // send a response saying the user was updated
    res.json({ userCopy })
  } catch (error) {
    logAndSendError("Cannot update user", error, res)
  }
})

// DELETE /users/:id -- DESTROY a user
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    // find id
    const id = req.params.id
    // delete
    await db.User.findByIdAndDelete(id)
    // send 'no content' status
    res.sendStatus(204)
  } catch (error) {
    logAndSendError("Cannot delete user", error, res)
  }
})

// GET /users -- Index of all users
router.get("/", requireAdmin, async (req, res) => {
  try {
    //find all users
    const allUsers = await db.User.find({})
    console.log(allUsers)
    const usersWithoutPasswords = allUsers.map((user) => {
      const { username, role, id, createdAt, updatedAt } = user
      return { username, role, id, createdAt, updatedAt }
    })
    console.log(usersWithoutPasswords)
    //send them to the client
    res.json(usersWithoutPasswords)
  } catch (error) {
    logAndSendError("Cannot get users", error, res)
  }
})

// GET /users/:id -- Show a user
router.get("/:id", requireUser, async (req, res) => {
  try {
    const id = req.params.id
    const user = await db.User.findById(id)

    if (!user) {
      return res.status(404).json({ error: "user not found" })
    }

    // If not an admin and trying to view someone else, stop the route and send a response saying the route is forbidden
    if (!res.locals.user.role === "admin" && id !== res.locals.user.id) {
      return res.status(403).json({ error: "forbidden" })
    }

    const { username, role, userId, createdAt, updatedAt } = user
    const userWithoutPassword = {
      username,
      role,
      id: userId,
      createdAt,
      updatedAt,
    }
    res.json(userWithoutPassword)
  } catch (error) {
    logAndSendError("Cannot get user", error, res)
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
  } catch (error) {
    logAndSendError("Cannot login", error, res)
  }
})

// // GET /users/auth-locked -- checks users credentials and only send back information if the user is logged in properly
// router.get("/auth-locked", requireUser, (req, res) => {
//   console.log("current user is:", res.locals.user)
//   res.json({ msg: "welcome to the secret auth-locked route 👋" })
// })

module.exports = router
