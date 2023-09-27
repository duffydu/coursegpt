import axios from 'axios';

export const baseUrl =
  // eslint-disable-next-line no-undef
  process.env.NODE_ENV === 'development' ||
  // eslint-disable-next-line no-undef
  process.env.REACT_APP_ENV === 'staging'
    ? 'http://localhost:3001/api'
    : 'https://research-gpt-13kt.onrender.com/api';

const api = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
});

export default api;
