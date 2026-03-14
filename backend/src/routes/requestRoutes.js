const express = require("express");
const {
  createRequest,
  listRequests,
  getRequestById,
  updateRequestStatus,
  getRequestQuotes
} = require("../controllers/requestController");
const { requireAuth, requireRole } = require("../middleware/auth");
const { USER_ROLES } = require("../utils/constants");

const router = express.Router();

router.get("/", requireAuth, listRequests);
router.post("/", requireAuth, requireRole(USER_ROLES.RESIDENT), createRequest);
router.get("/:id", requireAuth, getRequestById);
router.get("/:id/quotes", requireAuth, getRequestQuotes);
router.patch("/:id/status", requireAuth, requireRole(USER_ROLES.RESIDENT), updateRequestStatus);

module.exports = router;
