import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../constants/api';

const AdminPayouts = () => {
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('pending'); // Default to showing what needs attention

    // --- FETCH WITHDRAWALS ---
    const fetchWithdrawals = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/get_withdrawals.php`);
            const result = await res.json();
            if (result.status === 'success') {
                setWithdrawals(result.data);
            }
        } catch (error) {
            console.error("Error fetching payouts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWithdrawals();
    }, []);

    // --- PROCESS PAYOUT ---
    const handleProcess = async (id) => {
        if (!window.confirm("Mark this payout as Completed? Ensure you have successfully wired the funds to the provider's bank account before confirming.")) return;

        try {
            const res = await fetch(`${API_BASE_URL}/admin/process_withdrawal.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ withdrawal_id: id, status: 'completed' })
            });
            const result = await res.json();

            if (result.status === 'success') {
                // Optimistic local UI update
                setWithdrawals(withdrawals.map(w => w.id === id ? { ...w, status: 'completed' } : w));
            } else {
                alert(result.message || "Failed to process payout.");
            }
        } catch (error) {
            alert("Server error processing request. Please try again.");
        }
    };

    // --- FILTER LOGIC ---
    const filteredWithdrawals = statusFilter === 'all' 
        ? withdrawals 
        : withdrawals.filter(w => w.status === statusFilter);

    // Calculate Totals for the header cards
    const totalPending = withdrawals.filter(w => w.status === 'pending').reduce((sum, w) => sum + parseFloat(w.amount), 0);
    const totalPaid = withdrawals.filter(w => w.status === 'completed').reduce((sum, w) => sum + parseFloat(w.amount), 0);

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 pb-24 font-sans selection:bg-brand/20 selection:text-brand">
            
            {/* --- HEADER & CONTROLS --- */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Payouts & Finance</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Manage provider withdrawal requests and settle platform balances.</p>
                </div>
                
                {/* Status Filter Toggle */}
                <div className="bg-slate-100/80 p-1.5 rounded-2xl flex w-full md:w-auto border border-slate-200/60 shadow-inner backdrop-blur-sm">
                    <button 
                        onClick={() => setStatusFilter('pending')}
                        className={`flex-1 md:px-8 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
                            statusFilter === 'pending' 
                            ? 'bg-white text-amber-600 shadow-sm border border-slate-200/50' 
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        Needs Action ({withdrawals.filter(w => w.status === 'pending').length})
                    </button>
                    <button 
                        onClick={() => setStatusFilter('all')}
                        className={`flex-1 md:px-8 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
                            statusFilter === 'all' 
                            ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' 
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        Ledger History
                    </button>
                </div>
            </div>

            {/* --- QUICK STATS --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 animate-fade-in-up">
                
                {/* Pending Payouts Card */}
                <div className="bg-amber-50 rounded-[2rem] p-6 md:p-8 border border-amber-200/60 flex items-center justify-between shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-colors duration-700"></div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-amber-700/70 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> Total Pending Transfer
                        </p>
                        <h4 className="text-4xl font-black text-amber-600 tracking-tighter">₹{totalPending.toLocaleString()}</h4>
                    </div>
                    <div className="relative z-10 w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-amber-500 text-2xl shadow-sm border border-amber-100 group-hover:scale-110 transition-transform">
                        <i className="fa-solid fa-clock-rotate-left"></i>
                    </div>
                </div>

                {/* Settled Payouts Card */}
                <div className="bg-emerald-50 rounded-[2rem] p-6 md:p-8 border border-emerald-200/60 flex items-center justify-between shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-colors duration-700"></div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-emerald-700/70 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <i className="fa-solid fa-vault"></i> Lifetime Settled Volume
                        </p>
                        <h4 className="text-4xl font-black text-emerald-600 tracking-tighter">₹{totalPaid.toLocaleString()}</h4>
                    </div>
                    <div className="relative z-10 w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-500 text-2xl shadow-sm border border-emerald-100 group-hover:scale-110 transition-transform">
                        <i className="fa-solid fa-check-double"></i>
                    </div>
                </div>
            </div>

            {/* --- DATA TABLE --- */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200/60 overflow-hidden animate-fade-in-up" style={{animationDelay: '100ms'}}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <th className="p-5 pl-8">Request Details</th>
                                <th className="p-5">Provider Identity</th>
                                <th className="p-5">Transfer Value</th>
                                <th className="p-5 text-center">Status</th>
                                <th className="p-5 text-right pr-8">Admin Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm font-medium">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-16 text-center">
                                        <i className="fa-solid fa-circle-notch fa-spin text-3xl text-slate-300 mb-3"></i>
                                        <p className="text-slate-500 font-bold">Synchronizing financial ledger...</p>
                                    </td>
                                </tr>
                            ) : filteredWithdrawals.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-16 text-center">
                                        <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300 text-2xl shadow-inner"><i className="fa-solid fa-money-bill-wave"></i></div>
                                        <p className="text-slate-900 font-bold text-lg">No payout requests found.</p>
                                        <p className="text-slate-500 font-medium text-sm mt-1">Providers have not requested any new withdrawals.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredWithdrawals.map((withdrawal) => (
                                    <tr key={withdrawal.id} className={`transition-colors cursor-default ${withdrawal.status === 'completed' ? 'hover:bg-slate-50/50 bg-slate-50/30' : 'hover:bg-slate-50/80 bg-white'}`}>
                                        
                                        {/* Date & ID */}
                                        <td className="p-5 pl-8">
                                            <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider border border-slate-200 inline-block mb-1.5">
                                                REQ-#{withdrawal.id}
                                            </span>
                                            <p className="text-xs text-slate-500 font-bold flex items-center gap-2">
                                                <i className="fa-regular fa-calendar text-slate-400"></i>
                                                {new Date(withdrawal.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </td>

                                        {/* Provider Details */}
                                        <td className="p-5">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-sm border ${
                                                    withdrawal.status === 'completed' ? 'bg-slate-200 text-slate-500 border-slate-300' : 'bg-blue-50 text-blue-600 border-blue-100/50'
                                                }`}>
                                                    {withdrawal.provider_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h6 className={`font-bold text-base tracking-tight ${withdrawal.status === 'completed' ? 'text-slate-600' : 'text-slate-900'}`}>{withdrawal.provider_name}</h6>
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                                                        <i className="fa-solid fa-phone"></i> {withdrawal.phone}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Amount & Bank Info (Mocked bank for MVP) */}
                                        <td className="p-5">
                                            <h4 className={`font-black text-xl tracking-tighter ${withdrawal.status === 'completed' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                                ₹{parseFloat(withdrawal.amount).toLocaleString()}
                                            </h4>
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1 flex items-center gap-1.5">
                                                <i className="fa-solid fa-building-columns text-slate-400"></i> Primary Bank
                                            </p>
                                        </td>

                                        {/* Status */}
                                        <td className="p-5 text-center">
                                            {withdrawal.status === 'completed' ? (
                                                <span className="bg-emerald-50 text-emerald-600 border border-emerald-100/50 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 w-fit mx-auto shadow-sm">
                                                    <i className="fa-solid fa-check-double"></i> Settled
                                                </span>
                                            ) : (
                                                <span className="bg-amber-50 text-amber-600 border border-amber-100/50 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 w-fit mx-auto shadow-sm">
                                                    <i className="fa-solid fa-clock animate-pulse"></i> Pending
                                                </span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="p-5 pr-8 text-right">
                                            {withdrawal.status === 'pending' ? (
                                                <button 
                                                    onClick={() => handleProcess(withdrawal.id)}
                                                    className="text-xs font-bold text-white bg-slate-900 hover:bg-brand transition-all px-5 py-3 rounded-xl shadow-lg hover:shadow-brand/30 active:scale-95 flex items-center gap-2 ml-auto"
                                                    title="Mark funds as transferred"
                                                >
                                                    <i className="fa-solid fa-check"></i> Mark as Paid
                                                </button>
                                            ) : (
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-end gap-1.5">
                                                    <i className="fa-solid fa-lock"></i> Locked
                                                </span>
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

export default AdminPayouts;