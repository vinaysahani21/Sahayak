import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../constants/api';
import Dialog from '../../components/ui/Dialog'; 

const ProviderSchedule = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  // --- STATE ---
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); 
  
  const getLocalDateString = (d) => {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const [selectedDate, setSelectedDate] = useState(getLocalDateString(new Date()));

  // Bill Modal State
  const [showBillModal, setShowBillModal] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [billData, setBillData] = useState({ amount: '', description: '' });
  const [isSubmittingBill, setIsSubmittingBill] = useState(false);

  // --- FETCH SCHEDULE ---
  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const url = `${API_BASE_URL}/provider/get_schedule.php?provider_id=${user.id}&tab=${activeTab}&date=${selectedDate}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.status === 'success') {
          setJobs(data.data || []);
      } else {
          setJobs([]);
      }
    } catch (err) { 
        console.error("Error fetching schedule:", err); 
        setJobs([]);
    } finally { 
        setLoading(false); 
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [activeTab, selectedDate]);

  // --- ACTIONS ---
  const handleCompleteClick = (id) => {
    setCurrentJobId(id);
    setShowBillModal(true); 
  };

  const submitBill = async (e) => {
    e.preventDefault();
    if(!billData.amount || !billData.description) return alert("Please fill all details");
    
    setIsSubmittingBill(true);
    try {
      const res = await fetch(`${API_BASE_URL}/provider/generate_bill.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: currentJobId, provider_id: user.id, ...billData })
      });
      const result = await res.json();
      if(result.status === 'success') {
        setShowBillModal(false);
        setBillData({ amount: '', description: '' }); 
        fetchSchedule(); 
      } else {
          alert(result.message || "Failed to generate bill");
      }
    } catch (err) { alert("Error sending bill"); }
    finally { setIsSubmittingBill(false); }
  };

  const getCalendarDays = () => {
    const days = [];
    for(let i=0; i<7; i++) { 
        const d = new Date();
        d.setDate(d.getDate() + i);
        const dateStr = getLocalDateString(d);
        days.push({
            dateStr: dateStr,
            dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
            dayNum: d.getDate(),
            isActive: dateStr === selectedDate
        });
    }
    return days;
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans text-slate-800 pb-24 selection:bg-brand/20 selection:text-brand">
      
      {/* 1. PREMIUM HEADER & TABS */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm transition-all">
          <div className="px-6 md:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">My Schedule</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">Manage your appointments and history</p>
            </div>
            
            <div className="bg-slate-100/80 p-1.5 rounded-2xl flex self-start sm:self-auto border border-slate-200/60 shadow-inner backdrop-blur-sm">
                <button 
                    className={`px-6 md:px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'upcoming' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
                    onClick={() => setActiveTab('upcoming')}
                >
                    Upcoming
                </button>
                <button 
                    className={`px-6 md:px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'history' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
                    onClick={() => setActiveTab('history')}
                >
                    History
                </button>
            </div>
          </div>

          {/* 2. CALENDAR STRIP */}
          {activeTab === 'upcoming' && (
            <div className="px-6 md:px-8 py-5 bg-slate-50/50 border-t border-slate-100">
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {getCalendarDays().map((day) => (
                        <button 
                            key={day.dateStr} 
                            onClick={() => setSelectedDate(day.dateStr)}
                            className={`flex-shrink-0 flex flex-col items-center justify-center min-w-[72px] h-[88px] rounded-2xl border transition-all duration-300 active:scale-95 ${
                                day.isActive 
                                ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20 transform -translate-y-1' 
                                : 'bg-white text-slate-500 border-slate-200/60 hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-0.5'
                            }`}
                        >
                            <span className={`text-[10px] font-black uppercase tracking-widest mb-1 transition-colors ${day.isActive ? 'text-slate-400' : 'text-slate-400'}`}>{day.dayName}</span>
                            <span className="text-2xl font-black leading-none">{day.dayNum}</span>
                        </button>
                    ))}
                </div>
            </div>
          )}
      </div>

      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        
        {/* 3. JOB LIST */}
        {loading ? (
            <div className="flex flex-col justify-center items-center py-32">
                <div className="w-14 h-14 border-4 border-slate-200 border-t-brand rounded-full animate-spin mb-6 shadow-sm"></div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Syncing Schedule...</h3>
                <p className="text-slate-500 font-medium">Loading your appointments.</p>
            </div>
        ) : jobs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm animate-fade-in-up">
                <div className="w-24 h-24 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-center mx-auto mb-6 text-slate-300 text-4xl shadow-inner">
                    <i className="fa-regular fa-calendar-xmark"></i>
                </div>
                <h4 className="text-slate-900 font-black text-2xl tracking-tight mb-2">No jobs found</h4>
                <p className="text-slate-500 font-medium">
                    {activeTab === 'upcoming' ? "You have a clear schedule on this date. Take a break!" : "No past jobs recorded in your history yet."}
                </p>
            </div>
        ) : (
            <div className="space-y-6 animate-fade-in-up">
                {jobs.map((job) => (
                    <div key={job.id} className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-brand/30 transition-all duration-300 group relative overflow-hidden">
                        
                        {/* Decorative Left Line */}
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-100 group-hover:bg-brand transition-colors duration-300"></div>

                        {/* Top Row: Time & Status */}
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6 pl-2">
                            <div className="flex items-center md:items-start gap-4">
                                <div className="bg-blue-50 text-blue-600 font-black px-4 py-3 rounded-xl text-sm border border-blue-100/50 text-center min-w-[120px] shadow-sm tracking-tight">
                                    {job.time_slot.split(' - ')[0]}
                                </div>
                                <div className="pt-0.5">
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-2">
                                        ID: #{job.id} <span className="w-1 h-1 rounded-full bg-slate-300"></span> {job.service_name}
                                    </p>
                                    <h6 className="font-black text-slate-900 text-xl md:text-2xl tracking-tight group-hover:text-brand transition-colors leading-tight">{job.customer_name}</h6>
                                </div>
                            </div>
                            
                            <div className="self-start">
                                {activeTab === 'history' ? (
                                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm ${job.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' : 'bg-rose-50 text-rose-600 border border-rose-100/50'}`}>
                                        <i className={`fa-solid ${job.status === 'completed' ? 'fa-check-double' : 'fa-xmark'}`}></i> {job.status}
                                    </span>
                                ) : (
                                    <span className="bg-amber-50 text-amber-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-100/50 flex items-center gap-1.5 shadow-sm">
                                        <i className="fa-solid fa-clock"></i> Confirmed
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Middle Row: Location */}
                        <div className="bg-slate-50 p-5 rounded-2xl mb-6 border border-slate-100 ml-2">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 border border-slate-200 shadow-sm flex-shrink-0 mt-0.5">
                                    <i className="fa-solid fa-location-dot"></i>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Service Address</p>
                                    <span className="block font-medium text-slate-700 text-sm leading-relaxed">
                                        {job.address}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Row: Actions */}
                        <div className="flex flex-wrap md:flex-nowrap gap-3 pl-2">
                            <a href={`tel:${job.phone}`} className="flex-1 md:flex-none md:w-32 py-3.5 rounded-xl font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-brand hover:border-brand/30 transition-all text-center shadow-sm active:scale-95 flex items-center justify-center gap-2 text-sm">
                                <i className="fa-solid fa-phone text-xs"></i> Call
                            </a>
                            {/* BUG FIXED: Proper Google Maps URL Injection */}
                            <a 
                                href={`https://maps.google.com/?q=${encodeURIComponent(job.address)}`} 
                                target="_blank" rel="noreferrer"
                                className="flex-1 md:flex-none md:w-32 py-3.5 rounded-xl font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-brand hover:border-brand/30 transition-all text-center shadow-sm active:scale-95 flex items-center justify-center gap-2 text-sm"
                            >
                                <i className="fa-solid fa-map-location-dot text-xs"></i> Map
                            </a>
                            
                            {activeTab === 'upcoming' && (
                                <button 
                                    className="w-full md:flex-1 py-3.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-brand transition-all shadow-md hover:shadow-brand/30 active:scale-95 flex items-center justify-center gap-2 text-sm mt-2 md:mt-0"
                                    onClick={() => handleCompleteClick(job.id)}
                                >
                                    <i className="fa-solid fa-check-double text-xs"></i> Complete & Generate Bill
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* --- BILL MODAL (Premium SaaS Match) --- */}
      <Dialog isOpen={showBillModal} onClose={() => setShowBillModal(false)} title="Generate Final Invoice">
        <div className="p-6 md:p-8">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex gap-4 items-start mb-8 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-500 shrink-0 shadow-sm mt-0.5">
                    <i className="fa-solid fa-file-invoice-dollar"></i>
                </div>
                <p className="text-blue-800 text-sm font-medium leading-relaxed">
                    By submitting this invoice, the job will be marked as <span className="font-bold">"Payment Pending"</span>. The customer will be prompted to securely pay this exact amount.
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

export default ProviderSchedule;