import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../constants/api';

const AdminDashboard = () => {
    const [data, setData] = useState({
        stats: { customers: 0, providers: 0, jobs: 0, earnings: 0 },
        action_required: { pending_providers: 0, pending_withdrawals: 0 },
        chartData: [0, 0, 0, 0, 0, 0, 0],
        recent_bookings: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/admin/get_admin_dashboard.php`);
                const result = await res.json();
                if (result.status === 'success') {
                    setData(result.data);
                }
            } catch (error) {
                console.error("Dashboard Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <i className="fa-solid fa-circle-notch fa-spin text-4xl text-brand"></i>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 pb-20">
            
            {/* --- HEADER --- */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Platform Overview</h1>
                <p className="text-sm font-medium text-slate-500">Live metrics and system status.</p>
            </div>

            {/* --- 1. STATS ROW --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Earnings Card */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 shadow-lg shadow-slate-900/20 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl -mr-4 -mt-4"></div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Platform Earnings (Comm.)</p>
                    <h3 className="text-3xl font-bold mb-4">₹{parseFloat(data.stats.earnings).toLocaleString()}</h3>
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-brand text-lg">
                        <i className="fa-solid fa-vault"></i>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between group hover:border-blue-200 transition-colors">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Customers</p>
                        <h3 className="text-3xl font-bold text-slate-900">{data.stats.customers}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 text-lg mt-4 group-hover:scale-110 transition-transform">
                        <i className="fa-solid fa-users"></i>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between group hover:border-purple-200 transition-colors">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Registered Providers</p>
                        <h3 className="text-3xl font-bold text-slate-900">{data.stats.providers}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 text-lg mt-4 group-hover:scale-110 transition-transform">
                        <i className="fa-solid fa-user-tie"></i>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between group hover:border-green-200 transition-colors">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Completed Jobs</p>
                        <h3 className="text-3xl font-bold text-slate-900">{data.stats.jobs}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500 text-lg mt-4 group-hover:scale-110 transition-transform">
                        <i className="fa-solid fa-clipboard-check"></i>
                    </div>
                </div>
            </div>

            {/* --- 2. MIDDLE ROW (Chart & Actions) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Chart (2/3 width) */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h5 className="font-bold text-slate-900">Revenue (Last 7 Days)</h5>
                            <p className="text-xs text-slate-400 font-medium">Platform commission tracked daily.</p>
                        </div>
                    </div>
                    
                    <div className="flex items-end justify-between h-48 gap-2">
                        {data.chartData.map((val, i) => {
                            const maxVal = Math.max(...data.chartData, 1); 
                            const heightPct = (val / maxVal) * 100;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                                    <div className="relative w-full h-full flex items-end justify-center">
                                        <div 
                                            className="w-full max-w-[40px] bg-slate-100 rounded-t-lg group-hover:bg-brand transition-all duration-500 relative" 
                                            style={{height: `${heightPct}%`, minHeight: '10px'}}
                                        >
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-bold">
                                                ₹{val}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Action Required (1/3 width) */}
                <div className="lg:col-span-1 bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col">
                    <h5 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                        <i className="fa-solid fa-triangle-exclamation text-amber-500"></i> Action Required
                    </h5>
                    <p className="text-xs text-slate-400 font-medium mb-6">Tasks pending your approval.</p>

                    <div className="space-y-4 flex-1">
                        
                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-amber-500 shadow-sm">
                                    <i className="fa-solid fa-user-clock"></i>
                                </div>
                                <div>
                                    <h6 className="font-bold text-amber-900 text-sm">Provider Verifications</h6>
                                    <p className="text-[10px] font-bold text-amber-600/70 uppercase">Waiting Approval</p>
                                </div>
                            </div>
                            <span className="text-xl font-bold text-amber-600">{data.action_required.pending_providers}</span>
                        </div>

                        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-500 shadow-sm">
                                    <i className="fa-solid fa-money-check-dollar"></i>
                                </div>
                                <div>
                                    <h6 className="font-bold text-blue-900 text-sm">Payout Requests</h6>
                                    <p className="text-[10px] font-bold text-blue-600/70 uppercase">Pending Transfer</p>
                                </div>
                            </div>
                            <span className="text-xl font-bold text-blue-600">{data.action_required.pending_withdrawals}</span>
                        </div>

                    </div>

                    <Link to="/admin/providers" className="mt-4 w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all text-center text-sm shadow-md">
                        Review Tasks
                    </Link>
                </div>
            </div>

            {/* --- 3. RECENT BOOKINGS TABLE --- */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <h5 className="font-bold text-slate-900">Live Activity Feed</h5>
                    <Link to="/admin/bookings" className="text-brand text-sm font-bold hover:underline">View All</Link>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                                <th className="p-4 font-bold pl-6">ID</th>
                                <th className="p-4 font-bold">Service</th>
                                <th className="p-4 font-bold">Customer</th>
                                <th className="p-4 font-bold">Provider</th>
                                <th className="p-4 font-bold">Status</th>
                                <th className="p-4 font-bold text-right pr-6">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-sm">
                            {data.recent_bookings.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-400 italic">No recent bookings found.</td>
                                </tr>
                            ) : (
                                data.recent_bookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 pl-6 font-bold text-slate-500">#{booking.id}</td>
                                        <td className="p-4 font-bold text-slate-900">{booking.service_name}</td>
                                        <td className="p-4 text-slate-600">{booking.customer_name}</td>
                                        <td className="p-4 text-slate-600">{booking.provider_name}</td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                                booking.status === 'completed' ? 'bg-green-50 text-green-600 border border-green-100' :
                                                booking.status === 'cancelled' ? 'bg-red-50 text-red-600 border border-red-100' :
                                                'bg-amber-50 text-amber-600 border border-amber-100'
                                            }`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="p-4 pr-6 text-right font-bold text-slate-900">
                                            ₹{parseFloat(booking.final_amount || 0).toLocaleString()}
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

export default AdminDashboard;