import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ActivityStats from "../components/ActivityStats";
import UserActivityTable from "../components/UserActivityTable";
import { getActivityStats, getAllUsersActivity } from "../services/activityService";

function Activity() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActivity = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, usersRes] = await Promise.all([
        getActivityStats(),
        getAllUsersActivity(),
      ]);
      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (usersRes.success && usersRes.data?.users) setUsers(usersRes.data.users);
      else if (!usersRes.success) setError(usersRes.message || "Failed to load users.");
    } catch (err) {
      setError(err.message || "Failed to load activity.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1
              className="text-3xl font-bold text-white"
              style={{ fontFamily: "Archivo Black" }}
            >
              Growth & Activity
            </h1>
            <p className="text-gray-400 mt-1">
              Reading streaks, books read, and achievements across users.
            </p>
          </div>

          <ActivityStats stats={stats} users={users} />

          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">
              User activity
            </h2>
            <button
              onClick={fetchActivity}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50 transition-colors"
              style={{ backgroundColor: "#7C3AED" }}
            >
              Refresh
            </button>
          </div>

          <UserActivityTable
            users={users}
            loading={loading}
            error={error}
            onDelete={fetchActivity}
          />
        </div>
      </div>
    </div>
  );
}

export default Activity;
