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
        alert("Profile Updated Successfully!");
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
    } catch (error) { console.error(error); } 
    finally { setUploading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans selection:bg-brand selection:text-white">
      <div className="max-w-3xl mx-auto px-4 py-6 md:py-8">

        {/* --- SECTION 1: PROFILE HEADER CARD --- */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden mb-8 relative">
          
          {/* Premium Banner */}
          <div className="h-32 md:h-40 bg-slate-900 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-black opacity-90"></div>
             <div className="absolute top-[-50%] left-[20%] w-[60%] h-[200%] bg-brand/20 blur-[80px] rounded-full mix-blend-screen pointer-events-none"></div>
          </div>

          <div className="px-6 md:px-10 pb-8 text-center relative z-10">
              
              {/* Avatar */}
              <div className="relative inline-block -mt-16 md:-mt-20 mb-4">
                  <img
                      src={getProfileImage(user.profile_img)}
                      alt="Profile"
                      className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] border-4 border-white shadow-lg object-cover bg-white transition-transform hover:scale-105 duration-300"
                  />
                  <button
                      className="absolute -bottom-2 -right-2 bg-slate-900 text-white w-10 h-10 rounded-xl flex items-center justify-center border-4 border-white hover:bg-brand transition-colors shadow-sm active:scale-95"
                      onClick={() => setShowPicModal(true)}
                  >
                      <i className="fa-solid fa-camera text-sm"></i>
                  </button>
              </div>

              <h4 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-1">{user.name}</h4>
              <p className="text-slate-500 font-medium mb-6 flex items-center justify-center gap-2 text-sm">
                  <i className="fa-regular fa-envelope text-slate-400"></i> {user.email} 
                  <span className="text-slate-300">•</span> 
                  <i className="fa-solid fa-phone text-slate-400 text-[10px]"></i> {user.phone || "No Phone"}
              </p>

              <button
                  className="bg-slate-50 border border-slate-200 text-slate-700 px-8 py-2.5 rounded-full text-sm font-bold hover:bg-slate-100 hover:border-slate-300 transition-all shadow-sm active:scale-95"
                  onClick={() => setShowEditModal(true)}
              >
                  Edit Profile
              </button>
          </div>
        </div>

        {/* --- SECTION 2: QUICK STATS --- */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
             <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center text-xl">
               <i className="fa-solid fa-wallet"></i>
             </div>
             <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Wallet Balance</p>
               <h5 className="text-2xl font-bold text-slate-900 tracking-tight">₹450</h5>
             </div>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/user/my-bookings')}>
             <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center text-xl">
               <i className="fa-solid fa-calendar-check"></i>
             </div>
             <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Bookings</p>
               <h5 className="text-2xl font-bold text-slate-900 tracking-tight">12</h5>
             </div>
          </div>
        </div>

        {/* --- SECTION 3: MENU LINKS --- */}
        <h6 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-4 mb-3">Account Settings</h6>
        
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
           <div className="divide-y divide-slate-50">
              
              <Link to="/user/my-bookings" className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-brand/10 flex items-center justify-center text-slate-400 group-hover:text-brand transition-colors">
                      <i className="fa-regular fa-calendar-check text-lg"></i>
                  </div>
                  <span className="font-bold text-slate-700 flex-grow">My Bookings</span>
                  <i className="fa-solid fa-chevron-right text-slate-300 text-xs"></i>
              </Link>

              <Link to="/user/saved-addresses" className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-cyan-500/10 flex items-center justify-center text-slate-400 group-hover:text-cyan-500 transition-colors">
                      <i className="fa-solid fa-map-location-dot text-lg"></i>
                  </div>
                  <span className="font-bold text-slate-700 flex-grow">Manage Addresses</span>
                  <i className="fa-solid fa-chevron-right text-slate-300 text-xs"></i>
              </Link>

              <Link to="/user/wallet" className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-emerald-500/10 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                      <i className="fa-solid fa-credit-card text-lg"></i>
                  </div>
                  <span className="font-bold text-slate-700 flex-grow">Payment Methods</span>
                  <i className="fa-solid fa-chevron-right text-slate-300 text-xs"></i>
              </Link>
              
              <Link to="/user/preferences" className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-purple-500/10 flex items-center justify-center text-slate-400 group-hover:text-purple-500 transition-colors">
                      <i className="fa-solid fa-sliders text-lg"></i>
                  </div>
                  <span className="font-bold text-slate-700 flex-grow">Preferences</span>
                  <i className="fa-solid fa-chevron-right text-slate-300 text-xs"></i>
              </Link>

           </div>
        </div>

        <h6 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-4 mb-3">Support & More</h6>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-12">
           <div className="divide-y divide-slate-50">
              
              <Link to="/user/help" className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-amber-500/10 flex items-center justify-center text-slate-400 group-hover:text-amber-500 transition-colors">
                      <i className="fa-solid fa-headset text-lg"></i>
                  </div>
                  <span className="font-bold text-slate-700 flex-grow">Help & Support</span>
                  <i className="fa-solid fa-chevron-right text-slate-300 text-xs"></i>
              </Link>

              <Link to="/user/privacy" className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-slate-800/10 flex items-center justify-center text-slate-400 group-hover:text-slate-800 transition-colors">
                      <i className="fa-solid fa-shield-halved text-lg"></i>
                  </div>
                  <span className="font-bold text-slate-700 flex-grow">Privacy Policy</span>
                  <i className="fa-solid fa-chevron-right text-slate-300 text-xs"></i>
              </Link>

              <button onClick={handleLogoutClick} className="w-full flex items-center gap-4 p-5 hover:bg-red-50 transition-colors text-left group">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-400 group-hover:text-red-500 transition-colors">
                      <i className="fa-solid fa-right-from-bracket text-lg"></i>
                  </div>
                  <span className="font-bold text-red-500 flex-grow">Secure Logout</span>
              </button>

           </div>
        </div>

        <div className="text-center">
            <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center mx-auto mb-3 text-slate-400">
                <i className="fa-solid fa-shield-halved"></i>
            </div>
            <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-1">Sahaayak v1.0</p>
            <p className="text-slate-400 text-[10px] font-medium">Made with ❤️ in Surat</p>
        </div>


        {/* ================= MODAL 1: EDIT PROFILE ================= */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h5 className="text-xl font-bold text-slate-900 tracking-tight">Edit Profile</h5>
                <button onClick={() => setShowEditModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div className="p-6">
                <form onSubmit={submitEditProfile} className="space-y-5">
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                      <input 
                          type="text" name="name" 
                          className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none text-slate-900 font-medium bg-slate-50 transition-all" 
                          value={editFormData.name} onChange={handleEditChange} required 
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                      <input 
                          type="tel" name="phone" 
                          className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none text-slate-900 font-medium bg-slate-50 transition-all" 
                          value={editFormData.phone} onChange={handleEditChange} required 
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Primary Address</label>
                      <textarea 
                          name="address" rows="3"
                          className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none text-slate-900 font-medium bg-slate-50 transition-all resize-none" 
                          value={editFormData.address} onChange={handleEditChange}
                      ></textarea>
                   </div>
                   <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-brand transition-all shadow-md active:scale-[0.98] mt-2">
                       Save Changes
                   </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL 2: UPDATE PHOTO ================= */}
        {showPicModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
             <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
               <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                 <h5 className="text-xl font-bold text-slate-900 tracking-tight">Profile Photo</h5>
                 <button onClick={() => setShowPicModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors">
                   <i className="fa-solid fa-xmark"></i>
                 </button>
               </div>
               <div className="p-6 text-center">
                  <div className="mb-8 flex justify-center">
                      {selectedFile ? (
                          <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="w-32 h-32 rounded-full object-cover border-4 border-slate-100 shadow-md" />
                      ) : (
                          <div className="w-32 h-32 rounded-full bg-slate-50 flex items-center justify-center border-4 border-slate-100 shadow-inner text-slate-300 text-4xl">
                             <i className="fa-solid fa-cloud-arrow-up"></i>
                          </div>
                      )}
                  </div>
                  
                  <div className="relative mb-6">
                      <input 
                          type="file" 
                          id="file-upload"
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleFileChange} 
                      />
                      <label htmlFor="file-upload" className="cursor-pointer block w-full py-3 px-4 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 hover:border-brand hover:text-brand transition-all">
                          {selectedFile ? selectedFile.name : "Choose a new photo"}
                      </label>
                  </div>

                  <button 
                      onClick={submitProfilePic} 
                      disabled={uploading || !selectedFile}
                      className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-brand transition-all disabled:opacity-50 disabled:hover:bg-slate-900 active:scale-[0.98] shadow-md"
                  >
                      {uploading ? <><i className="fa-solid fa-circle-notch fa-spin me-2"></i> Uploading...</> : "Update Photo"}
                  </button>
               </div>
             </div>
          </div>
        )}

        {/* ================= MODAL 3: LOGOUT ================= */}
        <Dialog isOpen={showLogoutDialog} onClose={() => setShowLogoutDialog(false)} title="Confirm Logout">
          <div className="text-center p-2">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl">
                  <i className="fa-solid fa-right-from-bracket"></i>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Ready to leave?</h4>
              <p className="text-slate-500 font-medium mb-8 max-w-xs mx-auto">
                  You will need to sign back in to book services or track your orders.
              </p>
              <div className="flex gap-3">
                  <button onClick={() => setShowLogoutDialog(false)} className="flex-1 py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                      Stay
                  </button>
                  <button onClick={confirmLogout} className="flex-1 py-3.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-md active:scale-95 transition-all">
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