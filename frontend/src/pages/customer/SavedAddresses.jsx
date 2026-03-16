import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../constants/api';

const SavedAddresses = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Add Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: '', address: '' });

  // --- FETCH ADDRESSES ---
  const fetchAddresses = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}user/address/get_all.php?id=${user.id}`);
      const data = await res.json();
      setAddresses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) navigate('/login');
    else fetchAddresses();
    // eslint-disable-next-line
  }, []);

  // --- SAVE ADDRESS ---
  const handleSave = async (e) => {
    e.preventDefault();
    if(!newAddress.address) return alert("Address is required");

    try {
      await fetch(`${API_BASE_URL}user/address/add.php`, {
        method: 'POST',
        body: JSON.stringify({
          customer_id: user.id,
          label: newAddress.label || 'Home',
          address: newAddress.address
        })
      });
      setNewAddress({ label: '', address: '' });
      setShowAddForm(false);
      fetchAddresses(); 
    } catch (err) {
      alert("Failed to save", err);
    }
  };

  // --- DELETE ADDRESS ---
  const handleDelete = async (id) => {
    if(!window.confirm("Delete this address?")) return;
    try {
      await fetch(`${API_BASE_URL}/user/address/delete.php`, {
        method: 'POST',
        body: JSON.stringify({ address_id: id })
      });
      setAddresses(addresses.filter(a => a.id !== id));
    } catch (err) {
      alert("Failed to delete", err);
    }
  };

  return (
    <div className="font-sans min-h-screen bg-gray-50 pb-20 mt-20">
      
      {/* Container (Layout handles margins, we just padding internally if needed) */}
      <div className="py-6">

        {/* ADD NEW BUTTON (Visible when form is hidden) */}
        {!showAddForm && (
            <button 
                onClick={() => setShowAddForm(true)}
                className="w-full bg-white p-5 rounded-2xl shadow-sm border-2 border-dashed border-primary/30 text-primary font-bold hover:bg-blue-50 hover:border-primary transition-all duration-300 flex items-center justify-center gap-2 mb-6 group"
            >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                    <i className="fa-solid fa-plus"></i>
                </div>
                <span>Add New Address</span>
            </button>
        )}

        {/* ADD FORM CARD */}
        {showAddForm && (
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 mb-8 animate-fade-in-up">
                <div className="flex justify-between items-center mb-4">
                    <h6 className="font-bold text-gray-900">New Location</h6>
                    <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
                        <i className="fa-solid fa-xmark text-lg"></i>
                    </button>
                </div>
                
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Label (Optional)</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none bg-gray-50 transition-all placeholder:text-gray-400"
                            placeholder="e.g. Home, Office, Mom's Place"
                            value={newAddress.label}
                            onChange={(e) => setNewAddress({...newAddress, label: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Full Address</label>
                        <textarea 
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none bg-gray-50 transition-all placeholder:text-gray-400 min-h-[100px]"
                            placeholder="House No, Street, Area, Landmark..."
                            value={newAddress.address}
                            onChange={(e) => setNewAddress({...newAddress, address: e.target.value})}
                            required
                        ></textarea>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button 
                            type="button" 
                            className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                            onClick={() => setShowAddForm(false)}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="flex-1 py-3 rounded-xl font-bold text-white bg-brand hover:bg-black transition-colors shadow-lg shadow-brand/20"
                        >
                            Save Address
                        </button>
                    </div>
                </form>
            </div>
        )}

        {/* ADDRESS LIST */}
        {loading ? (
            <div className="flex justify-center py-10">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.length === 0 && !showAddForm ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-gray-200 rounded-3xl">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-3 text-2xl">
                            <i className="fa-solid fa-map-location-dot"></i>
                        </div>
                        <p className="text-gray-500 font-medium">No addresses saved yet.</p>
                        <p className="text-gray-400 text-sm">Add one to speed up checkout.</p>
                    </div>
                ) : (
                    addresses.map((addr) => (
                        <div key={addr.id} className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 flex items-start gap-4 hover:shadow-md transition-shadow group relative">
                            
                            {/* Icon */}
                            <div className="w-12 h-12 rounded-full bg-blue-50 text-primary flex items-center justify-center text-lg flex-shrink-0">
                                <i className={`fa-solid ${addr.label.toLowerCase() === 'home' ? 'fa-house' : addr.label.toLowerCase() === 'office' ? 'fa-briefcase' : 'fa-location-dot'}`}></i>
                            </div>

                            {/* Content */}
                            <div className="flex-grow pr-8">
                                <h6 className="font-bold text-gray-900 mb-1">{addr.label || 'Other'}</h6>
                                <p className="text-gray-500 text-sm leading-relaxed">{addr.address}</p>
                            </div>

                            {/* Delete Button (Absolute top-right) */}
                            <button 
                                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors p-2"
                                onClick={() => handleDelete(addr.id)}
                            >
                                <i className="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    ))
                )}
            </div>
        )}

      </div>
    </div>
  );
};

export default SavedAddresses;