import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '../../constants/api';

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // --- CONTROLS STATE ---
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month'
    const [sortBy, setSortBy] = useState('date_desc'); // 'date_desc', 'date_asc', 'amount_desc'

    // --- FETCH BOOKINGS ---
    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/get_all_bookings.php`);
            const result = await res.json();
            if (result.status === 'success') {
                setBookings(result.data);
            }
        } catch (error) {
            console.error("Error fetching bookings:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    // --- ADVANCED FILTERING & SORTING ---
    const processedBookings = useMemo(() => {
        let filtered = bookings.filter(booking => {
            // 1. Search Filter
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = 
                booking.id.toString().includes(searchLower) ||
                (booking.customer_name && booking.customer_name.toLowerCase().includes(searchLower)) ||
                (booking.provider_name && booking.provider_name.toLowerCase().includes(searchLower)) ||
                (booking.service_name && booking.service_name.toLowerCase().includes(searchLower));

            // 2. Status Filter
            const matchesStatus = statusFilter === 'all' ? true : booking.status === statusFilter;

            // 3. Date Filter
            let matchesDate = true;
            if (dateFilter !== 'all' && booking.created_at) {
                const bookingDate = new Date(booking.created_at);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (dateFilter === 'today') {
                    matchesDate = bookingDate >= today;
                } else if (dateFilter === 'week') {
                    const lastWeek = new Date(today);
                    lastWeek.setDate(lastWeek.getDate() - 7);
                    matchesDate = bookingDate >= lastWeek;
                } else if (dateFilter === 'month') {
                    const lastMonth = new Date(today);
                    lastMonth.setMonth(lastMonth.getMonth() - 1);
                    matchesDate = bookingDate >= lastMonth;
                }
            }

            return matchesSearch && matchesStatus && matchesDate;
        });

        // 4. Sorting
        filtered.sort((a, b) => {
            const dateA = new Date(a.created_at || a.booking_date).getTime();
            const dateB = new Date(b.created_at || b.booking_date).getTime();
            const amountA = parseFloat(a.final_amount || a.visit_charge || 0);
            const amountB = parseFloat(b.final_amount || b.visit_charge || 0);

            if (sortBy === 'date_desc') return dateB - dateA;
            if (sortBy === 'date_asc') return dateA - dateB;
            if (sortBy === 'amount_desc') return amountB - amountA;
            return 0;
        });

        return filtered;
    }, [bookings, searchTerm, statusFilter, dateFilter, sortBy]);

    // --- DYNAMIC METRICS ---
    const metrics = useMemo(() => {
        let totalVolume = 0;
        let completed = 0;
        let pending = 0;
        let cancelled = 0;

        processedBookings.forEach(b => {
            const amount = parseFloat(b.final_amount || b.visit_charge || 0);
            totalVolume += amount;
            if (b.status === 'completed') completed++;
            if (b.status === 'pending' || b.status === 'confirmed') pending++;
            if (b.status === 'cancelled') cancelled++;
        });

        return { totalVolume, completed, pending, cancelled };
    }, [processedBookings]);

    // --- HELPER: PREMIUM STATUS BADGES ---
    const getStatusBadge = (status) => {
        switch(status) {
            case 'completed': return <span className="bg-emerald-50 text-emerald-600 border border-emerald-100/50 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm"><i className="fa-solid fa-check-double mr-1"></i> Completed</span>;
            case 'cancelled': return <span className="bg-rose-50 text-rose-600 border border-rose-100/50 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm"><i className="fa-solid fa-xmark mr-1"></i> Cancelled</span>;
            case 'confirmed': return <span className="bg-blue-50 text-blue-600 border border-blue-100/50 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm"><i className="fa-solid fa-thumbs-up mr-1"></i> Confirmed</span>;
            case 'pending': return <span className="bg-amber-50 text-amber-600 border border-amber-100/50 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm"><i className="fa-solid fa-clock mr-1"></i> Pending</span>;
            case 'payment_pending': return <span className="bg-purple-50 text-purple-600 border border-purple-200/50 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm animate-pulse"><i className="fa-solid fa-file-invoice-dollar mr-1"></i> Bill Sent</span>;
            default: return <span className="bg-slate-100 text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">{status}</span>;
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 pb-24 font-sans selection:bg-brand/20 selection:text-brand">
            
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Master Ledger</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Track all service requests, transactions, and platform activity.</p>
                </div>
                <button onClick={fetchBookings} className="bg-slate-50 border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-white hover:shadow-sm transition-all flex items-center gap-2 w-fit">
                    <i className="fa-solid fa-rotate-right"></i> Refresh Data
                </button>
            </div>

            {/* --- DYNAMIC STATS ROW --- */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Value (Filtered)</p>
                    <h4 className="text-2xl font-black text-slate-900 tracking-tighter">₹{metrics.totalVolume.toLocaleString()}</h4>
                </div>
                <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/70 mb-1">Completed</p>
                    <h4 className="text-2xl font-black text-emerald-600 tracking-tighter">{metrics.completed}</h4>
                </div>
                <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100 shadow-sm flex flex-col justify-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-600/70 mb-1">Active / Pending</p>
                    <h4 className="text-2xl font-black text-amber-600 tracking-tighter">{metrics.pending}</h4>
                </div>
                <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-100 shadow-sm flex flex-col justify-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-600/70 mb-1">Cancelled</p>
                    <h4 className="text-2xl font-black text-rose-600 tracking-tighter">{metrics.cancelled}</h4>
                </div>
            </div>

            {/* --- CONTROLS BAR --- */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col lg:flex-row gap-4">
                
                {/* Search */}
                <div className="relative flex-grow">
                    <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input 
                        type="text" 
                        placeholder="Search by ID, Customer, Provider, or Service..." 
                        className="pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/10 w-full transition-all placeholder:text-slate-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                    <div className="relative w-full sm:w-auto">
                        <select 
                            className="w-full sm:w-auto appearance-none pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 cursor-pointer"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">Past 7 Days</option>
                            <option value="month">Past 30 Days</option>
                        </select>
                        <i className="fa-solid fa-calendar-day absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs"></i>
                    </div>

                    <div className="relative w-full sm:w-auto">
                        <select 
                            className="w-full sm:w-auto appearance-none pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 cursor-pointer"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="payment_pending">Payment Pending</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <i className="fa-solid fa-filter absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs"></i>
                    </div>

                    <div className="relative w-full sm:w-auto">
                        <select 
                            className="w-full sm:w-auto appearance-none pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 cursor-pointer"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="date_desc">Newest First</option>
                            <option value="date_asc">Oldest First</option>
                            <option value="amount_desc">Highest Amount</option>
                        </select>
                        <i className="fa-solid fa-sort absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs"></i>
                    </div>
                </div>
            </div>

            {/* --- DATA TABLE --- */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200/60 overflow-hidden animate-fade-in-up" style={{animationDelay: '100ms'}}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <th className="p-5 pl-8">Job Identity</th>
                                <th className="p-5">Customer Info</th>
                                <th className="p-5">Assigned Pro</th>
                                <th className="p-5 text-center">Status</th>
                                <th className="p-5 text-right pr-8">Final Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm font-medium">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-16 text-center">
                                        <i className="fa-solid fa-circle-notch fa-spin text-3xl text-slate-300 mb-3"></i>
                                        <p className="text-slate-500 font-bold">Synchronizing ledger...</p>
                                    </td>
                                </tr>
                            ) : processedBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-16 text-center">
                                        <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300 text-2xl shadow-inner"><i className="fa-solid fa-clipboard-question"></i></div>
                                        <p className="text-slate-900 font-bold text-lg">No bookings found.</p>
                                        <p className="text-slate-500 font-medium text-sm mt-1">Try adjusting your search or filters.</p>
                                    </td>
                                </tr>
                            ) : (
                                processedBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-slate-50/80 transition-colors cursor-default group">
                                        
                                        {/* Job Identity */}
                                        <td className="p-5 pl-8">
                                            <div className="flex flex-col">
                                                <h6 className="font-black text-slate-900 text-base group-hover:text-brand transition-colors tracking-tight">{booking.service_name}</h6>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="bg-slate-100 border border-slate-200 text-slate-500 px-2 py-0.5 rounded flex items-center text-[9px] font-black tracking-widest uppercase">
                                                        #{booking.id}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400">
                                                        {new Date(booking.created_at || booking.booking_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Customer */}
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 text-sm shrink-0 shadow-sm">
                                                    <i className="fa-solid fa-user"></i>
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="font-bold text-slate-900 truncate text-sm">{booking.customer_name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate max-w-[150px]">{booking.address || 'Address hidden'}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Provider */}
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100/50 flex items-center justify-center text-blue-500 text-sm shrink-0 shadow-sm">
                                                    <i className="fa-solid fa-user-tie"></i>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 text-sm">{booking.provider_name}</p>
                                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-0.5">Service Partner</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="p-5 text-center">
                                            {getStatusBadge(booking.status)}
                                        </td>

                                        {/* Amount */}
                                        <td className="p-5 pr-8 text-right">
                                            <h4 className="font-black text-slate-900 text-xl tracking-tighter">
                                                ₹{parseFloat(booking.final_amount > 0 ? booking.final_amount : booking.visit_charge).toLocaleString()}
                                            </h4>
                                            <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${booking.status === 'completed' ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                {booking.status === 'completed' ? 'Settled Value' : 'Est. Base Value'}
                                            </p>
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

export default AdminBookings;