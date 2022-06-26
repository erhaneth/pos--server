const router = require("express").Router()
const db = require("../../../models")

const logAndSendError = require("../../../helpers/errorHandler")
const { requireAdmin } = require("../../../middleware/authMiddleware")

// POST /products -- creates a new product
router.post("/", requireAdmin, async (req, res) => {
  try {
    const newProduct = await db.Product.create(req.body)
    res.json(newProduct)
  } catch (error) {
    logAndSendError("Cannot create product", error, res)
  }
})

// PUT /products/:id -- updates a product
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const updatedProduct = await db.Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate("category")
    res.json(updatedProduct)
  } catch (error) {
    logAndSendError("Cannot update product", error, res)
  }
})

// DELETE /products/:id -- deletes a product
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await db.Product.findByIdAndDelete(req.params.id)
    res.json({ msg: "Product deleted" })
  } catch (error) {
    logAndSendError("Cannot delete product", error, res)
  }
})

// GET /products -- index of all products
router.get("/", async (req, res) => {
  try {
    const products = await db.Product.find().populate("category")
    res.json(products)
  } catch (error) {
    logAndSendError("Cannot get products", error, res)
  }
})

// GET /products/:id -- show specific product
router.get("/:id", async (req, res) => {
  try {
    const product = await db.Product.findById(req.params.id).populate(
      "category"
    )

    if (!product) {
      return res.status(404).json({ error: "Product not found" })
    }

    res.json(product)
  } catch (error) {
    logAndSendError("Cannot get product", error, res)
  }
})

module.exports = router
