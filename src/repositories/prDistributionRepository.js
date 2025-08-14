const PrDistribution = require("../models/prDistributionModel");
const { default: ApiError } = require("../errors/ApiError");

class PrDistributionRepository {
  async create(distributionData) {
    try {
      const distribution = await PrDistribution.create(distributionData);
      return distribution;
    } catch (error) {
      throw ApiError.internal("Error creating PR distribution: " + error.message);
    }
  }

  async findById(id) {
    try {
      const distribution = await PrDistribution.findById(id);
      return distribution;
    } catch (error) {
      throw ApiError.internal("Error finding PR distribution by ID: " + error.message);
    }
  }

  async findByBatchId(batchId) {
    try {
      const distributions = await PrDistribution.find({ 
        batch_id: batchId,
        soft_delete: false 
      });
      return distributions;
    } catch (error) {
      throw ApiError.internal("Error finding PR distributions by batch ID: " + error.message);
    }
  }

  async findByRecipient(recipient) {
    try {
      const distributions = await PrDistribution.find({ 
        recipient,
        soft_delete: false 
      });
      return distributions;
    } catch (error) {
      throw ApiError.internal("Error finding PR distributions by recipient: " + error.message);
    }
  }

  async findByExchangeSymbol(exchangeSymbol) {
    try {
      const distributions = await PrDistribution.find({ 
        exchange_symbol: exchangeSymbol,
        soft_delete: false 
      });
      return distributions;
    } catch (error) {
      throw ApiError.internal("Error finding PR distributions by exchange symbol: " + error.message);
    }
  }

  async findAll() {
    try {
      const distributions = await PrDistribution.find({ soft_delete: false });
      return distributions;
    } catch (error) {
      throw ApiError.internal("Error finding all PR distributions: " + error.message);
    }
  }

  async updateById(id, updateData) {
    try {
      const distribution = await PrDistribution.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      return distribution;
    } catch (error) {
      throw ApiError.internal("Error updating PR distribution: " + error.message);
    }
  }

  async softDeleteById(id) {
    try {
      const distribution = await PrDistribution.findByIdAndUpdate(
        id,
        { soft_delete: true },
        { new: true }
      );
      return distribution;
    } catch (error) {
      throw ApiError.internal("Error soft deleting PR distribution: " + error.message);
    }
  }

  async hardDeleteById(id) {
    try {
      const distribution = await PrDistribution.findByIdAndDelete(id);
      return distribution;
    } catch (error) {
      throw ApiError.internal("Error hard deleting PR distribution: " + error.message);
    }
  }

  async count() {
    try {
      const count = await PrDistribution.countDocuments({ soft_delete: false });
      return count;
    } catch (error) {
      throw ApiError.internal("Error counting PR distributions: " + error.message);
    }
  }

  async findByUploadedBy(userId) {
    try {
      const distributions = await PrDistribution.find({ 
        "uploaded_by.id": userId,
        soft_delete: false 
      });
      return distributions;
    } catch (error) {
      throw ApiError.internal("Error finding PR distributions by uploaded by: " + error.message);
    }
  }

  async aggregateByBatchId() {
    try {
      const result = await PrDistribution.aggregate([
        { $match: { soft_delete: false } },
        {
          $group: {
            _id: "$batch_id",
            count: { $sum: 1 },
            totalPotentialReach: { $sum: "$potential_reach" }
          }
        }
      ]);
      return result;
    } catch (error) {
      throw ApiError.internal("Error aggregating PR distributions: " + error.message);
    }
  }

  async updateMany(filter, updateData) {
    try {
      const result = await PrDistribution.updateMany(filter, updateData);
      return result;
    } catch (error) {
      throw ApiError.internal("Error updating multiple PR distributions: " + error.message);
    }
  }
}

module.exports = new PrDistributionRepository();
