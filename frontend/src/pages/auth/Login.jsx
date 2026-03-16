import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_ENDPOINTS, ROLES } from '../../constants/api';
import Dialog from '../../components/ui/Dialog';

const Login = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loginMethod, setLoginMethod] = useState("email");

  const [formData, setFormData] = useState({ email: "", password: "", phone: "", otp: "" });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name] || errors.form) {
      setErrors({ ...errors, [e.target.name]: "", form: "" });
    }
  };

  const handleSuccess = (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    setShowSuccessModal(true);
    setLoading(false);

    setTimeout(() => {
      switch (user.role) {
        case ROLES.ADMIN: navigate("/admin/dashboard"); break;
        case ROLES.PROVIDER: navigate("/provider/dashboard"); break;
        case ROLES.CUSTOMER: navigate("/user/home"); break;
        default: navigate("/");
      }
    }, 2000);
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!formData.email || !formData.password) {
      setErrors({ form: "Please fill all fields" });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_ENDPOINTS.LOGIN}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.status === "success") handleSuccess(data.user);
      else {
        setErrors({ form: data.message || "Login failed." });
        setLoading(false);
      }
    } catch (error) {
      setErrors({ form: "Server connection failed.", error });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 md:p-8 font-sans selection:bg-brand selection:text-white">
      
      <button 
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 flex items-center justify-center w-12 h-12 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-brand hover:shadow-md transition-all z-20"
      >
        <i className="fa-solid fa-arrow-left"></i>
      </button>

      <div className="flex w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden min-h-[600px]">
        
        {/* LEFT SIDE (Brand Section) */}
        <div className="hidden md:flex flex-col justify-center items-center w-5/12 bg-slate-900 text-white p-12 relative overflow-hidden">
          <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-brand/20 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/20 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="relative z-10 text-center">
              <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-brand/20 text-white mx-auto mb-6">
                  <i className="fa-solid fa-shield-halved"></i>
              </div>
              <h2 className="text-4xl font-bold tracking-tight mb-4">Welcome Back</h2>
              <p className="text-slate-400 mb-10 leading-relaxed font-medium px-4">
                Access your dashboard to manage bookings, track services, and update your profile.
              </p>
              <Link 
                to="/signup" 
                className="px-8 py-3.5 rounded-xl border border-slate-700 text-white font-bold hover:bg-white hover:text-slate-900 transition-all duration-300"
              >
                Create New Account
              </Link>
          </div>
        </div>

        {/* RIGHT SIDE (Form Section) */}
        <div className="w-full md:w-7/12 p-8 md:p-16 flex flex-col justify-center bg-white">
          
          <div className="text-center md:text-left mb-10">
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Sign in to Sahaayak</h3>
            <p className="text-slate-500 font-medium mt-2">Enter your credentials to continue</p>
          </div>

          {errors.form && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-2xl mb-8 flex items-center gap-3 text-sm font-bold animate-fade-in">
              <i className="fa-solid fa-circle-exclamation text-lg"></i>
              <p>{errors.form}</p>
            </div>
          )}

          <div className="flex bg-slate-100 p-1.5 rounded-xl mb-8">
            <button
              onClick={() => setLoginMethod('email')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                loginMethod === 'email' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Email Login
            </button>
            <button
              onClick={() => setLoginMethod('phone')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                loginMethod === 'phone' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Phone Login
            </button>
          </div>

          {loginMethod === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                    <i className="fa-solid fa-envelope absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input 
                      type="email" name="email" value={formData.email} onChange={handleChange} placeholder="name@example.com" disabled={loading}
                      className="w-full pl-12 pr-5 py-4 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition-all placeholder:text-slate-400 text-slate-900 font-medium bg-slate-50 hover:bg-slate-100 focus:bg-white"
                    />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                  <a href="#" className="text-xs font-bold text-brand hover:underline">Forgot password?</a>
                </div>
                <div className="relative">
                    <i className="fa-solid fa-lock absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input 
                      type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" disabled={loading}
                      className="w-full pl-12 pr-5 py-4 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition-all placeholder:text-slate-400 text-slate-900 font-medium bg-slate-50 hover:bg-slate-100 focus:bg-white"
                    />
                </div>
              </div>

              <button 
                type="submit" disabled={loading}
                className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-lg shadow-slate-900/20 disabled:opacity-70 flex justify-center items-center gap-2 mt-4 active:scale-[0.98]"
              >
                {loading ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Authenticating...</> : "Secure Login"}
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-sm font-medium text-slate-600 md:hidden">
            Don't have an account? <Link to="/signup" className="text-brand font-bold hover:underline ml-1">Sign up</Link>
          </p>

        </div>
      </div>

      <Dialog isOpen={showSuccessModal} onClose={() => {}} title="">
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 border-4 border-green-100 text-green-500 text-4xl">
             <i className="fa-solid fa-check"></i>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Login Successful!</h3>
          <p className="text-slate-500 font-medium mb-6">Preparing your secure workspace...</p>
          <div className="animate-spin h-8 w-8 border-4 border-slate-200 border-t-brand rounded-full"></div>
        </div>
      </Dialog>
    </div>
  );
};

export default Login;