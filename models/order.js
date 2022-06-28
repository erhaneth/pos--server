const mongoose = require("mongoose")

const LineItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Product",
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
})

const OrderSchema = new mongoose.Schema(
  {
    lineItems: [
      {
        type: LineItemSchema,
        required: true,
        validate: [validateMinLength, "Line items must have at least one item"],
      },
    ],
    cashier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    payment_method: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
)

function validateMinLength(val) {
  return val.length >= 1
}

module.exports = mongoose.model("Order", OrderSchema)
