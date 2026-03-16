import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../constants/api';

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

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

    // --- FILTER LOGIC ---
    const filteredBookings = bookings.filter(booking => {
        // Search by ID, Customer Name, or Provider Name
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
            booking.id.toString().includes(searchLower) ||
            (booking.customer_name && booking.customer_name.toLowerCase().includes(searchLower)) ||
            (booking.provider_name && booking.provider_name.toLowerCase().includes(searchLower)) ||
            (booking.service_name && booking.service_name.toLowerCase().includes(searchLower));

        // Filter by Status
        const matchesStatus = statusFilter === 'all' ? true : booking.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Helper for Status Badge Colors
    const getStatusStyle = (status) => {
        switch(status) {
            case 'completed': return 'bg-green-50 text-green-600 border-green-200';
            case 'cancelled': return 'bg-red-50 text-red-600 border-red-200';
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-200';
            case 'confirmed': return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'payment_pending': return 'bg-purple-50 text-purple-600 border-purple-200';
            default: return 'bg-slate-50 text-slate-600 border-slate-200';
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 pb-20">
            
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Master Bookings</h1>
                    <p className="text-sm font-medium text-slate-500">Track all service requests and transactions across the platform.</p>
                </div>
                
                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        <input 
                            type="text" 
                            placeholder="Search ID, name, service..." 
                            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 w-full sm:w-64 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select 
                        className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand cursor-pointer text-slate-700 font-medium"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                                <th className="p-4 font-bold pl-6">Job Details</th>
                                <th className="p-4 font-bold">Customer</th>
                                <th className="p-4 font-bold">Assigned Provider</th>
                                <th className="p-4 font-bold text-center">Status</th>
                                <th className="p-4 font-bold text-right pr-6">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center">
                                        <i className="fa-solid fa-circle-notch fa-spin text-3xl text-brand"></i>
                                    </td>
                                </tr>
                            ) : filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300 text-2xl">
                                            <i className="fa-solid fa-clipboard-question"></i>
                                        </div>
                                        <p className="text-slate-500 font-bold">No bookings found matching your criteria.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-slate-50/80 transition-colors group">
                                        
                                        {/* Job Details */}
                                        <td className="p-4 pl-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900">{booking.service_name}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                                                    ID: #{booking.id} • {new Date(booking.booking_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Customer */}
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs shrink-0">
                                                    <i className="fa-solid fa-user"></i>
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="font-bold text-slate-700 truncate">{booking.customer_name}</p>
                                                    <p className="text-xs text-slate-500 truncate">{booking.address}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Provider */}
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 text-xs shrink-0">
                                                    <i className="fa-solid fa-user-tie"></i>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-700">{booking.provider_name}</p>
                                                    <p className="text-[10px] font-bold text-blue-400 uppercase">Provider</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="p-4 text-center">
                                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(booking.status)}`}>
                                                {booking.status.replace('_', ' ')}
                                            </span>
                                        </td>

                                        {/* Amount */}
                                        <td className="p-4 pr-6 text-right">
                                            <p className="font-bold text-slate-900 text-lg">
                                                ₹{parseFloat(booking.final_amount > 0 ? booking.final_amount : booking.visit_charge).toLocaleString()}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                                                {booking.status === 'completed' ? 'Final Paid' : 'Est. Base'}
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