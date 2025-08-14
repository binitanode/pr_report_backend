const fs = require("fs");
const path = require("path");
const stream = require("stream");
const csv = require("csv-parser");
const { pipeline } = require("stream/promises");
const { Parser } = require("json2csv");

const PrDistribution = require("../models/prDistributionModel");
const PrDistributionGroup = require("../models/prDistributionGroupModel");
const {
  generateUniqueGridId,
} = require("./generateUniqueId/generateUniqueGridId.service");
const { default: ApiError } = require("../errors/ApiError");
const { default: customError } = require("../errors/customError");

/**
 * Uploads and parses a CSV report, inserts detail and group records.
 */
async function uploadReport(req) {
  try {
    const { originalname, buffer } = req.file;
    const grid_id = await generateUniqueGridId();
    console.log("Generated grid_id:", grid_id);

    const results = [];
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);

    const finalObj = await new Promise((resolve, reject) => {
      bufferStream
        .pipe(csv())
        .on("data", (row) => results.push(row))
        .on("end", async () => {
          try {
            const parsedData = results.map((r) => ({
              exchange_symbol: r["Exchange Symbol"],
              recipient: r["Recipient"],
              url: r["URL"],
              potential_reach: (() => {
                const raw = r["Potential Reach"] || "";
                const cleaned = raw.replace(/[^0-9]/g, "");
                return cleaned ? parseInt(cleaned, 10) : 0;
              })(),
              about: r["About"],
              value: r["Value"],
              report_title: req.body.report_title || originalname,
              uploaded_by: {
                id: req.user?._id || "anonymous",
                name: req.user?.fullName || "Anonymous",
                email: req.user?.email || "N/A",
              },
            }));

            const parsedDataWithBatch = parsedData.map((item) => ({
              ...item,
              grid_id,
            }));

            const inserted = await PrDistribution.insertMany(parsedDataWithBatch);

            const overallPotentialReach = parsedDataWithBatch.reduce(
              (sum, item) => sum + (item.potential_reach || 0),
              0
            );

            await PrDistributionGroup.create({
              grid_id,
              report_title: req.body.report_title || originalname,
              uploaded_by: {
                id: req.user?._id || "anonymous",
                name: req.user?.fullName || "Anonymous",
                email: req.user?.email || "N/A",
              },
              total_records: inserted.length,
              overallPotentialReach,
              distribution_data: parsedDataWithBatch,
              status: "Completed",
            });

            const finalObj = {
              message: "PR report uploaded successfully",
              count: inserted.length,
              report_title: req.body.report_title || originalname,
              grid_id,
            };

            console.log("finalObj", finalObj);
            resolve(finalObj);
          } catch (err) {
            reject(new customError("Database insertion failed", 500, err));
          }
        })
        .on("error", (err) => {
          reject(new customError("Error parsing CSV", 500, err));
        });
    });

    return finalObj;
  } catch (error) {
    console.error("❌ Upload Error:", error);
    throw new customError("Unexpected server error", 500, error);
  }
}

/**
 * Retrieves all detail entries for a given grid_id.
 */
async function getByBatchId(grid_id) {
  if (!grid_id) throw ApiError.badRequest("grid_id is required");

  const docs = await PrDistribution.find({ grid_id, soft_delete: false });
  if (!docs.length) throw ApiError.notFound("No data for this grid_id");

  return {
    totalCount: docs.length,
    overallPotentialReach: docs.reduce((s, d) => s + d.potential_reach, 0),
    reportTitle: docs[0].report_title,
    reportCreatedAt: docs[0].createdAt,
    data: docs,
  };
}

/**
 * Retrieves the group record by grid_id.
 */
async function getGroupByGridId(grid_id) {
  if (!grid_id) throw ApiError.badRequest("grid_id is required");

  const grp = await PrDistributionGroup.findOne({
    grid_id,
    soft_delete: false,
  });
  if (!grp) throw ApiError.notFound("No group for this grid_id");
  return grp;
}

/**
 * Soft-deletes detail and group records for a given grid_id.
 */
