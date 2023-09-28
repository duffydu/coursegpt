const Chat = require('../models/chat');
const Message = require('../models/message');
const { ask } = require('../gpt/ask');
// const { generateChatTitle } = require('../gpt/openAI');
const mongoose = require('mongoose');
const QAPair = require('../models/qaPair');
const ObjectId = mongoose.Types.ObjectId;

async function getAllMessages(req, res) {
  const chatId = req.params.chatId;
  const messages = await Message.find({ chat: chatId });
  res.status(200).json({ messages });
}

// search all user messages
// params: userId
// queries: search [required], course [optional]
async function searchUserMessages(req, res) {
  try {
    // const userId = req.user.id;
    const userId = req.params.userId;
    const search = req.query.search;
    if (!search || search === '') {
      return res.status(422).json({
        error: true,
        message: 'Missing or empty search query parameter',
      });
    }
    const agg = [
      {
        $search: {
          index: 'messages',
          text: {
            query: search,
            path: 'content',
            fuzzy: {},
          },
          highlight: {
            path: 'content',
          },
        },
      },
      {
        $match: {
          user: new ObjectId(userId),
          deleted: false,
        },
      },
      {
        $project: {
          user: 1,
          chat: 1,
          content: 1,
          updatedAt: 1,
          senderType: 1,
          highlights: {
            $meta: 'searchHighlights',
          },
        },
      },
    ];

    const aggregate = await Message.aggregate(agg);

    // retrieve each message's course ID and attach to the aggregate results
    await Promise.all(
      aggregate.map(async result => {
        const chat = await Chat.findById(result.chat);
        const courseId = chat.course;
        result.course = courseId;
        return result;
      })
    );

    res.status(200).json(aggregate);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true, message: 'Internal Server Error' });
  }
}

async function createUserMessage(req, res) {
  try {
    const chatId = req.params.chatId;
    // const userId = req.user.id;
    const userId = req.params.userId;
    const userInputMessage = req.body.content;
    const message = new Message({
      chat: chatId,
      user: userId,
      role: 'user',
      content: userInputMessage,
    });
    const newUserMessage = await message.save();

    const chat = await Chat.findById(chatId);
    chat.messages.push(newUserMessage._id);
    await chat.save();

    res.status(201).json({ message: newUserMessage });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Something went wrong' + error.message });
  }
}

let gptResponses = {};

async function getGptResponse(req, res) {
  try {
    const chatId = req.params.chatId;
    // const userId = req.user.id;
    const userId = req.params.userId;
    const userMessageObject = req.body;
    if (gptResponses[chatId] && gptResponses[chatId].status === 'in-progress') {
      return res
        .status(400)
        .json({ error: 'Request already in progress for this chat ID.' });
    }

    gptResponses[chatId] = { status: 'in-progress' };

    if (userMessageObject.content.toLowerCase().includes('ignore')) {
      gptResponses[chatId].message =
        'Potential security risk detected in your input...';
      gptResponses[chatId].status = 'complete';
    } else {
      ask(userMessageObject.content, chatId)
        .then(async chatGPTResponse => {
          const gptMessage = new Message({
            chat: chatId,
            user: userId,
            role: 'system',
            content: chatGPTResponse,
          });

          const newGptMessage = await gptMessage.save();

          let chat = await Chat.findById(chatId);
          chat.messages.push(newGptMessage._id);

          await chat.save();

          try {
            const qaPair = await new QAPair({
              course: chat.course,
              chat: chatId,
              question: userMessageObject._id,
              answer: newGptMessage._id,
            });
            await qaPair.save();
          } catch (e) {
            throw new Error(e.message);
          }

          gptResponses[chatId].message = newGptMessage;
          gptResponses[chatId].status = 'complete';
        })
        .catch(error => {
          console.log(error);
          gptResponses[chatId].status = 'failed';
          gptResponses[chatId].message = error.message;
        });
    }

    res.status(202).json(gptResponses[chatId]);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: 'Something went wrong ' + error.message + error.stack });
  }
}

async function checkGptResponse(req, res) {
  const chatId = req.params.chatId;
  const responseStatus = gptResponses[chatId] || { status: 'not-started' };

  if (responseStatus.status === 'failed') {
    res.status(500).json({ error: responseStatus.message });
  } else {
    res.status(200).json(responseStatus);
  }
}

module.exports = {
  createUserMessage,
  getAllMessages,
  getGptResponse,
  searchUserMessages,
  checkGptResponse,
};
