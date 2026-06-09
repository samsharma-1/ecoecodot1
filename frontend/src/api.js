import axios from 'axios';

const api = axios.create({
  baseURL: 'https://ecoecodot1.onrender.com',
  timeout: 12000,
});

export default api;