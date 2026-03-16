import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from '../../constants/api'; 
import Dialog from '../../components/ui/Dialog';

const Registration = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "",
    house: "", building: "", area: "", city: "",
    password: "", confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!formData.name.trim()) newErrors.name = "Required";
    if (!formData.email) newErrors.email = "Required";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email";
    
    if (!formData.phone) newErrors.phone = "Required";
    else if (!phoneRegex.test(formData.phone)) newErrors.phone = "Invalid number";

    if (!formData.house.trim()) newErrors.house = "Required";
    if (!formData.building.trim()) newErrors.building = "Required";
    if (!formData.area.trim()) newErrors.area = "Required";
    if (!formData.city) newErrors.city = "Required";

    if (!formData.password) newErrors.password = "Required";
    else if (formData.password.length < 6) newErrors.password = "Min 6 chars";

    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Mismatch";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    const fullAddress = `${formData.house}, ${formData.building}, ${formData.area}, ${formData.city}`;

    const payload = {
      name: formData.name, email: formData.email, phone: formData.phone,
      address: fullAddress, locality: formData.area, password: formData.password
    };

    try {
      const response = await fetch(`${API_BASE_URL}registration.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.status === "success") {
        setShowSuccessModal(true);
        setTimeout(() => navigate("/login"), 2000);
      } else {
        alert(data.message); 
      }
    } catch (error) {
      alert("Server Connection Error");
    } finally {
      setLoading(false);
    }
  };

  // Premium Input Classes
  const inputClass = "w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition-all placeholder:text-slate-400 text-slate-900 font-medium bg-slate-50 hover:bg-slate-100 focus:bg-white";
  const labelClass = "block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2";
  const errorClass = "text-[10px] font-bold text-red-500 mt-1 absolute -bottom-4";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 md:p-8 font-sans selection:bg-brand selection:text-white">
      
      <button 
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 flex items-center justify-center w-12 h-12 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-brand hover:shadow-md transition-all z-20"
      >
        <i className="fa-solid fa-arrow-left"></i>
      </button>

      <div className="flex w-full max-w-6xl bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden my-8">
        
        {/* LEFT SIDE (Brand) */}
        <div className="hidden lg:flex flex-col justify-center items-center w-5/12 bg-slate-900 text-white p-12 relative overflow-hidden">
           <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>
           <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-brand/20 rounded-full blur-[80px] pointer-events-none"></div>

           <div className="relative z-10 text-center">
               <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-brand/20 text-white mx-auto mb-6">
                   <i className="fa-solid fa-user-plus"></i>
               </div>
               <h2 className="text-4xl font-bold tracking-tight mb-4">Join Sahaayak</h2>
               <p className="text-slate-400 mb-10 leading-relaxed font-medium px-4">
                 Create a free account to book expert home services, track professionals, and manage your household needs.
               </p>
               <Link 
                 to="/login" 
                 className="px-8 py-3.5 rounded-xl border border-slate-700 text-white font-bold hover:bg-white hover:text-slate-900 transition-all duration-300"
               >
                 Log In Instead
               </Link>
           </div>
        </div>

        {/* RIGHT SIDE (Form) */}
        <div className="w-full lg:w-7/12 p-8 md:p-12 lg:p-16 relative bg-white">
          
          <div className="text-center md:text-left mb-10">
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Create your account</h3>
            <p className="text-slate-500 font-medium mt-2">Join thousands of happy customers in Surat</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="relative pb-4">
              <label className={labelClass}>Full Name</label>
              <input type="text" name="name" className={inputClass} onChange={handleChange} placeholder="e.g. Rahul Sharma" />
              {errors.name && <p className={errorClass}>{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
              <div className="relative">
                <label className={labelClass}>Email Address</label>
                <input type="email" name="email" className={inputClass} onChange={handleChange} placeholder="rahul@example.com" />
                {errors.email && <p className={errorClass}>{errors.email}</p>}
              </div>
              <div className="relative">
                <label className={labelClass}>Mobile Number</label>
                <input type="tel" name="phone" className={inputClass} onChange={handleChange} placeholder="9876543210" maxLength={10} />
                {errors.phone && <p className={errorClass}>{errors.phone}</p>}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
               <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Primary Address Details</p>
               
               <div className="grid grid-cols-2 gap-6 mb-6 pb-4">
                  <div className="relative">
                    <label className={labelClass}>House / Flat No</label>
                    <input type="text" name="house" className={inputClass} onChange={handleChange} placeholder="A-101" />
                    {errors.house && <p className={errorClass}>{errors.house}</p>}
                  </div>
                  <div className="relative">
                    <label className={labelClass}>Building / Society</label>
                    <input type="text" name="building" className={inputClass} onChange={handleChange} placeholder="Gokul Dham" />
                    {errors.building && <p className={errorClass}>{errors.building}</p>}
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-6 pb-4">
                  <div className="relative">
                    <label className={labelClass}>Area (Locality)</label>
                    <input type="text" name="area" className={inputClass} onChange={handleChange} placeholder="Adajan" />
                    {errors.area && <p className={errorClass}>{errors.area}</p>}
                  </div>
                  <div className="relative">
                    <label className={labelClass}>City</label>
                    <select name="city" className={`${inputClass} cursor-pointer appearance-none`} onChange={handleChange}>
                        <option value="">Select City...</option>
                        <option value="Surat">Surat</option>
                        <option value="Ahmedabad">Ahmedabad</option>
                        <option value="Vadodara">Vadodara</option>
                    </select>
                    <i className="fa-solid fa-chevron-down absolute right-5 top-[45px] text-slate-400 pointer-events-none text-sm"></i>
                    {errors.city && <p className={errorClass}>{errors.city}</p>}
                  </div>
               </div>
            </div>

            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
               <div className="relative">
                  <label className={labelClass}>Create Password</label>
                  <input type="password" name="password" className={inputClass} onChange={handleChange} placeholder="••••••••" />
                  {errors.password && <p className={errorClass}>{errors.password}</p>}
               </div>
               <div className="relative">
                  <label className={labelClass}>Confirm Password</label>
                  <input type="password" name="confirmPassword" className={inputClass} onChange={handleChange} placeholder="••••••••" />
                  {errors.confirmPassword && <p className={errorClass}>{errors.confirmPassword}</p>}
               </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit" disabled={loading}
                className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-lg shadow-slate-900/20 disabled:opacity-70 flex justify-center items-center gap-2 active:scale-[0.98]"
              >
                {loading ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Creating Account...</> : "Complete Registration"}
              </button>
            </div>

            <p className="text-center text-sm font-medium text-slate-600 lg:hidden mt-6">
              Already have an account? <Link to="/login" className="text-brand font-bold hover:underline">Login</Link>
            </p>

          </form>
        </div>
      </div>

       <Dialog isOpen={showSuccessModal} onClose={() => {}} title="">
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 border-4 border-green-100 text-green-500 text-4xl">
             <i className="fa-solid fa-check"></i>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Account Created!</h3>
          <p className="text-slate-500 font-medium mb-6">Welcome to Sahaayak. Redirecting to login...</p>
          <div className="animate-spin h-8 w-8 border-4 border-slate-200 border-t-brand rounded-full"></div>
        </div>
      </Dialog>

    </div>
  );
};

export default Registration;