import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../api/axiosInstance';
import { fetchUser, loginUser, logoutUser, registerUser } from './authSlice';
import {
  createChatWithSelectedDropdownCourse,
  setActiveChat,
} from './chatsSlice';

// State Handlers
const updateUserData = (state, action) => {
  const userFields = [
    '_id',
    'profilePicture',
    'firstName',
    'lastName',
    'email',
    'chats',
    'school',
    'favourites',
    'type',
    'selectedCourse',
    'googleId',
  ];
  for (const field of userFields) {
    state[field] = action.payload[field] || null;
  }
  handleLoading(state, false);
};

const clearUserData = state => {
  updateUserData(state, { payload: { chats: [], favourites: [] } });
};

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
// const createUserRequest = (name, requestType, path) => {
//   return createAsyncThunk(`user/${name}`, async (payload = null) => {
//     try {
//       const response = await api[requestType](`${path}/`, payload);
//       return response.data.user;
//     } catch (error) {
//       handleRequestError(error);
//     }
//   });
// };

// Create an async thunk to update a user
export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ userId, updatedUser }) => {
  // payload = {all target user fields to update according to the exact user schema}
  // Example: {firstName: "John", lastName: "Doe", email: "efpyi@example.com"}
    try {
      console.log("before api call...");
      console.log(userId);
      console.log(updatedUser);
      const response = await api.patch(`/users/${userId}`, updatedUser);
      console.log(response);
      return response.data.user;
    } catch (error) {
      handleRequestError(error);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async ({ userId, deletedUser }) => {
  // payload = {all target user fields to update according to the exact user schema}
  // Example: {firstName: "John", lastName: "Doe", email: "efpyi@example.com"}
    try {
      const response = await api.patch(`/users/${userId}`, deletedUser);
      return response.data.user;
    } catch (error) {
      handleRequestError(error);
    }
  }
);

// User Slice
const userSlice = createSlice({
  name: 'user',
  initialState: {
    _id: null,
    profilePicture: null,
    firstName: null,
    lastName: null,
    email: null,
    googleId: null,
    dateOfBirth: null,
    chats: [],
    school: null,
    favourites: [],
    type: null,
    selectedCourse: null,
    loading: false,
    error: null, // string message

    activePanel: 'INFO', // "CHAT", "INFO", "SEARCH"
    shouldFocusChatInput: false,
  },
  reducers: {
    clearUser: state => {
      clearUserData(state);
    },
    setUserError: (state, action) => {
      state.error = action.payload;
    },
    setActivePanelInfo: state => {
      state.activePanel = 'INFO';
    },
    setActivePanelChat: state => {
      state.activePanel = 'CHAT';
    },
    setActivePanelSearch: state => {
      state.activePanel = 'SEARCH';
    },
    setShouldFocusChatInput: (state, action) => {
      state.shouldFocusChatInput = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(updateUser.pending, handlePending)
      .addCase(updateUser.fulfilled, updateUserData)
      .addCase(updateUser.rejected, handleRejected)
      .addCase(deleteUser.pending, handlePending)
      .addCase(deleteUser.fulfilled, clearUserData)
      .addCase(deleteUser.rejected, handleRejected)

      // authSlice actions
      .addCase(loginUser.fulfilled, updateUserData)
      .addCase(registerUser.fulfilled, updateUserData)
      .addCase(fetchUser.fulfilled, updateUserData)
      .addCase(logoutUser.fulfilled, state => {
        clearUserData(state);
      })

      // chatSlice actions
      .addCase(
        createChatWithSelectedDropdownCourse.fulfilled,
        (state, action) => {
          state.chats.push(action.payload._id);
          state.shouldFocusChatInput = true;
        }
      )
      .addCase(setActiveChat, state => {
        state.shouldFocusChatInput = true;
      });
  },
});

export const {
  clearUser,
  setUserError,
  setActivePanelChat,
  setActivePanelInfo,
  setActivePanelSearch,
  setShouldFocusChatInput,
} = userSlice.actions;
export default userSlice.reducer;

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
