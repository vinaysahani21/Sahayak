import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Redirect unauthenticated users to login when they click a service
  const handleServiceClick = () => {
      navigate('/login');
  };

  return (
    <div className="font-sans bg-[#F8FAFC] min-h-screen selection:bg-brand selection:text-white overflow-x-hidden">
      
      {/* 1. PREMIUM NAVBAR (Frosted Glass) */}
      <nav className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 py-4 transition-all">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          
          {/* Brand */}
          <Link to="/" className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-sm shadow-lg shadow-brand/20 text-white">
                <i className="fa-solid fa-shield-halved"></i>
            </div>
            Sahaayak<span className="text-brand">.</span>
          </Link>
          
          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-slate-600 hover:text-brand transition-colors focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars'} text-2xl`}></i>
          </button>

          {/* Desktop Links */}
          <div className={`absolute top-full left-0 w-full bg-white md:bg-transparent border-b border-slate-100 md:border-0 p-6 md:p-0 md:static md:flex md:items-center md:gap-8 md:w-auto transition-all duration-300 shadow-xl md:shadow-none ${isMenuOpen ? 'block' : 'hidden'}`}>
            <Link to="/provider/register" className="block md:inline-block py-2 text-slate-600 font-bold hover:text-brand transition-colors mb-4 md:mb-0">
              Become a Provider
            </Link>
            <div className="flex flex-col md:flex-row gap-3">
              <Link to="/login" className="px-6 py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all text-center">
                Log In
              </Link>
              <Link to="/signup" className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-brand shadow-lg hover:shadow-brand/30 transition-all text-center active:scale-95">
                Sign Up Free
              </Link>
            </div>
          </div>

        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Abstract Glowing Blobs */}
        <div className="absolute top-20 left-[-10%] w-[40%] h-[60%] bg-blue-400/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] bg-purple-400/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
            
            {/* Left Text */}
            <div className="w-full lg:w-1/2 text-center lg:text-left z-10">
              <div className="inline-block bg-white border border-slate-200 px-4 py-1.5 rounded-full text-xs font-bold text-slate-600 tracking-wider uppercase mb-6 shadow-sm">
                <span className="text-brand mr-2">●</span> The #1 Home Service App
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
                Book trusted local <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-purple-600">experts</span> instantly.
              </h1>
              <p className="text-lg md:text-xl text-slate-500 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                Plumbers, Electricians, Cleaners, and more. Verified professionals at your doorstep with transparent pricing.
              </p>

              {/* Hero Search Bar */}
              <div className="bg-white p-2 border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 max-w-lg mx-auto lg:mx-0 flex items-center transition-all focus-within:border-brand/50 focus-within:ring-4 focus-within:ring-brand/10">
                <i className="fa-solid fa-magnifying-glass text-slate-400 ml-4 text-lg"></i>
                <input 
                  type="text" 
                  className="flex-grow px-4 py-3 outline-none text-slate-900 placeholder:text-slate-400 font-medium bg-transparent" 
                  placeholder="What do you need help with?" 
                  onClick={handleServiceClick} // Redirects on click
                  readOnly
                />
                <button onClick={handleServiceClick} className="bg-slate-900 text-white px-6 md:px-8 py-3 rounded-xl font-bold hover:bg-brand transition-colors shadow-md">
                  Find Pro
                </button>
              </div>
              
              <div className="mt-8 flex items-center justify-center lg:justify-start gap-6 text-sm font-bold text-slate-400">
                  <div className="flex -space-x-3">
                      <img className="w-10 h-10 rounded-full border-2 border-[#F8FAFC]" src="https://ui-avatars.com/api/?name=Alex&background=random" alt="User" />
                      <img className="w-10 h-10 rounded-full border-2 border-[#F8FAFC]" src="https://ui-avatars.com/api/?name=Sam&background=random" alt="User" />
                      <img className="w-10 h-10 rounded-full border-2 border-[#F8FAFC]" src="https://ui-avatars.com/api/?name=Priya&background=random" alt="User" />
                  </div>
                  <p>Trusted by <span className="text-slate-900">10,000+</span> families.</p>
              </div>
            </div>

            {/* Right Image */}
            <div className="w-full lg:w-1/2 relative">
               <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white transform lg:rotate-2 hover:rotate-0 transition-transform duration-700 z-10">
                 <img 
                   src="https://img.freepik.com/free-photo/handsome-young-repairman-holding-tools_1303-18349.jpg?w=996" 
                   alt="Local Services" 
                   className="w-full h-auto object-cover"
                 />
                 {/* Floating Badge */}
                 <div className="absolute bottom-6 left-[-20px] md:left-[-40px] bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-fade-in-up">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl">
                        <i className="fa-solid fa-shield-check"></i>
                    </div>
                    <div>
                        <p className="text-slate-900 font-bold">100% Verified</p>
                        <p className="text-slate-500 text-xs font-medium">Background checked pros</p>
                    </div>
                 </div>
               </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- NEW: TRUST STATS SECTION --- */}
      <section className="border-y border-slate-200 bg-white py-10">
          <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-around gap-8 text-center">
              <div>
                  <h3 className="text-4xl font-black text-slate-900">4.8/5</h3>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-1">Average Rating</p>
              </div>
              <div>
                  <h3 className="text-4xl font-black text-slate-900">500+</h3>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-1">Verified Pros</p>
              </div>
              <div>
                  <h3 className="text-4xl font-black text-slate-900">60 Min</h3>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-1">Average Response</p>
              </div>
              <div>
                  <h3 className="text-4xl font-black text-slate-900">Surat</h3>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-1">Now Live In</p>
              </div>
          </div>
      </section>

      {/* 3. POPULAR SERVICES GRID */}
      <section className="py-24 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold tracking-tight text-slate-900">Services at your fingertips</h3>
            <p className="text-slate-500 mt-3 font-medium text-lg">Click any service to view pricing and availability.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <ServiceCard onClick={handleServiceClick} icon="fa-wrench" title="Plumber" desc="Tap leakage, pipe fix" color="text-blue-600" bg="bg-blue-50" border="border-blue-100" />
            <ServiceCard onClick={handleServiceClick} icon="fa-bolt" title="Electrician" desc="Wiring, switch board" color="text-amber-500" bg="bg-amber-50" border="border-amber-100" />
            <ServiceCard onClick={handleServiceClick} icon="fa-snowflake" title="AC Repair" desc="Gas filling, service" color="text-indigo-600" bg="bg-indigo-50" border="border-indigo-100" />
            <ServiceCard onClick={handleServiceClick} icon="fa-broom" title="Cleaning" desc="Full home deep clean" color="text-emerald-500" bg="bg-emerald-50" border="border-emerald-100" />
            <ServiceCard onClick={handleServiceClick} icon="fa-paint-roller" title="Painting" desc="Wall painting, touchups" color="text-rose-500" bg="bg-rose-50" border="border-rose-100" />
            <ServiceCard onClick={handleServiceClick} icon="fa-hammer" title="Carpenter" desc="Furniture repair & fix" color="text-orange-500" bg="bg-orange-50" border="border-orange-100" />
            <ServiceCard onClick={handleServiceClick} icon="fa-bug" title="Pest Control" desc="Ant, roach, termite" color="text-purple-600" bg="bg-purple-50" border="border-purple-100" />
            <ServiceCard onClick={handleServiceClick} icon="fa-arrow-right" title="View All" desc="Explore 50+ services" color="text-slate-600" bg="bg-slate-100" border="border-slate-200" />
          </div>
        </div>
      </section>

      {/* 4. SERVICES NEAR YOU */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12 gap-4">
            <div>
                <h3 className="text-4xl font-bold tracking-tight text-slate-900 mb-3">Top Rated Pros</h3>
                <p className="text-slate-500 font-medium text-lg">Highly recommended by your neighbors.</p>
            </div>
            <button onClick={handleServiceClick} className="text-brand font-bold hover:text-blue-800 transition-colors flex items-center gap-2 bg-blue-50 px-5 py-2.5 rounded-full">
              Explore Directory <i className="fa-solid fa-arrow-right text-sm"></i>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <ProviderCard 
              onClick={handleServiceClick}
              name="Ravi Plumbing" 
              role="Plumber" 
              desc="Expert in leakages and pipe fitting. Fast and reliable service." 
              rating="4.9"
              reviews="124"
              img="https://ui-avatars.com/api/?name=Ravi+P&background=0f172a&color=fff"
            />
            <ProviderCard 
              onClick={handleServiceClick}
              name="Priya Electronics" 
              role="Electrician" 
              desc="24x7 Inverter & wiring fix. Certified professional." 
              rating="4.8"
              reviews="89"
              img="https://ui-avatars.com/api/?name=Priya+E&background=0f172a&color=fff"
            />
             <ProviderCard 
              onClick={handleServiceClick}
              name="CleanX Crew" 
              role="Cleaning" 
              desc="Deep cleaning experts for sofas, carpets, and full homes." 
              rating="5.0"
              reviews="200+"
              img="https://ui-avatars.com/api/?name=CleanX&background=0f172a&color=fff"
            />
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[100%] bg-brand/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold tracking-tight mb-4">How it Works</h3>
            <p className="text-slate-400 font-medium text-lg">Your to-do list done in three simple steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
            {/* Desktop Connecting Line */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-brand/10 via-brand/50 to-brand/10 -z-10"></div>

            <div className="text-center group">
              <div className="w-24 h-24 mx-auto bg-slate-800 text-brand rounded-3xl flex items-center justify-center text-3xl mb-8 shadow-xl border border-slate-700 group-hover:bg-brand group-hover:text-white transition-all duration-300 transform group-hover:-translate-y-2">
                <i className="fa-solid fa-list-check"></i>
              </div>
              <h5 className="text-xl font-bold mb-3">1. Select Service</h5>
              <p className="text-slate-400 font-medium leading-relaxed">Choose from our wide range of professional services tailored to your needs.</p>
            </div>

            <div className="text-center group">
              <div className="w-24 h-24 mx-auto bg-slate-800 text-brand rounded-3xl flex items-center justify-center text-3xl mb-8 shadow-xl border border-slate-700 group-hover:bg-brand group-hover:text-white transition-all duration-300 transform group-hover:-translate-y-2">
                <i className="fa-regular fa-calendar-check"></i>
              </div>
              <h5 className="text-xl font-bold mb-3">2. Book a Slot</h5>
              <p className="text-slate-400 font-medium leading-relaxed">Pick a date and time that works for you. See upfront pricing instantly.</p>
            </div>

            <div className="text-center group">
              <div className="w-24 h-24 mx-auto bg-slate-800 text-brand rounded-3xl flex items-center justify-center text-3xl mb-8 shadow-xl border border-slate-700 group-hover:bg-brand group-hover:text-white transition-all duration-300 transform group-hover:-translate-y-2">
                <i className="fa-solid fa-house-circle-check"></i>
              </div>
              <h5 className="text-xl font-bold mb-3">3. Job Done</h5>
              <p className="text-slate-400 font-medium leading-relaxed">A verified professional arrives, completes the work, and you pay securely.</p>
            </div>

          </div>
        </div>
      </section>

      {/* --- NEW: FINAL CALL TO ACTION --- */}
      <section className="py-24 bg-white text-center px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-[3rem] p-10 md:p-16 shadow-lg shadow-blue-900/5 relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand/10 rounded-full blur-3xl"></div>
              
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6 relative z-10">
                  Ready to check off your <br /> to-do list?
              </h2>
              <p className="text-slate-500 font-medium text-lg mb-10 max-w-xl mx-auto relative z-10">
                  Join thousands of happy customers in Surat. Sign up for free and get ₹100 off your first booking.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
                  <button onClick={handleServiceClick} className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-brand transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95 text-lg">
                      Create Free Account
                  </button>
                  <Link to="/provider/register" className="bg-white border-2 border-slate-200 text-slate-700 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all text-lg">
                      Join as a Professional
                  </Link>
              </div>
          </div>
      </section>

      {/* 6. PREMIUM FOOTER */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
            
            <div className="max-w-xs">
              <Link to="/" className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-sm shadow-md text-white">
                    <i className="fa-solid fa-shield-halved"></i>
                </div>
                Sahaayak<span className="text-brand">.</span>
              </Link>
              <p className="text-slate-500 font-medium text-sm leading-relaxed mb-6">
                Empowering local service providers and simplifying your daily chores. Verified, fast, and reliable.
              </p>
              <div className="flex gap-3">
                 <a href="#" className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-brand hover:text-white hover:border-brand transition-colors"><i className="fa-brands fa-instagram"></i></a>
                 <a href="#" className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-brand hover:text-white hover:border-brand transition-colors"><i className="fa-brands fa-x-twitter"></i></a>
                 <a href="#" className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-brand hover:text-white hover:border-brand transition-colors"><i className="fa-brands fa-facebook-f"></i></a>
               </div>
            </div>

            <div className="flex gap-16 flex-wrap">
                <div>
                    <h6 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-sm">Customers</h6>
                    <ul className="space-y-4 text-sm font-medium text-slate-500">
                        <li><button onClick={handleServiceClick} className="hover:text-brand transition-colors">Book a Service</button></li>
                        <li><button onClick={handleServiceClick} className="hover:text-brand transition-colors">How it Works</button></li>
                        <li><a href="#" className="hover:text-brand transition-colors">Safety Guarantee</a></li>
                    </ul>
                </div>
                <div>
                    <h6 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-sm">Providers</h6>
                    <ul className="space-y-4 text-sm font-medium text-slate-500">
                        <li><Link to="/provider/register" className="hover:text-brand transition-colors">Join as a Pro</Link></li>
                        <li><Link to="/provider/login" className="hover:text-brand transition-colors">Provider Login</Link></li>
                        <li><a href="#" className="hover:text-brand transition-colors">Success Stories</a></li>
                    </ul>
                </div>
                <div>
                    <h6 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-sm">Company</h6>
                    <ul className="space-y-4 text-sm font-medium text-slate-500">
                        <li><a href="#" className="hover:text-brand transition-colors">About Us</a></li>
                        <li><a href="#" className="hover:text-brand transition-colors">Terms & Privacy</a></li>
                        <li><a href="#" className="hover:text-brand transition-colors">Contact Support</a></li>
                        <li><Link to="/admin/login" className="hover:text-brand transition-colors">Admin Login</Link></li>
                    </ul>
                </div>
            </div>

          </div>
          
          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 font-medium text-sm">
            <p>&copy; {new Date().getFullYear()} Sahaayak Platforms Inc. All rights reserved.</p>
            <p>Made with <i className="fa-solid fa-heart text-red-500 mx-1 animate-pulse"></i> in Surat.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- SUB COMPONENTS ---

const ServiceCard = ({ onClick, icon, title, desc, color, bg, border }) => (
  <div onClick={onClick} className="group cursor-pointer">
    <div className={`bg-white border ${border} shadow-sm rounded-[2rem] p-6 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 h-full flex flex-col items-center text-center`}>
      <div className={`w-16 h-16 rounded-2xl ${bg} ${color} flex items-center justify-center text-3xl mb-5 group-hover:scale-110 transition-transform`}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <h6 className="font-bold text-slate-900 mb-1.5 text-lg group-hover:text-brand transition-colors">{title}</h6>
      <p className="text-sm font-medium text-slate-500">{desc}</p>
    </div>
  </div>
);

const ProviderCard = ({ onClick, name, role, desc, rating, reviews, img }) => (
  <div onClick={onClick} className="bg-white border border-slate-100 shadow-sm rounded-[2rem] p-6 hover:shadow-xl hover:border-slate-200 hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full cursor-pointer group">
    <div className="flex gap-4 mb-5">
      <img src={img} alt={name} className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shadow-sm" />
      <div className="pt-1">
        <h6 className="font-bold text-slate-900 text-lg group-hover:text-brand transition-colors">{name}</h6>
        <div className="text-brand text-xs font-bold uppercase tracking-wider">{role}</div>
      </div>
    </div>
    
    <p className="text-slate-500 text-sm mb-6 flex-grow leading-relaxed font-medium">{desc}</p>
    
    <div className="flex justify-between items-center border-t border-slate-100 pt-5 mt-auto">
      <div className="text-xs text-slate-500 font-bold flex items-center gap-1.5">
          <i className="fa-solid fa-circle-check text-blue-500 text-sm"></i> Background Checked
      </div>
      <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
          <i className="fa-solid fa-star text-amber-500 text-[10px]"></i>
          <span className="text-xs font-bold text-slate-700">{rating} <span className="text-slate-400">({reviews})</span></span>
      </div>
    </div>
  </div>
);

export default LandingPage;