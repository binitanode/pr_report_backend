const { default: customError } = require("../errors/customError");
const PrDistributionService = require("../services/prDistributionService");
const fs = require("fs");
const path = require("path");
const stream = require("stream");
const csv = require("csv-parser");
const { pipeline } = require("stream/promises");
const PrDistribution = require("../models/prDistributionModel");
const PrDistributionGroup = require("../models/prDistributionGroupModel");
const {
  generateUniqueGridId,
} = require("../services/generateUniqueId/generateUniqueGridId.service");

class PrDistributionController {
  // async uploadPRReport(req, res) {
  //   try {
  //     console.log("Incoming file:", req.file);
  //     console.log("Body fields:", req.body);

  //     if (!req.file) {
  //       return res.status(400).json({ message: "CSV file not provided" });
  //     }

  //     const { originalname, buffer } = req.file;
  //     const destinationPath = path.join("uploads", originalname);
  //     const batch_id = await generateUniqueGridId();
  //     console.log("Generated batch_id:", batch_id);
  //     // Save file to disk
  //     const bufferStream = new stream.PassThrough();
  //     bufferStream.end(buffer);
  //     await pipeline(bufferStream, fs.createWriteStream(destinationPath));

  //     const results = [];

  //     fs.createReadStream(destinationPath)
  //       .pipe(csv())
  //       .on("data", (row) => {
  //         results.push(row);
  //       })
  //       .on("end", async () => {
  //         let status = "Completed";
  //         try {
  //           const parsedData = results.map((r) => ({
  //             exchange_symbol: r["Exchange Symbol"],
  //             recipient: r["Recipient"],
  //             url: r["URL"],
  //             potential_reach: (() => {
  //               const raw = r["Potential Reach"] || "";
  //               const cleaned = raw.replace(/[^0-9]/g, "");
  //               return cleaned ? parseInt(cleaned, 10) : 0;
  //             })(),

  //             about: r["About"],
  //             value: r["Value"],
  //             report_title: req.body.report_title || originalname,
  //             uploaded_by: {
  //               id: req.user?._id || "anonymous",
  //               name: req.user?.fullName || "Anonymous",
  //               email: req.user?.email || "N/A",
  //             },
  //           }));

  //           // Add batch_id to each entry
  //           const parsedDataWithBatch = parsedData.map((item) => ({
  //             ...item,
  //             batch_id,
  //           }));
  //           const inserted = await PrDistribution.insertMany(
  //             parsedDataWithBatch
  //           );

  //           const overallPotentialReach = parsedDataWithBatch.reduce(
  //             (sum, item) => sum + (item.potential_reach || 0),
  //             0
  //           );
  //           await PrDistributionGroup.create({
  //             grid_id: batch_id,
  //             report_title: req.body.report_title || originalname,
  //             uploaded_by: {
  //               id: req.user?._id || "anonymous",
  //               name: req.user?.fullName || "Anonymous",
  //               email: req.user?.email || "N/A",
  //             },
  //             total_records: inserted.length,
  //             overallPotentialReach: overallPotentialReach,
  //             distribution_data: parsedDataWithBatch, // ⬅️ full array here
  //             status,
  //           });
  //           console.log("Inserted PR data:", inserted);
  //           return res.status(200).json({
  //             message: "PR report uploaded successfully",
  //             count: inserted.length,
  //             report_title: req.body.report_title || originalname,
  //           });
  //         } catch (err) {
  //           console.error("❌ Error inserting PR data:", err);
  //           return res
  //             .status(500)
  //             .json({ message: "Database insertion failed" });
  //         } finally {
  //           fs.unlink(destinationPath, () => {});
  //         }
  //       })
  //       .on("error", (err) => {
  //         console.error("❌ CSV Parsing Error:", err);
  //         res.status(500).json({ message: "Error parsing CSV" });
  //         fs.unlink(destinationPath, () => {});
  //       });
  //   } catch (error) {
  //     console.error("❌ Upload Error:", error);
  //     res.status(500).json({ message: "Unexpected server error" });
  //   }
  // }

