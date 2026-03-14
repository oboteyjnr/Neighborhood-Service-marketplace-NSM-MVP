const express = require("express");
const authRoutes = require("./authRoutes");
const categoryRoutes = require("./categoryRoutes");
const requestRoutes = require("./requestRoutes");
const quoteRoutes = require("./quoteRoutes");
const userRoutes = require("./userRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/requests", requestRoutes);
router.use("/quotes", quoteRoutes);
router.use("/users", userRoutes);

module.exports = router;
