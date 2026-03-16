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
    { title: "Home looking messy?", subtitle: "Book a deep cleaning session today.", btn: "Book Now", color: "#4361EE", icon: "fa-broom", search:"cleaning" },
    { title: "AC not cooling?", subtitle: "Get expert repair in 60 mins.", btn: "Fix Now", color: "#3F37C9", icon: "fa-snowflake", search:"ac repair" },
    { title: "Renovating?", subtitle: "Painters & Decorators available.", btn: "Explore", color: "#FF9F1C", icon: "fa-paint-roller", search:"painting" },
    { title: "Leaky tap?", subtitle: "Expert plumbers at your doorstep.", btn: "Find Plumber", color: "#10B981", icon: "fa-faucet", search:"plumber" },
    { title: "Power issue?", subtitle: "Fix wiring & switches instantly.", btn: "Get Sparky", color: "#F59E0B", icon: "fa-bolt", search:"electrician" },
    { title: "Self-care time?", subtitle: "Salon services at home.", btn: "Pamper Me", color: "#F72585", icon: "fa-scissors", search:"salon" },
    { title: "Pests taking over?", subtitle: "Safe & herbal pest control.", btn: "Sanitize", color: "#7209B7", icon: "fa-bug", search:"pest control" },
    { title: "Broken furniture?", subtitle: "Skilled carpenters for any job.", btn: "Repair It", color: "#D35400", icon: "fa-hammer", search:"carpenter" },
    { title: "Fridge stopped?", subtitle: "Washing machine & Fridge repair.", btn: "Book Repair", color: "#EF476F", icon: "fa-screwdriver-wrench", search:"appliance repair" },
    { title: "Dirty Car?", subtitle: "Professional car wash at your parking.", btn: "Wash Now", color: "#4CC9F0", icon: "fa-car", search:"car wash" }
  ];
  // Auto-slide logic
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
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
  // This maps database slugs to specific icons and colors
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
    // Default fallback for any new categories added by admin that aren't mapped above
    return styles[slug] || { icon: 'fa-screwdriver-wrench', color: 'text-gray-600', bg: 'bg-gray-100' };
  };

  const getProImg = (img, name) => (!img || img === 'default_provider.png') ? `https://ui-avatars.com/api/?name=${name}&background=1e293b&color=fff` : (img.startsWith('http') ? img : `${API_BASE_URL}${img}`);

  if (loading) {
      return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
              <i className="fa-solid fa-circle-notch fa-spin text-4xl text-brand"></i>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* --- SECTION 1: HERO GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* SLIDER CARD */}
          <div className="lg:col-span-2 relative overflow-hidden rounded-3xl shadow-lg transition-all duration-500 ease-in-out"
               style={{ background: `linear-gradient(135deg, ${slides[activeSlide].color} 0%, #000000 140%)` }}>
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative z-10 p-8 h-full flex flex-col justify-center min-h-[300px]">
              <div key={activeSlide} className="animate-fade-in-up">
                <span className="inline-block px-3 py-1 mb-3 text-xs font-bold text-white bg-white/20 border border-white/20 rounded-full backdrop-blur-sm">
                  Featured Offer
                </span>
                <h2 className="text-3xl md:text-5xl font-bold text-white font-display mb-2 shadow-sm">
                  {slides[activeSlide].title}
                </h2>
                <p className="text-lg text-white/90 mb-6 font-medium">
                  {slides[activeSlide].subtitle}
                </p>
                <Link 
                  to={`/user/search?q=${slides[activeSlide].search}`} 
                  className="inline-block px-6 py-3 bg-white text-gray-900 font-bold rounded-full shadow-lg hover:scale-105 transition-transform"
                  style={{ color: slides[activeSlide].color }}
                >
                  {slides[activeSlide].btn}
                </Link>
              </div>

              <div className="absolute right-[-20px] bottom-[-40px] md:right-10 md:bottom-5 opacity-20 rotate-[-12deg] transition-all duration-500">
                <i className={`fa-solid ${slides[activeSlide].icon} text-9xl text-white`}></i>
              </div>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((_, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveSlide(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${idx === activeSlide ? 'w-6 bg-white' : 'w-2 bg-white/40'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* STATS CARD */}
          <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col justify-between border border-gray-100 hover:shadow-md transition-shadow">
             <div>
               <div className="flex justify-between items-center mb-6">
                 <h6 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Spent</h6>
                 <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-wallet"></i>
                 </div>
               </div>
               <h1 className="text-4xl font-bold text-gray-900 font-display mb-1">
                   ₹{parseFloat(data.stats.total_spent).toLocaleString()}
               </h1>
               <p className="text-xs text-gray-400">Lifetime platform usage</p>
             </div>

             <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="bg-amber-50 p-4 rounded-2xl text-center border border-amber-100">
                   <p className="text-xs text-amber-600/70 font-bold uppercase mb-1">Active</p>
                   <h5 className="text-2xl font-bold text-amber-600">{data.stats.active}</h5>
                </div>
                <div className="bg-green-50 p-4 rounded-2xl text-center border border-green-100">
                   <p className="text-xs text-green-600/70 font-bold uppercase mb-1">Completed</p>
                   <h5 className="text-2xl font-bold text-green-600">{data.stats.completed}</h5>
                </div>
             </div>
          </div>

        </div>

        {/* --- SECTION 2: CATEGORIES (Now with dynamic data + static icons) --- */}
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-xl font-bold text-gray-900 font-display">Categories</h3>
          <Link to="/user/search" className="text-sm font-semibold text-brand hover:underline">See All</Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
            {data.categories.length === 0 ? (
                <p className="col-span-full text-gray-400 text-sm italic">No categories available yet.</p>
            ) : (
                <>
                    {data.categories.map(cat => {
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
                        <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-full flex flex-col items-center justify-center">
                            <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-3 bg-gray-50 text-gray-400 group-hover:bg-brand/10 group-hover:text-brand transition-colors">
                                <i className="fa-solid fa-arrow-right text-xl"></i>
                            </div>
                            <h6 className="text-gray-700 font-semibold text-sm group-hover:text-brand transition-colors">See All</h6>
                        </div>
                    </Link>
                </>
            )}
        </div>

        {/* --- SECTION 3: SPLIT CONTENT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* LEFT: Recent Activity */}
          <div className="lg:col-span-7">
            <h3 className="text-xl font-bold text-gray-900 font-display mb-4">Recent Activity</h3>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-full">
               {data.recentActivity.length === 0 ? (
                   <div className="p-8 text-center text-gray-400 text-sm">You haven't booked any services yet.</div>
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
            <h3 className="text-xl font-bold text-gray-900 font-display mb-4">Top Rated Pros</h3>
            <div className="space-y-3">
              {data.topPros.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-3xl border border-gray-100 text-gray-400 text-sm">No providers available.</div>
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
        <div className="mb-12">
          <h3 className="text-xl font-bold text-gray-900 font-display mb-6 text-center">Why Choose Us?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard 
              icon="fa-shield-halved" 
              title="Verified Professionals" 
              desc="Background checked & trained experts for your safety." 
              color="text-blue-600" 
              bg="bg-blue-50"
            />
            <FeatureCard 
              icon="fa-clock" 
              title="On-Time Service" 
              desc="We value your time. Guaranteed on-time arrival." 
              color="text-green-600" 
              bg="bg-green-50"
            />
            <FeatureCard 
              icon="fa-tags" 
              title="Transparent Pricing" 
              desc="Upfront pricing. No hidden charges or surprises." 
              color="text-purple-600" 
              bg="bg-purple-50"
            />
          </div>
        </div>

        {/* --- SECTION 5: REFERRAL BANNER --- */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-3xl p-8 mb-12 text-white relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-bold font-display mb-2">Refer & Earn ₹100</h3>
              <p className="text-blue-100 mb-0">Invite your friends to Sahaayak and earn rewards on their first booking.</p>
            </div>
            <button className="bg-white text-indigo-600 px-8 py-3 rounded-full font-bold shadow-md hover:bg-gray-50 transition-colors whitespace-nowrap">
              Invite Friends
            </button>
          </div>
        </div>

        {/* --- SECTION 6: HOW IT WORKS --- */}
        <div className="mb-8">
           <h3 className="text-xl font-bold text-gray-900 font-display mb-8 text-center">How It Works</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative">
             <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 -translate-y-1/2"></div>
             
             <StepCard 
               step="1" 
               title="Choose Service" 
               desc="Select the service you need from our wide range of options." 
             />
             <StepCard 
               step="2" 
               title="Book A Slot" 
               desc="Pick a convenient date and time for the professional to visit." 
             />
             <StepCard 
               step="3" 
               title="Hassle-Free Service" 
               desc="Our expert arrives at your doorstep and gets the job done." 
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
    <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-full flex flex-col items-center justify-center">
      <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-3 ${bg} ${color} group-hover:scale-110 transition-transform`}>
        <i className={`fa-solid ${icon} text-xl`}></i>
      </div>
      <h6 className="text-gray-700 font-semibold text-sm group-hover:text-brand transition-colors">{title}</h6>
    </div>
  </Link>
);

const HistoryItem = ({ title, date, price, status }) => {
  const isDone = status === 'completed';
  const isCancelled = status === 'cancelled';
  return (
      <div className="flex justify-between items-center p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isDone ? 'bg-green-100 text-green-600' : isCancelled ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
            <i className={`fa-solid ${isDone ? 'fa-check' : isCancelled ? 'fa-xmark' : 'fa-clock'} text-sm`}></i>
          </div>
          <div>
            <h6 className="font-semibold text-gray-900">{title}</h6>
            <p className="text-xs text-gray-500">{date}</p>
          </div>
        </div>
        <div className="text-right">
          <h6 className="font-bold text-gray-900">₹{parseFloat(price).toLocaleString()}</h6>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${isDone ? 'text-green-600 bg-green-50' : isCancelled ? 'text-red-600 bg-red-50' : 'text-amber-600 bg-amber-50'}`}>
              {status.replace('_', ' ')}
          </span>
        </div>
      </div>
  );
};

const ProviderMiniCard = ({ name, role, rating, img }) => (
  <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer group">
    <img src={img} alt={name} className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-sm shrink-0" />
    <div className="flex-1 overflow-hidden">
      <h6 className="font-bold text-gray-900 text-sm group-hover:text-brand transition-colors truncate">{name}</h6>
      <p className="text-xs text-gray-500 truncate">{role}</p>
    </div>
    <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 shrink-0">
      <i className="fa-solid fa-star text-amber-400 text-xs"></i>
      <span className="text-xs font-bold text-amber-700">{parseFloat(rating).toFixed(1)}</span>
    </div>
  </div>
);

const FeatureCard = ({ icon, title, desc, color, bg }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center hover:shadow-md transition-shadow">
    <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4 ${bg} ${color}`}>
      <i className={`fa-solid ${icon} text-xl`}></i>
    </div>
    <h5 className="font-bold text-gray-900 mb-2">{title}</h5>
    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
  </div>
);

const StepCard = ({ step, title, desc }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative z-10">
    <div className="w-10 h-10 mx-auto bg-gray-900 text-white rounded-full flex items-center justify-center font-bold mb-4 shadow-md border-4 border-white">
      {step}
    </div>
    <h5 className="font-bold text-gray-900 mb-2">{title}</h5>
    <p className="text-sm text-gray-500">{desc}</p>
  </div>
);

export default Home;