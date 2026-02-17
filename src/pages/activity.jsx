import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ActivityStats from "../components/ActivityStats";
import UserActivityTable from "../components/UserActivityTable";
import { getActivityStats, getAllUsersActivity } from "../services/activityService";

const DEFAULT_PAGE_SIZE = 20;

function Activity() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: DEFAULT_PAGE_SIZE, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fullDetails, setFullDetails] = useState(false);

  const fetchActivity = async (opts = {}) => {
    setLoading(true);
    setError(null);
    const page = opts.page ?? pagination.page;
    const limit = opts.limit ?? pagination.limit;
    const loadAll = opts.loadAll === true;
    const details = opts.details ?? fullDetails;
    try {
      const [statsRes, usersRes] = await Promise.all([
        getActivityStats(),
        getAllUsersActivity({
          page: loadAll ? 1 : page,
          limit: loadAll ? 0 : limit,
          details,
        }),
      ]);
      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (usersRes.success && usersRes.data?.users) {
        setUsers(usersRes.data.users);
        if (usersRes.data.pagination) setPagination(usersRes.data.pagination);
      } else if (!usersRes.success) setError(usersRes.message || "Failed to load users.");
    } catch (err) {
      setError(err.message || "Failed to load activity.");
    } finally {
      setLoading(false);
    }
  };

  const loadAllDetails = () => {
    setFullDetails(true);
    fetchActivity({ loadAll: true, details: true });
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

          <div className="mb-4 flex flex-wrap justify-between items-center gap-3">
            <h2 className="text-xl font-semibold text-white">
              User activity
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => fetchActivity()}
                disabled={loading}
                className="px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50 transition-colors"
                style={{ backgroundColor: "#7C3AED" }}
              >
                Refresh
              </button>
              <button
                onClick={loadAllDetails}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-violet-600/80 hover:bg-violet-600 text-white font-medium disabled:opacity-50 transition-colors"
              >
                Load all details
              </button>
            </div>
          </div>

          {pagination.totalPages > 1 && pagination.limit > 0 && (
            <div className="mb-3 flex items-center justify-between text-sm text-gray-400">
              <span>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} users)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchActivity({ page: pagination.page - 1 })}
                  disabled={loading || pagination.page <= 1}
                  className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchActivity({ page: pagination.page + 1 })}
                  disabled={loading || pagination.page >= pagination.totalPages}
                  className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}

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
