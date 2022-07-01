const router = require("express").Router()
const db = require("../../../models")
const {
  requireAdmin,
  requireCashier,
} = require("../../../middleware/authMiddleware")
const logAndSendError = require("../../../helpers/errorHandler")

// POST /categories -- creates a new category
router.post("/", requireAdmin, async (req, res) => {
  try {
    const newCategory = await db.Category.create(req.body)
    res.status(201).json(newCategory)
  } catch (error) {
    logAndSendError("Cannot add category", error, res)
  }
})

// PUT /categories/:id -- updates a category
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const id = req.params.id
    const options = { new: true }
    const updatedCategory = await db.Category.findByIdAndUpdate(
      id,
      req.body,
      options
    )
    res.json(updatedCategory)
  } catch (error) {
    logAndSendError("Cannot update category", error, res)
  }
})

// DELETE /categories/:id -- deletes a category
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const id = req.params.id
    await db.Category.findByIdAndDelete(id)
    res.sendStatus(204)
  } catch (error) {
    logAndSendError("Cannot delete category", error, res)
  }
})

// GET /categories -- reads all categories
router.get("/", requireCashier, requireCashier, async (req, res) => {
  try {
    const categories = await db.Category.find({})
    res.json(categories)
  } catch (error) {
    logAndSendError("Cannot get categories", error, res)
  }
})

// GET /categories/:id -- reads specific category
router.get("/:id", requireAdmin, requireCashier, async (req, res) => {
  try {
    const id = req.params.id
    const category = await db.Category.findById(id)
    if (!category) {
      return res.status(404).json({ error: "Category not found" })
    }
    res.json(category)
  } catch (error) {
    logAndSendError("Cannot get category", error, res)
  }
})

module.exports = router
