const express = require("express");
const { verifyToken, requireRole } = require("../middleware/auth.middleware");
const {
  createCase, listCases, getCase,
  updateCase, deleteCase, getCaseTimeline,
} = require("../controllers/case.controller");

const router = express.Router();

router.get(    "/",            verifyToken, listCases);
router.post(   "/",            verifyToken, requireRole("admin", "officer"), createCase);
router.get(    "/:id",         verifyToken, getCase);
router.patch(  "/:id",         verifyToken, requireRole("admin", "officer"), updateCase);
router.delete( "/:id",         verifyToken, requireRole("admin"), deleteCase);
router.get(    "/:id/timeline",verifyToken, getCaseTimeline);

module.exports = router;