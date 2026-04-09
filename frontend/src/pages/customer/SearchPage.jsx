import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../../constants/api'; 

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const inputRef = useRef(null);

  // --- STATE ---
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [recentSearches, setRecentSearches] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- FILTER & SORT STATE ---
  const [sortBy, setSortBy] = useState('relevance');
  const [filterVerified, setFilterVerified] = useState(false);

  const isSearching = !!searchParams.get('q') || !!searchParams.get('category');
  const popularTags = ["Deep Cleaning", "Painting", "Carpenter", "AC Repair", "Plumber", "Pest Control"];

  // --- LOGIC: URL PARAMS TO STATE ---
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

  // --- LOGIC: AUTO-FOCUS ---
  useEffect(() => {
    if (inputRef.current && !isSearching && !category) inputRef.current.focus();
  }, [isSearching, category]);

  // --- LOGIC: FETCH ---
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

  // --- LOGIC: SUBMIT SEARCH ---
  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) return;
    
    setSearchParams({ q: searchTerm });
    
    const stored = JSON.parse(localStorage.getItem('recentSearches')) || [];
    const updated = [searchTerm, ...stored.filter(s => s !== searchTerm)].slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const clearSearch = () => {
    setQuery('');
    setCategory('');
    setSearchParams({});
    setSortBy('relevance');
    setFilterVerified(false);
    if (inputRef.current) inputRef.current.focus();
  };

  // --- LOGIC: CLIENT-SIDE SORTING & FILTERING ---
  const getProcessedResults = () => {
    let processed = [...results];

    // Filter
    if (filterVerified) {
      processed = processed.filter(r => r.is_verified == 1);
    }

    // Sort
    if (sortBy === 'price_asc') {
      processed.sort((a, b) => parseFloat(a.price_per_hour) - parseFloat(b.price_per_hour));
    } else if (sortBy === 'price_desc') {
      processed.sort((a, b) => parseFloat(b.price_per_hour) - parseFloat(a.price_per_hour));
    }
    
    return processed;
  };

  const processedResults = getProcessedResults();

  // --- NAVIGATION HELPERS ---
  const goToProvider = (id) => navigate(`/user/provider/${id}`);
  const handleBook = (service) => navigate('/user/book-service', { state: { service: service } });

  const getProImg = (img, name) => (!img || img === 'default_provider.png') ? `https://ui-avatars.com/api/?name=${name}&background=0f172a&color=fff&size=200` : (img.startsWith('http') ? img : `${API_BASE_URL}${img}`);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans selection:bg-brand/20 selection:text-brand">

      {/* --- PREMIUM HEADER (Frosted Glass) --- */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center gap-4">
          
          <div className="flex items-center gap-3 w-full">
            <button 
              onClick={() => navigate(-1)} 
              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 transition-all hover:scale-105 active:scale-95 flex-shrink-0 shadow-sm"
            >
              <i className="fa-solid fa-arrow-left"></i>
            </button>

            <div className="flex-grow relative group">
              <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors text-lg"></i>
              <input
                ref={inputRef}
                type="text"
                className="w-full pl-12 pr-14 py-3.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand/10 transition-all placeholder:text-slate-400 font-bold text-slate-900 shadow-inner"
                placeholder="What do you need help with?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              />
              {(query || category) && (
                <button 
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-500 transition-colors"
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
            <div className="w-14 h-14 border-4 border-slate-200 border-t-brand rounded-full animate-spin mb-6 shadow-sm"></div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Scanning directory...</h3>
            <p className="text-slate-500 font-medium">Finding the best professionals in your area.</p>
          </div>
        )}

        {/* SEARCH RESULTS */}
        {!loading && isSearching && (
          <div className="animate-fade-in-up">
            
            {/* RESULTS HEADER & FILTERS */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
                    {category ? `${category.replace('-', ' ')}` : `"${query}"`}
                  </h2>
                  <p className="text-slate-500 font-medium">Found <span className="font-bold text-slate-700">{processedResults.length}</span> matching services</p>
              </div>

              {/* FILTER / SORT CONTROLS */}
              {results.length > 0 && (
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setFilterVerified(!filterVerified)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-all flex items-center gap-2 active:scale-95 ${
                            filterVerified 
                            ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm' 
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        <i className={`fa-solid fa-shield-check ${filterVerified ? 'text-blue-500' : 'text-slate-400'}`}></i> Verified
                    </button>

                    <div className="relative">
                        <select 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2.5 pr-10 rounded-xl text-sm font-bold bg-white border border-slate-200 text-slate-700 outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand appearance-none cursor-pointer shadow-sm hover:bg-slate-50 transition-colors"
                        >
                            <option value="relevance">Sort: Relevance</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                        </select>
                        <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs"></i>
                    </div>
                </div>
              )}
            </div>

            {/* EMPTY STATE */}
            {processedResults.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm max-w-3xl mx-auto">
                <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <i className="fa-solid fa-magnifying-glass-minus text-4xl text-slate-300"></i>
                </div>
                <h4 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">No matches found</h4>
                <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto leading-relaxed">
                    We couldn't find any services matching your criteria. Try adjusting your filters or searching for something else.
                </p>
                <button 
                  onClick={clearSearch}
                  className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-brand transition-all shadow-xl hover:shadow-brand/20 active:scale-95"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (

              // PREMIUM RESULT GRID
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {processedResults.map((service) => (
                  <div 
                    key={service.id} 
                    onClick={() => goToProvider(service.provider_id)}
                    className="bg-white rounded-[2rem] p-5 border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-brand/30 transition-all duration-300 flex flex-col h-full group cursor-pointer"
                  >
                    {/* Header: Provider Info */}
                    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-100">
                      <div className="relative flex-shrink-0">
                        <img
                          src={getProImg(service.profile_img, service.provider_name)}
                          className="w-14 h-14 object-cover rounded-2xl shadow-sm border border-slate-100 group-hover:scale-105 transition-transform duration-500"
                          alt={service.provider_name}
                        />
                        {service.is_verified == 1 && (
                          <div className="absolute -bottom-1.5 -right-1.5 bg-white rounded-full p-0.5 shadow-sm">
                            <i className="fa-solid fa-circle-check text-blue-500 text-base"></i>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 text-base truncate group-hover:text-brand transition-colors">{service.provider_name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                           <i className="fa-solid fa-location-dot text-slate-300"></i> <span className="truncate">{service.city || "Surat"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Body: Service Info */}
                    <div className="flex-1 mb-6">
                      <span className="inline-block px-3 py-1 bg-slate-50 text-slate-500 border border-slate-100 text-[10px] font-bold uppercase tracking-widest rounded-lg mb-3">
                          {service.category_name || service.profession || 'Service'}
                      </span>
                      <h3 className="text-lg font-black text-slate-900 leading-tight mb-2 group-hover:text-brand transition-colors line-clamp-2">
                          {service.service_name}
                      </h3>
                      
                      <div className="flex items-center gap-2 mt-3 bg-amber-50/50 w-fit px-2 py-1 rounded-md border border-amber-100/50">
                        <i className="fa-solid fa-star text-amber-400 text-[10px]"></i>
                        <span className="text-xs font-black text-amber-700">4.9</span>
                        <span className="text-[10px] text-amber-600/60 font-bold">(120+ jobs)</span>
                      </div>
                    </div>

                    {/* Footer: Price & Action */}
                    <div className="flex justify-between items-end pt-4 border-t border-slate-50 mt-auto">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Starting at</p>
                        <p className="text-2xl font-black text-slate-900 tracking-tight">₹{parseFloat(service.price_per_hour).toLocaleString()}</p>
                      </div>
                      <button 
                        className="bg-slate-900 text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-brand transition-all shadow-md group-hover:shadow-brand/20 active:scale-95"
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
          <div className="max-w-4xl mx-auto animate-fade-in-up mt-4">
            
            {/* RECENT SEARCHES */}
            {recentSearches.length > 0 && (
              <div className="mb-10 bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200/60">
                <div className="flex justify-between items-center mb-6">
                  <h6 className="font-black text-slate-900 text-xl tracking-tight">Recent Searches</h6>
                  <button 
                    onClick={() => { localStorage.removeItem('recentSearches'); setRecentSearches([]) }} 
                    className="text-xs font-bold text-slate-500 hover:text-red-500 transition-colors bg-slate-50 hover:bg-red-50 border border-slate-100 hover:border-red-100 px-4 py-2 rounded-lg"
                  >
                    Clear History
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {recentSearches.map((item, index) => (
                    <button 
                      key={index} 
                      onClick={() => handleSearch(item)}
                      className="flex items-center gap-3 px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-bold hover:border-brand hover:text-brand hover:shadow-md transition-all active:scale-95"
                    >
                      <i className="fa-solid fa-clock-rotate-left text-slate-300"></i>
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* POPULAR TAGS */}
            <div>
              <h6 className="font-black text-slate-900 text-xl tracking-tight mb-6 px-2 flex items-center gap-2">
                 <i className="fa-solid fa-fire text-orange-500"></i> Trending Now
              </h6>
              <div className="flex flex-wrap gap-3 px-2">
                {popularTags.map((tag, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => handleSearch(tag)}
                    className="px-6 py-3.5 bg-white border border-slate-200/60 shadow-sm hover:border-brand/50 hover:shadow-md rounded-2xl text-sm font-bold text-slate-600 hover:text-brand hover:bg-brand/5 transition-all active:scale-95"
                  >
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