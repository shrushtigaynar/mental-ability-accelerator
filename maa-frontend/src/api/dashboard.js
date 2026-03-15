import axios from "axios";

const DASHBOARD_STATS_URL = "http://localhost:4000/api/dashboard/stats";

export async function getDashboardStats(token) {
  const response = await axios.get(DASHBOARD_STATS_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

