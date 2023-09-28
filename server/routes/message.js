const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to access chatId (ie parent route)
const {
  createUserMessage,
  getAllMessages,
  getGptResponse,
  checkGptResponse,
} = require('../controllers/message');
// const { validateToken } = require('../controllers/auth');

// router.use(validateToken);

router.get('/', getAllMessages);
router.get('/search', getAllMessages);

router.post('/', createUserMessage);

router.post('/gpt-response', getGptResponse);
router.get('/gpt-response-status', checkGptResponse);

module.exports = router;
