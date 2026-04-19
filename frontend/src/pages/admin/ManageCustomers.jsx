import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../../constants/api';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // --- FETCH USERS ---
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            // Pointing to our newly created unified PHP file
            const res = await fetch(`${API_BASE_URL}/admin/get_all_users.php`);
            const result = await res.json();
            if (result.status === 'success') {
                setUsers(result.data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // --- ADMIN ACTIONS ---
    const handleToggleStatus = async (userId, userRole, currentStatus) => {
        const actionStr = currentStatus == 1 ? "Suspend" : "Activate";
        if (!window.confirm(`Are you sure you want to ${actionStr} this ${userRole}?`)) return;

        const newStatus = currentStatus == 1 ? 0 : 1;

        try {
            const res = await fetch(`${API_BASE_URL}/admin/toggle_user_status.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: userId, role: userRole, is_active: newStatus })
            });
            const result = await res.json();

            if (result.status === 'success') {
                // Optimistic UI Update
                setUsers(users.map(u => 
                    (u.id === userId && u.role === userRole) ? { ...u, is_active: newStatus } : u
                ));
            } else {
                alert(result.message || "Failed to update status");
            }
        } catch (error) {
            alert("Network error while updating user status.");
        }
    };

    // --- FILTER LOGIC ---
    const filteredUsers = users.filter(user => {
        const matchesSearch = 
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone.includes(searchTerm);
        
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        
        const matchesStatus = statusFilter === 'all' || 
            (statusFilter === 'active' ? user.is_active == 1 : user.is_active == 0);

        return matchesSearch && matchesRole && matchesStatus;
    });

    // Stats Math
    const totalCustomers = users.filter(u => u.role === 'customer').length;
    const totalProviders = users.filter(u => u.role === 'provider').length;

    // Helper for Avatar
    const getImg = (img, name) => (!img || img.includes('default')) ? `https://ui-avatars.com/api/?name=${name}&background=f8fafc&color=475569` : (img.startsWith('http') ? img : `${API_BASE_URL}/${img}`);

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 pb-24 font-sans selection:bg-brand/20 selection:text-brand">
            
            {/* --- HEADER --- */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Identity Management</h1>
                <p className="text-sm font-medium text-slate-500 mt-1">Control access, view activity, and manage all platform accounts.</p>
            </div>

            {/* --- QUICK STATS --- */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xl shadow-inner"><i className="fa-solid fa-users"></i></div>
                    <div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Users</p><p className="text-2xl font-black text-slate-900 leading-none mt-0.5">{users.length}</p></div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center text-xl shadow-inner"><i className="fa-solid fa-user"></i></div>
                    <div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Customers</p><p className="text-2xl font-black text-slate-900 leading-none mt-0.5">{totalCustomers}</p></div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center text-xl shadow-inner"><i className="fa-solid fa-user-tie"></i></div>
                    <div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Providers</p><p className="text-2xl font-black text-slate-900 leading-none mt-0.5">{totalProviders}</p></div>
                </div>
            </div>
            
            {/* --- CONTROLS BAR --- */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-grow">
                    <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input 
                        type="text" 
                        placeholder="Search users by name, email, or phone..." 
                        className="pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/10 w-full transition-all placeholder:text-slate-400 placeholder:font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                {/* Dropdown Filters */}
                <div className="flex gap-4 shrink-0">
                    <div className="relative">
                        <select 
                            className="appearance-none pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 cursor-pointer min-w-[140px]"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="all">All Roles</option>
                            <option value="customer">Customers</option>
                            <option value="provider">Providers</option>
                        </select>
                        <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs"></i>
                    </div>

                    <div className="relative">
                        <select 
                            className="appearance-none pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 cursor-pointer min-w-[140px]"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active Only</option>
                            <option value="suspended">Suspended Only</option>
                        </select>
                        <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs"></i>
                    </div>
                </div>
            </div>

            {/* --- DATA TABLE --- */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <th className="p-5 pl-8">User Identity</th>
                                <th className="p-5">Platform Role</th>
                                <th className="p-5">Status</th>
                                <th className="p-5 text-center">Total Jobs</th>
                                <th className="p-5 text-right pr-8">Admin Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-16 text-center">
                                        <i className="fa-solid fa-circle-notch fa-spin text-3xl text-slate-300 mb-3"></i>
                                        <p className="text-slate-500 font-bold">Synchronizing Database...</p>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-16 text-center">
                                        <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300 text-2xl shadow-inner"><i className="fa-solid fa-magnifying-glass-minus"></i></div>
                                        <p className="text-slate-900 font-bold text-lg">No matching users found.</p>
                                        <p className="text-slate-500 font-medium text-sm mt-1">Try adjusting your filters or search term.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={`${user.role}-${user.id}`} className={`hover:bg-slate-50/50 transition-colors ${user.is_active == 0 ? 'opacity-75 bg-slate-50' : ''}`}>
                                        
                                        {/* User Identity */}
                                        <td className="p-5 pl-8">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <img src={getImg(user.profile_img, user.name)} alt={user.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-white shadow-sm" />
                                                    {user.is_active == 0 && (
                                                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full border-2 border-white flex items-center justify-center text-[10px]" title="Account Suspended">
                                                            <i className="fa-solid fa-lock"></i>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h6 className={`font-bold text-base ${user.is_active == 0 ? 'text-slate-500 line-through decoration-red-500/50' : 'text-slate-900'}`}>{user.name}</h6>
                                                    <p className="text-xs text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                                                        {user.email} <span className="w-1 h-1 bg-slate-300 rounded-full"></span> {user.phone}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Platform Role */}
                                        <td className="p-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                                user.role === 'provider' 
                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' 
                                                : 'bg-blue-50 text-blue-600 border border-blue-100/50'
                                            }`}>
                                                <i className={`fa-solid ${user.role === 'provider' ? 'fa-user-tie' : 'fa-user'}`}></i>
                                                {user.role}
                                            </span>
                                            <p className="text-[10px] font-bold text-slate-400 mt-2 ml-1">ID: #{user.id}</p>
                                        </td>

                                        {/* Status */}
                                        <td className="p-5">
                                            {user.is_active == 1 ? (
                                                <span className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                                    <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span> Active
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2 text-xs font-bold text-red-500">
                                                    <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span> Suspended
                                                </span>
                                            )}
                                        </td>

                                        {/* Total Jobs */}
                                        <td className="p-5 text-center">
                                            <span className={`inline-block px-3 py-1.5 rounded-lg font-bold text-xs border ${
                                                user.total_jobs > 0 ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-slate-50 text-slate-500 border-slate-200/60'
                                            }`}>
                                                {user.total_jobs} Jobs
                                            </span>
                                        </td>

                                        {/* Admin Action */}
                                        <td className="p-5 pr-8 text-right">
                                            {user.is_active == 1 ? (
                                                <button 
                                                    onClick={() => handleToggleStatus(user.id, user.role, user.is_active)}
                                                    className="px-5 py-2.5 bg-white border border-slate-200 text-red-500 text-xs font-bold rounded-xl hover:bg-red-50 hover:border-red-200 transition-all shadow-sm active:scale-95 flex items-center gap-2 ml-auto"
                                                    title="Suspend User"
                                                >
                                                    <i className="fa-solid fa-ban"></i> Suspend
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleToggleStatus(user.id, user.role, user.is_active)}
                                                    className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-brand transition-all shadow-md active:scale-95 flex items-center gap-2 ml-auto"
                                                    title="Reactivate User"
                                                >
                                                    <i className="fa-solid fa-unlock"></i> Activate
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageUsers;