import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../api/axiosInstance';
import {
  createUserMessageInActiveChat,
  getGptResponseInChat,
} from './messagesSlice';
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
export const fetchUserChats = createAsyncThunk(
  'chats/fetchUserChats',
  async (userId) => {
    try {
      const response = await api.get(`/${userId}/chats`);
      for (const chat of response.data.chats) {
        if (!chat.title || chat.title.length === 0) {
          const chatTitleRes = await api.post(`/chats/${chat._id}/chat-title`);
          chat.title = chatTitleRes.data.chat.title;
        }
      }
      return buildObjectMapFromArray(response.data.chats);
    } catch (error) {
      handleRequestError(error);
    }
  }
);

export const createChatTitle = createAsyncThunk(
  'chats/createChatTitle',
  async (args) => {
    var userId = args.userId;
    var chatId = args.chatId;
    try {
      const response = await api.post(`/${userId}/chats/${chatId}/chat-title`);
      return response.data.chat;
    } catch (error) {
      handleRequestError(error);
    }
  }
);

export const fetchChat = createAsyncThunk('chats/fetchChat', async chatId => {
  try {
    const response = await api.get(`/chats/${chatId}`);
    return response.data.chat;
  } catch (error) {
    handleRequestError(error);
  }
});

export const createChatWithSelectedDropdownCourse = createAsyncThunk(
  'chats/createChatWithSelectedDropdownCourse',
  async (userId, { getState }) => {
    try {
      const courseId = getState().courses.currentlySelectedDropdownCourse._id;
      const response = await api.post(`/${userId}/chats`, {
        course: courseId,
      });
      return response.data.chat;
    } catch (error) {
      handleRequestError(error);
    }
  }
);

export const softDeleteSelectedDropdownCourseChats = createAsyncThunk(
  'chats/softDeleteSelectedDropdownCourseChats',
  async (userId, { getState }) => {
    try {
      const courseId = getState().courses.currentlySelectedDropdownCourse
        ? getState().courses.currentlySelectedDropdownCourse._id
        : null;
      let filter;
      if (courseId) {
        filter = { course: courseId };
      } else {
        filter = {};
      }
      const updates = { $set: { deleted: true } };
      const body = { filter, updates };
      const response = await api.patch(`/${userId}/chats`, body);
      return buildObjectMapFromArray(response.data.chats);
    } catch (error) {
      handleRequestError(error);
    }
  }
);

export const softDeleteSingleChat = createAsyncThunk(
  'chats/softDeleteSingleChat',
  async args => {
    var userId = args.userId;
    var chatId = args.chatId;
    try {
      const body = { deleted: true };
      const response = await api.patch(`/${userId}/chats/${chatId}`, body);
      return response.data.chat;
    } catch (error) {
      handleRequestError(error);
    }
  }
);

const chatsSlice = createSlice({
  name: 'chats',
  initialState: {
    // The `userChats` object maps `chatId` keys to a chat object.
    // Example: { "chatId1": chatObject1, "chatId2": chatObject2, }
    userChats: {},
    activeChat: null, // chat object
    waitingFirstMessage: false,
    focusedChat: null, // chat id
    // search result message with highlight information
    // Example: { chat: chatID, content: messageContent, highlights: [highlight info], updatedAt: time, user: uid, _id: messageID }
    highlightMessage: null,
    loading: false,
    error: null, // string message
  },
  reducers: {
    setActiveChat: (state, action) => {
      // Payload must be a string (chatId) or chat object
      if (typeof action.payload === 'string') {
        state.activeChat = state.userChats[action.payload];
      } else {
        state.activeChat = action.payload;
      }
      // disable search result highlighting after user switch chats
      if (
        state.highlightMessage &&
        state.activeChat._id !== state.highlightMessage.chat
      ) {
        state.highlightMessage = null;
      }
      state.waitingFirstMessage = false;
    },
    setFocusedChat: (state, action) => {
      state.focusedChat = action.payload;
    },
    setChatsError: (state, action) => {
      state.error = action.payload;
    },
    setWaitingFirstMessage: (state, action) => {
      state.activeChat = null;
      state.waitingFirstMessage = action.payload;
    },
    setHighlightMessage: (state, action) => {
      state.highlightMessage = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchUserChats.pending, handlePending)
      .addCase(fetchUserChats.fulfilled, (state, action) => {
        state.userChats = action.payload;
        handleLoading(state, false);
      })
      .addCase(fetchUserChats.rejected, handleRejected)
      .addCase(fetchChat.pending, handlePending)
      .addCase(fetchChat.fulfilled, (state, action) => {
        state.userChats[action.payload._id] = action.payload;
        handleLoading(state, false);
      })
      .addCase(fetchChat.rejected, handleRejected)
      .addCase(createChatTitle.pending, handlePending)
      .addCase(createChatTitle.fulfilled, (state, action) => {
        state.userChats[action.payload._id] = action.payload;
        handleLoading(state, false);
      })
      .addCase(createChatTitle.rejected, handleRejected)
      .addCase(createChatWithSelectedDropdownCourse.pending, handlePending)
      .addCase(
        createChatWithSelectedDropdownCourse.fulfilled,
        (state, action) => {
          state.userChats[action.payload._id] = action.payload;
          state.activeChat = action.payload;
          handleLoading(state, false);
        }
      )
      .addCase(createChatWithSelectedDropdownCourse.rejected, handleRejected)
      .addCase(softDeleteSingleChat.pending, handlePending)
      .addCase(softDeleteSingleChat.fulfilled, (state, action) => {
        state.userChats[action.payload._id] = action.payload;
        handleLoading(state, false);
      })
      .addCase(softDeleteSingleChat.rejected, handleRejected)
      .addCase(softDeleteSelectedDropdownCourseChats.pending, handlePending)
      .addCase(
        softDeleteSelectedDropdownCourseChats.fulfilled,
        (state, action) => {
          state.userChats = { ...state.userChats, ...action.payload };
          handleLoading(state, false);
        }
      )
      .addCase(softDeleteSelectedDropdownCourseChats.rejected, handleRejected)

      // messagesSlice actions
      .addCase(createUserMessageInActiveChat.fulfilled, (state, action) => {
        const activeChatId = state.activeChat._id;
        state.userChats[activeChatId].messages.push(action.payload._id);
        state.activeChat = state.userChats[activeChatId];
      })
      .addCase(getGptResponseInChat.fulfilled, (state, action) => {
        const chatId = action.payload.chat;
        state.userChats[chatId].messages.push(action.payload._id);
        if (state.activeChat._id === chatId) {
          state.activeChat = state.userChats[chatId];
        }
      })
      // Auth slice
      .addCase(logoutUser.fulfilled, state => {
        state.userChats = {};
        state.activeChat = null;
        state.waitingFirstMessage = false;
        state.focusedChat = null;
        state.highlightMessage = null;
        state.loading = false;
        state.error = null;
      });
  },
});

export const {
  setActiveChat,
  setFocusedChat,
  setChatsError,
  setWaitingFirstMessage,
  setHighlightMessage,
} = chatsSlice.actions;
export default chatsSlice.reducer;

/**
 * All code written by team.
 * Helped with understanding:
 * - https://redux-toolkit.js.org/api/createAsyncThunk
 * - https://www.youtube.com/playlist?list=PLC3y8-rFHvwheJHvseC3I0HuYI2f46oAK
 * - https://redux.js.org/usage/deriving-data-selectors
 * - Other general Redux docs
 * - ChatSection GPT
 * - Stack Overflow / Google
 */
