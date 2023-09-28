import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../api/axiosInstance';
import buildObjectMapFromArray from '../util/buildObjectMapFromArray';
import { logoutUser } from './authSlice';

// State Handlers
const handleLoading = (state, loadingStatus) => {
  state.loading = loadingStatus;
  state.error = null;
};
const handlePending = state => {
  handleLoading(state, true);
};
const handleRejected = (state, action) => {
  state.error = action.error.message;
  state.loading = false;
};

// Helpers
const handleRequestError = error => {
  throw error.response?.data?.error || error.message;
};

// Async Functions
const fetchMessages = async (userId, chatId) => {
  const response = await api.get(`${userId}/chats/${chatId}/messages`);
  return buildObjectMapFromArray(response.data.messages);
};

// export const fetchChatMessages = createAsyncThunk(
//   'messages/fetchChatMessages',
//   async chatId => {
//     try {
//       return await fetchMessages(chatId);
//     } catch (error) {
//       handleRequestError(error);
//     }
//   }
// );

export const fetchActiveChatMessages = createAsyncThunk(
  'messages/fetchActiveChatMessages',
  async (userId, { getState }) => {
    try {
      const chatId = getState().chats.activeChat._id;
      return await fetchMessages(userId, chatId);
    } catch (error) {
      handleRequestError(error);
    }
  }
);

export const createUserMessageInActiveChat = createAsyncThunk(
  'messages/createUserMessageInActiveChat',
  async (args, { getState }) => {
    try {
      const userId = args.userId;
      const message = args.message;
      const newMessage = message || getState().messages.currentUserInput;
      const chatId = getState().chats.activeChat?._id;
      const response = await api.post(`${userId}/chats/${chatId}/messages`, {
        content: newMessage,
      });
      return response.data.message;
    } catch (error) {
      handleRequestError(error);
    }
  }
);

export const getGptResponseInChat = createAsyncThunk(
  'messages/getGptResponseInChat',
  async args => {
    try {
      const userId = args.userId;
      const userMessageObject = args.userMessageObject;
      const chatId = userMessageObject.chat;
      await api.post(
        `${userId}/chats/${chatId}/messages/gpt-response`,
        userMessageObject
      );

      let status;
      let message;
      do {
        await new Promise(resolve => setTimeout(resolve, 500)); // polls every 0.5 seconds for gpt message status
        const response = await api.get(
          `${userId}/chats/${chatId}/messages/gpt-response-status`
        );
        status = response.data.status;
        message = response.data.message;
      } while (status !== 'complete');

      return message;
    } catch (error) {
      handleRequestError(error);
    }
  }
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState: {
    // The `messages` object maps each `messageId` key to a message object.
    // Example: { "messageId1": messageObject1, "messageId2": messageObject2}
    messages: {},
    currentUserInput: '',
    loading: false,
    gptLoading: false,
    error: null, // string message
  },
  reducers: {
    setMessagesError: (state, action) => {
      state.error = action.payload;
    },
    setCurrentUserInput: (state, action) => {
      state.currentUserInput = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      // .addCase(fetchChatMessages.pending, handlePending)
      // .addCase(fetchChatMessages.fulfilled, (state, action) => {
      //   state.messages = { ...state.messages, ...action.payload };
      //   handleLoading(state, false);
      // })
      // .addCase(fetchChatMessages.rejected, handleRejected)
      .addCase(fetchActiveChatMessages.pending, handlePending)
      .addCase(fetchActiveChatMessages.fulfilled, (state, action) => {
        state.messages = { ...state.messages, ...action.payload };
        handleLoading(state, false);
      })
      .addCase(fetchActiveChatMessages.rejected, handleRejected)
      .addCase(createUserMessageInActiveChat.pending, handlePending)
      .addCase(createUserMessageInActiveChat.fulfilled, (state, action) => {
        state.messages[action.payload._id] = action.payload;
        handleLoading(state, false);
      })
      .addCase(createUserMessageInActiveChat.rejected, handleRejected)
      .addCase(getGptResponseInChat.pending, state => {
        state.gptLoading = true;
      })
      .addCase(getGptResponseInChat.fulfilled, (state, action) => {
        state.messages[action.payload._id] = action.payload;
        state.gptLoading = false;
      })
      .addCase(getGptResponseInChat.rejected, state => {
        state.gptLoading = false;
      })

      // Auth slice
      .addCase(logoutUser.fulfilled, state => {
        state.messages = {};
        state.currentUserInput = '';
        state.loading = false;
        state.gptLoading = false;
        state.error = null;
      });
  },
});

export const { setMessagesError, setCurrentUserInput } = messagesSlice.actions;
export default messagesSlice.reducer;

/**
 * All code written by team.
 * Helped with understanding:
 * - https://redux-toolkit.js.org/api/createAsyncThunk
 * - https://www.youtube.com/playlist?list=PLC3y8-rFHvwheJHvseC3I0HuYI2f46oAK
 * - https://redux.js.org/usage/deriving-messages-selectors
 * - Other general Redux docs
 * - ChatSection GPT
 * - Stack Overflow / Google
 */
