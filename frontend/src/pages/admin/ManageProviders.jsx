import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../constants/api';

const ManageProviders = () => {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // --- FILTER & SORT STATE ---
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); 
    const [sortBy, setSortBy] = useState('newest'); 

    // --- FETCH PROVIDERS ---
    const fetchProviders = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/get_providers.php`);
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
    const handleVerify = async (id, currentStatus) => {
        const newStatus = currentStatus == 1 ? 0 : 1;
        const actionText = newStatus === 1 ? "Approve & Verify" : "Revoke Verification for";
        
        if (!window.confirm(`Are you sure you want to ${actionText} this provider?`)) return;

        try {
            const res = await fetch(`${API_BASE_URL}/admin/verify_providers.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider_id: id, status: newStatus })
            });

            const text = await res.text(); 
            const result = JSON.parse(text);

            if (result.status === 'success') {
                // Optimistic UI Update
                setProviders(providers.map(p => p.id === id ? { ...p, is_verified: newStatus } : p));
            } else {
                alert(result.message || "Failed to update status.");
            }
        } catch (error) {
            alert("Action failed! Please check your network connection.");
        }
    };

    // --- DATA PROCESSING (Search -> Filter -> Sort) ---
    const getProcessedProviders = () => {
        // 1. Search & Filter
        let processed = providers.filter(provider => {
            const matchesSearch = 
                (provider.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                (provider.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (provider.phone || '').includes(searchTerm);
            
            const matchesFilter = filterStatus === 'all' ? true : 
                                  filterStatus === 'verified' ? provider.is_verified == 1 : 
                                  provider.is_verified == 0;

            return matchesSearch && matchesFilter;
        });

        // 2. Sort
        processed.sort((a, b) => {
            if (sortBy === 'name_asc') return (a.name || '').localeCompare(b.name || '');
            if (sortBy === 'jobs_desc') return (b.total_jobs || 0) - (a.total_jobs || 0);
            if (sortBy === 'exp_desc') return (b.experience_years || 0) - (a.experience_years || 0);
            // Default 'newest' relies on ID descending
            return b.id - a.id; 
        });

        return processed;
    };

    const processedProviders = getProcessedProviders();

    // Helper for Avatar
    const getImg = (img, name) => (!img || img.includes('default')) ? `https://ui-avatars.com/api/?name=${name}&background=f8fafc&color=475569` : (img.startsWith('http') ? img : `${API_BASE_URL}${img}`);

    // Stats Math
    const pendingCount = providers.filter(p => p.is_verified == 0).length;

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 pb-24 font-sans selection:bg-brand/20 selection:text-brand">
            
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Provider Directory</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Review KYC, verify accounts, and manage your workforce.</p>
                </div>
                {pendingCount > 0 && (
                    <div className="bg-amber-50 border border-amber-100 px-4 py-2 rounded-xl flex items-center gap-2 w-fit">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
                        <span className="text-xs font-black uppercase tracking-widest text-amber-700">{pendingCount} Pending Verifications</span>
                    </div>
                )}
            </div>
            
            {/* --- CONTROLS BAR --- */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col lg:flex-row gap-4">
                
                {/* Search */}
                <div className="relative flex-grow">
                    <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input 
                        type="text" 
                        placeholder="Search by name, email, or phone..." 
                        className="pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/10 w-full transition-all placeholder:text-slate-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                {/* Filters & Sorting */}
                <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                    <div className="relative w-full sm:w-auto">
                        <select 
                            className="w-full sm:w-auto appearance-none pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 cursor-pointer"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending KYC</option>
                            <option value="verified">Verified Active</option>
                        </select>
                        <i className="fa-solid fa-filter absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs"></i>
                    </div>

                    <div className="relative w-full sm:w-auto">
                        <select 
                            className="w-full sm:w-auto appearance-none pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 cursor-pointer"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="newest">Sort: Newest First</option>
                            <option value="name_asc">Sort: Name (A-Z)</option>
                            <option value="jobs_desc">Sort: Most Jobs Done</option>
                            <option value="exp_desc">Sort: Highest Experience</option>
                        </select>
                        <i className="fa-solid fa-sort absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs"></i>
                    </div>
                </div>
            </div>

            {/* --- DATA TABLE --- */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <th className="p-5 pl-8">Provider Identity</th>
                                <th className="p-5">Contact Details</th>
                                <th className="p-5">Trade & Exp.</th>
                                <th className="p-5 text-center">Jobs Done</th>
                                <th className="p-5 text-center">Status</th>
                                <th className="p-5 text-right pr-8">Verification</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm font-medium">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-16 text-center">
                                        <i className="fa-solid fa-circle-notch fa-spin text-3xl text-slate-300 mb-3"></i>
                                        <p className="text-slate-500 font-bold">Fetching provider registry...</p>
                                    </td>
                                </tr>
                            ) : processedProviders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-16 text-center">
                                        <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300 text-2xl shadow-inner"><i className="fa-solid fa-user-slash"></i></div>
                                        <p className="text-slate-900 font-bold text-lg">No providers match your criteria.</p>
                                        <p className="text-slate-500 font-medium text-sm mt-1">Try adjusting your filters or search term.</p>
                                    </td>
                                </tr>
                            ) : (
                                processedProviders.map((provider) => (
                                    <tr key={provider.id} className="hover:bg-slate-50/80 transition-colors cursor-default">
                                        
                                        {/* Provider Identity */}
                                        <td className="p-5 pl-8">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <img src={getImg(provider.profile_img, provider.name)} alt={provider.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-white shadow-sm" />
                                                    {provider.is_verified == 1 && (
                                                        <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-emerald-500 text-white rounded-full border-2 border-white flex items-center justify-center text-[10px]" title="Verified">
                                                            <i className="fa-solid fa-check"></i>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h6 className="font-bold text-slate-900 text-base">{provider.name}</h6>
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">ID: #PRO-{provider.id}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Contact */}
                                        <td className="p-5">
                                            <p className="text-slate-700 font-bold flex items-center gap-2 mb-1">
                                                <i className="fa-solid fa-phone text-slate-400 text-[10px]"></i> {provider.phone}
                                            </p>
                                            <p className="text-xs text-slate-500 flex items-center gap-2">
                                                <i className="fa-solid fa-envelope text-slate-400 text-[10px]"></i> {provider.email}
                                            </p>
                                        </td>

                                        {/* Profession */}
                                        <td className="p-5">
                                            <span className="inline-block bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border border-slate-200 mb-1">
                                                {provider.profession || 'Unspecified'}
                                            </span>
                                            <p className="text-xs text-slate-500 font-bold mt-1">
                                                {provider.experience_years ? `${provider.experience_years} Years Exp.` : 'No Exp. Listed'}
                                            </p>
                                        </td>

                                        {/* Stats */}
                                        <td className="p-5 text-center">
                                            <span className={`inline-block px-3 py-1.5 rounded-lg font-bold text-xs border ${
                                                provider.total_jobs > 0 ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-slate-50 text-slate-500 border-slate-200/60'
                                            }`}>
                                                {provider.total_jobs || 0} Jobs
                                            </span>
                                        </td>

                                        {/* Status Badge */}
                                        <td className="p-5">
                                            {provider.is_verified == 1 ? (
                                                <span className="bg-emerald-50 text-emerald-600 border border-emerald-100/50 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 w-fit mx-auto shadow-sm">
                                                    <i className="fa-solid fa-shield-check"></i> Verified
                                                </span>
                                            ) : (
                                                <span className="bg-amber-50 text-amber-600 border border-amber-100/50 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 w-fit mx-auto shadow-sm">
                                                    <i className="fa-solid fa-clock"></i> Pending
                                                </span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="p-5 pr-8 text-right">
                                            {provider.is_verified == 1 ? (
                                                <button 
                                                    onClick={() => handleVerify(provider.id, provider.is_verified)}
                                                    className="px-4 py-2 bg-white border border-slate-200 text-rose-500 text-xs font-bold rounded-xl hover:bg-rose-50 hover:border-rose-200 transition-all shadow-sm active:scale-95 flex items-center gap-2 ml-auto"
                                                    title="Revoke Verification"
                                                >
                                                    <i className="fa-solid fa-ban"></i> Revoke
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleVerify(provider.id, provider.is_verified)}
                                                    className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-brand transition-all shadow-md active:scale-95 flex items-center gap-2 ml-auto"
                                                    title="Approve & Verify"
                                                >
                                                    <i className="fa-solid fa-check"></i> Approve
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