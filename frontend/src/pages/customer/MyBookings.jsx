import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../../constants/api';
import { STATUS } from '../../constants/content';

const MyBookings = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null); 

  const activeTab = searchParams.get('tab') || 'active';
  const user = JSON.parse(localStorage.getItem('user'));

  // --- FETCH DATA ---
  const fetchBookings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/get_my_bookings.php?customer_id=${user.id}`);
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) navigate('/login');
    else fetchBookings();
    // eslint-disable-next-line
  }, []);

  const goToTimeline = (id) => navigate(`/user/booking/${id}`);

  // --- DYNAMICALLY LOAD RAZORPAY SCRIPT ---
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // --- RAZORPAY PAYMENT FLOW ---
  const handlePayNow = async (e, booking) => {
    e.stopPropagation();
    setProcessingId(booking.booking_id);

    const res = await loadRazorpayScript();
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      setProcessingId(null);
      return;
    }

    try {
      const orderRes = await fetch(`${API_BASE_URL}/user/create_razorpay_order.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: booking.booking_id })
      });
      const orderData = await orderRes.json();

      if (orderData.status !== 'success') {
        alert(orderData.message || 'Failed to create order.');
        setProcessingId(null);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.data.amount, 
        currency: 'INR',
        name: 'Sahaayak Pro Services',
        description: `Invoice for ${booking.service_name}`,
        image: 'https://ui-avatars.com/api/?name=S&background=0f172a&color=fff',
        order_id: orderData.data.order_id,
        handler: async function (response) {
          verifyAndApprovePayment(booking.booking_id, response);
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || '9999999999'
        },
        theme: { color: '#0f172a' } 
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

      paymentObject.on('payment.failed', function (response) {
        alert("Payment Failed. Reason: " + response.error.description);
        setProcessingId(null);
      });

    } catch (err) {
      alert("Server error initiating payment.");
      setProcessingId(null);
    }
  };

  // --- VERIFY PAYMENT ---
  const verifyAndApprovePayment = async (bookingId, paymentResponse) => {
    try {
      const res = await fetch(`${API_BASE_URL}/user/approve_bill.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_signature: paymentResponse.razorpay_signature
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        alert("Payment Successful! Job Completed.");
        fetchBookings();
      } else {
        alert("Payment verification failed.");
      }
    } catch (err) {
      alert("Error approving bill.", err);
    } finally {
      setProcessingId(null);
    }
  };

  // --- OTHER ACTIONS ---
  const handleCancel = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await fetch(`${API_BASE_URL}/user/cancel_booking.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: id })
      });
      fetchBookings();
    } catch (err) { alert("Failed", err); }
  };

  const handleRejectBill = async (e, id) => {
    e.stopPropagation();
    const reason = prompt("Please provide a reason for declining this bill:");
    if (!reason) return;
    try {
      const res = await fetch(`${API_BASE_URL}/user/reject_bill.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: id, reason: reason })
      });
      const data = await res.json();
      if (data.status === 'success') fetchBookings();
    } catch (err) { alert("Error", err); }
  };

  // --- HELPERS ---
  const getImg = (img, name) => (!img || img.includes('default')) ? `https://ui-avatars.com/api/?name=${name}&background=f8fafc&color=475569` : (img.startsWith('http') ? img : `${API_BASE_URL}${img}`);

  const getStatusBadge = (status) => {
    switch (status) {
      case STATUS.PENDING:
        return <span className="bg-amber-50 text-amber-600 border border-amber-100 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit"><i className="fa-regular fa-clock"></i> Pending</span>;
      case STATUS.CONFIRMED:
        return <span className="bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit"><i className="fa-solid fa-calendar-check"></i> Confirmed</span>;
      case STATUS.COMPLETED:
        return <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit"><i className="fa-solid fa-check-double"></i> Completed</span>;
      case STATUS.CANCELLED:
        return <span className="bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit"><i className="fa-solid fa-xmark"></i> Cancelled</span>;
      case STATUS.PAYMENT_PENDING:
        return <span className="bg-purple-50 text-purple-600 border border-purple-200 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm animate-pulse w-fit"><i className="fa-solid fa-file-invoice-dollar"></i> Bill Ready</span>;
      default:
        return <span className="bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest w-fit">{status}</span>;
    }
  };

  const activeList = bookings.filter(b => [STATUS.PENDING, STATUS.CONFIRMED, STATUS.PAYMENT_PENDING].includes(b.status));
  const historyList = bookings.filter(b => ['completed', 'cancelled'].includes(b.status));
  activeList.sort((a, b) => new Date(a.booking_date) - new Date(b.booking_date));
  historyList.sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date));
  
  const displayList = activeTab === 'active' ? activeList : historyList;

  return (
    <div className="font-sans bg-[#F8FAFC] min-h-screen selection:bg-brand/20 selection:text-brand">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* LOADING STATE */}
        {loading && (
          <div className="flex flex-col justify-center items-center py-32">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-brand rounded-full animate-spin mb-6"></div>
            <p className="text-slate-500 font-bold tracking-tight">Syncing your bookings...</p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && displayList.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-200/60 shadow-sm animate-fade-in-up max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
              <i className="fa-regular fa-folder-open text-4xl text-slate-300"></i>
            </div>
            <h4 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">No {activeTab} bookings</h4>
            <p className="text-slate-500 font-medium mb-8">You don't have any {activeTab} service requests at the moment.</p>
            {activeTab === 'active' && (
              <button onClick={() => navigate('/user/search')} className="bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-brand transition-all shadow-lg active:scale-95">
                Book a Service
              </button>
            )}
          </div>
        )}

        {/* BOOKING LIST (Ticket Style) */}
        {!loading && displayList.length > 0 && (
          <div className="space-y-4 animate-fade-in-up">
            {displayList.map((item) => (
              <div
                key={item.booking_id}
                onClick={() => goToTimeline(item.booking_id)}
                className={`bg-white rounded-2xl md:rounded-[2rem] p-5 md:p-6 shadow-sm border transition-all duration-300 cursor-pointer group flex flex-col md:flex-row gap-5 relative overflow-hidden ${
                  item.status === 'payment_pending' 
                  ? 'border-purple-200/60 shadow-purple-900/5 hover:shadow-purple-900/10' 
                  : 'border-slate-200/60 hover:shadow-xl hover:border-brand/30'
                }`}
              >
                {/* Decorative Side Ribbon */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors ${
                    item.status === 'payment_pending' ? 'bg-purple-500' : 
                    item.status === 'completed' ? 'bg-emerald-500' : 
                    item.status === 'cancelled' ? 'bg-slate-300' : 'bg-brand'
                }`}></div>

                {/* LEFT: Date & Time Block */}
                <div className="flex md:flex-col items-center justify-between md:justify-center md:w-32 bg-slate-50 rounded-xl p-4 border border-slate-100 shrink-0">
                    <div className="text-center">
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                            {new Date(item.booking_date).toLocaleString('default', { month: 'short' })}
                        </span>
                        <span className="block text-3xl font-black text-slate-900 leading-none">
                            {new Date(item.booking_date).getDate()}
                        </span>
                    </div>
                    <div className="md:mt-4 text-right md:text-center pt-0 md:pt-4 md:border-t border-slate-200">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Time</p>
                        <p className="text-xs font-bold text-slate-700">{item.time_slot.split(' - ')[0]}</p>
                    </div>
                </div>

                {/* MIDDLE: Details Block */}
                <div className="flex-1 flex flex-col justify-center min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                ID: #{item.booking_id} <span className="w-1 h-1 bg-slate-300 rounded-full"></span> {item.category_name || 'Service'}
                            </p>
                            <h5 className="font-black text-slate-900 text-xl md:text-2xl group-hover:text-brand transition-colors leading-tight truncate">
                                {item.service_name}
                            </h5>
                        </div>
                        <div className="shrink-0 hidden md:block">
                            {getStatusBadge(item.status)}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                        <img src={getImg(item.profile_img, item.provider_name)} className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 object-cover" alt="Pro" />
                        <div className="truncate">
                            <p className="font-bold text-slate-700 text-sm truncate">{item.provider_name}</p>
                            {['pending', 'confirmed'].includes(item.status) && (
                                <p className="text-slate-500 text-[10px] font-bold tracking-wider uppercase mt-0.5 flex items-center gap-1.5">
                                    <i className="fa-solid fa-phone"></i> {item.provider_phone || 'Call Pro'}
                                </p>
                            )}
                        </div>
                    </div>
                    
                    <div className="md:hidden mt-4">
                         {getStatusBadge(item.status)}
                    </div>
                </div>

                {/* RIGHT: Actions / Invoice Block */}
                <div className="md:w-56 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-5 mt-2 md:mt-0 shrink-0">
                    
                    {item.status === 'payment_pending' ? (
                        // PAYMENT REQUIRED STATE
                        <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100/50" onClick={(e) => e.stopPropagation()}>
                            <div className="mb-4">
                                <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest block mb-0.5">Amount Due</span>
                                <span className="font-black text-3xl text-slate-900 tracking-tighter leading-none">
                                    ₹{parseFloat(item.final_amount).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-red-500 hover:border-red-200 rounded-xl transition-all"
                                    onClick={(e) => handleRejectBill(e, item.booking_id)}
                                    title="Decline Invoice"
                                    disabled={processingId === item.booking_id}
                                >
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                                <button
                                    className="flex-1 bg-slate-900 text-white hover:bg-brand text-xs font-bold py-2.5 rounded-xl shadow-md transition-all active:scale-95 flex justify-center items-center gap-2"
                                    onClick={(e) => handlePayNow(e, item)}
                                    disabled={processingId === item.booking_id}
                                >
                                    {processingId === item.booking_id ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Pay Now'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        // NORMAL ACTION STATE
                        <div className="flex flex-row md:flex-col justify-between items-center md:items-end h-full" onClick={(e) => e.stopPropagation()}>
                            <div className="text-left md:text-right">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">
                                    {item.status === 'completed' ? 'Total Paid' : 'Est. Base Rate'}
                                </span>
                                <span className="font-black text-2xl text-slate-900 tracking-tight">
                                    ₹{item.final_amount > 0 ? parseFloat(item.final_amount).toLocaleString() : parseFloat(item.price_per_hour).toLocaleString()}
                                </span>
                            </div>

                            <div className="flex gap-2 mt-4">
                                {['pending', 'confirmed'].includes(item.status) && (
                                    <a href={`tel:${item.provider_phone}`} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-brand transition-colors shadow-sm">
                                        <i className="fa-solid fa-phone"></i>
                                    </a>
                                )}
                                {item.status === 'pending' && (
                                    <button 
                                        className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 rounded-xl transition-colors shadow-sm" 
                                        onClick={(e) => handleCancel(e, item.booking_id)}
                                        title="Cancel Booking"
                                    >
                                        <i className="fa-solid fa-cancel"></i>
                                    </button>
                                )}
                                {item.status === 'completed' && (
                                    <button className="bg-amber-50 border border-amber-100 text-amber-600 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-amber-100 transition-colors shadow-sm flex items-center gap-1.5">
                                        <i className="fa-solid fa-star"></i> Rate
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default MyBookings;