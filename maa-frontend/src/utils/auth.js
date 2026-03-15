export function getToken() {
  return localStorage.getItem("maa_token");
}

export function getUser() {
  const stored = localStorage.getItem("maa_user");

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored);
  } catch (_error) {
    return null;
  }
}

export function isLoggedIn() {
  return Boolean(getToken());
}

export function logout() {
  localStorage.removeItem("maa_token");
  localStorage.removeItem("maa_user");
}

