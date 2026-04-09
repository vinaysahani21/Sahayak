import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../constants/api';

const Home = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  
  // Dynamic Data State
  const [data, setData] = useState({
      stats: { active: 0, completed: 0, total_spent: 0 },
      categories: [],
      recentActivity: [],
      topPros: []
  });
  const [loading, setLoading] = useState(true);

  // Carousel State
  const [activeSlide, setActiveSlide] = useState(0);
  const slides = [
    { title: "Home looking messy?", subtitle: "Book a deep cleaning session today.", btn: "Book Now", color: "from-blue-600 to-indigo-700", icon: "fa-broom", search:"cleaning" },
    { title: "AC not cooling?", subtitle: "Get expert repair in 60 mins.", btn: "Fix Now", color: "from-cyan-500 to-blue-600", icon: "fa-snowflake", search:"ac repair" },
    { title: "Renovating?", subtitle: "Painters & Decorators available.", btn: "Explore", color: "from-orange-500 to-red-500", icon: "fa-paint-roller", search:"painting" },
    { title: "Leaky tap?", subtitle: "Expert plumbers at your doorstep.", btn: "Find Plumber", color: "from-emerald-500 to-teal-600", icon: "fa-faucet", search:"plumber" },
    { title: "Power issue?", subtitle: "Fix wiring & switches instantly.", btn: "Get Sparky", color: "from-amber-500 to-orange-500", icon: "fa-bolt", search:"electrician" },
  ];

  // Auto-slide logic
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // --- FETCH DYNAMIC DATA ---
  useEffect(() => {
      if (!user) {
          navigate('/login');
          return;
      }

      const fetchHomeData = async () => {
          try {
              const res = await fetch(`${API_BASE_URL}/user/get_home_data.php?customer_id=${user.id}`);
              const result = await res.json();
              if (result.status === 'success') {
                  setData(result.data);
              }
          } catch (error) {
              console.error("Error fetching home data:", error);
          } finally {
              setLoading(false);
          }
      };

      fetchHomeData();
  }, [user, navigate]);

  // --- ICON & COLOR MAPPER ---
  const getCategoryStyle = (slug) => {
    const styles = {
        'plumber': { icon: 'fa-faucet', color: 'text-blue-600', bg: 'bg-blue-50' },
        'electrician': { icon: 'fa-bolt', color: 'text-amber-500', bg: 'bg-amber-50' },
        'cleaning': { icon: 'fa-broom', color: 'text-cyan-500', bg: 'bg-cyan-50' },
        'ac-repair': { icon: 'fa-snowflake', color: 'text-indigo-600', bg: 'bg-indigo-50' },
        'carpenter': { icon: 'fa-hammer', color: 'text-orange-600', bg: 'bg-orange-50' },
        'painting': { icon: 'fa-paint-roller', color: 'text-rose-500', bg: 'bg-rose-50' },
        'tutor': { icon: 'fa-book-open', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    };
    return styles[slug] || { icon: 'fa-screwdriver-wrench', color: 'text-slate-600', bg: 'bg-slate-100' };
  };

  const getProImg = (img, name) => (!img || img === 'default_provider.png') ? `https://ui-avatars.com/api/?name=${name}&background=0f172a&color=fff` : (img.startsWith('http') ? img : `${API_BASE_URL}${img}`);

  if (loading) {
      return (
          <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center pb-20 transition-colors duration-300">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-brand rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500 font-medium animate-pulse">Preparing your dashboard...</p>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans transition-colors duration-300">
      
      {/* --- GREETING HEADER --- */}
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Good to see you, {user.name.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 font-medium mt-1">Ready to cross things off your to-do list?</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* --- SECTION 1: HERO GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
          
          {/* SLIDER CARD */}
          <div className={`lg:col-span-8 relative overflow-hidden rounded-[2.5rem] shadow-lg transition-all duration-700 ease-in-out bg-gradient-to-br ${slides[activeSlide].color}`}>
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl mix-blend-overlay"></div>
            <div className="relative z-10 p-8 md:p-12 h-full flex flex-col justify-center min-h-[320px]">
              <div key={activeSlide} className="animate-fade-in-up max-w-lg">
                <span className="inline-block px-3 py-1 mb-4 text-[10px] font-black uppercase tracking-widest text-white bg-black/20 border border-white/10 rounded-full backdrop-blur-md">
                  Featured Offer
                </span>
                <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-3 tracking-tighter">
                  {slides[activeSlide].title}
                </h2>
                <p className="text-lg text-white/90 mb-8 font-medium">
                  {slides[activeSlide].subtitle}
                </p>
                <Link 
                  to={`/user/search?q=${slides[activeSlide].search}`} 
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-slate-900 font-bold rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  {slides[activeSlide].btn} <i className="fa-solid fa-arrow-right text-xs"></i>
                </Link>
              </div>

              <div className="absolute right-[-20px] bottom-[-40px] md:right-8 md:bottom-0 opacity-20 rotate-[-15deg] transition-all duration-500 pointer-events-none">
                <i className={`fa-solid ${slides[activeSlide].icon} text-[10rem] text-white`}></i>
              </div>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((_, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveSlide(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeSlide ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* STATS CARD */}
          <div className="lg:col-span-4 bg-white rounded-[2.5rem] shadow-sm p-8 flex flex-col justify-between border border-slate-200/60 hover:shadow-md transition-all group">
             <div>
               <div className="flex justify-between items-center mb-6">
                 <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Usage</h6>
                 <div className="w-10 h-10 bg-brand/10 text-brand rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-wallet"></i>
                 </div>
               </div>
               <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-1">
                   ₹{parseFloat(data.stats.total_spent).toLocaleString()}
               </h1>
               <p className="text-xs text-slate-400 font-medium">Total Lifetime Spend</p>
             </div>

             <div className="grid grid-cols-2 gap-3 mt-8">
                <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100 transition-colors hover:bg-brand/5">
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Active</p>
                   <h5 className="text-2xl font-black text-brand">{data.stats.active}</h5>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100 transition-colors hover:bg-emerald-500/5">
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Done</p>
                   <h5 className="text-2xl font-black text-emerald-500">{data.stats.completed}</h5>
                </div>
             </div>
          </div>

        </div>

        {/* --- NEW SECTION: TRUST BANNER --- */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4 mb-10 flex flex-wrap items-center justify-center md:justify-between gap-4 text-sm font-bold text-slate-600">
            <div className="flex items-center gap-2"><i className="fa-solid fa-shield-check text-emerald-500"></i> Background Checked</div>
            <div className="hidden md:block w-1 h-1 bg-slate-300 rounded-full"></div>
            <div className="flex items-center gap-2"><i className="fa-solid fa-tags text-brand"></i> Transparent Pricing</div>
            <div className="hidden md:block w-1 h-1 bg-slate-300 rounded-full"></div>
            <div className="flex items-center gap-2"><i className="fa-solid fa-clock-rotate-left text-amber-500"></i> Easy Rescheduling</div>
        </div>

        {/* --- SECTION 2: CATEGORIES --- */}
        <div className="flex justify-between items-end mb-5 px-2">
          <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Categories</h3>
          <Link to="/user/search" className="text-sm font-bold text-brand hover:underline flex items-center gap-1">
            See All <i className="fa-solid fa-chevron-right text-[10px]"></i>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 mb-12">
            {data.categories.length === 0 ? (
                <p className="col-span-full text-slate-400 text-sm italic px-2">No categories available yet.</p>
            ) : (
                <>
                    {data.categories.slice(0, 5).map(cat => {
                        const style = getCategoryStyle(cat.slug);
                        return (
                            <CategoryCard 
                                key={cat.id} 
                                icon={style.icon} 
                                color={style.color} 
                                bg={style.bg} 
                                title={cat.name} 
                                link={`/user/search?category=${cat.slug}`} 
                            />
                        );
                    })}
                    <Link to="/user/search" className="block group">
                        <div className="bg-white border border-slate-200/60 rounded-[2rem] p-6 text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col items-center justify-center">
                            <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 bg-slate-100 text-slate-400 group-hover:bg-brand group-hover:text-white transition-all shadow-inner">
                                <i className="fa-solid fa-grid-2 text-xl"></i>
                            </div>
                            <h6 className="text-slate-900 font-bold text-sm">View More</h6>
                        </div>
                    </Link>
                </>
            )}
        </div>

        {/* --- NEW SECTION: TRENDING SERVICES --- */}
        <div className="mb-12">
          <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mb-5 px-2">Trending Right Now</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <TrendingCard title="AC Deep Clean" price="499" icon="fa-snowflake" link="/user/search?q=ac" />
              <TrendingCard title="Sofa Cleaning" price="349" icon="fa-couch" link="/user/search?q=sofa" />
              <TrendingCard title="Water Purifier Repair" price="299" icon="fa-droplet" link="/user/search?q=purifier" />
              <TrendingCard title="Bathroom Cleaning" price="399" icon="fa-bath" link="/user/search?q=cleaning" />
          </div>
        </div>

        {/* --- SECTION 3: SPLIT CONTENT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          
          {/* LEFT: Recent Activity */}
          <div className="lg:col-span-7">
            <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mb-5 px-2">Recent Activity</h3>
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden divide-y divide-slate-100">
               {data.recentActivity.length === 0 ? (
                   <div className="p-10 text-center text-slate-400 font-medium text-sm">Your booking history will appear here.</div>
               ) : (
                   data.recentActivity.map(job => (
                       <HistoryItem 
                           key={job.id} 
                           title={job.title} 
                           date={new Date(job.date).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'})} 
                           price={job.price} 
                           status={job.status} 
                       />
                   ))
               )}
            </div>
          </div>

          {/* RIGHT: Top Rated */}
          <div className="lg:col-span-5">
            <div className="flex justify-between items-end mb-5 px-2">
                <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Elite Pros</h3>
                <Link to="/user/search" className="text-sm font-bold text-slate-400 hover:text-brand">View Directory</Link>
            </div>
            <div className="space-y-3">
              {data.topPros.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-[2rem] border border-slate-200/60 text-slate-400 text-sm">No providers available.</div>
              ) : (
                  data.topPros.map(pro => (
                      <ProviderMiniCard 
                          key={pro.id} 
                          name={pro.name} 
                          role={pro.profession || 'Professional'} 
                          rating={pro.rating} 
                          img={getProImg(pro.profile_img, pro.name)} 
                      />
                  ))
              )}
            </div>
          </div>

        </div>

        {/* --- SECTION 4: WHY CHOOSE US --- */}
        <div className="mb-16">
          <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-8 text-center">Built for Reliability</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard 
              icon="fa-user-shield" 
              title="Vetted Experts" 
              desc="Every professional undergoes strict identity and background checks." 
              color="text-blue-600" 
              bg="bg-blue-50"
            />
            <FeatureCard 
              icon="fa-stopwatch" 
              title="Punctual Delivery" 
              desc="We respect your time. Expect our pros to arrive exactly as scheduled." 
              color="text-emerald-600" 
              bg="bg-emerald-50"
            />
            <FeatureCard 
              icon="fa-money-bill-wave" 
              title="Standardized Rates" 
              desc="Clear, upfront pricing matrix with absolutely zero hidden fees." 
              color="text-purple-600" 
              bg="bg-purple-50"
            />
          </div>
        </div>

        {/* --- NEW SECTION 6: TESTIMONIALS --- */}
        <div className="mb-16">
           <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-8 px-2">Loved by Locals</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <TestimonialCard name="Amit Desai" area="Adajan" review="The AC repair guy was perfectly on time and fixed the gas leak in 30 minutes. Highly recommended!" />
              <TestimonialCard name="Priya Patel" area="Vesu" review="Booked a deep cleaning service before Diwali. The team was extremely professional and thorough." />
              <TestimonialCard name="Rahul Sharma" area="Piplod" review="Finally an app that gives transparent pricing for plumbing. No more haggling with local guys." />
           </div>
        </div>

        {/* --- SECTION 7: REFERRAL BANNER --- */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 mb-16 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand/30 rounded-full blur-[80px] -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[60px] -ml-20 -mb-20"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand bg-brand/10 px-3 py-1 rounded-full mb-3 inline-block">Sahaayak Rewards</span>
              <h3 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Invite & Earn ₹100</h3>
              <p className="text-slate-400 font-medium max-w-md">Share your love for seamless home services. Give your friends a discount and earn wallet cash.</p>
            </div>
            <button className="bg-white text-slate-900 px-8 py-4 rounded-xl font-bold shadow-xl hover:bg-brand hover:text-white transition-all whitespace-nowrap active:scale-95">
              Copy Referral Link
            </button>
          </div>
        </div>

        {/* --- SECTION 8: HOW IT WORKS --- */}
        <div className="mb-10">
           <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-10 text-center">Simple 3-Step Process</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative">
             <div className="hidden md:block absolute top-1/2 left-[10%] w-[80%] h-0.5 bg-slate-200 -z-10 -translate-y-1/2"></div>
             
             <StepCard 
               step="1" 
               icon="fa-magnifying-glass"
               title="Discover" 
               desc="Find the perfect professional for your specific household needs." 
             />
             <StepCard 
               step="2" 
               icon="fa-calendar-check"
               title="Schedule" 
               desc="Pick a date and time slot that fits perfectly into your day." 
             />
             <StepCard 
               step="3" 
               icon="fa-house-circle-check"
               title="Relax" 
               desc="Our verified pro arrives and completes the job efficiently." 
             />
           </div>
        </div>

      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const CategoryCard = ({ icon, color, bg, title, link }) => (
  <Link to={link} className="block group">
    <div className="bg-white border border-slate-200/60 rounded-[2rem] p-5 md:p-6 text-center shadow-sm hover:shadow-xl hover:border-brand/30 hover:-translate-y-1.5 transition-all duration-300 h-full flex flex-col items-center justify-center">
      <div className={`w-14 h-14 md:w-16 md:h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${bg} ${color} group-hover:scale-110 transition-transform duration-500 shadow-inner ring-4 ring-transparent group-hover:ring-brand/5`}>
        <i className={`fa-solid ${icon} text-xl md:text-2xl`}></i>
      </div>
      <h6 className="text-slate-800 font-bold text-xs md:text-sm group-hover:text-brand transition-colors">{title}</h6>
    </div>
  </Link>
);

const HistoryItem = ({ title, date, price, status }) => {
  const isDone = status === 'completed';
  const isCancelled = status === 'cancelled';
  return (
      <div className="flex justify-between items-center p-5 md:p-6 hover:bg-slate-50 transition-colors group cursor-pointer">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110 ${isDone ? 'bg-emerald-50 text-emerald-600' : isCancelled ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
            <i className={`fa-solid ${isDone ? 'fa-check' : isCancelled ? 'fa-xmark' : 'fa-clock'} text-lg`}></i>
          </div>
          <div>
            <h6 className="font-bold text-slate-900 group-hover:text-brand transition-colors">{title}</h6>
            <p className="text-xs text-slate-500 font-medium">{date}</p>
          </div>
        </div>
        <div className="text-right">
          <h6 className="font-black text-slate-900 tracking-tight">₹{parseFloat(price).toLocaleString()}</h6>
          <span className={`text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest mt-1 inline-block ${isDone ? 'text-emerald-600 bg-emerald-50' : isCancelled ? 'text-rose-600 bg-rose-50' : 'text-amber-600 bg-amber-50'}`}>
              {status.replace('_', ' ')}
          </span>
        </div>
      </div>
  );
};

const ProviderMiniCard = ({ name, role, rating, img }) => (
  <div className="bg-white rounded-[1.5rem] p-4 shadow-sm border border-slate-200/60 flex items-center gap-4 hover:shadow-md hover:border-brand/30 transition-all cursor-pointer group">
    <img src={img} alt={name} className="w-14 h-14 rounded-xl object-cover border border-slate-100 shadow-sm shrink-0 group-hover:scale-105 transition-transform" />
    <div className="flex-1 overflow-hidden">
      <h6 className="font-bold text-slate-900 text-sm group-hover:text-brand transition-colors truncate">{name}</h6>
      <p className="text-[10px] text-brand font-black uppercase tracking-widest truncate mt-0.5">{role}</p>
    </div>
    <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100 shrink-0 shadow-sm">
      <i className="fa-solid fa-star text-amber-500 text-[10px]"></i>
      <span className="text-xs font-black text-amber-700">{parseFloat(rating).toFixed(1)}</span>
    </div>
  </div>
);

const FeatureCard = ({ icon, title, desc, color, bg }) => (
  <div className="bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${bg} ${color} group-hover:scale-110 transition-transform`}>
      <i className={`fa-solid ${icon} text-2xl`}></i>
    </div>
    <h5 className="font-bold text-slate-900 text-lg mb-2">{title}</h5>
    <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
  </div>
);

const StepCard = ({ step, icon, title, desc }) => (
  <div className="bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-sm relative z-10 group hover:-translate-y-1 transition-all duration-300">
    <div className="w-14 h-14 mx-auto bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xl mb-6 shadow-xl border-4 border-white group-hover:bg-brand group-hover:text-white transition-colors">
      <i className={`fa-solid ${icon}`}></i>
    </div>
    <h5 className="font-bold text-slate-900 text-lg mb-2 tracking-tight">Step {step}: {title}</h5>
    <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
  </div>
);

const TrendingCard = ({ title, price, icon, link }) => (
    <Link to={link} className="bg-white border border-slate-200/60 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md hover:border-brand/30 transition-all group">
        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 group-hover:text-brand group-hover:bg-brand/10 transition-colors shrink-0">
            <i className={`fa-solid ${icon} text-lg`}></i>
        </div>
        <div>
            <h6 className="font-bold text-slate-900 text-sm group-hover:text-brand transition-colors">{title}</h6>
            <p className="text-[10px] text-slate-500 font-bold mt-0.5 uppercase tracking-wider">Starts at ₹{price}</p>
        </div>
    </Link>
);

const TestimonialCard = ({ name, area, review }) => (
    <div className="bg-white border border-slate-200/60 rounded-[2rem] p-6 md:p-8 shadow-sm">
        <div className="flex text-amber-400 text-[10px] gap-1 mb-4">
            <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
        </div>
        <p className="text-sm text-slate-600 font-medium italic leading-relaxed mb-6">"{review}"</p>
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-xs">
                {name.charAt(0)}
            </div>
            <div>
                <h6 className="font-bold text-slate-900 text-xs">{name}</h6>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{area}</p>
            </div>
        </div>
    </div>
);

export default Home;