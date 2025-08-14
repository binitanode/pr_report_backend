// src/routes/index.js
const express = require('express');
const prDist = require('./prDistributionRoute');
const authRoute = require('./authRoute');
const roleRoute = require('./roleRoute');  

const router = express.Router();

router.use('/pr-distributions', prDist);
router.use('/auth', authRoute);
router.use('/roles', roleRoute); 

module.exports = router;
