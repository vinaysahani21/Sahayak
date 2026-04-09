import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants/api'; 

const HomeSearch = () => {
  const navigate = useNavigate(); 
  const [locationLabel, setLocationLabel] = useState('Surat');
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [placeholder, setPlaceholder] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  const services = ["Plumber", "Electrician", "AC Repair", "Deep Cleaning", "Carpenter"];

  useEffect(() => {
    const handleType = () => {
      const i = loopNum % services.length;
      const fullText = `Search for '${services[i]}'`;
      setPlaceholder(isDeleting ? fullText.substring(0, placeholder.length - 1) : fullText.substring(0, placeholder.length + 1));
      setTypingSpeed(isDeleting ? 40 : 80);

      if (!isDeleting && placeholder === fullText) {
        setTimeout(() => setIsDeleting(true), 2500);
        setTypingSpeed(2500);
      } else if (isDeleting && placeholder === "Search for '") {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        setTypingSpeed(500);
      }
    };
    const timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [placeholder, isDeleting, loopNum, typingSpeed]);

  const getAreaName = (fullAddress) => {
    if (!fullAddress) return 'Set Location';
    const parts = fullAddress.split(',').map(p => p.trim());
    const clean = parts.filter(p => !['surat', 'gujarat', 'india'].includes(p.toLowerCase()) && !/^\d{6}$/.test(p));
    return clean.length > 0 ? clean[clean.length - 1].substring(0, 15) : "Surat";
  };

  const detectLocation = (e) => {
    e.stopPropagation();
    if (!navigator.geolocation) return;
    setLoadingLoc(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
            const data = await res.json();
            if (data.address) setLocationLabel(data.address.suburb || data.address.city);
        } catch (err) { console.error(err); }
        finally { setLoadingLoc(false); }
    }, () => setLoadingLoc(false));
  };

  return (
    <div className="w-full bg-white border-b border-slate-100 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center gap-4">

          {/* --- Location Capsule --- */}
          <div className="hidden lg:flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-1.5 pr-5 transition-all hover:border-brand/30 hover:bg-white hover:shadow-md group">
            <button onClick={detectLocation} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-brand shadow-sm border border-slate-100 hover:bg-brand hover:text-white transition-all">
                {loadingLoc ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-location-crosshairs text-sm"></i>}
            </button>
            <div className="w-px h-6 bg-slate-200 mx-4"></div>
            <button onClick={() => navigate('/user/saved-addresses')} className="text-left">
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.1em] mb-0.5">Your Area</p>
                <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-800">{locationLabel}</p>
                    <i className="fa-solid fa-chevron-down text-[10px] text-slate-300"></i>
                </div>
            </button>
          </div>

          {/* --- Search Input --- */}
          <div className="relative flex-grow group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors">
              <i className="fa-solid fa-magnifying-glass text-lg"></i>
            </div>
            <input
              type="text"
              readOnly
              onClick={() => navigate('/user/search')}
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand/10 focus:bg-white focus:border-brand transition-all placeholder:text-slate-500 text-slate-700 font-medium shadow-inner"
              placeholder={placeholder + "|"} 
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-2">
               <button className="bg-slate-900 text-white h-10 px-5 rounded-xl font-bold text-xs hover:bg-brand shadow-lg transition-all active:scale-95">Find Help</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HomeSearch;