import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../../constants/api';
import Dialog from '../../components/ui/Dialog'; 

const ProviderEarnings = () => {
    const user = JSON.parse(localStorage.getItem('user'));

    // --- STATE ---
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        stats: { available_balance: 0, total_earned: 0, pending_clearance: 0, total_withdrawn: 0 },
        transactions: []
    });

    // Withdrawal Modal State
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const MIN_WITHDRAWAL = 500; 

    // --- FETCH DATA (Stabilized with useCallback) ---
    const fetchEarnings = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/provider/get_earnings.php?provider_id=${user.id}`);
            const result = await res.json();
            if (result.status === 'success') {
                setData(result.data);
            }
        } catch (err) {
            console.error("Error fetching earnings:", err);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchEarnings();
    }, [fetchEarnings]);

    // --- ACTIONS ---
    const handleWithdrawRequest = async (e) => {
        e.preventDefault();
        const amount = parseFloat(withdrawAmount);

        if (amount < MIN_WITHDRAWAL) {
            return alert(`Minimum withdrawal amount is ₹${MIN_WITHDRAWAL}`);
        }
        if (amount > parseFloat(data.stats.available_balance)) {
            return alert("Insufficient available balance.");
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`${API_BASE_URL}/provider/request_withdrawal.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider_id: user.id, amount: amount })
            });
            const result = await res.json();
            
            if (result.status === 'success') {
                setShowWithdrawModal(false);
                setWithdrawAmount('');
                fetchEarnings(); // Refresh balance
            } else {
                alert(result.message || "Failed to process request");
            }
        } catch (err) {
            alert("Server error processing withdrawal.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-[#F8FAFC] min-h-screen font-sans text-slate-800 pb-24 selection:bg-brand/20 selection:text-brand">
            
            {/* --- PREMIUM HEADER --- */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm sticky top-0 z-30 px-6 md:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Earnings & Payouts</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Manage your wallet and request bank transfers</p>
                </div>
                <button 
                    onClick={() => setShowWithdrawModal(true)}
                    className="flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-xl text-sm font-bold hover:bg-brand transition-all shadow-lg shadow-slate-900/10 active:scale-95 self-start sm:self-auto"
                >
                    <i className="fa-solid fa-building-columns text-xs"></i> Withdraw Funds
                </button>
            </div>

            <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 animate-fade-in-up">
                
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="w-14 h-14 border-4 border-slate-200 border-t-brand rounded-full animate-spin mb-6 shadow-sm"></div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Syncing Ledger...</h3>
                        <p className="text-slate-500 font-medium">Retrieving your latest financial data.</p>
                    </div>
                ) : (
                    <>
                        {/* ================= 1. WALLET CARDS ================= */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            
                            {/* Primary Balance Card ("The Black Card") */}
                            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden md:col-span-2 group border border-slate-700">
                                {/* Decorative Glows */}
                                <div className="absolute top-[-30%] right-[-10%] w-[60%] h-[150%] bg-brand/20 rounded-full blur-[80px] pointer-events-none transition-all duration-700 group-hover:bg-brand/40"></div>
                                <div className="absolute bottom-[-30%] left-[-10%] w-[50%] h-[100%] bg-emerald-500/20 rounded-full blur-[60px] pointer-events-none"></div>
                                
                                <div className="relative z-10 flex flex-col h-full justify-between min-h-[160px]">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Available Balance</p>
                                            <h3 className="text-5xl font-black tracking-tighter mb-1">₹{parseFloat(data.stats.available_balance).toLocaleString()}</h3>
                                        </div>
                                        <i className="fa-brands fa-cc-visa text-3xl text-slate-500/50"></i>
                                    </div>
                                    <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/90 bg-white/10 w-fit px-4 py-2 rounded-xl backdrop-blur-md border border-white/10 shadow-sm">
                                        <i className="fa-solid fa-circle-check text-emerald-400 text-sm"></i>
                                        Ready for withdrawal
                                    </div>
                                </div>
                            </div>

                            {/* Secondary Stats */}
                            <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-200/60 shadow-sm flex flex-col justify-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center text-sm group-hover:scale-110 transition-transform"><i className="fa-solid fa-clock-rotate-left"></i></span> Pending
                                </p>
                                <h4 className="text-3xl font-black text-slate-900 tracking-tighter">₹{parseFloat(data.stats.pending_clearance).toLocaleString()}</h4>
                                <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">Jobs completed, awaiting customer payment.</p>
                            </div>

                            <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-200/60 shadow-sm flex flex-col justify-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center text-sm group-hover:scale-110 transition-transform"><i className="fa-solid fa-money-bill-transfer"></i></span> Withdrawn
                                </p>
                                <h4 className="text-3xl font-black text-slate-900 tracking-tighter">₹{parseFloat(data.stats.total_withdrawn).toLocaleString()}</h4>
                                <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">Lifetime payouts transferred to bank.</p>
                            </div>
                        </div>

                        {/* ================= 2. TRANSACTION LEDGER ================= */}
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200/60 overflow-hidden">
                            <div className="px-6 md:px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h5 className="font-black text-slate-900 text-xl tracking-tight">Transaction History</h5>
                                <button className="text-brand text-sm font-bold hover:underline hidden sm:block">Download CSV</button>
                            </div>

                            <div className="p-0">
                                {data.transactions.length === 0 ? (
                                    <div className="text-center py-20 bg-slate-50/30">
                                        <div className="w-20 h-20 bg-white border border-slate-100 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 text-slate-300 text-3xl shadow-sm">
                                            <i className="fa-solid fa-receipt"></i>
                                        </div>
                                        <h6 className="font-black text-slate-900 text-xl mb-2 tracking-tight">No transactions yet</h6>
                                        <p className="text-slate-500 font-medium text-sm">Your earnings and withdrawals will appear here.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {data.transactions.map((txn, index) => (
                                            <div key={index} className="p-6 md:px-8 flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-default">
                                                
                                                <div className="flex items-center gap-5">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-inner ${
                                                        txn.type === 'credit' ? 'bg-emerald-50 text-emerald-500 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'
                                                    }`}>
                                                        {txn.type === 'credit' ? <i className="fa-solid fa-arrow-down"></i> : <i className="fa-solid fa-building-columns"></i>}
                                                    </div>
                                                    
                                                    <div>
                                                        <h6 className="font-black text-slate-900 text-base md:text-lg tracking-tight group-hover:text-brand transition-colors">
                                                            {txn.type === 'credit' ? 'Payment Received' : 'Withdrawal to Bank'}
                                                        </h6>
                                                        <p className="text-xs text-slate-500 font-medium mt-0.5 max-w-[200px] md:max-w-md truncate">{txn.description}</p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(txn.date).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'})}</span>
                                                            <span className="text-[10px] text-slate-300">•</span>
                                                            <span className={`text-[10px] font-black uppercase tracking-widest ${
                                                                txn.status === 'completed' ? 'text-emerald-500' : 
                                                                txn.status === 'failed' ? 'text-red-500' : 'text-amber-500'
                                                            }`}>{txn.status}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <h4 className={`text-2xl font-black tracking-tighter ${txn.type === 'credit' ? 'text-emerald-500' : 'text-slate-900'}`}>
                                                        {txn.type === 'credit' ? '+' : '-'}₹{parseFloat(txn.amount).toLocaleString()}
                                                    </h4>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* ================= WITHDRAWAL MODAL ================= */}
            <Dialog isOpen={showWithdrawModal} onClose={() => setShowWithdrawModal(false)} title="Request Payout">
                <form onSubmit={handleWithdrawRequest} className="p-6 md:p-8 space-y-6">
                    
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 flex justify-between items-center shadow-inner">
                        <div>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Available to withdraw</p>
                            <h4 className="text-3xl font-black text-slate-900 tracking-tighter">₹{parseFloat(data.stats.available_balance || 0).toLocaleString()}</h4>
                        </div>
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-300 shadow-sm text-2xl border border-slate-100">
                            <i className="fa-solid fa-wallet"></i>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Amount to Withdraw (₹)</label>
                        <div className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black">₹</span>
                            <input 
                                type="number" 
                                className="w-full pl-10 pr-5 py-4 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none text-slate-900 font-black text-xl bg-slate-50 hover:bg-white transition-all placeholder:text-slate-300 shadow-inner" 
                                placeholder="0.00" 
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                min={MIN_WITHDRAWAL}
                                max={data.stats.available_balance}
                                required
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider"><i className="fa-solid fa-circle-info"></i> Minimum withdrawal: ₹{MIN_WITHDRAWAL}</p>
                    </div>

                    <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 shadow-sm">
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3">Transfer Destination</p>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl border border-blue-200 flex items-center justify-center text-blue-500 shadow-sm text-xl">
                                <i className="fa-solid fa-building-columns"></i>
                            </div>
                            <div>
                                <p className="text-base font-bold text-slate-900 leading-tight">Primary Bank Account</p>
                                <p className="text-xs text-slate-500 font-medium">Ending in •••• 4092</p>
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className={`w-full text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-4 active:scale-95 ${
                            isSubmitting ? 'bg-slate-400 cursor-not-allowed shadow-none' : 'bg-slate-900 hover:bg-brand shadow-slate-900/20 hover:shadow-brand/30'
                        }`}
                    >
                        {isSubmitting ? <><i className="fa-solid fa-circle-notch fa-spin text-lg"></i> Processing...</> : <><i className="fa-solid fa-paper-plane text-sm"></i> Confirm Withdrawal</>}
                    </button>
                </form>
            </Dialog>

        </div>
    );
};

export default ProviderEarnings;