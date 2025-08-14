const { v4: uuidv4 } = require("uuid");

async function generateUniqueGridId() {
  //   let gridId;
  //   let isUnique = false;

  //   // Loop until a unique grid ID is generated
  //   while (!isUnique) {
  //     // Generate a random grid ID
  //     gridId = Math.floor(100000 + Math.random() * 900000);

  //     // Check if the generated grid ID already exists in the database
  //     const existingRecord = await outReachModel.findOne({ grid_id: gridId });

  //     // If the grid ID is not found in the database, it's unique
  //     if (!existingRecord) {
  //       isUnique = true;
  //     }
  //   }
  //   console.log("Generated unique grid ID:", gridId);
  let gridId = uuidv4();
  return gridId;
}

module.exports = {
  generateUniqueGridId,
};
