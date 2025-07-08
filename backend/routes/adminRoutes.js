const express = require("express");
const router = express.Router();
const { loginAdmin, getPendingBusinesses, approveBusiness, rejectBusiness } = require("../controllers/adminController");
const { protectAdmin } = require("../middleware/authMiddleware");

// Admin girişi
router.post("/login", loginAdmin);

// Bekleyen işletmeleri getir
router.get("/pending-businesses", protectAdmin, getPendingBusinesses);

// İşletmeyi onayla
router.put("/approve/:id", protectAdmin, approveBusiness);

// İşletmeyi reddet
router.delete("/reject/:id", protectAdmin, rejectBusiness);

module.exports = router;
