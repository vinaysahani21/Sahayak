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
              <div className="w-12 h-12 border-4 border-slate-200 border-t-brand rounded-full animate-spin mb-4 shadow-lg"></div>
              <p className="text-slate-500 font-medium animate-pulse">Loading profile...</p>
          </div>
      );
  }

  if (!provider || provider.error) {
      return (
          <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center pb-20">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <i className="fa-solid fa-user-slash text-3xl text-slate-300"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Provider Not Found</h3>
              <button onClick={() => navigate(-1)} className="mt-4 text-brand font-bold hover:underline">Go Back</button>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans selection:bg-brand selection:text-white">
      
      {/* --- PREMIUM BANNER --- */}
      <div className="relative h-48 md:h-64 bg-slate-900 overflow-hidden">
        {/* Background Gradients & Glows */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-black opacity-90"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] bg-brand/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>
        
        {/* Back Button (Frosted Glass) */}
        <button 
            onClick={() => navigate(-1)} 
            className="absolute top-4 left-4 md:top-6 md:left-6 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white transition-all hover:scale-105 active:scale-95 shadow-lg"
        >
            <i className="fa-solid fa-arrow-left"></i>
        </button>
      </div>

      {/* --- MAIN CONTENT CONTAINER --- */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative -mt-20 md:-mt-24 z-20">
        
        {/* PROFILE CARD */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 mb-8">
            
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                {/* Avatar */}
                <div className="relative -mt-16 md:-mt-20 flex-shrink-0">
                    <img 
                        src={getImg(provider.profile_img, provider.name)} 
                        alt={provider.name} 
                        className="w-28 h-28 md:w-36 md:h-36 rounded-2xl object-cover border-4 border-white shadow-lg bg-white" 
                    />
                    {provider.is_verified == 1 && (
                        <div className="absolute -bottom-3 -right-3 bg-white rounded-full p-1 shadow-sm">
                            <i className="fa-solid fa-circle-check text-blue-500 text-2xl md:text-3xl bg-white rounded-full"></i>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 w-full pt-2">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-1">{provider.name}</h1>
                            <p className="text-brand font-bold text-sm tracking-wider uppercase mb-2">{provider.profession || 'Professional'}</p>
                            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                <i className="fa-solid fa-location-dot"></i>
                                {provider.city || 'Surat, Gujarat'}
                            </div>
                        </div>

                        {/* Quick Stats Tags */}
                        <div className="flex gap-3 mt-2 md:mt-0">
                            <div className="bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                                <i className="fa-solid fa-star text-amber-500 text-xs"></i>
                                <span className="font-bold text-amber-700 text-sm">4.9</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                                <i className="fa-solid fa-briefcase text-slate-400 text-xs"></i>
                                <span className="font-bold text-slate-700 text-sm">{provider.experience_years}+ Yrs Exp</span>
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-100 my-5" />

                    {/* Bio */}
                    <div>
                        <h6 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About Provider</h6>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                            {provider.bio || "This professional hasn't written a bio yet, but their work speaks for itself!"}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* --- SERVICES LIST --- */}
        <div className="flex items-baseline justify-between mb-6 px-2">
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Services Offered</h3>
            <span className="text-sm font-bold text-slate-400 bg-slate-200/50 px-3 py-1 rounded-full">{services.length} Total</span>
        </div>

        <div className="space-y-4">
            {services.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 border border-slate-100 text-center shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fa-solid fa-box-open text-2xl text-slate-300"></i>
                    </div>
                    <h5 className="font-bold text-slate-900 mb-1">No services listed</h5>
                    <p className="text-sm text-slate-500 font-medium">This provider hasn't added any specific services yet.</p>
                </div>
            ) : (
                services.map(service => (
                    <div key={service.id} className="bg-white border border-slate-100 rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-md transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        
                        <div className="flex-1">
                            <h4 className="text-lg font-bold text-slate-900 group-hover:text-brand transition-colors mb-1">{service.service_name}</h4>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-2xl line-clamp-2 sm:line-clamp-none">
                                {service.description || "Expert service tailored to your needs."}
                            </p>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6 shrink-0 min-w-[120px]">
                            <div className="text-left sm:text-right">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Est. Price</p>
                                <p className="text-2xl font-bold text-slate-900 tracking-tight">₹{parseFloat(service.price_per_hour).toLocaleString()}</p>
                            </div>
                            <button 
                                onClick={() => handleBookService(service)} 
                                className="bg-slate-900 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-brand transition-all shadow-md hover:shadow-lg active:scale-95 text-sm"
                            >
                                Book Now
                            </button>
                        </div>

                    </div>
                ))
            )}
        </div>

      </div>
    </div>
  );
};

export default ProviderDetails;