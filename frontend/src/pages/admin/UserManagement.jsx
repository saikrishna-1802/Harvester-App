import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Trash2, ShieldCheck, HardHat, Loader2 } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [form, setForm] = useState({ username: '', password: '', role: 'driver' });
  const [creating, setCreating] = useState(false);

  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get('/api/users', { headers });
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setMessage({ type: '', text: '' });
    try {
      const { data } = await axios.post('/api/users', form, { headers });
      setUsers(prev => [data, ...prev]);
      setForm({ username: '', password: '', role: 'driver' });
      setMessage({ type: 'success', text: `User "${data.username}" created successfully!` });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create user' });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id, username) => {
    if (!window.confirm(`Delete user "${username}"?`)) return;
    try {
      await axios.delete(`/api/users/${id}`, { headers });
      setUsers(prev => prev.filter(u => u.id !== id));
      setMessage({ type: 'success', text: `User "${username}" deleted.` });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete user' });
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      const { data } = await axios.put(`/api/users/${id}`, { role: newRole }, { headers });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: data.role } : u));
      setMessage({ type: 'success', text: `Role updated for "${data.username}"` });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update role' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">User Management</h1>

      {message.text && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium border ${
          message.type === 'success'
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Create User Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-green-600" /> Create New User
        </h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              required
              value={form.username}
              onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
              placeholder="e.g. driver1"
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              placeholder="Set a password"
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={form.role}
              onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none text-sm"
            >
              <option value="driver">Driver</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={creating}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-70"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Create User
            </button>
          </div>
        </form>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">All Users</h2>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-green-600" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Username</th>
                <th className="px-6 py-3 text-left">Role</th>
                <th className="px-6 py-3 text-left">Created</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800">{user.username}</td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={e => handleRoleChange(user.id, e.target.value)}
                      className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-green-400 outline-none ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      <option value="admin">Admin</option>
                      <option value="driver">Driver</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    -
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(user.id, user.username)}
                      className="text-red-400 hover:text-red-600 transition-colors p-1 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
