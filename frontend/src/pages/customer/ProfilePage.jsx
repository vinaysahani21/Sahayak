import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../../constants/api';
import Dialog from '../../components/ui/Dialog';

const ProfilePage = () => {
  const navigate = useNavigate();

  // --- STATE ---
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});

  
  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPicModal, setShowPicModal] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Forms
  const [editFormData, setEditFormData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    address: user.address || ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Premium Helper
  const getProfileImage = (imgStr) => {
    if (!imgStr || imgStr.includes('default')) return `https://ui-avatars.com/api/?name=${user.name}&background=0f172a&color=fff&size=200`;
    return imgStr.startsWith('http') ? imgStr : `${API_BASE_URL}${imgStr}`;
  };

  // --- ACTIONS ---
  const handleLogoutClick = () => setShowLogoutDialog(true);
  
  const confirmLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('recentSearches');
    navigate('/login');
  };

  const handleEditChange = (e) => setEditFormData({ ...editFormData, [e.target.name]: e.target.value });

  const submitEditProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/user/update_profile.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editFormData, id: user.id })
      });
      const data = await response.json();
      if (data.status === 'success') {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setShowEditModal(false);
      } else {
        alert(data.message);
      }
    } catch (error) { console.error(error); }
  };

  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  const submitProfilePic = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('id', user.id);
    
    try {
      setUploading(true);
      const response = await fetch(`${API_BASE_URL}/user/upload_profile_pic.php`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.status === 'success') {
        const updatedUser = { ...user, profile_img: data.image_url };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setShowPicModal(false);
      } else {
        alert(data.message);
      }
    } catch (error) { console.error("Upload error:", error); console.log("FormData contents:", formData.get('image')); } 
    finally { setUploading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans selection:bg-brand/20 selection:text-brand">
      
      {/* --- PAGE HEADER --- */}
      <div className="max-w-3xl mx-auto px-4 pt-8 pb-4">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Your Profile</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your account details and preferences.</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-4">

        {/* --- SECTION 1: PROFILE HEADER CARD --- */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden mb-8 relative">
          
          {/* Premium Banner */}
          <div className="h-32 md:h-40 bg-slate-900 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 opacity-90"></div>
             <div className="absolute top-[-50%] left-[10%] w-[60%] h-[200%] bg-brand/20 blur-[80px] rounded-full mix-blend-screen pointer-events-none"></div>
             <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[100%] bg-blue-500/20 blur-[60px] rounded-full mix-blend-screen pointer-events-none"></div>
          </div>

          <div className="px-6 md:px-10 pb-8 relative z-10 flex flex-col items-center sm:items-start sm:flex-row gap-6">
              
              {/* Floating Avatar */}
              <div className="relative -mt-16 md:-mt-20 shrink-0">
                  <img
                      src={getProfileImage(user.profile_img)}
                      alt="Profile"
                      className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] border-8 border-white shadow-lg object-cover bg-white"
                  />
                  <button
                      className="absolute -bottom-2 -right-2 bg-slate-900 text-white w-12 h-12 rounded-xl flex items-center justify-center border-4 border-white hover:bg-brand transition-all shadow-md active:scale-95 group"
                      onClick={() => setShowPicModal(true)}
                      title="Update Photo"
                  >
                      <i className="fa-solid fa-camera text-sm group-hover:scale-110 transition-transform"></i>
                  </button>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center sm:text-left pt-2">
                  <h4 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-2">{user.name}</h4>
                  
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-sm text-slate-500 font-medium mb-6">
                      <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                         <i className="fa-solid fa-envelope text-slate-400"></i> {user.email} 
                      </span>
                      {user.phone && (
                          <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                             <i className="fa-solid fa-phone text-slate-400 text-[10px]"></i> {user.phone}
                          </span>
                      )}
                  </div>

                  <button
                      className="bg-slate-50 border border-slate-200 text-slate-700 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-white hover:border-brand/50 hover:shadow-md transition-all active:scale-95 flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto"
                      onClick={() => setShowEditModal(true)}
                  >
                      <i className="fa-solid fa-pen-to-square text-brand"></i> Edit Profile
                  </button>
              </div>
          </div>
        </div>

        {/* --- SECTION 2: QUICK STATS --- */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-200/60 flex items-center gap-4 hover:shadow-md hover:-translate-y-1 transition-all group cursor-pointer" onClick={() => navigate('/user/wallet')}>
             <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
               <i className="fa-solid fa-wallet"></i>
             </div>
             <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Wallet Balance</p>
               <h5 className="text-2xl font-black text-slate-900 tracking-tight">₹0</h5>
             </div>
          </div>
          <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-200/60 flex items-center gap-4 hover:shadow-md hover:-translate-y-1 transition-all group cursor-pointer" onClick={() => navigate('/user/my-bookings')}>
             <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
               <i className="fa-solid fa-calendar-check"></i>
             </div>
             <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Bookings</p>
               <h5 className="text-2xl font-black text-slate-900 tracking-tight">12</h5>
             </div>
          </div>
        </div>

        {/* --- SECTION 3: MENU LINKS --- */}
        <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-3">Account Settings</h6>
        
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden mb-10">
           <div className="divide-y divide-slate-100">
              
              <Link to="/user/my-bookings" className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors group">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-brand/10 group-hover:border-transparent flex items-center justify-center text-slate-400 group-hover:text-brand transition-colors">
                      <i className="fa-regular fa-calendar-check text-xl"></i>
                  </div>
                  <span className="font-bold text-slate-700 flex-grow text-lg group-hover:text-slate-900 transition-colors">My Bookings</span>
                  <i className="fa-solid fa-chevron-right text-slate-300 text-xs"></i>
              </Link>

              <Link to="/user/saved-addresses" className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors group">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-cyan-500/10 group-hover:border-transparent flex items-center justify-center text-slate-400 group-hover:text-cyan-600 transition-colors">
                      <i className="fa-solid fa-map-location-dot text-xl"></i>
                  </div>
                  <span className="font-bold text-slate-700 flex-grow text-lg group-hover:text-slate-900 transition-colors">Manage Addresses</span>
                  <i className="fa-solid fa-chevron-right text-slate-300 text-xs"></i>
              </Link>

              <Link to="/user/wallet" className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors group">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-emerald-500/10 group-hover:border-transparent flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors">
                      <i className="fa-solid fa-credit-card text-xl"></i>
                  </div>
                  <span className="font-bold text-slate-700 flex-grow text-lg group-hover:text-slate-900 transition-colors">Payment Methods</span>
                  <i className="fa-solid fa-chevron-right text-slate-300 text-xs"></i>
              </Link>

           </div>
        </div>

        <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-3">Support & Security</h6>
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden mb-12">
           <div className="divide-y divide-slate-100">
              
              <Link to="/user/help" className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors group">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-amber-500/10 group-hover:border-transparent flex items-center justify-center text-slate-400 group-hover:text-amber-500 transition-colors">
                      <i className="fa-solid fa-headset text-xl"></i>
                  </div>
                  <span className="font-bold text-slate-700 flex-grow text-lg group-hover:text-slate-900 transition-colors">Help & Support</span>
                  <i className="fa-solid fa-chevron-right text-slate-300 text-xs"></i>
              </Link>

              <button onClick={handleLogoutClick} className="w-full flex items-center gap-4 p-5 hover:bg-red-50 transition-colors text-left group">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-red-500/10 group-hover:border-transparent flex items-center justify-center text-slate-400 group-hover:text-red-500 transition-colors">
                      <i className="fa-solid fa-right-from-bracket text-xl"></i>
                  </div>
                  <span className="font-bold text-slate-700 flex-grow text-lg group-hover:text-red-600 transition-colors">Secure Logout</span>
              </button>

           </div>
        </div>

        {/* --- FOOTER TAG --- */}
        <div className="text-center mb-10">
            <div className="w-12 h-12 bg-slate-200/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                <i className="fa-solid fa-shield-halved text-xl"></i>
            </div>
            <p className="text-slate-400 text-xs font-black tracking-widest uppercase mb-1">Sahaayak App</p>
            <p className="text-slate-400 text-[10px] font-bold">Version 1.0.0</p>
        </div>


        {/* ================= MODAL 1: EDIT PROFILE ================= */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl">
              <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center">
                <div>
                    <h5 className="text-2xl font-black text-slate-900 tracking-tight">Edit Profile</h5>
                    <p className="text-xs text-slate-500 font-medium mt-1">Update your personal information</p>
                </div>
                <button onClick={() => setShowEditModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              
              <div className="p-6 md:p-8">
                <form onSubmit={submitEditProfile} className="space-y-6">
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                      <div className="relative">
                          <i className="fa-regular fa-user absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                          <input 
                              type="text" name="name" 
                              className="w-full pl-12 pr-5 py-4 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none text-slate-900 font-bold bg-slate-50 hover:bg-white transition-all shadow-inner" 
                              value={editFormData.name} onChange={handleEditChange} required 
                          />
                      </div>
                   </div>
                   
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Phone Number</label>
                      <div className="relative">
                          <i className="fa-solid fa-phone absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs"></i>
                          <input 
                              type="tel" name="phone" 
                              className="w-full pl-12 pr-5 py-4 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none text-slate-900 font-bold bg-slate-50 hover:bg-white transition-all shadow-inner" 
                              value={editFormData.phone} onChange={handleEditChange} required 
                          />
                      </div>
                   </div>
                   
                   <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-brand transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                       <i className="fa-solid fa-check text-sm"></i> Save Changes
                   </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL 2: UPDATE PHOTO ================= */}
        {showPicModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
             <div className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl">
               <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center">
                 <h5 className="text-2xl font-black text-slate-900 tracking-tight">Update Photo</h5>
                 <button onClick={() => setShowPicModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                   <i className="fa-solid fa-xmark"></i>
                 </button>
               </div>
               
               <div className="p-6 md:p-8 text-center">
                  <div className="mb-8 flex justify-center relative">
                      {selectedFile ? (
                          <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="w-32 h-32 rounded-[2rem] object-cover border-4 border-slate-100 shadow-md" />
                      ) : (
                          <div className="w-32 h-32 rounded-[2rem] bg-slate-50 flex items-center justify-center border-4 border-slate-100 shadow-inner text-slate-300 text-4xl">
                             <i className="fa-regular fa-image"></i>
                          </div>
                      )}
                  </div>
                  
                  <div className="mb-8">
                      <input 
                          type="file" 
                          id="file-upload"
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleFileChange} 
                      />
                      <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center w-full py-6 px-4 rounded-2xl border-2 border-dashed border-slate-200 hover:bg-brand/5 hover:border-brand transition-all group">
                          <div className="w-10 h-10 bg-slate-100 group-hover:bg-brand text-slate-400 group-hover:text-white rounded-full flex items-center justify-center mb-2 transition-colors">
                              <i className="fa-solid fa-cloud-arrow-up"></i>
                          </div>
                          <span className="text-slate-700 font-bold text-sm">
                              {selectedFile ? selectedFile.name : "Click to browse files"}
                          </span>
                      </label>
                  </div>

                  <button 
                      onClick={submitProfilePic} 
                      disabled={uploading || !selectedFile}
                      className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-brand transition-all disabled:opacity-50 disabled:hover:bg-slate-900 active:scale-95 shadow-lg flex justify-center items-center gap-2"
                  >
                      {uploading ? <><i className="fa-solid fa-circle-notch fa-spin text-lg"></i> Uploading...</> : <><i className="fa-solid fa-arrow-up-from-bracket text-sm"></i> Confirm Upload</>}
                  </button>
               </div>
             </div>
          </div>
        )}

        {/* ================= MODAL 3: LOGOUT ================= */}
        <Dialog isOpen={showLogoutDialog} onClose={() => setShowLogoutDialog(false)} title="Confirm Action">
          <div className="text-center p-2">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 text-3xl shadow-sm border border-red-100">
                  <i className="fa-solid fa-power-off"></i>
              </div>
              <h4 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Ready to leave?</h4>
              <p className="text-slate-500 font-medium mb-8 max-w-xs mx-auto leading-relaxed">
                  You will need to sign back in to book services or track your current orders.
              </p>
              <div className="flex gap-4">
                  <button onClick={() => setShowLogoutDialog(false)} className="flex-1 py-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                      Stay
                  </button>
                  <button onClick={confirmLogout} className="flex-1 py-4 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/20 active:scale-95 transition-all">
                      Logout
                  </button>
              </div>
          </div>
        </Dialog>

      </div>
    </div>
  );
};

export default ProfilePage;