import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // --- ACTUAL ROUTING LOGIC ---
  const handleSearch = (e) => {
      if (e) e.preventDefault();
      if (searchQuery.trim()) {
          navigate(`/user/search?q=${encodeURIComponent(searchQuery.trim())}`);
      } else {
          navigate('/user/search');
      }
  };

  const handleCategoryClick = (categorySlug) => {
      navigate(`/user/search?category=${categorySlug}`);
  };

  return (
    <div className="font-sans bg-[#F8FAFC] min-h-screen selection:bg-brand/20 selection:text-brand overflow-x-hidden">
      
      {/* 1. PREMIUM NAVBAR (Frosted Glass) */}
      <nav className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 py-3 transition-all">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center">
          
          {/* Brand */}
          <Link to="/" className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2 z-50 relative">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-sm shadow-lg shadow-brand/20 text-white">
                <i className="fa-solid fa-shield-halved"></i>
            </div>
            Sahaayak<span className="text-brand">.</span>
          </Link>
          
          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden w-10 h-10 flex items-center justify-center bg-slate-50 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 active:scale-95 transition-all z-50 relative"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars'} text-lg`}></i>
          </button>

          {/* Desktop & Mobile Links */}
          <div className={`absolute top-0 left-0 w-full h-screen bg-white md:h-auto md:bg-transparent md:static flex flex-col md:flex-row md:items-center justify-center md:justify-end gap-6 md:gap-8 pt-20 md:pt-0 transition-all duration-300 ease-in-out ${isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 md:translate-y-0 md:opacity-100'}`}>
            <Link to="/user/search" className="text-lg md:text-sm font-bold text-slate-600 hover:text-brand transition-colors text-center md:text-left">
              Browse Services
            </Link>
            <Link to="/provider/register" className="text-lg md:text-sm font-bold text-slate-600 hover:text-brand transition-colors text-center md:text-left mb-4 md:mb-0">
              Become a Provider
            </Link>
            
            <div className="flex flex-col md:flex-row gap-3 px-6 md:px-0">
              <Link to="/login" className="px-6 py-3 md:py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all text-center">
                Log In
              </Link>
              <Link to="/signup" className="px-6 py-3 md:py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-brand shadow-lg hover:shadow-brand/30 transition-all text-center active:scale-95 flex items-center justify-center gap-2">
                Sign Up <i className="fa-solid fa-arrow-right text-xs hidden md:inline-block"></i>
              </Link>
            </div>
          </div>

        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pb-20 lg:pt-30 lg:pb-32 overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-brand/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            
            {/* Left Text & Functional Search */}
            <div className="w-full lg:w-[55%] text-center lg:text-left z-10">
              {/* <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-1.5 rounded-full text-[10px] font-black text-slate-500 tracking-widest uppercase mb-6 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Service Directory Live
              </div> */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-[1.1] mb-6">
                Your home's <br className="hidden md:block"/>
                <span className="text-brand">maintenance</span> on autopilot.
              </h1>
              <p className="text-lg md:text-xl text-slate-500 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                Instantly connect with top-rated, background-checked professionals in Surat. Transparent pricing, guaranteed quality.
              </p>

              {/* Functional Search Bar */}
              <form 
                onSubmit={handleSearch}
                className="bg-white p-2 border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-200/50 max-w-xl mx-auto lg:mx-0 flex items-center transition-all focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10"
              >
                <div className="pl-4 text-slate-400">
                    <i className="fa-solid fa-magnifying-glass text-lg"></i>
                </div>
                <input 
                  type="text" 
                  className="flex-grow px-4 py-3.5 outline-none text-slate-900 font-bold bg-transparent placeholder:text-slate-400 placeholder:font-medium" 
                  placeholder="e.g. AC Repair, Sofa Cleaning..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-brand transition-all shadow-md active:scale-95 whitespace-nowrap">
                  Search
                </button>
              </form>
              
              {/* Quick Tags */}
              <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Popular:</span>
                  <button type="button" onClick={() => handleCategoryClick('cleaning')} className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:border-brand hover:text-brand transition-colors shadow-sm">Deep Cleaning</button>
                  <button type="button" onClick={() => handleCategoryClick('plumber')} className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:border-brand hover:text-brand transition-colors shadow-sm">Plumbing</button>
                  <button type="button" onClick={() => handleCategoryClick('electrician')} className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:border-brand hover:text-brand transition-colors shadow-sm">Electrical</button>
              </div>
            </div>

            {/* Right Image (SaaS Styled Mockup) */}
            <div className="w-full lg:w-[45%] relative">
               <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200/60 bg-white p-2 transform lg:rotate-2 hover:rotate-0 transition-transform duration-700 z-10">
                 <div className="rounded-[2rem] overflow-hidden relative">
                    <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors z-10"></div>
                    <img 
                    src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop" 
                    alt="Professional Cleaning" 
                    className="w-full h-auto object-cover aspect-[4/3]"
                    />
                 </div>
                 
                 {/* Floating Verification Badge */}
                 <div className="absolute bottom-6 -left-4 md:-left-8 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4 animate-fade-in-up">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center text-xl shadow-inner">
                        <i className="fa-solid fa-shield-check"></i>
                    </div>
                    <div>
                        <p className="text-slate-900 font-black text-sm">100% Verified</p>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mt-0.5">Background checked pros</p>
                    </div>
                 </div>
               </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. FUNCTIONAL CATEGORIES GRID */}
      <section className="py-20 bg-white border-y border-slate-100 relative">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
                <h3 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-2">Explore Categories</h3>
                <p className="text-slate-500 font-medium text-lg">Find the right professional for any job.</p>
            </div>
            <Link to="/user/search" className="text-sm font-bold text-brand hover:text-blue-800 transition-colors flex items-center gap-2 bg-blue-50 px-5 py-2.5 rounded-xl self-start md:self-auto active:scale-95">
              View All Services <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <ServiceCard onClick={() => handleCategoryClick('plumber')} icon="fa-wrench" title="Plumber" desc="Pipe fixes & installations" color="text-blue-600" bg="bg-blue-50" border="border-blue-100/50" />
            <ServiceCard onClick={() => handleCategoryClick('electrician')} icon="fa-bolt" title="Electrician" desc="Wiring & switch boards" color="text-amber-500" bg="bg-amber-50" border="border-amber-100/50" />
            <ServiceCard onClick={() => handleCategoryClick('ac-repair')} icon="fa-snowflake" title="AC Repair" desc="Gas filling & servicing" color="text-indigo-600" bg="bg-indigo-50" border="border-indigo-100/50" />
            <ServiceCard onClick={() => handleCategoryClick('cleaning')} icon="fa-broom" title="Cleaning" desc="Deep home sanitization" color="text-emerald-500" bg="bg-emerald-50" border="border-emerald-100/50" />
            <ServiceCard onClick={() => handleCategoryClick('painting')} icon="fa-paint-roller" title="Painting" desc="Wall touchups & full house" color="text-rose-500" bg="bg-rose-50" border="border-rose-100/50" />
            <ServiceCard onClick={() => handleCategoryClick('carpenter')} icon="fa-hammer" title="Carpenter" desc="Furniture repair & assembly" color="text-orange-500" bg="bg-orange-50" border="border-orange-100/50" />
            <ServiceCard onClick={() => handleCategoryClick('pest-control')} icon="fa-bug" title="Pest Control" desc="Termite & roach elimination" color="text-purple-600" bg="bg-purple-50" border="border-purple-100/50" />
            <div onClick={() => navigate('/user/search')} className="group cursor-pointer h-full">
                <div className="bg-slate-50 border border-slate-200/60 shadow-sm rounded-[2rem] p-6 hover:shadow-lg hover:border-brand/30 hover:bg-white transition-all duration-300 h-full flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xl mb-4 group-hover:bg-brand group-hover:text-white transition-colors shadow-inner">
                    <i className="fa-solid fa-arrow-right"></i>
                </div>
                <h6 className="font-black text-slate-900 mb-1 text-lg group-hover:text-brand transition-colors">See Directory</h6>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TRUST & PROCESS SECTION (SaaS Style) */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h3 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Built for Reliability</h3>
            <p className="text-slate-400 font-medium text-lg">We've engineered the friction out of finding local help. Just three steps to a completed job.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-slate-800 via-slate-600 to-slate-800 -z-10"></div>

            <ProcessCard step="1" icon="fa-magnifying-glass" title="Search & Compare" desc="Browse verified profiles, read real customer reviews, and check upfront base pricing." />
            <ProcessCard step="2" icon="fa-calendar-check" title="Book Instantly" desc="Select a convenient time slot and secure your booking. No phone calls required." />
            <ProcessCard step="3" icon="fa-shield-halved" title="Secure Payment" desc="The professional completes the work, and you pay securely through our platform." />
          </div>
        </div>
      </section>

      {/* 5. FINAL CALL TO ACTION */}
      <section className="py-24 bg-[#F8FAFC] text-center px-4">
          <div className="max-w-5xl mx-auto bg-white border border-slate-200/60 rounded-[3rem] p-10 md:p-20 shadow-2xl relative overflow-hidden group">
              {/* Decorative backgrounds */}
              <div className="absolute -top-24 -right-24 w-80 h-80 bg-brand/10 rounded-full blur-3xl group-hover:bg-brand/20 transition-colors duration-700"></div>
              <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
              
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter mb-6 relative z-10">
                  Ready to check off your <br className="hidden md:block" /> to-do list?
              </h2>
              <p className="text-slate-500 font-medium text-lg mb-10 max-w-xl mx-auto relative z-10 leading-relaxed">
                  Join thousands of happy households in Surat relying on Sahaayak. Explore the directory today.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 relative z-10">
                  <Link to="/user/search" className="w-full sm:w-auto bg-slate-900 text-white px-10 py-4 rounded-xl font-bold hover:bg-brand transition-all shadow-xl hover:shadow-brand/30 active:scale-95 text-base flex items-center justify-center gap-2">
                      <i className="fa-solid fa-magnifying-glass text-sm"></i> Browse Professionals
                  </Link>
                  <Link to="/signup" className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 px-10 py-4 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all text-base text-center">
                      Create Free Account
                  </Link>
              </div>
          </div>
      </section>

      {/* 6. PREMIUM FOOTER */}
      <footer className="bg-white border-t border-slate-200/60 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
            
            <div className="max-w-xs">
              <Link to="/" className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-sm shadow-md text-white">
                    <i className="fa-solid fa-shield-halved"></i>
                </div>
                Sahaayak<span className="text-brand">.</span>
              </Link>
              <p className="text-slate-500 font-medium text-sm leading-relaxed mb-6">
                The modern operating system for local services. Verified experts, upfront pricing, zero hassle.
              </p>
              <div className="flex gap-3">
                 <a href="#" className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-brand hover:text-white hover:border-brand transition-all shadow-sm active:scale-95"><i className="fa-brands fa-instagram"></i></a>
                 <a href="#" className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-brand hover:text-white hover:border-brand transition-all shadow-sm active:scale-95"><i className="fa-brands fa-x-twitter"></i></a>
                 <a href="#" className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-brand hover:text-white hover:border-brand transition-all shadow-sm active:scale-95"><i className="fa-brands fa-linkedin-in"></i></a>
               </div>
            </div>

            <div className="flex gap-12 md:gap-20 flex-wrap">
                <div>
                    <h6 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-[10px]">Customers</h6>
                    <ul className="space-y-4 text-sm font-bold text-slate-500">
                        <li><Link to="/user/search" className="hover:text-brand transition-colors">Service Directory</Link></li>
                        <li><Link to="/login" className="hover:text-brand transition-colors">Customer Login</Link></li>
                        <li><Link to="/signup" className="hover:text-brand transition-colors">Sign Up Free</Link></li>
                    </ul>
                </div>
                <div>
                    <h6 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-[10px]">Professionals</h6>
                    <ul className="space-y-4 text-sm font-bold text-slate-500">
                        <li><Link to="/provider/register" className="hover:text-brand transition-colors">Join as a Pro</Link></li>
                        <li><Link to="/login" className="hover:text-brand transition-colors">Provider Dashboard</Link></li>
                        <li><a href="#" className="hover:text-brand transition-colors">Success Stories</a></li>
                    </ul>
                </div>
                <div>
                    <h6 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-[10px]">Company</h6>
                    <ul className="space-y-4 text-sm font-bold text-slate-500">
                        <li><a href="#" className="hover:text-brand transition-colors">About Sahaayak</a></li>
                        <li><a href="#" className="hover:text-brand transition-colors">Privacy Policy</a></li>
                        <li><a href="#" className="hover:text-brand transition-colors">Support Center</a></li>
                    </ul>
                </div>
            </div>

          </div>
          
          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
            <p>&copy; {new Date().getFullYear()} Sahaayak Technologies. All rights reserved.</p>
            <p className="flex items-center gap-1.5">Engineered in <i className="fa-solid fa-heart text-red-500 animate-pulse text-xs"></i> Surat</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- SUB COMPONENTS ---

const ServiceCard = ({ onClick, icon, title, desc, color, bg, border }) => (
  <div onClick={onClick} className="group cursor-pointer h-full">
    <div className={`bg-white border ${border} shadow-sm rounded-[2rem] p-6 hover:shadow-xl hover:border-brand/30 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col items-center text-center`}>
      <div className={`w-16 h-16 rounded-2xl ${bg} ${color} flex items-center justify-center text-2xl mb-5 group-hover:scale-110 group-hover:bg-brand group-hover:text-white transition-all duration-300 shadow-inner`}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <h6 className="font-black text-slate-900 mb-1.5 text-lg group-hover:text-brand transition-colors tracking-tight">{title}</h6>
      <p className="text-xs font-medium text-slate-500 leading-relaxed">{desc}</p>
    </div>
  </div>
);

const ProcessCard = ({ step, icon, title, desc }) => (
  <div className="text-center group relative z-10 bg-slate-800/50 backdrop-blur-md p-8 rounded-[2rem] border border-slate-700 hover:border-brand/50 hover:bg-slate-800 transition-all duration-300 hover:-translate-y-2">
    <div className="absolute -top-4 -left-4 w-10 h-10 bg-slate-900 text-slate-400 rounded-xl flex items-center justify-center font-black text-lg border border-slate-700 shadow-lg group-hover:bg-brand group-hover:text-white group-hover:border-brand transition-colors">
        {step}
    </div>
    <div className="w-20 h-20 mx-auto bg-slate-900 text-brand rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner border border-slate-700 group-hover:bg-brand group-hover:text-white transition-all duration-300 group-hover:scale-110">
      <i className={`fa-solid ${icon}`}></i>
    </div>
    <h5 className="text-xl font-black mb-3 tracking-tight">{title}</h5>
    <p className="text-slate-400 font-medium leading-relaxed text-sm">{desc}</p>
  </div>
);

export default LandingPage;