const userRepository = require('./userRepository');
const roleRepository = require('./roleRepository');
const prDistributionRepository = require('./prDistributionRepository');
const prDistributionGroupRepository = require('./prDistributionGroupRepository');
const BaseRepository = require('./baseRepository');

module.exports = {
  userRepository,
  roleRepository,
  prDistributionRepository,
  prDistributionGroupRepository,
  BaseRepository
};
