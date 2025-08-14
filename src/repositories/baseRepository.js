const { default: ApiError } = require("../errors/ApiError");

class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    try {
      const document = await this.model.create(data);
      return document;
    } catch (error) {
      throw ApiError.internal(`Error creating ${this.model.modelName}: ` + error.message);
    }
  }

  async findById(id) {
    try {
      const document = await this.model.findById(id);
      return document;
    } catch (error) {
      throw ApiError.internal(`Error finding ${this.model.modelName} by ID: ` + error.message);
    }
  }

  async findOne(filter) {
    try {
      const document = await this.model.findOne(filter);
      return document;
    } catch (error) {
      throw ApiError.internal(`Error finding ${this.model.modelName}: ` + error.message);
    }
  }

  async find(filter = {}, options = {}) {
    try {
      const { sort = {}, limit, skip, populate } = options;
      let query = this.model.find(filter);
      
      if (sort && Object.keys(sort).length > 0) {
        query = query.sort(sort);
      }
      
      if (skip) {
        query = query.skip(skip);
      }
      
      if (limit) {
        query = query.limit(limit);
      }
      
      if (populate) {
        if (Array.isArray(populate)) {
          populate.forEach(field => {
            query = query.populate(field);
          });
        } else {
          query = query.populate(populate);
        }
      }
      
      const documents = await query.exec();
      return documents;
    } catch (error) {
      throw ApiError.internal(`Error finding ${this.model.modelName}: ` + error.message);
    }
  }

  async findAll(options = {}) {
    try {
      return await this.find({}, options);
    } catch (error) {
      throw ApiError.internal(`Error finding all ${this.model.modelName}: ` + error.message);
    }
  }

  async updateById(id, updateData, options = {}) {
    try {
      const document = await this.model.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true, ...options }
      );
      return document;
    } catch (error) {
      throw ApiError.internal(`Error updating ${this.model.modelName}: ` + error.message);
    }
  }

  async updateOne(filter, updateData, options = {}) {
    try {
      const document = await this.model.findOneAndUpdate(
        filter,
        updateData,
        { new: true, runValidators: true, ...options }
      );
      return document;
    } catch (error) {
      throw ApiError.internal(`Error updating ${this.model.modelName}: ` + error.message);
    }
  }

  async updateMany(filter, updateData, options = {}) {
    try {
      const result = await this.model.updateMany(filter, updateData, options);
      return result;
    } catch (error) {
      throw ApiError.internal(`Error updating multiple ${this.model.modelName}: ` + error.message);
    }
  }

  async deleteById(id) {
    try {
      const document = await this.model.findByIdAndDelete(id);
      return document;
    } catch (error) {
      throw ApiError.internal(`Error deleting ${this.model.modelName}: ` + error.message);
    }
  }

  async deleteOne(filter) {
    try {
      const document = await this.model.findOneAndDelete(filter);
      return document;
    } catch (error) {
      throw ApiError.internal(`Error deleting ${this.model.modelName}: ` + error.message);
    }
  }

  async deleteMany(filter) {
    try {
      const result = await this.model.deleteMany(filter);
      return result;
    } catch (error) {
      throw ApiError.internal(`Error deleting multiple ${this.model.modelName}: ` + error.message);
    }
  }

  async count(filter = {}) {
    try {
      const count = await this.model.countDocuments(filter);
      return count;
    } catch (error) {
      throw ApiError.internal(`Error counting ${this.model.modelName}: ` + error.message);
    }
  }

  async exists(filter) {
    try {
      const exists = await this.model.exists(filter);
      return exists;
    } catch (error) {
      throw ApiError.internal(`Error checking ${this.model.modelName} existence: ` + error.message);
    }
  }

  async aggregate(pipeline) {
    try {
      const result = await this.model.aggregate(pipeline);
      return result;
    } catch (error) {
      throw ApiError.internal(`Error aggregating ${this.model.modelName}: ` + error.message);
    }
  }

  async paginate(filter = {}, options = {}) {
    try {
      const { page = 1, limit = 10, sort = {}, populate } = options;
      const skip = (page - 1) * limit;
      
      const [documents, total] = await Promise.all([
        this.find(filter, { sort, limit, skip, populate }),
        this.count(filter)
      ]);
      
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;
      
      return {
        documents,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage,
          hasPrevPage
        }
      };
    } catch (error) {
      throw ApiError.internal(`Error paginating ${this.model.modelName}: ` + error.message);
    }
  }
}

module.exports = BaseRepository;
