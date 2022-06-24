const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "unverified",
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model("User", UserSchema)
