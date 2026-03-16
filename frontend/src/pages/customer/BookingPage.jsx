import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../constants/api';

const BookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  // Get Service Data passed from Search/Provider Page
  const { service } = location.state || {};

  // --- STATE ---
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null); 
  const [loadingAddr, setLoadingAddr] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Date & Time State
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  // Get today's date for the date picker minimum
  const today = new Date().toISOString().split("T")[0];

  // --- 1. FETCH SAVED ADDRESSES ---
  useEffect(() => {
    if (!user) {
        navigate('/login');
        return;
    }
    const fetchAddresses = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/user/address/get_all.php?id=${user.id}`);
        const data = await res.json();
        setAddresses(data);
        // Auto-select the first address if available
        if (data.length > 0) setSelectedAddress(data[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAddr(false);
      }
    };
    fetchAddresses();
  }, [user, navigate]);

  // --- 2. BOOKING HANDLER ---
  const handleConfirm = async () => {
    if (!date || !time) return alert("Please select a valid Date & Time.");
    if (!selectedAddress) return alert("Please select a Service Address.");

    setIsSubmitting(true);

    const payload = {
        customer_id: user.id,
        provider_id: service.provider_id,
        service_id: service.id, 
        booking_date: date,
        time_slot: time,
        address: selectedAddress.address, 
        visit_charge: 99.00 
    };

    try {
        const res = await fetch(`${API_BASE_URL}/user/book_service.php`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        
        if (data.status === 'success') {
            navigate('/user/my-bookings');
        } else {
            alert(data.message || "Booking Failed");
            setIsSubmitting(false);
        }
    } catch (err) {
        alert("Server Error while processing your booking.");
        setIsSubmitting(false);
    }
  };

  // Image Helper
  const getProImg = (img, name) => (!img || img === 'default_provider.png') ? `https://ui-avatars.com/api/?name=${name}&background=0f172a&color=fff&size=200` : (img.startsWith('http') ? img : `${API_BASE_URL}${img}`);

  if (!service) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC] text-center px-4">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
            <i className="fa-regular fa-calendar-xmark text-4xl text-slate-300"></i>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Service not found</h3>
        <p className="text-slate-500 font-medium mt-2 mb-8">Please select a service from the search page to continue.</p>
        <button onClick={() => navigate('/user/search')} className="bg-slate-900 text-white px-8 py-3.5 rounded-full font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
            Search Services
        </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans selection:bg-brand selection:text-white">
      
      {/* --- PREMIUM HEADER (Frosted Glass) --- */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm transition-all mb-20">
        
      </div>

      {/* --- BODY --- */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT SIDE: DETAILS & FORM (Span 8) */}
            <div className="lg:col-span-8 space-y-6">
                
                {/* 1. Service Summary */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 md:p-6 transition-all hover:shadow-md">
                    <div className="flex gap-5 items-center">
                        <img 
                            src={getProImg(service.provider_img, service.provider_name)} 
                            alt={service.provider_name}
                            className="w-20 h-20 rounded-2xl object-cover border border-slate-100 shadow-sm flex-shrink-0"
                        />
                        <div className="flex-grow">
                            <h5 className="font-bold text-slate-900 text-xl tracking-tight mb-1">{service.service_name}</h5>
                            <div className="flex items-center gap-2 mb-3">
                                <i className="fa-solid fa-user-tie text-slate-400 text-xs"></i>
                                <p className="text-slate-600 text-sm font-medium">{service.provider_name}</p>
                            </div>
                            <span className="inline-block bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200">
                                Base Rate: ₹{parseFloat(service.price_per_hour).toLocaleString()}/hr
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. DATE & TIME */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
                    <h6 className="font-bold text-slate-900 text-lg mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                            <i className="fa-regular fa-calendar"></i>
                        </div>
                        When do you need it?
                    </h6>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Date</label>
                            <input 
                                type="date" 
                                min={today}
                                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none text-slate-900 font-medium bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                                onChange={(e) => setDate(e.target.value)} 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Preferred Slot</label>
                            <div className="relative">
                                <select 
                                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none text-slate-900 font-medium bg-slate-50 hover:bg-slate-100 transition-colors appearance-none cursor-pointer"
                                    onChange={(e) => setTime(e.target.value)}
                                >
                                    <option value="">Choose a time...</option>
                                    <option>09:00 AM - 11:00 AM</option>
                                    <option>11:00 AM - 01:00 PM</option>
                                    <option>02:00 PM - 04:00 PM</option>
                                    <option>04:00 PM - 06:00 PM</option>
                                </select>
                                <i className="fa-solid fa-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. ADDRESS SELECTION */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                        <h6 className="font-bold text-slate-900 text-lg flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center">
                                <i className="fa-solid fa-map-location-dot"></i>
                            </div>
                            Service Location
                        </h6>
                        <button 
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold px-4 py-2 rounded-xl transition-colors self-start sm:self-auto flex items-center gap-2"
                            onClick={() => navigate('/user/saved-addresses')}
                        >
                            <i className="fa-solid fa-plus"></i> Add New
                        </button>
                    </div>

                    {loadingAddr ? (
                        <div className="flex justify-center py-8">
                            <div className="w-8 h-8 border-4 border-slate-200 border-t-brand rounded-full animate-spin"></div>
                        </div>
                    ) : addresses.length === 0 ? (
                        <div 
                            className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-brand/50 transition-all group"
                            onClick={() => navigate('/user/saved-addresses')}
                        >
                            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-brand/10 group-hover:text-brand transition-colors text-slate-400 text-xl">
                                <i className="fa-solid fa-plus"></i>
                            </div>
                            <p className="text-slate-900 font-bold">No addresses found</p>
                            <p className="text-slate-500 text-sm font-medium mt-1">Click here to add your home or office.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {addresses.map((addr) => {
                                const isSelected = selectedAddress?.id === addr.id;
                                return (
                                    <div 
                                        key={addr.id} 
                                        onClick={() => setSelectedAddress(addr)}
                                        className={`p-5 rounded-2xl border-2 cursor-pointer flex items-start gap-4 transition-all duration-300 ${
                                            isSelected 
                                            ? 'border-brand bg-brand/5 shadow-md shadow-brand/10' 
                                            : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                                            isSelected ? 'bg-brand text-white' : 'bg-slate-200 text-slate-500'
                                        }`}>
                                            <i className={`fa-solid ${addr.label === 'Home' ? 'fa-house' : addr.label === 'Office' ? 'fa-briefcase' : 'fa-location-dot'}`}></i>
                                        </div>
                                        <div className="flex-grow min-w-0 pt-0.5">
                                            <h6 className={`font-bold text-sm uppercase tracking-wider mb-1 ${isSelected ? 'text-brand' : 'text-slate-900'}`}>
                                                {addr.label}
                                            </h6>
                                            <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">{addr.address}</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors mt-0.5 ${
                                            isSelected ? 'border-brand bg-brand' : 'border-slate-300'
                                        }`}>
                                            {isSelected && <i className="fa-solid fa-check text-white text-[10px]"></i>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT SIDE: CHECKOUT SUMMARY (Span 4) */}
            <div className="lg:col-span-4">
                <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 p-6 md:p-8 lg:sticky lg:top-28">
                    
                    <h4 className="text-xl font-bold text-slate-900 tracking-tight mb-6">Payment Summary</h4>
                    
                    <div className="bg-slate-50 rounded-2xl p-4 flex gap-3 items-start mb-8 border border-slate-100">
                        <i className="fa-solid fa-circle-info text-slate-400 mt-0.5"></i>
                        <p className="text-slate-600 text-xs font-medium leading-relaxed">
                            You are securing your slot with a <b>Visit Fee</b>. The final bill (including parts & labor) will be calculated after the service is completed.
                        </p>
                    </div>
                    
                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center text-slate-600 text-sm font-medium">
                            <span>Inspection / Visit Fee</span>
                            <span className="text-slate-900 font-bold">₹99.00</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-600 text-sm font-medium">
                            <span>Taxes & Platform Fees</span>
                            <span className="text-slate-900 font-bold">₹0.00</span>
                        </div>
                        
                        <hr className="border-slate-100 my-2" />
                        
                        <div className="flex justify-between items-end pt-2">
                            <span className="font-bold text-slate-900 uppercase tracking-wider text-xs">Total Due Now</span>
                            <span className="font-bold text-3xl text-slate-900 tracking-tight">₹99.00</span>
                        </div>
                    </div>

                    <button 
                        className={`w-full text-white font-bold py-4 rounded-2xl transition-all shadow-lg flex justify-center items-center gap-2 mt-8 ${
                            isSubmitting 
                            ? 'bg-slate-400 cursor-not-allowed' 
                            : 'bg-slate-900 hover:bg-black shadow-slate-900/20 hover:shadow-slate-900/30 hover:-translate-y-0.5 active:translate-y-0'
                        }`}
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <><i className="fa-solid fa-circle-notch fa-spin text-lg"></i> Processing...</>
                        ) : (
                            'Confirm Booking'
                        )}
                    </button>
                    
                    <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-5 flex items-center justify-center gap-1.5">
                        <i className="fa-solid fa-lock text-slate-300"></i> 256-bit Secure Checkout
                    </p>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default BookingPage;