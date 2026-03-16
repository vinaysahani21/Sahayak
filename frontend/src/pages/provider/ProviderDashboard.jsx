import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../constants/api';
import Dialog from '../../components/ui/Dialog'; 

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // --- STATE ---
  const [data, setData] = useState({ 
    stats: { total_earnings: 0, total_jobs: 0, rating: 0 }, 
    requests: [], 
    upcoming: [],
    chartData: [0, 0, 0, 0, 0, 0, 0], 
    reviews: []
  });
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  
  // Bill Modal State
  const [showBillModal, setShowBillModal] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [billData, setBillData] = useState({ amount: '', description: '' });
  const [isSubmittingBill, setIsSubmittingBill] = useState(false);

  // --- FETCH DATA ---
  const fetchDashboard = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/provider/get_provider_dashboard.php?provider_id=${user.id}`);
      const result = await res.json();
      
      if(result.status === 'success') {
          setData({
            stats: result.data.stats || { total_earnings: 0, total_jobs: 0, rating: 0 },
            requests: result.data.requests || [],
            upcoming: result.data.upcoming || [],
            chartData: result.data.chartData || [0, 0, 0, 0, 0, 0, 0],
            reviews: result.data.reviews || []
          });
      }
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // --- ACTIONS ---
  const handleAction = async (id, status) => {
    // Optimistic Update
    const newRequests = data.requests.filter(r => r.id !== id);
    setData(prev => ({ ...prev, requests: newRequests }));

    try {
      await fetch(`${API_BASE_URL}/provider/update_booking_status.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: id, status: status })
      });
      fetchDashboard(); 
    } catch (error) { alert("Action failed"); }
  };

  const submitBill = async (e) => {
    e.preventDefault();
    if(!billData.amount || !billData.description) return alert("Please fill all details.");
    
    setIsSubmittingBill(true);
    try {
      const res = await fetch(`${API_BASE_URL}/provider/generate_bill.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: currentJobId, ...billData })
      });
      const result = await res.json();
      
      if(result.status === 'success') {
        setShowBillModal(false);
        setBillData({ amount: '', description: '' }); 
        fetchDashboard();
      } else {
          alert(result.message || "Failed to send invoice.");
      }
    } catch (err) { alert("Error sending bill."); }
    finally { setIsSubmittingBill(false); }
  };

  // Helper: Get Date Strips
  const getDays = () => {
    const days = [];
    const today = new Date();
    for(let i=0; i<5; i++) {
        const d = new Date();
        d.setDate(today.getDate() + i);
        days.push({ 
            day: d.toLocaleDateString('en-US', { weekday: 'short' }), 
            date: d.getDate(),
            active: i === 0
        });
    }
    return days;
  };

  if (loading) {
      return (
          <div className="flex flex-col h-screen items-center justify-center bg-[#F8FAFC]">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-brand rounded-full animate-spin mb-4 shadow-sm"></div>
              <p className="text-slate-500 font-medium animate-pulse">Loading Workspace...</p>
          </div>
      );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans text-slate-800 pb-12">
      
      {/* ================= 1. PREMIUM HEADER ================= */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-6 md:px-8 h-20 flex justify-between items-center transition-all shadow-sm">
        <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h2>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-4 md:gap-6">
          <button 
            onClick={() => setIsOnline(!isOnline)}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm active:scale-95 ${
                isOnline 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300' 
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-300'}`}></span>
            {isOnline ? 'Accepting Jobs' : 'Offline'}
          </button>

          <div className="flex items-center gap-3 pl-4 md:pl-6 border-l border-slate-200">
             <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 leading-tight">{user.name}</p>
                <p className="text-[10px] font-bold text-brand uppercase tracking-wider">Professional</p>
             </div>
             <img 
                src={user.profile_img || `https://ui-avatars.com/api/?name=${user.name}&background=0f172a&color=fff`} 
                alt="Profile" 
                className="w-10 h-10 rounded-full bg-slate-200 object-cover border-2 border-white shadow-sm"
             />
          </div>
        </div>
      </header>

      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        
        {/* ================= 2. QUICK STATS ROW ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all duration-300">
                <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Total Revenue</p>
                    <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">₹{parseFloat(data.stats.total_earnings || 0).toLocaleString()}</h3>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm">
                    <i className="fa-solid fa-wallet"></i>
                </div>
            </div>

            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all duration-300">
                <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Jobs Completed</p>
                    <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{data.stats.total_jobs || 0}</h3>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all shadow-sm">
                    <i className="fa-solid fa-clipboard-check"></i>
                </div>
            </div>

            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all duration-300 sm:col-span-2 lg:col-span-1">
                <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Avg Rating</p>
                    <div className="flex items-center gap-3">
                        <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{parseFloat(data.stats.rating || 0).toFixed(1)}</h3>
                        <div className="flex text-amber-400 text-sm">
                            <i className="fa-solid fa-star"></i>
                        </div>
                    </div>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm">
                    <i className="fa-solid fa-award"></i>
                </div>
            </div>
        </div>

        {/* ================= 3. MAIN CONTENT ================= */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* --- LEFT COLUMN (Requests & Chart) --- */}
            <div className="xl:col-span-2 space-y-8">
                
                {/* ACTIVE REQUESTS */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-6 md:px-8 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                        <h5 className="font-bold text-slate-900 text-lg flex items-center gap-3 tracking-tight">
                            <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center text-sm">
                               <i className="fa-solid fa-bell"></i> 
                            </div>
                            New Requests
                        </h5>
                        {data.requests.length > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full animate-pulse shadow-sm shadow-red-500/30">{data.requests.length} PENDING</span>}
                    </div>

                    <div className="p-6 md:p-8">
                        {data.requests.length === 0 ? (
                            <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-2xl">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 text-2xl">
                                    <i className="fa-solid fa-mug-hot"></i>
                                </div>
                                <h6 className="text-slate-900 font-bold mb-1">You're all caught up!</h6>
                                <p className="text-slate-500 text-sm font-medium">Keep your status "Online" to receive new job requests.</p>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {data.requests.map(req => (
                                    <div key={req.id} className="border border-slate-100 rounded-[2rem] p-5 md:p-6 hover:shadow-lg hover:border-slate-200 transition-all relative overflow-hidden group bg-white">
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand"></div>
                                        <div className="flex flex-col md:flex-row justify-between gap-6">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">New Job</span>
                                                    <h6 className="font-bold text-slate-900 text-xl tracking-tight">{req.service_name}</h6>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <p className="text-slate-600 text-sm font-medium flex items-start gap-2">
                                                        <i className="fa-solid fa-location-dot text-slate-400 mt-1"></i> 
                                                        <span className="leading-relaxed max-w-sm">{req.address}</span>
                                                    </p>
                                                    <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                                                        <i className="fa-solid fa-user text-slate-400"></i> Customer: <span className="text-slate-700">{req.customer_name}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="md:text-right flex flex-row md:flex-col justify-between items-center md:items-end min-w-[120px] bg-slate-50 md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Est. Payout</p>
                                                <h4 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">₹{req.price || 0}</h4>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 mt-6 pt-5 border-t border-slate-100">
                                            <button onClick={() => handleAction(req.id, 'cancelled')} className="flex-1 py-3.5 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 hover:text-slate-700 transition-colors text-sm active:scale-95">
                                                Decline
                                            </button>
                                            <button onClick={() => handleAction(req.id, 'confirmed')} className="flex-[2] py-3.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-brand transition-all text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 flex justify-center items-center gap-2">
                                                <i className="fa-solid fa-check text-xs"></i> Accept Job
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* REVENUE CHART */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h5 className="font-bold text-slate-900 text-lg tracking-tight">Weekly Earnings</h5>
                            <p className="text-xs text-slate-400 font-medium mt-1">Income breakdown for the last 7 days</p>
                        </div>
                    </div>
                    
                    <div className="flex items-end justify-between h-56 gap-2 md:gap-4 relative">
                        {/* Horizontal Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                            <div className="w-full h-px bg-slate-300"></div>
                            <div className="w-full h-px bg-slate-300"></div>
                            <div className="w-full h-px bg-slate-300"></div>
                            <div className="w-full h-px bg-slate-300"></div>
                        </div>

                        {data.chartData.map((val, i) => {
                            const maxVal = Math.max(...data.chartData, 1); 
                            const heightPct = (val / maxVal) * 100;

                            return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-3 group cursor-pointer z-10">
                                <div className="relative w-full h-full flex items-end justify-center">
                                    <div 
                                        className="w-full max-w-[48px] bg-blue-50 rounded-xl group-hover:bg-brand transition-all duration-500 relative shadow-sm group-hover:shadow-brand/30" 
                                        style={{height: `${heightPct}%`, minHeight: '12px'}}
                                    >
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                                            ₹{val}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</span>
                            </div>
                        )})}
                    </div>
                </div>

            </div>

            {/* --- RIGHT COLUMN (Schedule & Reviews) --- */}
            <div className="xl:col-span-1 space-y-8">
                
                {/* UPCOMING SCHEDULE */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
                    <h5 className="font-bold text-slate-900 text-lg tracking-tight mb-6 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-sm">
                           <i className="fa-regular fa-calendar"></i> 
                        </div>
                        Your Schedule
                    </h5>
                    
                    <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
                        {getDays().map((d, i) => (
                            <div key={i} className={`flex-shrink-0 flex flex-col items-center justify-center w-14 h-16 md:w-16 md:h-20 rounded-2xl border transition-all cursor-pointer ${
                                d.active 
                                ? 'bg-slate-900 text-white border-slate-900 shadow-md transform -translate-y-1' 
                                : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                            }`}>
                                <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-0.5">{d.day}</span>
                                <span className="text-xl md:text-2xl font-black">{d.date}</span>
                            </div>
                        ))}
                    </div>

                    {data.upcoming.length === 0 ? (
                        <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                            <span className="block text-sm font-bold text-slate-400 mb-1">Clear Schedule</span>
                            <span className="text-xs text-slate-500 font-medium">You have no upcoming jobs.</span>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {data.upcoming.map(job => (
                                <div key={job.id} className="p-4 bg-white rounded-2xl flex items-center gap-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="text-center min-w-[55px] bg-slate-50 rounded-xl py-2 border border-slate-100 flex-shrink-0">
                                        <span className="block text-xs font-bold text-slate-400 uppercase mb-0.5 tracking-wider">{new Date(job.booking_date).toLocaleDateString('en-US', { month: 'short' })}</span>
                                        <span className="block text-lg font-black text-brand leading-none">{new Date(job.booking_date).toLocaleDateString('en-US', { day: '2-digit' })}</span>
                                    </div>
                                    <div className="flex-grow overflow-hidden">
                                        <h6 className="text-sm font-bold text-slate-900 truncate mb-0.5">{job.customer_name}</h6>
                                        <p className="text-xs text-slate-500 font-medium truncate">{job.service_name}</p>
                                    </div>
                                    <button 
                                        onClick={() => { setCurrentJobId(job.id); setShowBillModal(true); }} 
                                        className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:border-emerald-500 hover:text-white transition-all shadow-sm flex-shrink-0 active:scale-95"
                                        title="Complete Job & Bill"
                                    >
                                        <i className="fa-solid fa-check"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* RECENT REVIEWS */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
                    <h5 className="font-bold text-slate-900 text-lg tracking-tight mb-6 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center text-sm">
                           <i className="fa-regular fa-star"></i> 
                        </div>
                        Latest Reviews
                    </h5>
                    
                    {data.reviews.length === 0 ? (
                        <div className="text-center py-6">
                           <p className="text-sm text-slate-400 font-medium">No reviews yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {data.reviews.map(rev => (
                                <div key={rev.id} className="pb-5 border-b border-slate-50 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h6 className="font-bold text-slate-900 text-sm mb-1">{rev.customer_name}</h6>
                                            <div className="flex text-amber-400 text-[10px] gap-0.5">
                                                {[...Array(5)].map((_, i) => <i key={i} className={`fa-solid fa-star ${i < rev.rating ? 'text-amber-400' : 'text-slate-200'}`}></i>)}
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{new Date(rev.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 font-medium leading-relaxed">"{rev.comment}"</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
      </div>

      {/* ================= BILL MODAL (PREMIUM) ================= */}
      <Dialog isOpen={showBillModal} onClose={() => setShowBillModal(false)} title="Generate Final Invoice">
        <div className="p-6 md:p-8">
            
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 items-start mb-6">
                <i className="fa-solid fa-circle-info text-blue-500 mt-0.5"></i>
                <p className="text-blue-700 text-xs font-medium leading-relaxed">
                    By submitting this invoice, the job will be marked as "Payment Pending". The customer will be prompted to pay this exact amount via the app.
                </p>
            </div>

            <form onSubmit={submitBill} className="space-y-5">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Amount (₹)</label>
                    <div className="relative">
                        <i className="fa-solid fa-indian-rupee-sign absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        <input 
                            type="number" 
                            className="w-full pl-10 pr-5 py-4 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none text-slate-900 font-black text-lg bg-slate-50 transition-all"
                            placeholder="0.00"
                            value={billData.amount}
                            onChange={(e) => setBillData({...billData, amount: e.target.value})}
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Invoice Breakdown / Description</label>
                    <textarea 
                        className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none text-slate-900 font-medium bg-slate-50 transition-all resize-none"
                        rows="3"
                        placeholder="e.g. Visit Charge: 99, Parts replaced: 450, Labor: 300"
                        value={billData.description}
                        onChange={(e) => setBillData({...billData, description: e.target.value})}
                        required
                    ></textarea>
                </div>

                <div className="pt-4 flex gap-3">
                    <button 
                        type="button"
                        onClick={() => setShowBillModal(false)}
                        className="flex-1 py-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        disabled={isSubmittingBill}
                        className="flex-[2] bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-brand transition-all shadow-md active:scale-95 disabled:opacity-70 flex justify-center items-center gap-2"
                    >
                        {isSubmittingBill ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Sending...</> : <><i className="fa-solid fa-paper-plane text-xs"></i> Send Invoice</>}
                    </button>
                </div>
            </form>
        </div>
      </Dialog>

    </div>
  );
};

export default ProviderDashboard;