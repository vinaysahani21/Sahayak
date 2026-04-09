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

  // --- HELPER: Image Formatter ---
  const getProImg = (img, name) => {
    if (!img || img.includes('default')) return `https://ui-avatars.com/api/?name=${name || 'Pro'}&background=0f172a&color=fff`;
    return img.startsWith('http') ? img : `${API_BASE_URL}${img}`;
  };

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

  // Pre-calculate max value for the chart to prevent recalculating in the map loop
  const maxChartVal = Math.max(...data.chartData, 100); // Default to 100 to give bars scale if all 0

  if (loading) {
      return (
          <div className="flex flex-col h-screen items-center justify-center bg-[#F8FAFC]">
              <div className="w-14 h-14 border-4 border-slate-200 border-t-brand rounded-full animate-spin mb-6 shadow-sm"></div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Preparing Workspace...</h3>
              <p className="text-slate-500 font-medium">Syncing your latest jobs and earnings.</p>
          </div>
      );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans text-slate-800 pb-24 selection:bg-brand/20 selection:text-brand">
      
      {/* ================= 1. PREMIUM HEADER ================= */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-4 md:px-8 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 transition-all shadow-sm">
        <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard</h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Provider Control Center</p>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-4 md:gap-6 self-start sm:self-auto w-full sm:w-auto justify-between sm:justify-end">
          <button 
            onClick={() => setIsOnline(!isOnline)}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95 ${
                isOnline 
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300' 
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-300'}`}></span>
            {isOnline ? 'Accepting Jobs' : 'Offline'}
          </button>

          <div className="flex items-center gap-3 pl-4 md:pl-6 border-l border-slate-200">
             <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 leading-tight">{user.name}</p>
                <p className="text-[10px] font-black text-brand uppercase tracking-widest mt-0.5">Professional</p>
             </div>
             <img 
                src={getProImg(user.profile_img, user.name)} 
                alt="Profile" 
                className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-sm"
             />
          </div>
        </div>
      </header>

      <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fade-in-up">
        
        {/* ================= 2. QUICK STATS ROW ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200/60 flex items-center justify-between group hover:shadow-xl hover:border-brand/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer" onClick={() => navigate('/provider/earnings')}>
                <div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Total Revenue</p>
                    <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter group-hover:text-brand transition-colors">₹{parseFloat(data.stats.total_earnings || 0).toLocaleString()}</h3>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-brand group-hover:text-white transition-all duration-500 shadow-inner">
                    <i className="fa-solid fa-wallet"></i>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200/60 flex items-center justify-between group hover:shadow-xl hover:border-purple-300 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Jobs Completed</p>
                    <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">{data.stats.total_jobs || 0}</h3>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all duration-500 shadow-inner">
                    <i className="fa-solid fa-clipboard-check"></i>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200/60 flex items-center justify-between group hover:shadow-xl hover:border-amber-300 hover:-translate-y-1 transition-all duration-300 sm:col-span-2 lg:col-span-1 cursor-pointer">
                <div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Avg Rating</p>
                    <div className="flex items-center gap-3">
                        <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">{parseFloat(data.stats.rating || 0).toFixed(1)}</h3>
                        <div className="flex text-amber-400 text-sm">
                            <i className="fa-solid fa-star"></i>
                        </div>
                    </div>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-500 shadow-inner">
                    <i className="fa-solid fa-award"></i>
                </div>
            </div>
        </div>

        {/* ================= 3. MAIN CONTENT GRID ================= */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* --- LEFT COLUMN (Requests & Chart) --- */}
            <div className="xl:col-span-2 space-y-8">
                
                {/* ACTIVE REQUESTS */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200/60 overflow-hidden">
                    <div className="px-6 md:px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h5 className="font-black text-slate-900 text-xl tracking-tight flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center text-lg shadow-inner">
                               <i className="fa-solid fa-bell"></i> 
                            </div>
                            Action Required
                        </h5>
                        {data.requests.length > 0 && <span className="bg-red-50 border border-red-100 text-red-500 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg animate-pulse shadow-sm">{data.requests.length} Pending</span>}
                    </div>

                    <div className="p-6 md:p-8 bg-slate-50/30">
                        {data.requests.length === 0 ? (
                            <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-[2rem]">
                                <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 text-4xl shadow-inner">
                                    <i className="fa-solid fa-mug-hot"></i>
                                </div>
                                <h6 className="text-xl font-black text-slate-900 mb-2 tracking-tight">You're all caught up!</h6>
                                <p className="text-slate-500 text-sm font-medium">Keep your status "Accepting Jobs" to receive new requests.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {data.requests.map(req => (
                                    <div key={req.id} className="bg-white border border-slate-200/60 rounded-[2rem] p-6 hover:shadow-xl hover:border-brand/30 transition-all relative overflow-hidden group">
                                        
                                        <div className="absolute left-0 top-0 bottom-0 w-2 bg-brand"></div>
                                        
                                        <div className="flex flex-col md:flex-row justify-between gap-6 pl-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest shadow-sm">New Request</span>
                                                    <h6 className="font-black text-slate-900 text-xl md:text-2xl tracking-tight truncate group-hover:text-brand transition-colors">{req.service_name}</h6>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-slate-600 text-sm font-medium flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                        <i className="fa-solid fa-location-dot text-slate-400 mt-1 shrink-0"></i> 
                                                        <span className="leading-relaxed">{req.address}</span>
                                                    </p>
                                                    <p className="text-sm text-slate-600 font-bold flex items-center gap-3 px-1">
                                                        <i className="fa-solid fa-user text-slate-400"></i> {req.customer_name}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="md:text-right flex flex-row md:flex-col justify-between items-center md:items-end min-w-[140px] bg-slate-50 md:bg-transparent p-5 md:p-0 rounded-2xl md:rounded-none shrink-0 border md:border-0 border-slate-100">
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Est. Payout</p>
                                                <h4 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">₹{req.price || 0}</h4>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-slate-100 pl-2">
                                            <button onClick={() => handleAction(req.id, 'cancelled')} className="flex-1 py-4 rounded-xl font-bold text-slate-500 bg-slate-50 border border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors text-sm active:scale-95 shadow-sm">
                                                Decline
                                            </button>
                                            <button onClick={() => handleAction(req.id, 'confirmed')} className="flex-[2] py-4 rounded-xl font-bold text-white bg-slate-900 hover:bg-brand transition-all text-sm shadow-md hover:shadow-brand/30 active:scale-95 flex justify-center items-center gap-2">
                                                <i className="fa-solid fa-check"></i> Accept Job
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* REVENUE CHART */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200/60 p-6 md:p-8">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h5 className="font-black text-slate-900 text-xl tracking-tight">Weekly Earnings</h5>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Last 7 Days Performance</p>
                        </div>
                    </div>
                    
                    <div className="flex items-end justify-between h-64 gap-2 md:gap-4 relative pt-10">
                        {/* Horizontal Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-50 z-0">
                            <div className="w-full h-px bg-slate-200"></div>
                            <div className="w-full h-px bg-slate-200"></div>
                            <div className="w-full h-px bg-slate-200"></div>
                            <div className="w-full h-px bg-slate-200"></div>
                        </div>

                        {data.chartData.map((val, i) => {
                            const heightPct = (val / maxChartVal) * 100;

                            return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-4 group cursor-pointer z-10 h-full justify-end">
                                <div className="relative w-full flex items-end justify-center h-[90%]">
                                    <div 
                                        className="w-full max-w-[56px] bg-slate-100 group-hover:bg-brand rounded-t-xl transition-all duration-500 relative group-hover:shadow-lg group-hover:shadow-brand/30" 
                                        style={{height: `${heightPct}%`, minHeight: '8px'}}
                                    >
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg pointer-events-none">
                                            ₹{val}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</span>
                            </div>
                        )})}
                    </div>
                </div>

            </div>

            {/* --- RIGHT COLUMN (Schedule & Reviews) --- */}
            <div className="xl:col-span-1 space-y-8">
                
                {/* UPCOMING SCHEDULE */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200/60 p-6 md:p-8">
                    <h5 className="font-black text-slate-900 text-xl tracking-tight mb-8 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center text-lg shadow-inner">
                           <i className="fa-regular fa-calendar-check"></i> 
                        </div>
                        Your Schedule
                    </h5>
                    
                    <div className="flex gap-3 overflow-x-auto pb-6 mb-2 scrollbar-hide">
                        {getDays().map((d, i) => (
                            <div key={i} className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 md:w-[72px] md:h-24 rounded-2xl border transition-all cursor-pointer shadow-sm ${
                                d.active 
                                ? 'bg-slate-900 text-white border-slate-900 shadow-slate-900/20 transform -translate-y-2' 
                                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}>
                                <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${d.active ? 'text-slate-400' : 'text-slate-400'}`}>{d.day}</span>
                                <span className="text-2xl md:text-3xl font-black tracking-tighter">{d.date}</span>
                            </div>
                        ))}
                    </div>

                    {data.upcoming.length === 0 ? (
                        <div className="p-8 bg-slate-50 border border-dashed border-slate-200 rounded-[1.5rem] text-center">
                            <span className="block text-sm font-bold text-slate-500 mb-1">Schedule Clear</span>
                            <span className="text-xs text-slate-400 font-medium">You have no active appointments.</span>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {data.upcoming.map(job => (
                                <div key={job.id} className="p-4 bg-white rounded-2xl flex items-center gap-4 border border-slate-200/60 shadow-sm hover:shadow-md hover:border-brand/30 transition-all group">
                                    <div className="text-center min-w-[64px] bg-slate-50 rounded-xl py-2 border border-slate-100 flex-shrink-0 shadow-inner group-hover:bg-brand group-hover:text-white transition-colors">
                                        <span className="block text-[10px] font-black text-slate-400 group-hover:text-white/70 uppercase mb-0.5 tracking-widest">{new Date(job.booking_date).toLocaleDateString('en-US', { month: 'short' })}</span>
                                        <span className="block text-xl font-black text-slate-900 group-hover:text-white leading-none">{new Date(job.booking_date).toLocaleDateString('en-US', { day: '2-digit' })}</span>
                                    </div>
                                    <div className="flex-grow overflow-hidden">
                                        <h6 className="text-sm font-bold text-slate-900 truncate mb-1">{job.customer_name}</h6>
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest truncate">{job.service_name}</p>
                                    </div>
                                    <button 
                                        onClick={() => { setCurrentJobId(job.id); setShowBillModal(true); }} 
                                        className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-brand hover:border-brand hover:text-white hover:shadow-md transition-all flex-shrink-0 active:scale-95"
                                        title="Complete Job & Generate Bill"
                                    >
                                        <i className="fa-solid fa-check"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* RECENT REVIEWS */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200/60 p-6 md:p-8">
                    <h5 className="font-black text-slate-900 text-xl tracking-tight mb-8 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center text-lg shadow-inner">
                           <i className="fa-regular fa-star"></i> 
                        </div>
                        Latest Feedback
                    </h5>
                    
                    {data.reviews.length === 0 ? (
                        <div className="text-center py-10 bg-slate-50 rounded-[1.5rem] border border-dashed border-slate-200">
                           <p className="text-sm text-slate-400 font-medium">No reviews received yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {data.reviews.map(rev => (
                                <div key={rev.id} className="pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h6 className="font-bold text-slate-900 text-sm mb-1">{rev.customer_name}</h6>
                                            <div className="flex text-amber-400 text-[10px] gap-0.5">
                                                {[...Array(5)].map((_, i) => <i key={i} className={`fa-solid fa-star ${i < rev.rating ? 'text-amber-400' : 'text-slate-200'}`}></i>)}
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md">{new Date(rev.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 font-medium leading-relaxed italic bg-slate-50 p-4 rounded-xl border border-slate-100">"{rev.comment}"</p>
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
            
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex gap-4 items-start mb-8 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-500 shrink-0 shadow-sm mt-0.5">
                    <i className="fa-solid fa-file-invoice-dollar"></i>
                </div>
                <p className="text-blue-800 text-sm font-medium leading-relaxed">
                    By submitting this invoice, the job will be marked as <span className="font-bold">"Payment Pending"</span>. The customer will be prompted to securely pay this exact amount via Razorpay.
                </p>
            </div>

            <form onSubmit={submitBill} className="space-y-6">
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Final Amount (₹)</label>
                    <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black">₹</span>
                        <input 
                            type="number" 
                            className="w-full pl-10 pr-5 py-4 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none text-slate-900 font-black text-xl bg-slate-50 hover:bg-white transition-all shadow-inner"
                            placeholder="0.00"
                            value={billData.amount}
                            onChange={(e) => setBillData({...billData, amount: e.target.value})}
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Invoice Breakdown / Description</label>
                    <textarea 
                        className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none text-slate-900 font-medium bg-slate-50 hover:bg-white transition-all resize-none shadow-inner"
                        rows="4"
                        placeholder="e.g. Visit Charge: ₹99, Parts replaced (Compressor): ₹450, Labor: ₹300"
                        value={billData.description}
                        onChange={(e) => setBillData({...billData, description: e.target.value})}
                        required
                    ></textarea>
                </div>

                <div className="pt-4 flex gap-4">
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
                        className="flex-[2] bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-brand transition-all shadow-lg active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        {isSubmittingBill ? <><i className="fa-solid fa-circle-notch fa-spin text-lg"></i> Processing...</> : <><i className="fa-solid fa-paper-plane text-sm"></i> Send Invoice</>}
                    </button>
                </div>
            </form>
        </div>
      </Dialog>

    </div>
  );
};

export default ProviderDashboard;