async function deleteReport(grid_id) {
  if (!grid_id) throw ApiError.badRequest("grid_id is required");

  const e = await PrDistribution.updateMany(
    { grid_id: grid_id, soft_delete: false },
    { $set: { soft_delete: true } }
  );
  const g = await PrDistributionGroup.updateOne(
    { grid_id, soft_delete: false },
    { $set: { soft_delete: true } }
  );

  if (e.modifiedCount === 0 && g.modifiedCount === 0) {
    throw ApiError.notFound("Nothing to delete or already deleted");
  }

  return {
    entriesModified: e.modifiedCount,
    groupModified: g.modifiedCount,
  };
}

/**
 * Updates privacy and sharedEmails on a group record.
 */
async function shareReport(grid_id, is_private, sharedEmails) {
  if (typeof is_private !== "boolean") {
    throw ApiError.badRequest("`is_private` must be boolean");
  }

  const update = { $set: { is_private } };
  if (is_private) {
    if (!Array.isArray(sharedEmails) || !sharedEmails.length) {
      throw ApiError.badRequest("`sharedEmails` required when private");
    }
    update.$addToSet = {
      sharedEmails: {
        $each: sharedEmails.map((e) => e.trim().toLowerCase()),
      },
    };
  } else {
    update.$set.sharedEmails = [];
  }

  const result = await PrDistributionGroup.updateOne(
    { grid_id, soft_delete: false },
    update
  );
  if (result.matchedCount === 0) {
    throw ApiError.notFound("Report group not found");
  }

  return { is_private, sharedEmails };
}

/**
 * Verifies access to a report URL (grid_id + optional email).
 */
// async function verifyUrl(grid_id, email) {
//   if (!grid_id) throw ApiError.badRequest("grid_id is required");

//   // Find the group record
//   const grp = await PrDistributionGroup.findOne({
//     grid_id,
//     soft_delete: false,
//   });

//   console.log("Check------...", grp);

//   if (!grp) {
//     throw ApiError.notFound("Link expired or report not found");
//   }

//   // If report is public, no email required
//   if (!grp.is_private) {
//     return {
//       verify: true,
//       message: "Public report - Access granted",
//       report_title: grp.report_title,
//       is_private: false,
//       grid_id: grp.grid_id,
//     };
//   }

//   // For private reports, email is required
//   // if (!email) {
//   //   throw ApiError.unauthorized("Email required for private report");
//   // }

//   // Ensure sharedEmails array exists and is an array
//   if (!grp.sharedEmails || !Array.isArray(grp.sharedEmails)) {
//     throw ApiError.unauthorized("Report access not configured properly");
//   }

//   // Check if email is in the shared emails list (case-insensitive)
//   console.log("Checking email authorization...", email);
//   // if (!email) {
//   //   return ApiError.unauthorized("Email is required for private report");
//   // }
//   const normalizedEmail = email.toLowerCase().trim();
//   const isEmailAuthorized = grp.sharedEmails.some(
//     (sharedEmail) => sharedEmail.toLowerCase().trim() === normalizedEmail
//   );

//   if (!isEmailAuthorized) {
//     throw ApiError.unauthorized(
//       "Access denied - Email not authorized for this report"
//     );
//   }

//   return {
//     verify: true,
//     message: "Access granted",
//     report_title: grp.report_title,
//     is_private: true,
//     grid_id: grp.grid_id,
//   };
// }

// In your backend Node.js server file (e.g., routes/pr-distributions.js)

