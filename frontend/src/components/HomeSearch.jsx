import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants/api'; 

const HomeSearch = () => {
  const navigate = useNavigate(); 
  
  // --- STATE ---
  const [locationLabel, setLocationLabel] = useState('Surat');
  const [loadingLoc, setLoadingLoc] = useState(false);
  
  // --- TYPEWRITER STATE ---
  const [placeholder, setPlaceholder] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  const services = ["Plumber", "Electrician", "AC Repair", "Cleaning", "Carpenter", "Painter"];

  // --- 1. TYPEWRITER EFFECT LOGIC ---
  useEffect(() => {
    const handleType = () => {
      const i = loopNum % services.length;
      const fullText = `Search for '${services[i]}'`;
      
      setPlaceholder(isDeleting 
        ? fullText.substring(0, placeholder.length - 1) 
        : fullText.substring(0, placeholder.length + 1)
      );

      // Typing Speed Logic
      setTypingSpeed(isDeleting ? 50 : 100);

      // If word is fully typed
      if (!isDeleting && placeholder === fullText) {
        setTimeout(() => setIsDeleting(true), 2000); // Pause at end
        setTypingSpeed(2000); // Wait before deleting
      } 
      // If word is fully deleted
      else if (isDeleting && placeholder === "Search for '") {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        setTypingSpeed(500); // Pause before typing next
      }
    };

    const timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [placeholder, isDeleting, loopNum, typingSpeed]);


  // --- 2. SEARCH REDIRECT ---
  const handleSearchRedirect = () => {
    navigate('/user/search');
  };

  // --- 3. SMART AREA EXTRACTOR ---
  const getAreaName = (fullAddress) => {
    if (!fullAddress) return 'Set Location';
    const parts = fullAddress.split(',').map(part => part.trim());
    const cleanParts = parts.filter(part => {
        const lower = part.toLowerCase();
        const isCityState = lower === 'surat' || lower === 'gujarat' || lower === 'india';
        const isPincode = /^\d{6}$/.test(part); 
        return !isCityState && !isPincode;
    });
    if (cleanParts.length > 0) {
        const area = cleanParts[cleanParts.length - 1];
        return area.length > 15 ? area.substring(0, 15) + '...' : area;
    }
    return "Surat";
  };

  // --- 4. FETCH SAVED LOCATION ---
  useEffect(() => {
    const fetchUserLocation = async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) return; 

        if (user.address) setLocationLabel(getAreaName(user.address));

        try {
            const res = await fetch(`${API_BASE_URL}user/address/get_all.php?id=${user.id}`);
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                const primary = data.find(addr => addr.label === 'Home') || data[0];
                setLocationLabel(getAreaName(primary.address));
                const updatedUser = { ...user, address: primary.address };
                localStorage.setItem('user', JSON.stringify(updatedUser));
            } 
        } catch (error) { console.error(error); }
    };
    fetchUserLocation();
  }, []);

  // --- 5. DETECT LOCATION (GPS) ---
  const detectLocation = (e) => {
    e.stopPropagation();
    if (!navigator.geolocation) return alert("Geolocation not supported");

    setLoadingLoc(true);

    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data && data.address) {
                const area = data.address.suburb || data.address.neighbourhood || data.address.city;
                setLocationLabel(area);
            } else {
                alert("Location not found.");
            }
        } catch (error) {
            console.error("Geocoding error:", error);
        } finally {
            setLoadingLoc(false);
        }
    }, () => {
        setLoadingLoc(false);
        alert("Permission denied.");
    });
  };

  const handleLocationClick = () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if(user) navigate('/user/saved-addresses');
      else navigate('/login');
  };

  return (
    <div className="w-full bg-white border-b border-gray-100 py-3 shadow-sm  top-[60px] z-50">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="flex items-center gap-4">

          {/* --- LEFT: LOCATION CAPSULE --- */}
          <div className="hidden sm:flex items-center bg-gray-50 rounded-full border border-gray-200 p-1 pr-4 transition-all hover:border-gray-300 hover:shadow-sm">
            
            {/* Detect Button */}
            <button 
                onClick={detectLocation}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-brand shadow-sm border border-gray-100 hover:bg-brand hover:text-white transition-all duration-300 group"
                title="Use Current Location"
            >
                {loadingLoc ? (
                    <i className="fa-solid fa-circle-notch fa-spin text-xs"></i>
                ) : (
                    <i className="fa-solid fa-crosshairs text-sm group-hover:rotate-90 transition-transform"></i>
                )}
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-200 mx-3"></div>

            {/* Address Text */}
            <button onClick={handleLocationClick} className="text-left group">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-0.5 group-hover:text-brand transition-colors">Location</p>
                <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-gray-800 truncate max-w-[120px] leading-none">{locationLabel}</p>
                    <i className="fa-solid fa-chevron-down text-[10px] text-gray-400"></i>
                </div>
            </button>
          </div>

          {/* --- MIDDLE: SEARCH BAR --- */}
          <div className="relative flex-grow">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <i className="fa-solid fa-magnifying-glass text-lg"></i>
            </div>
            <input
              type="text"
              className="w-full pl-12 pr-6 py-3.5 bg-gray-50/50 border border-gray-200 rounded-full focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all placeholder:text-gray-500 text-gray-700 font-medium shadow-sm hover:shadow-md hover:bg-white"
              
              // ANIMATED PLACEHOLDER
              placeholder={placeholder + "|"} 
              
              onClick={handleSearchRedirect} 
              onFocus={handleSearchRedirect}
              readOnly 
            />
            
            {/* Optional Search Button */}
            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand text-white w-9 h-9 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform hidden md:flex pointer-events-none">
                <i className="fa-solid fa-arrow-right text-sm"></i>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HomeSearch;