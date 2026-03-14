const express = require("express");
const { createCategory, getCategories } = require("../controllers/categoryController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, getCategories);
router.post("/", requireAuth, createCategory);

module.exports = router;
