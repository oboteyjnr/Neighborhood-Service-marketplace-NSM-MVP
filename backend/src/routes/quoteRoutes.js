const express = require("express");
const {
  submitQuote,
  getMyQuotes,
  getMyAssignedQuotes,
  getQuotesByRequestId,
  acceptQuote
} = require("../controllers/quoteController");
const { requireAuth, requireRole } = require("../middleware/auth");
const { USER_ROLES } = require("../utils/constants");

const router = express.Router();

router.post("/", requireAuth, requireRole(USER_ROLES.PROVIDER), submitQuote);
router.get("/my", requireAuth, requireRole(USER_ROLES.PROVIDER), getMyQuotes);
router.get("/my/assigned", requireAuth, requireRole(USER_ROLES.PROVIDER), getMyAssignedQuotes);
router.get("/request/:requestId", requireAuth, getQuotesByRequestId);
router.post("/:quoteId/accept", requireAuth, requireRole(USER_ROLES.RESIDENT), acceptQuote);

module.exports = router;
