import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Get auth header for admin token.
 * @returns {{ Authorization: string } | {}}
 */
function getAuthHeaders() {
  const token = localStorage.getItem("adminToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Fetch dashboard stats: totalCurrentStreaks, totalBooksRead, totalAchievements (admin only).
 * @returns {Promise<{ success: boolean, data?: { totalCurrentStreaks, totalBooksRead, totalAchievements }, message?: string }>}
 */
export async function getActivityStats() {
  try {
    const response = await axios.get(`${API_BASE_URL}/activity/stats`, {
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    });
    return response.data;
  } catch (err) {
    const message =
      err.response?.data?.message || err.message || "Failed to load activity stats.";
    throw new Error(message);
  }
}

/**
 * Fetch all users' activity stats for the table (admin only).
 * @returns {Promise<{ success: boolean, data?: { users: Array }, message?: string }>}
 */
export async function getAllUsersActivity() {
  try {
    const response = await axios.get(`${API_BASE_URL}/activity/users`, {
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    });
    return response.data;
  } catch (err) {
    const message =
      err.response?.data?.message ||
      err.message ||
      "Failed to load users activity.";
    throw new Error(message);
  }
}

/**
 * Fetch a single user's activity stats by userId (admin or same user).
 * @param {string} userId
 * @returns {Promise<{ success: boolean, data?: object, message?: string }>}
 */
export async function getUserActivity(userId) {
  if (!userId) {
    throw new Error("User ID is required.");
  }
  try {
    const response = await axios.get(`${API_BASE_URL}/activity/${userId}`, {
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    });
    return response.data;
  } catch (err) {
    const message =
      err.response?.data?.message ||
      err.message ||
      "Failed to load user activity.";
    throw new Error(message);
  }
}

/**
 * Update daily streak (app user token). Used by the app, not admin panel.
 * @param {string} userToken - JWT for the app user
 * @returns {Promise<{ success: boolean, data?: object, message?: string }>}
 */
export async function updateStreak(userToken) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/activity/update-streak`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          ...(userToken ? { Authorization: `Bearer ${userToken}` } : {}),
        },
      }
    );
    return response.data;
  } catch (err) {
    const message =
      err.response?.data?.message || err.message || "Failed to update streak.";
    throw new Error(message);
  }
}

/**
 * Mark a book as completed for the app user (app user token). Used by the app, not admin panel.
 * @param {string} userToken - JWT for the app user
 * @returns {Promise<{ success: boolean, data?: object, message?: string }>}
 */
export async function completeBook(userToken) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/activity/complete-book`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          ...(userToken ? { Authorization: `Bearer ${userToken}` } : {}),
        },
      }
    );
    return response.data;
  } catch (err) {
    const message =
      err.response?.data?.message ||
      err.message ||
      "Failed to complete book.";
    throw new Error(message);
  }
}

/**
 * Delete/reset a user's growth activity (admin only).
 * @param {string} firebaseUid - Firebase UID of the user
 * @returns {Promise<{ success: boolean, message?: string }>}
 */
export async function deleteUserActivity(firebaseUid) {
  if (!firebaseUid) {
    throw new Error("Firebase UID is required.");
  }
  try {
    const response = await axios.delete(`${API_BASE_URL}/activity/${firebaseUid}`, {
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    });
    return response.data;
  } catch (err) {
    const message =
      err.response?.data?.message ||
      err.message ||
      "Failed to delete user activity.";
    throw new Error(message);
  }
}
