const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getChat,
  createChat,
  softDeleteChat,
  getChats,
  createChatTitle,
  softDeleteChats,
} = require('../controllers/chat');
// const { validateToken } = require('../controllers/auth');

// router.use(validateToken);

router.get('/:chatId', getChat);

router.post('/', createChat);

router.get('/', getChats);

router.patch('/:chatId', softDeleteChat); // for setting deleted = true

router.patch('/', softDeleteChats); // for setting deleted = true

router.post('/:chatId/chat-title', createChatTitle);

module.exports = router;
