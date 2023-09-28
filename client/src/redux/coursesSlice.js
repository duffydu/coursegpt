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
export const fetchSchoolCourse = createAsyncThunk(
  'courses/fetchSchoolCourse',
  async ({ schoolId, courseId }) => {
    try {
      const response = await api.get(
        `/schools/${schoolId}/courses/user/${courseId}`
      );
      return response.data.course;
    } catch (error) {
      handleRequestError(error);
    }
  }
);

export const trainCurrentlySelectedDropdownCourse = createAsyncThunk(
  'courses/trainCurrentlySelectedDropdownCourse',
  async ({userId, content}, { getState }) => {
    try {
      const schoolId =
        getState().courses.currentlySelectedDropdownCourse?.school;
      const courseId = getState().courses.currentlySelectedDropdownCourse?._id;

      await api.put(`/schools/${schoolId}/courses/${userId}/${courseId}/improve-model`, {
        content,
      });

      let status;
      do {
        await new Promise(resolve => setTimeout(resolve, 3000)); // polls every 3 seconds for training status
        const response = await api.get(
          `/schools/${schoolId}/courses/${userId}/${courseId}/training-status`
        );
        status = response.data.status;
      } while (status !== 'complete');

      return { status: 'complete', courseId };
    } catch (error) {
      handleRequestError(error);
    }
  }
);

export const fetchSchoolCourses = createAsyncThunk(
  'courses/fetchSchoolCourses',
  async schoolId => {
    try {
      const response = await api.get(`/schools/${schoolId}/courses/user`);
      return buildObjectMapFromArray(response.data.courses);
    } catch (error) {
      handleRequestError(error);
    }
  }
);

export const fetchAllCourses = createAsyncThunk(
  'courses/fetchAllCourses',
  async () => {
    try {
      const response = await api.get(`/courses`);
      return buildObjectMapFromArray(response.data.courses);
    } catch (error) {
      handleRequestError(error);
    }
  }
);

const coursesSlice = createSlice({
  name: 'courses',
  initialState: {
    // The `courses` object maps each `courseId` key to a course object.
    // Example: { "courseId1": courseObject1, "courseId2": courseObject2}
    courses: {},
    currentlySelectedDropdownCourse: null, // course object, null if allChats
    loading: false,
    error: null, // string message
  },
  reducers: {
    setCoursesError: (state, action) => {
      state.error = action.payload;
    },
    setCurrentlySelectedDropdownCourse: (state, action) => {
      if (!action.payload || action.payload._id) {
        // if the payload is a course object or null, then simply update the selectedDropdownCourse
        state.currentlySelectedDropdownCourse = action.payload;
      } else {
        // else its a course id. index and update
        state.currentlySelectedDropdownCourse = state.courses[action.payload];
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchSchoolCourse.pending, handlePending)
      .addCase(fetchSchoolCourse.fulfilled, (state, action) => {
        state.courses[action.payload._id] = action.payload;
        handleLoading(state, false);
      })
      .addCase(fetchSchoolCourse.rejected, handleRejected)
      .addCase(fetchSchoolCourses.pending, handlePending)
      .addCase(fetchSchoolCourses.fulfilled, (state, action) => {
        state.courses = { ...state.courses, ...action.payload };
        handleLoading(state, false);
      })
      .addCase(fetchSchoolCourses.rejected, handleRejected)
      .addCase(fetchAllCourses.pending, handlePending)
      .addCase(fetchAllCourses.fulfilled, (state, action) => {
        state.courses = action.payload;
        handleLoading(state, false);
      })
      .addCase(fetchAllCourses.rejected, handleRejected)
      .addCase(trainCurrentlySelectedDropdownCourse.pending, handlePending)
      .addCase(trainCurrentlySelectedDropdownCourse.fulfilled, state => {
        handleLoading(state, false);
      })
      .addCase(trainCurrentlySelectedDropdownCourse.rejected, handleRejected)

      // Auth slice
      .addCase(logoutUser.fulfilled, state => {
        state.currentlySelectedDropdownCourse = null;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { setCoursesError, setCurrentlySelectedDropdownCourse } =
  coursesSlice.actions;
export default coursesSlice.reducer;

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