  async uploadPRReport(req, res) {
    try {
      console.log("Incoming file:", req.file);
      // console.log("Body fields:", req.body);

      if (!req.file) {
        return res.status(400).json({ message: "CSV file not provided" });
      }
      const response = await PrDistributionService.uploadReport(req);
      console.log("eeeee",response)
      if (!response) {
        return res.status(500).json({ message: "Failed to upload report" });
      }

      res.status(200).json({ message: "Report uploaded successfully", data: response });
    } catch (error) {
      console.error("❌ Upload Error:", error);
      res.status(500).json({ message: "Unexpected server error" });
    }
  }

  async getPRReportByBatchId(req, res, next) {
    try {
      const data = await PrDistributionService.getByBatchId(req.params.grid_id);
      res.json(data);
    } catch (err) {
      // Pass the error directly to preserve the original message
      next(err);
    }
  }

  async getPRReportGroupByGridId(req, res, next) {
    try {
      const group = await PrDistributionService.getGroupByGridId(
        req.params.grid_id
      );
      res.json(group);
    } catch (err) {
      // Pass the error directly to preserve the original message
      next(err);
    }
  }

  async deletePRReport(req, res, next) {
    try {
      const data = await PrDistributionService.deleteReport(req.params.grid_id);
      res.json({ message: "Soft deleted", ...data });
    } catch (err) {
      // Pass the error directly to preserve the original message
      next(err);
    }
  }

  async sharePRReport(req, res, next) {
    try {
      const data = await PrDistributionService.shareReport(
        req.params.grid_id,
        req.body.is_private,
        req.body.sharedEmails
      );
      res.json({ message: "Share settings updated", ...data });
    } catch (err) {
      // Pass the error directly to preserve the original message
      next(err);
    }
  }

  async verifyPRReportUrl(req, res, next) {
    try {
      console.log("=== verifyPRReportUrl called ===");
      console.log("Query parameters:", req.query);
      console.log("grid_id:", req.query.grid_id);
      console.log("email:", req.query.email);

      const info = await PrDistributionService.verifyUrl(
        req.query.grid_id,
        req.query.email
      );

      // console.log("Verification successful:", info);
      if (!info.access_granted) {
        return res.status(403).json({
          success: false,
          message: "Access denied - Email not authorized for this report",
          requires_email: info.requires_email,
        });
      }
      res.json({
        success: true,
        message: "URL verification successful",
        data: info,
      });
    } catch (err) {
      console.log("=== verifyPRReportUrl ERROR ===");
      console.log("Error details:", err);
      console.log("Error message:", err.message);
      console.log("Error statusCode:", err.statusCode);

      // Pass the error directly to preserve the original message
      next(err);
    }
  }

  async getPRReportData(req, res, next) {
    try {
      console.log("=== getPRReportData called ===");
      console.log("Request body:", req.body);
      console.log("grid_id:", req.body.grid_id);
      console.log("email:", req.body.email);

      const data = await PrDistributionService.getReportData(
        req.body.grid_id,
        req.body.email
      );

      console.log(
        "Data retrieval successful, records found:",
        data.total_records
      );
      res.json({
        success: true,
        message: "Report data retrieved successfully",
        data: data,
      });
    } catch (err) {
      console.log("=== getPRReportData ERROR ===");
      console.log("Error details:", err);
      console.log("Error message:", err.message);
      console.log("Error statusCode:", err.statusCode);

      // Pass the error directly to preserve the original message
      next(err);
    }
  }

  async exportPRReportCsv(req, res, next) {
    try {
      const { csv, filename } = await PrDistributionService.exportCsv(
        req.params.grid_id
      );
      res.header("Content-Type", "text/csv");
      res.header("Content-Disposition", attachment`filename="${filename}"`);
      res.send(csv);
    } catch (err) {
      // Pass the error directly to preserve the original message
      next(err);
    }
  }

  async getPRReportGroups(req, res, next) {
    try {
      const data = await PrDistributionService.getGroups(req);
      res.json(data);
    } catch (err) {
      // Pass the error directly to preserve the original message
      next(err);
    }
  }
}

module.exports = new PrDistributionController();