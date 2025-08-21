// routes/trackingRoutes.js
import express from "express"
import {
  generateTrackingReport,
  saveTrackingReport,
  getBrandReports,
} from "../controllers/trackingController.js"
import { validateBrandId } from "../middleware/validation.js"

const router = express.Router()

// Middleware to log requests
router.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`)
  next()
})

// Routes with validation
router.post("/generate-report", validateBrandId, generateTrackingReport)
router.get("/generate-report/:brandId", validateBrandId, generateTrackingReport)
router.post("/save-report", saveTrackingReport)
router.get("/reports/:brandId", getBrandReports)

// Error handler
router.use((err, req, res, next) => {
  console.error("Tracking route error:", err)
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  })
})

export default router
