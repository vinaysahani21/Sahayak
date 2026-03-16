import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../../constants/api'; 

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const inputRef = useRef(null);

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  
  const [recentSearches, setRecentSearches] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const isSearching = !!searchParams.get('q') || !!searchParams.get('category');
  const popularTags = ["Cleaning", "Painting", "Carpenter", "AC Repair", "Plumber"];

  useEffect(() => {
    const currentQuery = searchParams.get('q') || '';
    const currentCat = searchParams.get('category') || '';
    
    setQuery(currentQuery);
    setCategory(currentCat);

    if (currentQuery || currentCat) {
      fetchResults(currentQuery, currentCat);
    } else {
      setResults([]);
      const stored = JSON.parse(localStorage.getItem('recentSearches')) || [];
      setRecentSearches(stored);
    }
  }, [searchParams]);

  useEffect(() => {
    // Only auto-focus if it's a completely fresh search page
    if (inputRef.current && !isSearching && !category) inputRef.current.focus();
  }, [isSearching, category]);

  const fetchResults = async (searchTerm, categorySlug) => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/user/search.php?`;
      if (searchTerm) url += `q=${encodeURIComponent(searchTerm)}&`;
      if (categorySlug) url += `category=${encodeURIComponent(categorySlug)}`;

      const response = await fetch(url);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Search Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) return;
    
    // Clear category if we are doing a manual text search
    setSearchParams({ q: searchTerm });
    
    // Save to Recent
    const stored = JSON.parse(localStorage.getItem('recentSearches')) || [];
    const updated = [searchTerm, ...stored.filter(s => s !== searchTerm)].slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const clearSearch = () => {
    setQuery('');
    setCategory('');
    setSearchParams({});
    if (inputRef.current) inputRef.current.focus();
  };

  const goToProvider = (id) => navigate(`/user/provider/${id}`);
  const handleBook = (service) => navigate('/user/book-service', { state: { service: service } });

  // Premium Image Helper
  const getProImg = (img, name) => (!img || img === 'default_provider.png') ? `https://ui-avatars.com/api/?name=${name}&background=0f172a&color=fff&size=200` : (img.startsWith('http') ? img : `${API_BASE_URL}${img}`);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans selection:bg-brand selection:text-white">

      {/* --- PREMIUM HEADER (Frosted Glass) --- */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-5 flex flex-col md:flex-row md:items-center gap-4">
          
          <div className="flex items-center gap-3 w-full">
            <button 
              onClick={() => navigate(-1)} 
              className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-100/80 hover:bg-slate-200 text-slate-700 transition-all hover:scale-105 active:scale-95 flex-shrink-0"
            >
              <i className="fa-solid fa-arrow-left"></i>
            </button>

            <div className="flex-grow relative group">
              <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors text-lg"></i>
              <input
                ref={inputRef}
                type="text"
                className="w-full pl-12 pr-12 py-3.5 bg-slate-100/50 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-brand/30 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand/10 transition-all placeholder:text-slate-400 font-medium text-slate-900 shadow-inner"
                placeholder="What do you need help with?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              />
              {(query || category) && (
                <button 
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 transition-colors"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* --- BODY --- */}
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* LOADING STATE */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-brand rounded-full animate-spin mb-6 shadow-lg"></div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Searching providers...</h3>
            <p className="text-slate-500 font-medium mt-2">Finding the best matches in your area</p>
          </div>
        )}

        {/* SEARCH RESULTS */}
        {!loading && isSearching && (
          <div className="animate-fade-in-up">
            <div className="mb-8 flex items-baseline gap-3">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                {category ? `Browsing ${category.replace('-', ' ')}` : `Results for "${query}"`}
              </h2>
              <span className="text-slate-500 font-medium bg-slate-200/50 px-3 py-1 rounded-full text-sm">
                {results.length} found
              </span>
            </div>

            {results.length === 0 ? (
              // PREMIUM EMPTY STATE
              <div className="text-center py-24 bg-white rounded-[2rem] border border-slate-100 shadow-sm max-w-2xl mx-auto">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="fa-solid fa-wind text-4xl text-slate-300"></i>
                </div>
                <h4 className="text-2xl font-bold text-slate-900 mb-2">No professionals found</h4>
                <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto">We couldn't find any services matching your search. Try using different keywords or checking our popular categories.</p>
                <button 
                  onClick={clearSearch}
                  className="bg-slate-900 text-white px-8 py-3.5 rounded-full font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              // PREMIUM RESULT GRID
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {results.map((service) => (
                  <div 
                    key={service.id} 
                    onClick={() => goToProvider(service.provider_id)}
                    className="bg-white rounded-3xl p-4 shadow-sm hover:shadow-xl border border-slate-100 hover:border-slate-200 transition-all duration-300 cursor-pointer group flex flex-col h-full relative"
                  >
                    {/* Top Info Area */}
                    <div className="flex gap-4 mb-4">
                      <div className="w-20 h-20 flex-shrink-0 relative">
                        <img
                          src={getProImg(service.profile_img, service.provider_name)}
                          className="w-full h-full object-cover rounded-2xl shadow-sm group-hover:scale-105 transition-transform duration-500"
                          alt={service.provider_name}
                        />
                        {service.is_verified === 1 && (
                          <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-0.5 shadow-sm">
                            <i className="fa-solid fa-circle-check text-blue-500 text-lg"></i>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{service.category_name || service.profession || 'Service'}</p>
                        <h3 className="font-bold text-slate-900 leading-tight mb-1 line-clamp-2 group-hover:text-brand transition-colors">{service.service_name}</h3>
                      </div>
                    </div>

                    {/* Provider & Location */}
                    <div className="bg-slate-50 rounded-2xl p-3 mb-4 flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-bold text-slate-700">{service.provider_name}</p>
                        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow-sm border border-slate-100">
                          <i className="fa-solid fa-star text-amber-400 text-[10px]"></i>
                          <span className="text-xs font-bold text-slate-700">4.9</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <i className="fa-solid fa-location-dot text-slate-400"></i>
                        <span className="truncate">{service.city || "Surat"}</span>
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="flex justify-between items-center mt-auto">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Starting at</p>
                        <p className="text-xl font-bold text-slate-900 tracking-tight">₹{parseFloat(service.price_per_hour).toLocaleString()}</p>
                      </div>
                      <button 
                        className="bg-slate-900 text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-brand transition-colors shadow-md group-hover:shadow-lg active:scale-95"
                        onClick={(e) => { e.stopPropagation(); handleBook(service); }}
                      >
                        Book
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DEFAULT VIEW (Recent & Popular) */}
        {!loading && !isSearching && (
          <div className="max-w-3xl mx-auto animate-fade-in-up mt-8">
            
            {/* RECENT SEARCHES */}
            {recentSearches.length > 0 && (
              <div className="mb-12 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-5">
                  <h6 className="font-bold text-slate-900 text-lg tracking-tight">Recent Searches</h6>
                  <button 
                    onClick={() => { localStorage.removeItem('recentSearches'); setRecentSearches([]) }} 
                    className="text-sm font-bold text-brand hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg"
                  >
                    Clear History
                  </button>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {recentSearches.map((item, index) => (
                    <button 
                      key={index} 
                      onClick={() => handleSearch(item)}
                      className="flex items-center gap-2.5 px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-bold hover:border-brand hover:text-brand hover:bg-white hover:shadow-md transition-all active:scale-95"
                    >
                      <i className="fa-solid fa-clock-rotate-left text-slate-400"></i>
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* POPULAR TAGS */}
            <div>
              <h6 className="font-bold text-slate-900 text-lg tracking-tight mb-5 px-2">Popular Right Now</h6>
              <div className="flex flex-wrap gap-3 px-2">
                {popularTags.map((tag, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => handleSearch(tag)}
                    className="px-6 py-3 bg-white border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md rounded-2xl text-sm font-bold text-slate-700 transition-all active:scale-95 flex items-center gap-2"
                  >
                    <i className="fa-solid fa-fire text-amber-500"></i>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SearchPage;