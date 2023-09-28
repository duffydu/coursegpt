const Chat = require('../models/chat');
const Message = require('../models/message');
const User = require('../models/user');
const { generateChatTitle } = require('../gpt/openAI');

async function getChat(req, res) {
  try {
    const chatId = req.params.chatId;
    const chat = await Chat.findById(chatId);
    res.send({ chat });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
}

async function getChats(req, res) {
  try {
    // const userId = req.user.id;
    const userId = req.params.userId;
    const chats = await Chat.find({ user: userId, deleted: false });
    res.send({ chats });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
}

async function createChat(req, res) {
  // const userId = req.user.id;
  const userId = req.params.userId;
  try {
    const chat = new Chat({
      user: userId,
      messages: [],
      course: req.body.course,
    });
    const newChat = await chat.save();
    const user = await User.findById(userId);
    if (!user) {
      res.status(500).send({ error: 'There is no such user!' });
    }
    user.chats.push(newChat._id);
    await user.save();

    res.status(201).send({ chat: newChat });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
}

async function softDeleteChats(req, res) {
  let filter = req.body.filter;
  filter.user = req.params.userId;
  const updates = req.body.updates;

  try {
    await Chat.updateMany(filter, updates);
    const chats = await Chat.find(filter);

    // also set associated messages to deleted
    chats.forEach(chat => {
      let messageFilter = {
        user: req.params.userId,
        chat: chat._id,
        deleted: false,
      };
      Message.updateMany(messageFilter, updates);
    });

    res.status(200).send({ chats });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
}

async function softDeleteChat(req, res) {
  const chatId = req.params.chatId;
  const updates = req.body;

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      res.status(404).send({ error: 'ChatSection not found' });
    }

    const updatedChat = await Chat.findByIdAndUpdate(chatId, updates, {
      new: true,
    });

    // also set associated messages to deleted
    const filter = {
      user: req.params.userId,
      chat: chatId,
      deleted: false,
    };
    await Message.updateMany(filter, updates);
    const updatedMessagesFound = await Message.find(filter);

    res.status(200).send({ chat: updatedChat, messages: updatedMessagesFound });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
}

async function createChatTitle(req, res) {
  try {
    const chatId = req.params.chatId;
    let messageIds = [];

    let updatedChat = await Chat.findById(chatId).populate('messages');
    let userMessageContent;
    let chatGptResponseContent;

    for (let i = 0; i < updatedChat.messages.length; i++) {
      let message = updatedChat.messages[i];
      if (!userMessageContent && message.role === 'user') {
        userMessageContent = message.content;
      } else if (!chatGptResponseContent && message.role === 'system') {
        chatGptResponseContent = message.content;
      }
      messageIds.push(message._id);
    }

    if (!updatedChat.title) {
      updatedChat.title = await generateChatTitle(
        userMessageContent,
        chatGptResponseContent,
        0.5,
        0,
        5,
        'gpt-3.5-turbo'
      );
    }

    await updatedChat.save();

    // The frontend expects just a list of id's not the populated messages
    updatedChat.messages = messageIds;

    res.status(201).json({ chat: updatedChat });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: 'Something went wrong ' + error.message + error + error.stack,
    });
  }
}

module.exports = {
  getChat,
  createChat,
  softDeleteChat,
  getChats,
  softDeleteChats,
  createChatTitle,
};
