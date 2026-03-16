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
        if (!window.confirm("Mark this payout as Completed? Ensure you have actually transferred the funds to the provider's bank account.")) return;

        try {
            const res = await fetch(`${API_BASE_URL}/admin/process_withdrawal.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ withdrawal_id: id, status: 'completed' })
            });
            const result = await res.json();

            if (result.status === 'success') {
                // Update local UI
                setWithdrawals(withdrawals.map(w => w.id === id ? { ...w, status: 'completed' } : w));
            } else {
                alert(result.message || "Failed to process payout.");
            }
        } catch (error) {
            alert("Server error processing request.");
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
        <div className="p-6 max-w-7xl mx-auto space-y-6 pb-20">
            
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Payouts & Finance</h1>
                    <p className="text-sm font-medium text-slate-500">Manage provider withdrawal requests and settlements.</p>
                </div>
                
                {/* Filter */}
                <div className="bg-slate-100 p-1 rounded-xl flex gap-1 w-full sm:w-auto">
                    <button 
                        onClick={() => setStatusFilter('pending')}
                        className={`flex-1 sm:px-6 py-2 text-sm font-bold rounded-lg transition-all ${statusFilter === 'pending' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Pending Needs Action
                    </button>
                    <button 
                        onClick={() => setStatusFilter('all')}
                        className={`flex-1 sm:px-6 py-2 text-sm font-bold rounded-lg transition-all ${statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        All History
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1">Total Pending Payouts</p>
                        <h4 className="text-2xl font-bold text-blue-900">₹{totalPending.toLocaleString()}</h4>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-500 text-xl shadow-sm">
                        <i className="fa-solid fa-clock-rotate-left"></i>
                    </div>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-2xl p-5 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-green-500 uppercase tracking-wider mb-1">Total Settled (Lifetime)</p>
                        <h4 className="text-2xl font-bold text-green-900">₹{totalPaid.toLocaleString()}</h4>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-green-500 text-xl shadow-sm">
                        <i className="fa-solid fa-check-double"></i>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                                <th className="p-4 font-bold pl-6">Req ID / Date</th>
                                <th className="p-4 font-bold">Provider Details</th>
                                <th className="p-4 font-bold">Transfer Info</th>
                                <th className="p-4 font-bold text-center">Status</th>
                                <th className="p-4 font-bold text-right pr-6">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center">
                                        <i className="fa-solid fa-circle-notch fa-spin text-3xl text-brand"></i>
                                    </td>
                                </tr>
                            ) : filteredWithdrawals.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300 text-2xl">
                                            <i className="fa-solid fa-money-bill-wave"></i>
                                        </div>
                                        <p className="text-slate-500 font-bold">No payout requests found.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredWithdrawals.map((withdrawal) => (
                                    <tr key={withdrawal.id} className="hover:bg-slate-50/50 transition-colors">
                                        
                                        {/* Date & ID */}
                                        <td className="p-4 pl-6">
                                            <p className="font-bold text-slate-900">#{withdrawal.id}</p>
                                            <p className="text-xs text-slate-500 font-medium">
                                                {new Date(withdrawal.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </td>

                                        {/* Provider Details */}
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold shrink-0">
                                                    {withdrawal.provider_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h6 className="font-bold text-slate-900">{withdrawal.provider_name}</h6>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">PRO-{withdrawal.provider_id} • {withdrawal.phone}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Amount & Bank Info (Mocked bank for MVP) */}
                                        <td className="p-4">
                                            <p className="font-bold text-slate-900 text-lg">₹{parseFloat(withdrawal.amount).toLocaleString()}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                                                <i className="fa-solid fa-building-columns"></i> Bank Transfer
                                            </p>
                                        </td>

                                        {/* Status */}
                                        <td className="p-4 text-center">
                                            {withdrawal.status === 'completed' ? (
                                                <span className="bg-green-50 text-green-600 border border-green-100 px-3 py-1 rounded-full text-xs font-bold flex items-center justify-center gap-1 w-fit mx-auto">
                                                    <i className="fa-solid fa-check"></i> Paid
                                                </span>
                                            ) : (
                                                <span className="bg-amber-50 text-amber-600 border border-amber-100 px-3 py-1 rounded-full text-xs font-bold flex items-center justify-center gap-1 w-fit mx-auto animate-pulse">
                                                    <i className="fa-solid fa-clock"></i> Pending
                                                </span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="p-4 pr-6 text-right">
                                            {withdrawal.status === 'pending' ? (
                                                <button 
                                                    onClick={() => handleProcess(withdrawal.id)}
                                                    className="text-xs font-bold text-white bg-slate-900 hover:bg-black transition-colors px-4 py-2 shadow-sm rounded-lg"
                                                >
                                                    Mark as Paid
                                                </button>
                                            ) : (
                                                <span className="text-xs font-bold text-slate-400">
                                                    Settled
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