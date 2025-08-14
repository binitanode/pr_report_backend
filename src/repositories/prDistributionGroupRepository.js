const PrDistributionGroup = require("../models/prDistributionGroupModel");
const { default: ApiError } = require("../errors/ApiError");

class PrDistributionGroupRepository {
  async create(groupData) {
    try {
      const group = await PrDistributionGroup.create(groupData);
      return group;
    } catch (error) {
      throw ApiError.internal("Error creating PR distribution group: " + error.message);
    }
  }

  async findById(id) {
    try {
      const group = await PrDistributionGroup.findById(id);
      return group;
    } catch (error) {
      throw ApiError.internal("Error finding PR distribution group by ID: " + error.message);
    }
  }

  async findByGridId(gridId) {
    try {
      const group = await PrDistributionGroup.findOne({ 
        grid_id: gridId,
        soft_delete: false 
      });
      return group;
    } catch (error) {
      throw ApiError.internal("Error finding PR distribution group by grid ID: " + error.message);
    }
  }

  async findByReportTitle(reportTitle) {
    try {
      const groups = await PrDistributionGroup.find({ 
        report_title: { $regex: reportTitle, $options: 'i' },
        soft_delete: false 
      });
      return groups;
    } catch (error) {
      throw ApiError.internal("Error finding PR distribution groups by report title: " + error.message);
    }
  }

  async findByStatus(status) {
    try {
      const groups = await PrDistributionGroup.find({ 
        status,
        soft_delete: false 
      });
      return groups;
    } catch (error) {
      throw ApiError.internal("Error finding PR distribution groups by status: " + error.message);
    }
  }

  async findByUploadedBy(userId) {
    try {
      const groups = await PrDistributionGroup.find({ 
        "uploaded_by.id": userId,
        soft_delete: false 
      });
      return groups;
    } catch (error) {
      throw ApiError.internal("Error finding PR distribution groups by uploaded by: " + error.message);
    }
  }

  async findAll() {
    try {
      const groups = await PrDistributionGroup.find({ soft_delete: false });
      return groups;
    } catch (error) {
      throw ApiError.internal("Error finding all PR distribution groups: " + error.message);
    }
  }

  async updateById(id, updateData) {
    try {
      const group = await PrDistributionGroup.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      return group;
    } catch (error) {
      throw ApiError.internal("Error updating PR distribution group: " + error.message);
    }
  }

  async updateByGridId(gridId, updateData) {
    try {
      const group = await PrDistributionGroup.findOneAndUpdate(
        { grid_id: gridId, soft_delete: false },
        updateData,
        { new: true, runValidators: true }
      );
      return group;
    } catch (error) {
      throw ApiError.internal("Error updating PR distribution group by grid ID: " + error.message);
    }
  }

  async softDeleteById(id) {
    try {
      const group = await PrDistributionGroup.findByIdAndUpdate(
        id,
        { soft_delete: true },
        { new: true }
      );
      return group;
    } catch (error) {
      throw ApiError.internal("Error soft deleting PR distribution group: " + error.message);
    }
  }

  async hardDeleteById(id) {
    try {
      const group = await PrDistributionGroup.findByIdAndDelete(id);
      return group;
    } catch (error) {
      throw ApiError.internal("Error hard deleting PR distribution group: " + error.message);
    }
  }

  async count() {
    try {
      const count = await PrDistributionGroup.countDocuments({ soft_delete: false });
      return count;
    } catch (error) {
      throw ApiError.internal("Error counting PR distribution groups: " + error.message);
    }
  }

  async addDistributionData(id, distributionData) {
    try {
      const group = await PrDistributionGroup.findByIdAndUpdate(
        id,
        { $push: { distribution_data: distributionData } },
        { new: true }
      );
      return group;
    } catch (error) {
      throw ApiError.internal("Error adding distribution data: " + error.message);
    }
  }

  async updateDistributionData(id, distributionData) {
    try {
      const group = await PrDistributionGroup.findByIdAndUpdate(
        id,
        { distribution_data: distributionData },
        { new: true }
      );
      return group;
    } catch (error) {
      throw ApiError.internal("Error updating distribution data: " + error.message);
    }
  }

  async addSharedEmail(id, email) {
    try {
      const group = await PrDistributionGroup.findByIdAndUpdate(
        id,
        { $addToSet: { sharedEmails: email } },
        { new: true }
      );
      return group;
    } catch (error) {
      throw ApiError.internal("Error adding shared email: " + error.message);
    }
  }

  async removeSharedEmail(id, email) {
    try {
      const group = await PrDistributionGroup.findByIdAndUpdate(
        id,
        { $pull: { sharedEmails: email } },
        { new: true }
      );
      return group;
    } catch (error) {
      throw ApiError.internal("Error removing shared email: " + error.message);
    }
  }

  async updateMany(filter, updateData) {
    try {
      const result = await PrDistributionGroup.updateMany(filter, updateData);
      return result;
    } catch (error) {
      throw ApiError.internal("Error updating multiple PR distribution groups: " + error.message);
    }
  }
}

module.exports = new PrDistributionGroupRepository();
