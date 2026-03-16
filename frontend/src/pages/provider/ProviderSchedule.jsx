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
    <div className="bg-[#F8FAFC] min-h-screen font-sans text-slate-800 pb-24 selection:bg-brand selection:text-white">
      
      {/* 1. PREMIUM HEADER & TABS */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm transition-all">
          <div className="px-6 md:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">My Schedule</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">Manage your appointments and history</p>
            </div>
            
            <div className="bg-slate-100 p-1.5 rounded-xl flex self-start sm:self-auto border border-slate-200/50 shadow-inner">
                <button 
                    className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'upcoming' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    onClick={() => setActiveTab('upcoming')}
                >
                    Upcoming
                </button>
                <button 
                    className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    onClick={() => setActiveTab('history')}
                >
                    History
                </button>
            </div>
          </div>

          {/* 2. CALENDAR STRIP */}
          {activeTab === 'upcoming' && (
            <div className="px-6 md:px-8 py-4 bg-slate-50/50 border-t border-slate-100">
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {getCalendarDays().map((day) => (
                        <button 
                            key={day.dateStr} 
                            onClick={() => setSelectedDate(day.dateStr)}
                            className={`flex-shrink-0 flex flex-col items-center justify-center min-w-[70px] h-[85px] rounded-2xl border transition-all active:scale-95 ${
                                day.isActive 
                                ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20 transform -translate-y-1' 
                                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                            <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${day.isActive ? 'text-slate-300' : 'text-slate-400'}`}>{day.dayName}</span>
                            <span className="text-2xl font-black leading-none">{day.dayNum}</span>
                        </button>
                    ))}
                </div>
            </div>
          )}
      </div>

      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        
        {/* 3. JOB LIST */}
        {loading ? (
            <div className="flex flex-col justify-center items-center py-24">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-brand rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium">Loading schedule...</p>
            </div>
        ) : jobs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 text-3xl">
                    <i className="fa-regular fa-calendar-xmark"></i>
                </div>
                <h4 className="text-slate-900 font-bold text-xl tracking-tight mb-2">No jobs found</h4>
                <p className="text-slate-500 font-medium">
                    {activeTab === 'upcoming' ? "You have a clear schedule on this date." : "No past jobs recorded yet."}
                </p>
            </div>
        ) : (
            <div className="space-y-6">
                {jobs.map((job) => (
                    <div key={job.id} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 group">
                        
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-blue-50 text-blue-700 font-bold px-4 py-2.5 rounded-xl text-sm border border-blue-100 text-center min-w-[100px] shadow-sm">
                                    {job.time_slot.split(' - ')[0]}
                                </div>
                                <div className="pt-0.5">
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Booking #{job.id}</p>
                                    <h6 className="font-bold text-slate-900 text-xl tracking-tight group-hover:text-brand transition-colors">{job.service_name}</h6>
                                </div>
                            </div>
                            
                            <div className="self-start">
                                {activeTab === 'history' ? (
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${job.status === 'completed' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                        <i className={`fa-solid ${job.status === 'completed' ? 'fa-check-double' : 'fa-xmark'}`}></i> {job.status}
                                    </span>
                                ) : (
                                    <span className="bg-amber-50 text-amber-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-100 flex items-center gap-1.5 shadow-sm">
                                        <i className="fa-solid fa-clock"></i> Confirmed
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="bg-slate-50 p-5 rounded-2xl mb-6 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-400 border border-slate-200 shadow-sm flex-shrink-0">
                                    <i className="fa-solid fa-user"></i>
                                </div>
                                <div>
                                    <span className="block font-bold text-slate-900 text-lg mb-0.5">{job.customer_name}</span>
                                    <span className="flex items-start gap-1.5 text-slate-500 text-sm font-medium">
                                        <i className="fa-solid fa-location-dot mt-1 text-slate-400"></i> {job.address}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <a href={`tel:${job.phone}`} className="flex-1 min-w-[120px] py-3.5 rounded-xl font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-brand transition-colors text-center shadow-sm active:scale-95 flex items-center justify-center gap-2">
                                <i className="fa-solid fa-phone"></i> Call
                            </a>
                            <a 
                                href={`https://maps.google.com/?q=${encodeURIComponent(job.address)}`} 
                                target="_blank" rel="noreferrer"
                                className="flex-1 min-w-[120px] py-3.5 rounded-xl font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-brand transition-colors text-center shadow-sm active:scale-95 flex items-center justify-center gap-2"
                            >
                                <i className="fa-solid fa-map-location-dot"></i> Map
                            </a>
                            
                            {activeTab === 'upcoming' && (
                                <button 
                                    className="flex-[2] min-w-[200px] py-3.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-brand transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                                    onClick={() => handleCompleteClick(job.id)}
                                >
                                    <i className="fa-solid fa-check-double text-sm"></i> Complete & Bill
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* --- BILL MODAL (Matches Dashboard) --- */}
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

export default ProviderSchedule;