import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../../constants/api';
import { STATUS } from '../../constants/content';

const MyBookings = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null); // Track which bill is being paid

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

    // 1. Load Script
    const res = await loadRazorpayScript();
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      setProcessingId(null);
      return;
    }

    try {
      // 2. Create Order on Backend
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

      // 3. Open Razorpay Checkout Modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.data.amount, // Amount is in paise
        currency: 'INR',
        name: 'Sahaayak Services',
        description: `Payment for ${booking.service_name}`,
        image: 'https://ui-avatars.com/api/?name=S&background=0f172a&color=fff',
        order_id: orderData.data.order_id,
        handler: async function (response) {
          // 4. On Success, Verify & Approve Bill on Backend
          verifyAndApprovePayment(booking.booking_id, response);
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || '9999999999'
        },
        theme: { color: '#0f172a' } // Matches Slate-900
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
    if (!window.confirm("Cancel booking?")) return;
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
    const reason = prompt("Reason for declining this bill?");
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
  const getImg = (img, name) => (!img || img.includes('default')) ? `https://ui-avatars.com/api/?name=${name}&background=f1f5f9&color=64748b` : (img.startsWith('http') ? img : `${API_BASE_URL}${img}`);

  const getStatusBadge = (status) => {
    switch (status) {
      case STATUS.PENDING:
        return <span className="bg-amber-50 text-amber-600 border border-amber-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"><i className="fa-regular fa-clock"></i> Pending</span>;
      case STATUS.CONFIRMED:
        return <span className="bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"><i className="fa-solid fa-calendar-check"></i> Confirmed</span>;
      case STATUS.COMPLETED:
        return <span className="bg-green-50 text-green-600 border border-green-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"><i className="fa-solid fa-check-double"></i> Completed</span>;
      case STATUS.CANCELLED:
        return <span className="bg-red-50 text-red-600 border border-red-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"><i className="fa-solid fa-xmark"></i> Cancelled</span>;
      case STATUS.PAYMENT_PENDING:
        return <span className="bg-purple-50 text-purple-600 border border-purple-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm animate-pulse"><i className="fa-solid fa-file-invoice-dollar"></i> Bill Ready</span>;
      default:
        return <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  const activeList = bookings.filter(b => [STATUS.PENDING, STATUS.CONFIRMED, STATUS.PAYMENT_PENDING].includes(b.status));
  const historyList = bookings.filter(b => ['completed', 'cancelled'].includes(b.status));
  activeList.sort((a, b) => new Date(a.booking_date) - new Date(b.booking_date));
  historyList.sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date));
  const displayList = activeTab === 'active' ? activeList : historyList;

  return (
    <div className="font-sans">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* LOADING STATE */}
        {loading && (
          <div className="flex flex-col justify-center items-center py-24">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-brand rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">Loading your bookings...</p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && displayList.length === 0 && (
          <div className="text-center py-24 bg-white rounded-[2rem] border border-slate-100 shadow-sm animate-fade-in-up">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fa-regular fa-folder-open text-4xl text-slate-300"></i>
            </div>
            <h4 className="text-2xl font-bold text-slate-900 mb-2">No {activeTab} bookings</h4>
            <p className="text-slate-500 font-medium mb-8">You don't have any {activeTab} service requests at the moment.</p>
            {activeTab === 'active' && (
              <button onClick={() => navigate('/user/search')} className="bg-slate-900 text-white px-8 py-3.5 rounded-full font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95">
                Book a Service
              </button>
            )}
          </div>
        )}

        {/* BOOKING GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {displayList.map((item) => (
            <div
              key={item.booking_id}
              onClick={() => goToTimeline(item.booking_id)}
              className={`bg-white rounded-3xl p-5 md:p-6 shadow-sm border transition-all duration-300 cursor-pointer group flex flex-col h-full relative ${item.status === 'payment_pending' ? 'border-purple-200 shadow-purple-900/5 hover:shadow-purple-900/10' : 'border-slate-100 hover:shadow-xl hover:border-slate-200'
                }`}
            >

              {/* TOP ROW: Title & Status */}
              <div className="flex justify-between items-start mb-5">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Booking #{item.booking_id}</p>
                  <h5 className="font-bold text-slate-900 text-xl group-hover:text-brand transition-colors leading-tight pr-4">
                    {item.service_name}
                  </h5>
                </div>
                <div className="flex-shrink-0">
                  {getStatusBadge(item.status)}
                </div>
              </div>

              {/* MIDDLE ROW: Date & Provider Card */}
              <div className="bg-slate-50 rounded-2xl p-4 mb-5 flex flex-col sm:flex-row gap-4 border border-slate-100">
                <div className="flex items-center gap-3 sm:border-r border-slate-200 sm:pr-4">
                  <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-center shadow-sm min-w-[60px]">
                    <span className="block text-xl font-black text-brand leading-none">{new Date(item.booking_date).getDate()}</span>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase">{new Date(item.booking_date).toLocaleString('default', { month: 'short' })}</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Time</p>
                    <p className="text-sm font-bold text-slate-700">{item.time_slot.split(' - ')[0]}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-1">
                  <img src={getImg(item.profile_img, item.provider_name)} className="w-10 h-10 rounded-full bg-white border border-slate-200 object-cover" alt="Pro" />
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{item.provider_name}</p>
                    <p className="text-slate-500 text-xs font-medium"><i className="fa-solid fa-phone text-[10px] me-1"></i> {item.provider_phone || 'Provider'}</p>
                  </div>
                </div>
              </div>

              {/* BOTTOM ROW: Actions & Invoice */}
              <div className="mt-auto">
                {item.status === 'payment_pending' ? (

                  // INVOICE CARD
                  <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-2xl p-4 shadow-inner" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-purple-700 text-xs font-bold uppercase tracking-wider block mb-1">Final Invoice Generated</span>
                        <span className="text-xs text-slate-600 font-medium line-clamp-2 border-l-2 border-purple-300 pl-2">"{item.bill_description}"</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Amount Due</span>
                        <span className="font-black text-2xl text-purple-700 tracking-tight leading-none">₹{parseFloat(item.final_amount).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button
                        className="flex-1 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-red-600 text-sm font-bold py-3 rounded-xl transition-colors"
                        onClick={(e) => handleRejectBill(e, item.booking_id)}
                        disabled={processingId === item.booking_id}
                      >
                        Decline
                      </button>
                      <button
                        className="flex-[2] bg-slate-900 text-white hover:bg-brand text-sm font-bold py-3 rounded-xl shadow-md transition-all active:scale-95 flex justify-center items-center gap-2"
                        onClick={(e) => handlePayNow(e, item)}
                        disabled={processingId === item.booking_id}
                      >
                        {processingId === item.booking_id ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <><i className="fa-solid fa-lock text-[10px] opacity-70"></i> Pay Securely</>}
                      </button>
                    </div>
                  </div>

                ) : (

                  // NORMAL ACTIONS
                  <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                    <div className="text-left">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                        {item.status === 'completed' ? 'Final Paid' : 'Est. Base'}
                      </span>
                      <span className="font-bold text-lg text-slate-900">
                        ₹{item.final_amount > 0 ? parseFloat(item.final_amount).toLocaleString() : parseFloat(item.price_per_hour).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      {['pending', 'confirmed'].includes(item.status) && (
                        <a href={`tel:${item.provider_phone}`} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-brand transition-colors shadow-sm">
                          <i className="fa-solid fa-phone"></i>
                        </a>
                      )}
                      {item.status === 'pending' && (
                        <button className="bg-white border border-red-100 text-red-500 text-xs font-bold px-4 py-2 rounded-xl hover:bg-red-50 transition-colors shadow-sm" onClick={(e) => handleCancel(e, item.booking_id)}>
                          Cancel
                        </button>
                      )}
                      {item.status === 'completed' && (
                        <button className="bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold px-4 py-2 rounded-xl hover:bg-amber-100 transition-colors shadow-sm flex items-center gap-1.5">
                          <i className="fa-solid fa-star text-[10px]"></i> Rate Pros
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default MyBookings;