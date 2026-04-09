import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../constants/api';

const ProviderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper for premium fallback images
  const getImg = (img, name) => (!img || img.includes('default')) 
    ? `https://ui-avatars.com/api/?name=${name || 'Pro'}&background=0f172a&color=fff&size=200` 
    : (img.startsWith('http') ? img : `${API_BASE_URL}${img}`);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const resProv = await fetch(`${API_BASE_URL}/user/get_provider_details.php?id=${id}`);
        const dataProv = await resProv.json();
        setProvider(dataProv);

        const resServ = await fetch(`${API_BASE_URL}/user/get_provider_services.php?provider_id=${id}`);
        const dataServ = await resServ.json();
        setServices(dataServ);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleBookService = (service) => {
    navigate('/user/book-service', { 
        state: { service: { ...service, provider_name: provider.name, provider_img: provider.profile_img } } 
    });
  };

  if (loading) {
      return (
          <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center pb-20">
              <div className="w-14 h-14 border-4 border-slate-200 border-t-brand rounded-full animate-spin mb-6 shadow-sm"></div>
              <p className="text-slate-500 font-bold tracking-tight animate-pulse">Loading professional profile...</p>
          </div>
      );
  }

  if (!provider || provider.error) {
      return (
          <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center pb-20 px-4 text-center">
              <div className="w-24 h-24 bg-white border border-slate-200/60 shadow-sm rounded-[2rem] flex items-center justify-center mb-6">
                  <i className="fa-solid fa-user-slash text-4xl text-slate-300"></i>
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Provider Not Found</h3>
              <p className="text-slate-500 font-medium mb-8 max-w-sm">This professional may have deactivated their account or the link is incorrect.</p>
              <button onClick={() => navigate(-1)} className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-brand transition-colors shadow-lg active:scale-95 flex items-center gap-2">
                 <i className="fa-solid fa-arrow-left text-sm"></i> Go Back
              </button>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans selection:bg-brand/20 selection:text-brand">
      
      {/* --- PREMIUM FULL-WIDTH BANNER --- */}
      <div className="relative h-56 md:h-72 bg-slate-900 overflow-hidden">
        {/* Background Gradients & Glows */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 opacity-90"></div>
        <div className="absolute top-[-30%] left-[-10%] w-[60%] h-[160%] bg-brand/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[100%] bg-blue-500/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>
        
        {/* Back Button */}
        <button 
            onClick={() => navigate(-1)} 
            className="absolute top-6 left-4 md:top-8 md:left-8 z-10 w-12 h-12 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white transition-all hover:scale-105 active:scale-95 shadow-lg"
        >
            <i className="fa-solid fa-arrow-left"></i>
        </button>
      </div>

      {/* --- MAIN CONTENT GRID (Full Width Layout) --- */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative -mt-24 md:-mt-32 z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* ================= LEFT: PROFILE SIDEBAR (Span 4) ================= */}
            <div className="lg:col-span-4 relative">
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 p-6 md:p-8 lg:sticky lg:top-28">
                    
                    {/* Floating Avatar */}
                    <div className="relative -mt-20 md:-mt-24 mb-6 flex justify-center lg:justify-start">
                        <div className="relative">
                            <img 
                                src={getImg(provider.profile_img, provider.name)} 
                                alt={provider.name} 
                                className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] object-cover border-8 border-white shadow-xl bg-white" 
                            />
                            {provider.is_verified == 1 && (
                                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-sm">
                                    <i className="fa-solid fa-circle-check text-blue-500 text-3xl bg-white rounded-full"></i>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Core Info */}
                    <div className="text-center lg:text-left mb-8">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1">{provider.name}</h1>
                        <p className="text-brand font-black text-xs tracking-widest uppercase mb-3">{provider.profession || 'Professional'}</p>
                        <div className="flex items-center justify-center lg:justify-start gap-2 text-sm text-slate-500 font-medium">
                            <i className="fa-solid fa-location-dot text-slate-400"></i>
                            {provider.city || 'Surat, Gujarat'}
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-8">
                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-center">
                            <i className="fa-solid fa-star text-amber-500 text-lg mb-1"></i>
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-600/70 mb-0.5">Rating</p>
                            <span className="font-black text-amber-700 text-xl">4.9</span>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center">
                            <i className="fa-solid fa-briefcase text-slate-400 text-lg mb-1"></i>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Experience</p>
                            <span className="font-black text-slate-700 text-xl">{provider.experience_years || '2'}+ <span className="text-sm font-bold">Yrs</span></span>
                        </div>
                    </div>

                    <hr className="border-slate-100 mb-6" />

                    {/* Bio Section */}
                    <div>
                        <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                           <i className="fa-solid fa-quote-left text-slate-300"></i> About {provider.name.split(' ')[0]}
                        </h6>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                            {provider.bio || "This professional is dedicated to providing top-tier service. Book a slot below to experience their expertise firsthand."}
                        </p>
                    </div>

                    {/* Trust Badges */}
                    <div className="mt-8 bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                        <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                            <i className="fa-solid fa-shield-check text-emerald-500 w-4"></i> Background Verified
                        </div>
                        <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                            <i className="fa-solid fa-clock-rotate-left text-blue-500 w-4"></i> On-Time Guarantee
                        </div>
                    </div>

                </div>
            </div>

            {/* ================= RIGHT: SERVICES AREA (Span 8) ================= */}
            <div className="lg:col-span-8 mt-6 lg:mt-0">
                
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 px-2">
                    <div>
                        <h3 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-1">Available Services</h3>
                        <p className="text-slate-500 font-medium text-sm">Select a service to proceed with booking</p>
                    </div>
                    <span className="text-xs font-bold text-slate-600 bg-slate-200/50 border border-slate-200 px-4 py-2 rounded-xl shrink-0">
                        {services.length} Services Listed
                    </span>
                </div>

                <div className="space-y-4">
                    {services.length === 0 ? (
                        <div className="bg-white rounded-[2rem] p-12 border border-slate-200/60 text-center shadow-sm">
                            <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <i className="fa-solid fa-box-open text-3xl text-slate-300"></i>
                            </div>
                            <h5 className="text-xl font-black text-slate-900 mb-2">No services listed</h5>
                            <p className="text-slate-500 font-medium max-w-sm mx-auto">This provider hasn't added any specific services to their catalog yet.</p>
                        </div>
                    ) : (
                        services.map(service => (
                            <div 
                                key={service.id} 
                                className="bg-white border border-slate-200/60 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:border-brand/30 transition-all duration-300 group flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden"
                            >
                                {/* Decorative line */}
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-100 group-hover:bg-brand transition-colors"></div>

                                {/* Service Details */}
                                <div className="flex-1 pl-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">
                                            {service.category_name || 'Standard Service'}
                                        </span>
                                    </div>
                                    <h4 className="text-xl font-black text-slate-900 group-hover:text-brand transition-colors mb-2 tracking-tight">
                                        {service.service_name}
                                    </h4>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed md:pr-8">
                                        {service.description || "Expert service tailored to your specific requirements. Includes standard inspection and labor."}
                                    </p>
                                </div>

                                {/* Pricing & Action */}
                                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-5 md:pt-0 md:pl-8 shrink-0 min-w-[160px]">
                                    <div className="text-left md:text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Est. Price</p>
                                        <p className="text-3xl font-black text-slate-900 tracking-tighter leading-none">
                                            ₹{parseFloat(service.price_per_hour).toLocaleString()}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => handleBookService(service)} 
                                        className="bg-slate-900 text-white font-bold py-3.5 px-8 rounded-xl hover:bg-brand transition-all shadow-lg shadow-slate-900/10 group-hover:shadow-brand/20 active:scale-95 text-sm flex items-center gap-2"
                                    >
                                        Book Now <i className="fa-solid fa-arrow-right text-xs"></i>
                                    </button>
                                </div>

                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDetails;