import axios from 'axios';
import Cookies from 'js-cookie';

// Set the default base URL for your API
// axios.defaults.baseURL = 'https://your-api-url.com';
const api = axios.create({
    baseURL:'https://new-app-fuaa.onrender.com'    
})
// Add an interceptor to include the JWT token with all requests
api.interceptors.request.use(
  (config) => {
        const jwtToken = Cookies.get('jwtToken');        
    if (jwtToken) {
      config.headers['Authorization'] = jwtToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
export default api