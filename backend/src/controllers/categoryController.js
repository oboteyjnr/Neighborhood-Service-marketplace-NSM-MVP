const Category = require("../models/Category");
const asyncHandler = require("../utils/asyncHandler");

const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: "name is required" });
  }

  const normalizedName = String(name).trim();
  if (normalizedName.length < 2) {
    return res.status(400).json({ message: "name must be at least 2 characters" });
  }

  try {
    const category = await Category.create({
      name: normalizedName,
      description
    });

    return res.status(201).json({ category });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Category name already exists" });
    }

    throw error;
  }
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  return res.status(200).json({ categories });
});

module.exports = {
  createCategory,
  getCategories
};
