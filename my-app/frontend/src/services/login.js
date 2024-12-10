import axios from 'axios'
const baseUrl = 'http://localhost:8080/api/login';

const login = (username, password) => {
  const request = axios.post(baseUrl, { username, password });
  return request.then(response => response.data, error => error?.response?.data ? error.response.data : { error: "Something happened"})
}

export default { login }

