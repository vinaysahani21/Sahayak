import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../constants/api';
import Dialog from '../../components/ui/Dialog'; 

const MyServices = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    // --- STATE ---
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    
    const [newService, setNewService] = useState({
        service_name: '',
        price_per_hour: '',
        description: '',
        category_id: ''
    });

    // --- FETCH DATA ---
    const fetchData = async () => {
        setLoading(true);
        try {
            const srvRes = await fetch(`${API_BASE_URL}/provider/get_my_service.php?id=${user.id}`);
            const srvData = await srvRes.json();
            setServices(Array.isArray(srvData) ? srvData : (srvData.data || []));

            const catRes = await fetch(`${API_BASE_URL}/provider/get_categories.php`);
            const catData = await catRes.json();
            setCategories(Array.isArray(catData) ? catData : (catData.data || []));
            
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user || user.role !== 'provider') {
            navigate('/login');
            return;
        }
        fetchData();
    }, [user, navigate]);

    // --- ACTIONS ---
    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newService.service_name || !newService.price_per_hour || !newService.category_id) {
            alert("Please fill all required fields, including Category.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/provider/add_service.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider_id: user.id,
                    category_id: newService.category_id,
                    service_name: newService.service_name,
                    price: newService.price_per_hour,
                    desc: newService.description
                })
            });

            const text = await response.text();
            const data = JSON.parse(text); 

            if (data.status === 'success') {
                setNewService({ service_name: '', price_per_hour: '', description: '', category_id: '' });
                setIsAdding(false);
                fetchData(); 
            } else {
                alert("Server Error: " + (data.message || "Failed to add service"));
            }
        } catch (error) {
            alert("Failed to add service. Check console.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this service? Customers won't be able to book it anymore.")) return;

        try {
            await fetch(`${API_BASE_URL}/provider/delete_service.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ service_id: id })
            });
            setServices(services.filter(s => s.id !== id));
        } catch (error) {
            alert("Delete failed");
        }
    };

    return (
        <div className="bg-[#F8FAFC] min-h-screen font-sans text-slate-800 pb-24 selection:bg-brand selection:text-white">
            
            {/* --- PREMIUM HEADER --- */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm sticky top-0 z-30 px-6 md:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">My Offerings</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Manage the catalog of services you provide</p>
                </div>
                <button 
                    onClick={() => setIsAdding(true)}
                    className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-brand transition-all shadow-md active:scale-95"
                >
                    <i className="fa-solid fa-plus text-xs"></i> Create Service
                </button>
            </div>

            <div className="p-6 md:p-8 max-w-7xl mx-auto">
                
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="w-12 h-12 border-4 border-slate-200 border-t-brand rounded-full animate-spin mb-4 shadow-sm"></div>
                        <p className="text-slate-500 font-medium animate-pulse">Loading catalog...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                        
                        {/* 1. ADD NEW BUTTON CARD */}
                        <button 
                            onClick={() => setIsAdding(true)}
                            className="flex flex-col items-center justify-center min-h-[220px] rounded-[2rem] border-2 border-dashed border-slate-300 bg-slate-50/50 text-slate-500 hover:text-brand hover:border-brand hover:bg-brand/5 transition-all duration-300 group p-8 shadow-sm hover:shadow-md"
                        >
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                <i className="fa-solid fa-plus text-2xl"></i>
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 group-hover:text-brand transition-colors tracking-tight">New Service</h4>
                            <p className="text-sm font-medium mt-1">Add a new skill to your profile</p>
                        </button>

                        {/* 2. EXISTING SERVICES */}
                        {services.map((item) => (
                            <div key={item.id} className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 relative group flex flex-col h-full">
                                
                                <div className="flex justify-between items-start mb-4">
                                    <div className="pr-8">
                                        <span className="inline-block bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider mb-2">
                                            {categories.find(c => c.id == item.category_id)?.name || 'General'}
                                        </span>
                                        <h6 className="font-bold text-slate-900 text-xl tracking-tight leading-tight group-hover:text-brand transition-colors">{item.service_name}</h6>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-500 hover:text-white hover:scale-110 shadow-sm"
                                        title="Delete Service"
                                    >
                                        <i className="fa-solid fa-trash-can"></i>
                                    </button>
                                </div>

                                <p className="text-sm text-slate-500 font-medium flex-grow mb-6 leading-relaxed">
                                    {item.description || "No description provided."}
                                </p>

                                <div className="pt-5 border-t border-slate-100 flex justify-between items-end mt-auto">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Base Rate</span>
                                    <span className="text-2xl font-black text-slate-900 tracking-tight">
                                        ₹{parseFloat(item.price_per_hour || item.price).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* === ADD SERVICE DIALOG === */}
            <Dialog isOpen={isAdding} onClose={() => setIsAdding(false)} title="Configure New Service">
                <form onSubmit={handleAdd} className="p-6 md:p-8 space-y-5">
                    
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Category <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <select
                                className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none text-slate-900 font-medium bg-slate-50 hover:bg-slate-100 transition-colors appearance-none cursor-pointer"
                                value={newService.category_id}
                                onChange={(e) => setNewService({ ...newService, category_id: e.target.value })}
                                required
                            >
                                <option value="" disabled>Select a category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            <i className="fa-solid fa-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Service Name <span className="text-red-500">*</span></label>
                        <input
                            type="text" 
                            className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none text-slate-900 font-medium bg-slate-50 transition-all placeholder:text-slate-400"
                            placeholder="e.g. AC Gas Filling, Tap Repair"
                            value={newService.service_name}
                            onChange={(e) => setNewService({ ...newService, service_name: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Base Price (₹) <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <i className="fa-solid fa-indian-rupee-sign absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                            <input
                                type="number" 
                                className="w-full pl-10 pr-5 py-4 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none text-slate-900 font-bold text-lg bg-slate-50 transition-all placeholder:text-slate-400"
                                placeholder="299"
                                value={newService.price_per_hour}
                                onChange={(e) => setNewService({ ...newService, price_per_hour: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Description</label>
                        <textarea
                            className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none text-slate-900 font-medium bg-slate-50 transition-all min-h-[120px] resize-none placeholder:text-slate-400"
                            placeholder="Detail exactly what this service includes to set clear expectations for the customer..."
                            value={newService.description}
                            onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                        ></textarea>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-brand transition-all shadow-lg shadow-slate-900/20 active:scale-95 mt-4 flex items-center justify-center gap-2"
                    >
                        <i className="fa-solid fa-check text-xs"></i> Save to Catalog
                    </button>
                </form>
            </Dialog>

        </div>
    );
};

export default MyServices;