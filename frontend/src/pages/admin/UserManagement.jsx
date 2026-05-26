import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiUsers, FiSearch, FiFilter, FiEdit2, FiTrash2, FiUserCheck, FiUserX } from 'react-icons/fi';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import { SkeletonTable } from '../../components/common/LoadingSkeleton';
import { formatDate, getInitials } from '../../utils/helpers';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, role],
    queryFn: () => api.get(`/users?page=${page}&limit=10&search=${search}&role=${role}`).then((r) => r.data),
    keepPreviousData: true,
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) => api.put(`/users/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      toast.success('User status updated');
    },
  });

  const users = data?.data || [];

  const roleColors = {
    customer: 'bg-blue-100 text-blue-700',
    driver: 'bg-green-100 text-green-700',
    fleet_manager: 'bg-purple-100 text-purple-700',
    admin: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <span className="badge bg-gray-100 text-gray-700">{data?.total || 0} users</span>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search users..." className="input-field pl-9" />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-400" size={16} />
            <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} className="input-field w-40">
              <option value="">All Roles</option>
              <option value="customer">Customer</option>
              <option value="driver">Driver</option>
              <option value="fleet_manager">Fleet Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <SkeletonTable />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-dark-700">
                    {['User', 'Email', 'Phone', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                      <th key={h} className="text-left py-3 px-2 text-gray-500 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b border-gray-50 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                            {u.avatar ? (
                              <img src={u.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <span className="text-primary-600 font-semibold text-xs">{getInitials(u.firstName, u.lastName)}</span>
                            )}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{u.firstName} {u.lastName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-gray-500 text-xs">{u.email}</td>
                      <td className="py-3 px-2 text-gray-500 text-xs">{u.phone}</td>
                      <td className="py-3 px-2">
                        <span className={`badge text-xs ${roleColors[u.role] || 'bg-gray-100 text-gray-600'}`}>
                          {u.role?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`badge text-xs ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-gray-500 text-xs">{formatDate(u.createdAt)}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleActiveMutation.mutate({ id: u._id, isActive: !u.isActive })}
                            className={`p-1.5 rounded-lg ${u.isActive ? 'hover:bg-red-50 text-red-500' : 'hover:bg-green-50 text-green-500'}`}
                            title={u.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {u.isActive ? <FiUserX size={14} /> : <FiUserCheck size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="text-center py-12">
                  <FiUsers className="mx-auto text-gray-300 mb-3" size={40} />
                  <p className="text-gray-500">No users found</p>
                </div>
              )}
            </div>
            <Pagination currentPage={page} totalPages={data?.pages || 1} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
