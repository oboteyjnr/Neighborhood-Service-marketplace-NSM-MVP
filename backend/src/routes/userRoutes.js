const express = require("express");
const { listProviders } = require("../controllers/userController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/providers", requireAuth, listProviders);

module.exports = router;
