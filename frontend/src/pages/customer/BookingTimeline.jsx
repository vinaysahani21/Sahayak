import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../constants/api';
import { STATUS } from '../../constants/content';

const BookingTimeline = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper for Dates
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) + 
           ' at ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/user/get_booking_details.php?id=${id}`);
        const data = await res.json();
        setBooking(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const getStatusBadge = (status) => {
    switch (status) {
      case STATUS.PENDING: return <span className="bg-amber-50 text-amber-600 border border-amber-100 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">Pending</span>;
      case STATUS.CONFIRMED: return <span className="bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">Confirmed</span>;
      case STATUS.COMPLETED: return <span className="bg-green-50 text-green-600 border border-green-100 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">Completed</span>;
      case STATUS.CANCELLED: return <span className="bg-red-50 text-red-600 border border-red-100 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">Cancelled</span>;
      case STATUS.PAYMENT_PENDING: return <span className="bg-purple-50 text-purple-600 border border-purple-200 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider animate-pulse">Payment Due</span>;
      default: return <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  if (loading) {
      return (
          <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center pb-20">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-brand rounded-full animate-spin mb-4 shadow-sm"></div>
              <p className="text-slate-500 font-medium animate-pulse">Loading timeline...</p>
          </div>
      );
  }

  if (!booking) {
      return (
          <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center pb-20 px-4 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <i className="fa-solid fa-magnifying-glass-minus text-3xl text-slate-300"></i>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Booking Not Found</h3>
              <p className="text-slate-500 font-medium mt-2 mb-6">We couldn't locate the details for this service request.</p>
              <button onClick={() => navigate(-1)} className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold hover:bg-black transition-colors shadow-md">Go Back</button>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans selection:bg-brand selection:text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all hover:scale-105 active:scale-95 shadow-sm flex-shrink-0"
          >
              <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">Track Service</h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ID: #{booking.id}</p>
          </div>
        </div>

        {/* SERVICE SUMMARY CARD */}
        <div className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-slate-100 mb-8 transition-all hover:shadow-md">
          <div className="flex gap-4 items-center">
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl text-center min-w-[75px] shadow-inner">
                  <span className="block text-2xl font-black text-brand leading-none">{new Date(booking.booking_date).getDate()}</span>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{new Date(booking.booking_date).toLocaleString('default', { month: 'short' })}</span>
              </div>
              <div className="flex-grow">
                  <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-slate-900 text-lg leading-tight">{booking.service_name}</h4>
                      {getStatusBadge(booking.status)}
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mt-1">
                      <i className="fa-solid fa-user-tie text-[10px]"></i> 
                      {booking.provider_name}
                  </div>
              </div>
          </div>
        </div>

        {/* TIMELINE SECTION */}
        <div className="pl-2">
            <h6 className="font-bold text-slate-400 uppercase tracking-wider text-xs mb-6">Activity Timeline</h6>
            
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
                <div className="space-y-0">
                    
                    {/* 1. BOOKED (Always shows) */}
                    <TimelineItem 
                        icon="fa-file-signature" 
                        color="bg-brand text-white shadow-brand/30" 
                        title="Booking Request Sent" 
                        date={formatDate(booking.created_at)}
                        desc="Your service request was successfully placed."
                        isLast={booking.status === 'pending'}
                    />

                    {/* 2. CONFIRMED */}
                    {booking.status !== 'pending' && booking.status !== 'cancelled' && (
                        <TimelineItem 
                            icon="fa-user-check" 
                            color="bg-blue-500 text-white shadow-blue-500/30" 
                            title="Provider Assigned" 
                            date="Shortly after booking" 
                            desc={`${booking.provider_name} has accepted your request and will arrive at the scheduled time.`}
                            isLast={booking.status === 'confirmed'}
                        />
                    )}

                    {/* 3. PAYMENT PENDING (Bill Generated) */}
                    {(booking.status === 'payment_pending' || booking.status === 'completed') && (
                        <TimelineItem 
                            icon="fa-file-invoice-dollar" 
                            color={booking.status === 'completed' ? "bg-slate-400 text-white" : "bg-purple-500 text-white shadow-purple-500/30 animate-pulse"} 
                            title="Invoice Generated" 
                            date={formatDate(booking.completed_at || new Date())} // Approximated if not tracked separately
                            desc={
                                <div>
                                    <p className="mb-1">The provider has generated the final bill.</p>
                                    <span className="font-bold text-slate-900">Total Amount: ₹{parseFloat(booking.final_amount).toLocaleString()}</span>
                                </div>
                            }
                            isLast={booking.status === 'payment_pending'}
                        />
                    )}

                    {/* 4. COMPLETED */}
                    {booking.status === 'completed' && booking.completed_at && (
                        <TimelineItem 
                            icon="fa-circle-check" 
                            color="bg-green-500 text-white shadow-green-500/30" 
                            title={booking.rejection_reason ? "Job Closed (Rejected)" : "Service Completed & Paid"} 
                            date={formatDate(booking.completed_at)}
                            desc={booking.rejection_reason 
                                ? `You declined the bill. Reason: ${booking.rejection_reason}` 
                                : `Payment successful. Thank you for using Sahaayak!`}
                            isLast={true}
                        />
                    )}

                    {/* 5. CANCELLED */}
                    {booking.status === 'cancelled' && booking.cancelled_at && (
                        <TimelineItem 
                            icon="fa-circle-xmark" 
                            color="bg-red-500 text-white shadow-red-500/30" 
                            title="Booking Cancelled" 
                            date={formatDate(booking.cancelled_at)}
                            desc="This booking was cancelled and closed."
                            isLast={true}
                        />
                    )}

                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

// Sub-Component for Timeline Row
const TimelineItem = ({ icon, color, title, date, desc, isLast }) => (
    <div className="flex gap-4 md:gap-6 relative group">
        
        {/* Vertical Connecting Line */}
        {!isLast && (
            <div className="absolute left-[19px] top-[40px] bottom-[-20px] w-[2px] bg-slate-100 group-hover:bg-slate-200 transition-colors z-0"></div>
        )}
        
        {/* Icon Node */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 shadow-md ${color} ring-4 ring-white`}>
            <i className={`fa-solid ${icon} text-sm`}></i>
        </div>

        {/* Content Box */}
        <div className="pb-8 flex-grow">
            <h6 className="font-bold text-slate-900 text-lg leading-tight mb-1">{title}</h6>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{date}</p>
            <div className="text-sm text-slate-600 font-medium bg-slate-50 border border-slate-100 p-3 md:p-4 rounded-2xl leading-relaxed">
                {desc}
            </div>
        </div>
    </div>
);

export default BookingTimeline;