import axios from "axios";

const API_BASE_URL = "http://localhost:4000/api/auth";

export async function loginUser(email, password) {
  const response = await axios.post(`${API_BASE_URL}/login`, {
    email,
    password,
  });

  const { token, user } = response.data;

  if (token) {
    localStorage.setItem("maa_token", token);
  }

  if (user) {
    localStorage.setItem("maa_user", JSON.stringify(user));
  }

  return user;
}

export async function registerUser(name, email, password) {
  const response = await axios.post(`${API_BASE_URL}/register`, {
    name,
    email,
    password,
  });

  const { token, user } = response.data;

  if (token) {
    localStorage.setItem("maa_token", token);
  }

  if (user) {
    localStorage.setItem("maa_user", JSON.stringify(user));
  }

  return user;
}

