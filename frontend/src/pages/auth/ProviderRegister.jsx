import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../constants/api';
import Dialog from '../../components/ui/Dialog';

const ProviderRegister = () => {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); 

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    address: '', city: '',
    profession: '', experience_years: '', bio: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateStep = () => {
    if (step === 1) {
        if (!formData.name || !formData.phone || !formData.email || !formData.password) return alert("Please fill all Personal Details"), false;
        if (formData.password !== formData.confirmPassword) return alert("Passwords do not match"), false;
    }
    if (step === 2) {
        if (!formData.address || !formData.city) return alert("Please fill Address Details"), false;
    }
    if (step === 3) {
        if (!formData.profession || !formData.experience_years) return alert("Please fill Work Profile"), false;
    }
    return true;
  };

  const handleNext = () => validateStep() && setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/register_provider.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: 'provider' })
      });
      const data = await response.json();
      if (data.status === 'success') setShowSuccessModal(true);
      else alert(data.message || "Registration Failed");
    } catch (error) { alert("Server Error"); } 
    finally { setLoading(false); }
  };

  // Premium Input Classes
  const inputClass = "w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition-all placeholder:text-slate-400 text-slate-900 font-medium bg-slate-50 hover:bg-slate-100 focus:bg-white";
  const labelClass = "block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 md:p-8 font-sans selection:bg-brand selection:text-white">
      
      <button 
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 flex items-center justify-center w-12 h-12 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-brand hover:shadow-md transition-all z-20"
      >
        <i className="fa-solid fa-arrow-left"></i>
      </button>

      <div className="flex w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden my-8">
        
        {/* LEFT SIDE (Stepper) */}
        <div className="hidden md:flex flex-col w-5/12 bg-slate-900 text-white p-12 relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-blue-500/20 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="relative z-10 h-full flex flex-col">
                <div>
                    <div className="w-12 h-12 bg-brand rounded-xl flex items-center justify-center text-xl shadow-lg shadow-brand/20 text-white mb-6">
                        <i className="fa-solid fa-briefcase"></i>
                    </div>
                    <h3 className="text-3xl font-bold tracking-tight mb-2">Partner Signup</h3>
                    <p className="text-slate-400 font-medium mb-12">Join our network of verified professionals in 3 simple steps.</p>
                </div>

                {/* Vertical Stepper */}
                <div className="flex flex-col gap-6 flex-grow">
                    {[
                      { num: 1, label: "Personal Info", icon: "fa-user" },
                      { num: 2, label: "Location", icon: "fa-location-dot" },
                      { num: 3, label: "Work Profile", icon: "fa-clipboard-list" }
                    ].map((s) => (
                      <div key={s.num} className="relative flex items-center gap-5 group">
                          {s.num !== 3 && <div className={`absolute left-[22px] top-[45px] w-[2px] h-[30px] ${step > s.num ? 'bg-brand' : 'bg-slate-700'}`}></div>}
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold z-10 transition-colors ${
                              step > s.num ? 'bg-brand text-white shadow-lg shadow-brand/30' : 
                              step === s.num ? 'bg-white text-slate-900 shadow-md' : 'bg-slate-800 text-slate-500 border border-slate-700'
                          }`}>
                              {step > s.num ? <i className="fa-solid fa-check"></i> : <i className={`fa-solid ${s.icon} text-sm`}></i>}
                          </div>
                          <span className={`font-bold tracking-wide ${step >= s.num ? 'text-white' : 'text-slate-500'}`}>{s.label}</span>
                      </div>
                    ))}
                </div>

                <div className="mt-auto pt-8 border-t border-slate-800">
                    <p className="text-slate-400 text-sm font-medium mb-2">Already registered?</p>
                    <Link to="/login" className="text-white font-bold hover:text-brand transition-colors flex items-center gap-2">
                        Login to Dashboard <i className="fa-solid fa-arrow-right text-sm"></i>
                    </Link>
                </div>
            </div>
        </div>

        {/* RIGHT SIDE (Forms) */}
        <div className="w-full md:w-7/12 p-8 md:p-12 lg:p-16 relative bg-white flex flex-col justify-center min-h-[600px]">
            
            <div className="animate-fade-in-up">
                {/* === STEP 1: PERSONAL === */}
                {step === 1 && (
                    <div className="space-y-5">
                        <div className="mb-8">
                            <h4 className="text-3xl font-bold text-slate-900 tracking-tight">Who are you?</h4>
                            <p className="text-slate-500 font-medium mt-1">Let's start with the basics.</p>
                        </div>
                        <div>
                            <label className={labelClass}>Full Name</label>
                            <input type="text" name="name" className={inputClass} value={formData.name} onChange={handleChange} placeholder="e.g. Rajesh Kumar" />
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className={labelClass}>Phone</label>
                                <input type="tel" name="phone" className={inputClass} value={formData.phone} onChange={handleChange} placeholder="9876543210" maxLength={10} />
                            </div>
                            <div>
                                <label className={labelClass}>Email</label>
                                <input type="email" name="email" className={inputClass} value={formData.email} onChange={handleChange} placeholder="rajesh@example.com" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className={labelClass}>Password</label>
                                <input type="password" name="password" className={inputClass} value={formData.password} onChange={handleChange} placeholder="••••••••" />
                            </div>
                            <div>
                                <label className={labelClass}>Confirm Password</label>
                                <input type="password" name="confirmPassword" className={inputClass} value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" />
                            </div>
                        </div>
                    </div>
                )}

                {/* === STEP 2: LOCATION === */}
                {step === 2 && (
                    <div className="space-y-5">
                        <div className="mb-8">
                            <h4 className="text-3xl font-bold text-slate-900 tracking-tight">Where are you based?</h4>
                            <p className="text-slate-500 font-medium mt-1">So customers can find you nearby.</p>
                        </div>
                        <div>
                            <label className={labelClass}>Full Operating Address</label>
                            <textarea name="address" className={`${inputClass} resize-none`} rows="3" value={formData.address} onChange={handleChange} placeholder="Shop No, Area, Landmark"></textarea>
                        </div>
                        <div className="relative">
                            <label className={labelClass}>City of Operation</label>
                            <select name="city" className={`${inputClass} cursor-pointer appearance-none`} value={formData.city} onChange={handleChange}>
                                <option value="">Select City...</option>
                                <option>Surat</option>
                                <option>Ahmedabad</option>
                                <option>Vadodara</option>
                            </select>
                            <i className="fa-solid fa-chevron-down absolute right-5 top-[45px] text-slate-400 pointer-events-none text-sm"></i>
                        </div>
                    </div>
                )}

                {/* === STEP 3: WORK === */}
                {step === 3 && (
                    <div className="space-y-5">
                        <div className="mb-8">
                            <h4 className="text-3xl font-bold text-slate-900 tracking-tight">What do you do?</h4>
                            <p className="text-slate-500 font-medium mt-1">Highlight your skills and experience.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <div className="relative">
                                <label className={labelClass}>Profession</label>
                                <select name="profession" className={`${inputClass} cursor-pointer appearance-none`} value={formData.profession} onChange={handleChange}>
                                    <option value="">Select Category...</option>
                                    <option>Plumber</option>
                                    <option>Electrician</option>
                                    <option>Carpenter</option>
                                    <option>Cleaning</option>
                                    <option>AC Repair</option>
                                </select>
                                <i className="fa-solid fa-chevron-down absolute right-5 top-[45px] text-slate-400 pointer-events-none text-sm"></i>
                            </div>
                            <div>
                                <label className={labelClass}>Experience (Years)</label>
                                <input type="number" name="experience_years" className={inputClass} value={formData.experience_years} onChange={handleChange} placeholder="e.g. 5" min="0" />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Short Bio (Make it stand out)</label>
                            <textarea name="bio" className={`${inputClass} resize-none`} rows="3" value={formData.bio} onChange={handleChange} placeholder="e.g. Expert in pipe fitting and leak repairs with 5+ years of trusted service..."></textarea>
                        </div>
                    </div>
                )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-between items-center mt-10 pt-6 border-t border-slate-100">
                {step > 1 ? (
                    <button className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors" onClick={handleBack}>
                        Back
                    </button>
                ) : <div></div>}

                {step < 3 ? (
                    <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-md active:scale-95 flex items-center gap-2" onClick={handleNext}>
                        Continue <i className="fa-solid fa-arrow-right text-sm"></i>
                    </button>
                ) : (
                    <button 
                        className="bg-brand text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-brand/20 active:scale-95 disabled:opacity-70 flex items-center gap-2" 
                        onClick={handleSubmit} disabled={loading}
                    >
                        {loading ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Submitting...</> : "Complete Signup"}
                    </button>
                )}
            </div>

        </div>
      </div>

      {/* === SUCCESS DIALOG === */}
      <Dialog isOpen={showSuccessModal} onClose={() => navigate('/login')} title="">
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 border-4 border-green-100 text-green-500 text-4xl">
             <i className="fa-solid fa-check"></i>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Welcome Aboard!</h3>
          <p className="text-slate-500 font-medium mb-8 max-w-sm mx-auto">
            Your partner account has been created. Log in now to start accepting jobs and earning money.
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-black transition-all shadow-lg active:scale-[0.98]"
          >
            Login to Dashboard
          </button>
        </div>
      </Dialog>
    </div>
  );
};

export default ProviderRegister;