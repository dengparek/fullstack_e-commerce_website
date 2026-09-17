import React, { useEffect, useState } from "react";
import { adminApi } from "../api/admin.api";
import type { User } from "../types/api";
import axios from "axios";

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Action Loading States
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const getErrorMessage = (err: unknown, fallback: string): string => {
    if (axios.isAxiosError(err)) {
      return err.response?.data?.message || fallback;
    }
    return fallback;
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getUsers({ page, limit });

      //   setUsers(res.data.items || res.data.data || []);
      //     setTotalPages(res.data.totalPages || 1);

      setUsers(res.data.items || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load users list."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleRoleChange = async (
    id: string,
    newRole: "customer" | "admin",
  ) => {
    try {
      setUpdatingId(id);
      setError(null);
      await adminApi.updateUserRole(id, newRole);

      setUsers((prev) =>
        prev.map((user) =>
          user.id === id ? { ...user, role: newRole } : user,
        ),
      );
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to update user role."));
      await fetchUsers();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      setUpdatingId(id);
      setError(null);
      const updatedStatus = !currentStatus;
      await adminApi.toggleUserActiveStatus(id, updatedStatus);

      setUsers((prev) =>
        prev.map((user) =>
          user.id === id ? { ...user, isActive: updatedStatus } : user,
        ),
      );
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to update user status."));
      await fetchUsers();
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <p className="text-sm text-slate-500">
          Manage system access, customer roles, and account statuses.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-md">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-x-auto bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-700 uppercase">
            <tr>
              <th className="px-6 py-3">User</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-slate-500"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">
                      {user.name || "No Name Provided"}
                    </div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      disabled={updatingId === user.id}
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(
                          user.id,
                          e.target.value as "customer" | "admin",
                        )
                      }
                      className="border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-slate-900 disabled:opacity-50"
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${
                        (user.isActive ?? true)
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {(user.isActive ?? true) ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      disabled={updatingId === user.id}
                      onClick={() =>
                        handleToggleStatus(user.id, user.isActive ?? true)
                      }
                      className={`text-xs font-medium underline ${
                        (user.isActive ?? true)
                          ? "text-rose-600 hover:text-rose-800"
                          : "text-emerald-600 hover:text-emerald-800"
                      }`}
                    >
                      {(user.isActive ?? true) ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center text-xs text-slate-600 pt-2">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="space-x-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="px-3 py-1.5 border border-slate-300 rounded bg-white hover:bg-slate-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              className="px-3 py-1.5 border border-slate-300 rounded bg-white hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
