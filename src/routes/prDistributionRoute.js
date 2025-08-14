const express = require("express");
const multer = require("multer");
const PrDistributionController = require("../controllers/prDistributionController");
const jwtMiddleware = require("../middlewares/jwtMiddleware");
const {
  validateBatchUpload,
  validateCsvFile,
  validatePrDistributionId,
  validatePrDistributionQuery,
} = require("../validators/prDistributionValidators");

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

// To Upload PR Report
router.post(
  "/uploadPR",
  jwtMiddleware,
  upload.single("csv_file"),
  validateCsvFile,
  PrDistributionController.uploadPRReport
);

// To get PR Report by Grid ID from prModel
router.get(
  "/getPRReportByBatchId/:batch_id",
  jwtMiddleware,
  validatePrDistributionId,
  PrDistributionController.getPRReportByBatchId
);

// To get PR Report Group by Grid ID from prGroupModel
router.get(
  "/getPRReportGroupByGridId/:grid_id",
  jwtMiddleware,
  validatePrDistributionId,
  PrDistributionController.getPRReportGroupByGridId
);

// To delete PR Report by Grid ID from prGroupModel
router.delete(
  "/deletePRReport/:grid_id",
  jwtMiddleware,
  validatePrDistributionId,
  PrDistributionController.deletePRReport
);

// To share PR Report by Grid ID from prGroupModel
router.put(
  "/sharePRReport/:grid_id",
  jwtMiddleware,
  validatePrDistributionId,
  PrDistributionController.sharePRReport
);

// To verify PR Report URL Access
router.get("/verifyPRReportUrl", PrDistributionController.verifyPRReportUrl);

// To get PR Report Data
router.post(
  "/getPRReportData",
  validatePrDistributionQuery,
  PrDistributionController.getPRReportData
);

// To export PR Report as CSV
router.get(
  "/exportPRReportCsv/:grid_id",
  validatePrDistributionId,
  PrDistributionController.exportPRReportCsv
);

// To get PR Report Groups
router.get(
  "/getPRReportGroups",
  jwtMiddleware,
  PrDistributionController.getPRReportGroups
);

module.exports = router;
