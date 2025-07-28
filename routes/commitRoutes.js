const express = require('express');
const router = express.Router();
const { generateCommit } = require('../controllers/commitController');
const gitEnvMiddleware = require('../middlewares/gitEnvMiddleware');
const logger = require('../middlewares/logger');

router.get('/', (req, res) => {
  res.render('index');
});

router.post('/commit', gitEnvMiddleware, logger, generateCommit);

module.exports = router;