async function verifyUrl(grid_id, email) {
  if (!grid_id) throw ApiError.badRequest("grid_id is required");

  // get group
  const grp = await PrDistributionGroup.findOne({ grid_id, soft_delete: false }).lean();
  if (!grp) throw ApiError.notFound("Link expired or report not found");

  const baseResponse = {
    verify: true,
    report_title: grp.report_title,
    is_private: grp.is_private,
    grid_id: grp.grid_id,
  };

  // Public report => grant access w/o email
  if (!grp.is_private) {
    return { ...baseResponse, message: "Public report - Access granted", access_granted: true };
  }

  if (email && grid_id) {

    // Private report => need email
    if (!email) {
      return {
        ...baseResponse,
        message: "Private report - Email required for access",
        access_granted: false,
        requires_email: true,
      };
    }

    if (typeof email !== "string") throw ApiError.badRequest("Invalid email format");

    console.log("Checking email authorization...", email);
    console.log("Shared emails:", grp.sharedEmails);
    // Second stage: Private report with email - validate access
    // Ensure sharedEmails array exists and is an array
    if (!grp.sharedEmails || !Array.isArray(grp.sharedEmails)) {
      throw ApiError.notFound("Report access not configured properly");
    }

    // Check if email is in the shared emails list (case-insensitive)
    console.log("Checking email authorization...", email);

    // Safety check - ensure email is a string
    if (typeof email !== "string") {
      throw ApiError.badRequest("Invalid email format");
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log("Normalized email:", normalizedEmail);
    const isEmailAuthorized = grp.sharedEmails.some((sharedEmail) => {
      if (typeof sharedEmail !== "string") return false;
      return sharedEmail.toLowerCase().trim() === normalizedEmail;
    });

    console.log("Email authorization result:", isEmailAuthorized);

    if (!isEmailAuthorized) {
      return {
        message: "Access denied - Email not authorized for this report",
        access_granted: false,
        requires_email: true,
      };
    }
  }
  // Email is authorized - grant access
  return {
    ...baseResponse,
    message: "Access granted",
    access_granted: true,
  };
}

/**
 * Fetches report data enforcing privacy if needed.
 */
async function getReportData(grid_id, email) {
  if (!grid_id) throw ApiError.badRequest("grid_id is required");

  const grp = await PrDistributionGroup.findOne({
    grid_id,
    soft_delete: false,
  });
  if (!grp) throw ApiError.notFound("Report not found");

  // If report is private, validate email access
  if (grp.is_private) {
    if (!email) {
      throw ApiError.unauthorized("Email is required for private report");
    }

    // Ensure sharedEmails array exists and is an array
    if (!grp.sharedEmails || !Array.isArray(grp.sharedEmails)) {
      throw ApiError.unauthorized("Report access not configured properly");
    }

    // Check if email is in the shared emails list (case-insensitive)
    const normalizedEmail = email.toLowerCase().trim();
    const isEmailAuthorized = grp.sharedEmails.some(
      (sharedEmail) => sharedEmail.toLowerCase().trim() === normalizedEmail
    );

    if (!isEmailAuthorized) {
      throw ApiError.unauthorized("Access denied - Email not authorized");
    }
  }

  const data = await PrDistribution.find({
    grid_id: grid_id,
    soft_delete: false,
  });
  
  const totalCount = data.length;
  const overallReach = data.reduce((s, d) => s + (d.potential_reach || 0), 0);

  return {
    report_title: grp.report_title,
    total_records: totalCount,
    overallPotentialReach: overallReach,
    distribution_data: data,
  };
}

/**
 * Generates a CSV string and filename for export.
 */
async function exportCsv(grid_id) {
  if (!grid_id) throw ApiError.badRequest("grid_id is required");

  const grp = await PrDistributionGroup.findOne({
    grid_id,
    soft_delete: false,
  }).lean();
  if (!grp) throw ApiError.notFound("Report not found or deleted");

  const data = grp.distribution_data;
  if (!Array.isArray(data) || data.length === 0) {
    throw ApiError.notFound("No distribution data to export");
  }

  const fields = Object.keys(data[0]);
  const parser = new Parser({ fields });
  const csvData = parser.parse(data);
  const filename = `pr-report-${grid_id}.csv`;

  return { csv: csvData, filename };
}

async function getGroups() {
  const groups = await PrDistributionGroup.find({ soft_delete: false });
  return groups;
}

module.exports = {
  uploadReport,
  getByBatchId,
  getGroupByGridId,
  deleteReport,
  shareReport,
  verifyUrl,
  getReportData,
  exportCsv,
  getGroups,
};
