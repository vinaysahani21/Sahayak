import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../../constants/api';
import Dialog from '../../components/ui/Dialog';

const ProviderProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
  const fileInputRef = useRef(null);

  // --- STATE ---
  const [stats, setStats] = useState({ total_earnings: 0, total_jobs: 0, rating: 0 });
  const [showEdit, setShowEdit] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingPic, setIsUploadingPic] = useState(false);

  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    profession: user.profession || '',
    experience_years: user.experience_years || 0,
    bio: user.bio || ''
  });

  // --- FETCH REAL STATS ---
  useEffect(() => {
    if (!user.id) {
        navigate('/login');
        return;
    }
  const fetchStats = async () => {
      try {
          const res = await fetch(`${API_BASE_URL}/provider/get_provider_dashboard.php?provider_id=${user.id}`);
          const text = await res.text();
          try {
              const result = JSON.parse(text);
              if(result.status === 'success' && result.data.stats) {
                  setStats(result.data.stats);
              }
          } catch (parseError) {
              console.error("PHP Error:", text); 
          }
      } catch(err) { console.error("Error fetching stats", err); }
  };
    fetchStats();
  }, [user.id, navigate]);

  // --- ACTIONS ---
  const confirmLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
        const res = await fetch(`${API_BASE_URL}/provider/update_profile.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, id: user.id })
        });
        const data = await res.json();
        
        if(data.status === 'success') {
            const updatedUser = { ...user, ...formData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setShowEdit(false);
        } else {
            alert(data.message || "Failed to update profile.");
        }
    } catch(err) { 
        alert("Server error during update."); 
    } finally {
        setIsUpdating(false);
    }
  };

  const handlePicChange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) return alert('Please select a valid image file (JPG, PNG).');
      if (file.size > 2 * 1024 * 1024) return alert('Image size must be less than 2MB.');

      setIsUploadingPic(true);
      const uploadData = new FormData();
      uploadData.append('profile_image', file);
      uploadData.append('user_id', user.id);

      try {
          const res = await fetch(`${API_BASE_URL}/provider/upload_profile_pic.php`, {
              method: 'POST',
              body: uploadData
          });
          const data = await res.json();

          if (data.status === 'success') {
              const updatedUser = { ...user, profile_img: data.image_url };
              localStorage.setItem('user', JSON.stringify(updatedUser));
              setUser(updatedUser);
          } else {
              alert(data.message || "Failed to upload image.");
          }
      } catch (err) {
          alert("Server error during image upload.");
      } finally {
          setIsUploadingPic(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
      }
  };

  // Helper
  const getImg = (img) => (!img || img.includes('default')) ? `https://ui-avatars.com/api/?name=${user.name}&background=0f172a&color=fff&size=200` : (img.startsWith('http') ? img : `${API_BASE_URL}${img}`);

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans text-slate-800 pb-24 selection:bg-brand selection:text-white">
      
      {/* --- PREMIUM HEADER --- */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm sticky top-0 z-30 px-6 md:px-8 py-5 flex justify-between items-center transition-all">
          <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Account</h2>
          </div>
          <button 
            onClick={() => setShowEdit(true)}
            className="text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 px-5 py-2.5 rounded-full transition-colors flex items-center gap-2 active:scale-95"
          >
              <i className="fa-solid fa-pen-to-square"></i> Edit
          </button>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">

        {/* --- SECTION 1: PROFILE BANNER & CARD --- */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden relative">
          
          <div className="h-40 md:h-48 bg-slate-900 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-black opacity-90"></div>
             <div className="absolute top-[-30%] right-[10%] w-[50%] h-[150%] bg-blue-500/20 blur-[80px] rounded-full pointer-events-none"></div>
             <div className="absolute bottom-[-30%] left-[-10%] w-[60%] h-[150%] bg-brand/20 blur-[100px] rounded-full pointer-events-none"></div>
          </div>

          <div className="px-6 md:px-10 pb-8 relative z-10">
            
            <div className="absolute -top-20 flex items-end">
              <div className="relative group">
                <img
                  src={getImg(user.profile_img)}
                  alt="Profile"
                  className={`w-32 h-32 md:w-40 md:h-40 rounded-[2rem] border-4 border-white shadow-xl object-cover bg-white transition-all duration-300 ${isUploadingPic ? 'opacity-50 blur-sm' : 'opacity-100'}`}
                />

                {isUploadingPic && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <i className="fa-solid fa-circle-notch fa-spin text-3xl text-brand drop-shadow-md"></i>
                    </div>
                )}

                {!isUploadingPic && (
                    <label 
                        htmlFor="profilePicInput" 
                        className="absolute -bottom-2 -right-2 bg-slate-900 text-white w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer shadow-lg hover:bg-brand transition-all border-4 border-white z-20 group-hover:scale-105 active:scale-95"
                        title="Change Profile Picture"
                    >
                        <i className="fa-solid fa-camera"></i>
                    </label>
                )}
                <input type="file" id="profilePicInput" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg, image/jpg" onChange={handlePicChange}/>
              </div>
            </div>

            <div className="pt-20 md:pt-24 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6">
               <div>
                  <h4 className="text-3xl font-bold text-slate-900 mb-1.5 flex items-center gap-2 justify-center sm:justify-start tracking-tight">
                      {user.name}
                      {user.is_verified == 1 && <i className="fa-solid fa-circle-check text-blue-500 text-2xl shadow-sm rounded-full bg-white" title="Verified Provider"></i>}
                  </h4>
                  <p className="text-sm font-bold text-brand uppercase tracking-wider mb-4">
                    {user.profession || 'Professional Provider'} • <span className="text-slate-500">{user.experience_years} Years Exp</span>
                  </p>
                  {user.bio && (
                      <p className="text-sm text-slate-600 font-medium max-w-xl italic leading-relaxed">"{user.bio}"</p>
                  )}
               </div>

               <div className="flex gap-3">
                  <span className="bg-amber-50 text-amber-600 border border-amber-100 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-sm">
                      <i className="fa-solid fa-star"></i> {parseFloat(stats.rating || 0).toFixed(1)}
                  </span>
                  <span className="bg-slate-50 text-slate-600 border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-sm">
                      <i className="fa-solid fa-briefcase"></i> {stats.total_jobs} Jobs
                  </span>
               </div>
            </div>
          </div>
        </div>

        {/* --- SECTION 2: BUSINESS STATS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Lifetime Earnings</p>
              <h5 className="text-3xl font-black text-slate-900 tracking-tight">₹{parseFloat(stats.total_earnings || 0).toLocaleString()}</h5>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-wallet"></i>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/provider/schedule?tab=history')}>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Total Bookings</p>
              <h5 className="text-3xl font-black text-slate-900 tracking-tight">{stats.total_jobs}</h5>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-clipboard-check"></i>
            </div>
          </div>
        </div>

        {/* --- SECTION 3: MENU LINKS --- */}
        <h6 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4">Workspace & Account</h6>
        
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
            <Link to="/provider/services" className="flex items-center justify-between p-5 md:p-6 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-4 md:gap-6">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-brand group-hover:shadow-sm transition-all text-lg">
                        <i className="fa-solid fa-layer-group"></i>
                    </div>
                    <span className="font-bold text-slate-700 group-hover:text-slate-900">Manage Catalog</span>
                </div>
                <i className="fa-solid fa-chevron-right text-sm text-slate-300 group-hover:text-brand transition-colors"></i>
            </Link>

            <Link to="/provider/earnings" className="flex items-center justify-between p-5 md:p-6 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-4 md:gap-6">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-emerald-500 group-hover:shadow-sm transition-all text-lg">
                        <i className="fa-solid fa-building-columns"></i>
                    </div>
                    <span className="font-bold text-slate-700 group-hover:text-slate-900">Bank & Payouts</span>
                </div>
                <i className="fa-solid fa-chevron-right text-sm text-slate-300 group-hover:text-brand transition-colors"></i>
            </Link>

            <button onClick={() => setShowLogoutDialog(true)} className="w-full flex items-center justify-between p-5 md:p-6 hover:bg-red-50 transition-colors group">
                <div className="flex items-center gap-4 md:gap-6">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-red-500 group-hover:shadow-sm transition-all text-lg">
                        <i className="fa-solid fa-right-from-bracket"></i>
                    </div>
                    <span className="font-bold text-slate-700 group-hover:text-red-600 transition-colors">Secure Logout</span>
                </div>
            </button>
        </div>

        <div className="text-center text-[10px] font-bold text-slate-400 mt-10 tracking-widest uppercase opacity-70">
          Sahaayak Pro v2.0 <br />
          Designed for Experts.
        </div>

      </div>

      {/* ================= MODAL 1: EDIT PROFILE ================= */}
      <Dialog isOpen={showEdit} onClose={() => setShowEdit(false)} title="Update Profile Details">
          <form onSubmit={handleUpdate} className="p-6 md:p-8 space-y-5">
              <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Full Name</label>
                  <input type="text" className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none text-slate-900 font-bold bg-slate-50 transition-all placeholder:text-slate-400" value={formData.name} onChange={(e)=>setFormData({...formData, name:e.target.value})} required/>
              </div>

              <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Professional Title</label>
                  <input type="text" className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none text-slate-900 font-bold bg-slate-50 transition-all placeholder:text-slate-400" placeholder="e.g. Master Electrician" value={formData.profession} onChange={(e)=>setFormData({...formData, profession:e.target.value})} required/>
              </div>

              <div className="grid grid-cols-2 gap-5">
                  <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Phone</label>
                      <input type="tel" className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none text-slate-900 font-bold bg-slate-50 transition-all placeholder:text-slate-400" value={formData.phone} onChange={(e)=>setFormData({...formData, phone:e.target.value})} required/>
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Exp. (Yrs)</label>
                      <input type="number" className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none text-slate-900 font-bold bg-slate-50 transition-all placeholder:text-slate-400" value={formData.experience_years} onChange={(e)=>setFormData({...formData, experience_years:e.target.value})} required min="0"/>
                  </div>
              </div>

              <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Bio / About</label>
                  <textarea className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none text-slate-900 font-medium bg-slate-50 transition-all placeholder:text-slate-400 min-h-[120px] resize-none" value={formData.bio} onChange={(e)=>setFormData({...formData, bio:e.target.value})} placeholder="Tell customers about your expertise..."></textarea>
              </div>

              <button type="submit" disabled={isUpdating} className={`w-full text-white font-bold py-4 rounded-xl transition-all shadow-md active:scale-95 mt-4 flex items-center justify-center gap-2 ${isUpdating ? 'bg-slate-400' : 'bg-slate-900 hover:bg-brand shadow-slate-900/20'}`}>
                  {isUpdating ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Saving...</> : <><i className="fa-solid fa-check text-xs"></i> Save Changes</>}
              </button>
          </form>
      </Dialog>

      {/* ================= MODAL 2: LOGOUT ================= */}
      <Dialog isOpen={showLogoutDialog} onClose={() => setShowLogoutDialog(false)} title="Confirm Action">
          <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-50 border border-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-sm">
                  <i className="fa-solid fa-power-off"></i>
              </div>
              <h5 className="font-bold text-slate-900 text-2xl tracking-tight mb-2">Ready to clock out?</h5>
              <p className="text-slate-500 font-medium mb-8 max-w-xs mx-auto">You will need to login again to accept new jobs and view your schedule.</p>
              
              <div className="flex gap-4">
                  <button className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-200 transition-colors" onClick={() => setShowLogoutDialog(false)}>Stay</button>
                  <button className="flex-1 bg-red-500 text-white font-bold py-4 rounded-xl hover:bg-red-600 transition-colors shadow-lg active:scale-95" onClick={confirmLogout}>Logout</button>
              </div>
          </div>
      </Dialog>

    </div>
  );
};

export default ProviderProfile;