import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../constants/api';

const ManageProviders = () => {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'verified', 'pending'

    // --- FETCH PROVIDERS ---
    const fetchProviders = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}admin/get_providers.php`);
            const result = await res.json();
            if (result.status === 'success') {
                setProviders(result.data);
            }
        } catch (error) {
            console.error("Error fetching providers:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProviders();
    }, []);

    // --- VERIFY ACTION ---
  // --- VERIFY ACTION (WITH DEBUGGING) ---
    const handleVerify = async (id, currentStatus) => {
        const newStatus = currentStatus == 1 ? 0 : 1;
        const actionText = newStatus === 1 ? "Verify" : "Revoke Verification for";
        
        if (!window.confirm(`Are you sure you want to ${actionText} this provider?`)) return;

        try {
            const url = `${API_BASE_URL}admin/verify_providers.php`;
            // console.log("Sending request to:", url); // Check this URL in the console!

            const res = await fetch(url, {
                method: 'POST',
                headers: { 
                    'Accept': 'application/json',
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ provider_id: id, status: newStatus })
            });

            // Read the raw response text before trying to parse it as JSON
            const text = await res.text(); 
            // console.log("RAW SERVER RESPONSE:", text); 

            // Now try to parse it
            const result = JSON.parse(text);

            if (result.status === 'success') {
                setProviders(providers.map(p => p.id === id ? { ...p, is_verified: newStatus } : p));
            } else {
                alert(result.message || "Failed to update status.");
            }
        } catch (error) {
            console.error("FETCH FAILED. Error details:", error);
            alert("Action failed! Please check the F12 Console for the exact error.");
        }
    };
    // --- FILTER & SEARCH LOGIC ---
    const filteredProviders = providers.filter(provider => {
        const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              provider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              provider.phone.includes(searchTerm);
        
        const matchesFilter = filterStatus === 'all' ? true : 
                              filterStatus === 'verified' ? provider.is_verified == 1 : 
                              provider.is_verified == 0;

        return matchesSearch && matchesFilter;
    });

    const getImg = (img, name) => (!img || img === 'default_provider.png') ? `https://ui-avatars.com/api/?name=${name}&background=f8fafc&color=334155` : (img.startsWith('http') ? img : `${API_BASE_URL}${img}`);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 pb-20">
            
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Manage Providers</h1>
                    <p className="text-sm font-medium text-slate-500">Review, verify, and manage service partners.</p>
                </div>
                
                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        <input 
                            type="text" 
                            placeholder="Search name, email, phone..." 
                            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 w-full sm:w-64 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select 
                        className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand cursor-pointer text-slate-700 font-medium"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">All Providers</option>
                        <option value="pending">Pending Verification</option>
                        <option value="verified">Verified</option>
                    </select>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                                <th className="p-4 font-bold pl-6">Provider Info</th>
                                <th className="p-4 font-bold">Contact</th>
                                <th className="p-4 font-bold">Profession</th>
                                <th className="p-4 font-bold text-center">Jobs Done</th>
                                <th className="p-4 font-bold text-center">Status</th>
                                <th className="p-4 font-bold text-right pr-6">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center"><i className="fa-solid fa-circle-notch fa-spin text-2xl text-brand"></i></td>
                                </tr>
                            ) : filteredProviders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-400 font-medium">No providers match your search.</td>
                                </tr>
                            ) : (
                                filteredProviders.map((provider) => (
                                    <tr key={provider.id} className="hover:bg-slate-50/50 transition-colors">
                                        
                                        {/* User Info */}
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <img src={getImg(provider.profile_img, provider.name)} alt={provider.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                                                <div>
                                                    <h6 className="font-bold text-slate-900">{provider.name}</h6>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ID: #PRO-{provider.id}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Contact */}
                                        <td className="p-4">
                                            <p className="text-slate-700 font-medium">{provider.phone}</p>
                                            <p className="text-xs text-slate-500">{provider.email}</p>
                                        </td>

                                        {/* Profession */}
                                        <td className="p-4">
                                            <p className="font-bold text-slate-700">{provider.profession || 'N/A'}</p>
                                            <p className="text-xs text-slate-500">{provider.experience_years} Yrs Exp.</p>
                                        </td>

                                        {/* Stats */}
                                        <td className="p-4 text-center">
                                            <span className="inline-block bg-slate-100 text-slate-600 px-3 py-1 rounded-lg font-bold">
                                                {provider.total_jobs}
                                            </span>
                                        </td>

                                        {/* Status Badge */}
                                        <td className="p-4 text-center">
                                            {provider.is_verified == 1 ? (
                                                <span className="bg-green-50 text-green-600 border border-green-100 px-3 py-1 rounded-full text-xs font-bold flex items-center justify-center gap-1 w-fit mx-auto">
                                                    <i className="fa-solid fa-check-circle"></i> Verified
                                                </span>
                                            ) : (
                                                <span className="bg-amber-50 text-amber-600 border border-amber-100 px-3 py-1 rounded-full text-xs font-bold flex items-center justify-center gap-1 w-fit mx-auto">
                                                    <i className="fa-solid fa-clock"></i> Pending
                                                </span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="p-4 pr-6 text-right">
                                            {provider.is_verified == 1 ? (
                                                <button 
                                                    onClick={() => handleVerify(provider.id, provider.is_verified)}
                                                    className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors px-3 py-1.5 border border-transparent hover:border-red-100 hover:bg-red-50 rounded-lg"
                                                >
                                                    Revoke
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleVerify(provider.id, provider.is_verified)}
                                                    className="text-xs font-bold text-white bg-brand hover:bg-blue-700 transition-colors px-4 py-2 shadow-sm shadow-brand/20 rounded-lg"
                                                >
                                                    Verify Now
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

export default ManageProviders;