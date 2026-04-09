import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../constants/api';
import Dialog from '../../components/ui/Dialog'; 

const MyServices = () => {
    const navigate = useNavigate();
    
    // Parse user once to avoid infinite loops, but we'll use specific properties in dependencies
    const user = JSON.parse(localStorage.getItem('user'));

    // --- STATE ---
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form State
    const [isAdding, setIsAdding] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newService, setNewService] = useState({
        service_name: '',
        price_per_hour: '',
        description: '',
        category_id: ''
    });

    // --- FETCH DATA ---
    // Wrapped in useCallback to prevent unnecessary recreations
    const fetchData = useCallback(async () => {
        if (!user?.id) return;
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
    }, [user?.id]);

    // INFINITE LOOP FIXED: Only depend on user.id and user.role, not the whole object
    useEffect(() => {
        if (!user || user.role !== 'provider') {
            navigate('/login');
            return;
        }
        fetchData();
    }, [user?.id, user?.role, navigate, fetchData]);

    // --- ACTIONS ---
    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newService.service_name || !newService.price_per_hour || !newService.category_id) {
            alert("Please fill all required fields, including Category.");
            return;
        }

        setIsSubmitting(true);
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
                fetchData(); // Refresh list to get new IDs
            } else {
                alert("Server Error: " + (data.message || "Failed to add service"));
            }
        } catch (error) {
            alert("Failed to add service. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id, serviceName) => {
        if (!window.confirm(`Are you sure you want to remove "${serviceName}" from your catalog?`)) return;

        try {
            const response = await fetch(`${API_BASE_URL}/provider/delete_service.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ service_id: id })
            });
            const data = await response.json();
            
            if(data.status === 'success') {
                // Optimistically remove from UI
                setServices(services.filter(s => s.id !== id));
            } else {
                alert("Failed to delete service.");
            }
        } catch (error) {
            alert("Network error while deleting.");
        }
    };

    return (
        <div className="bg-[#F8FAFC] min-h-screen font-sans text-slate-800 pb-24 selection:bg-brand/20 selection:text-brand">
            
            {/* --- PREMIUM HEADER --- */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm sticky top-0 z-30 px-6 md:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Service Catalog</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Manage your offerings and base pricing</p>
                </div>
                <button 
                    onClick={() => setIsAdding(true)}
                    className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-xl text-sm font-bold hover:bg-brand transition-all shadow-md shadow-slate-900/10 hover:shadow-brand/20 active:scale-95"
                >
                    <i className="fa-solid fa-plus text-xs"></i> Create Service
                </button>
            </div>

            <div className="p-6 md:p-8 max-w-7xl mx-auto">
                
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="w-12 h-12 border-4 border-slate-200 border-t-brand rounded-full animate-spin mb-6 shadow-sm"></div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Syncing Catalog...</h3>
                        <p className="text-slate-500 font-medium">Loading your available services.</p>
                    </div>
                ) : (
                    <div className="animate-fade-in-up">
                        
                        {/* STATS SUMMARY ROW */}
                        <div className="flex flex-wrap gap-4 mb-8">
                            <div className="bg-white border border-slate-200/60 shadow-sm px-5 py-3 rounded-2xl flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center text-lg">
                                    <i className="fa-solid fa-layer-group"></i>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Active Services</p>
                                    <p className="text-xl font-black text-slate-900 leading-none">{services.length}</p>
                                </div>
                            </div>
                        </div>

                        {/* GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                            
                            {/* 1. ADD NEW BUTTON CARD */}
                            <button 
                                onClick={() => setIsAdding(true)}
                                className="flex flex-col items-center justify-center min-h-[260px] rounded-[2rem] border-2 border-dashed border-slate-300 bg-slate-50/50 text-slate-500 hover:text-brand hover:border-brand hover:bg-brand/5 transition-all duration-300 group p-8 shadow-sm hover:shadow-md"
                            >
                                <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center shadow-sm mb-4 border border-slate-100 group-hover:scale-110 transition-transform duration-300 group-hover:bg-brand group-hover:border-brand group-hover:text-white">
                                    <i className="fa-solid fa-plus text-2xl"></i>
                                </div>
                                <h4 className="text-xl font-black text-slate-900 group-hover:text-brand transition-colors tracking-tight mb-1">Add New Offering</h4>
                                <p className="text-sm font-medium">Expand your professional catalog</p>
                            </button>

                            {/* 2. EXISTING SERVICES */}
                            {services.map((item) => (
                                <div key={item.id} className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-brand/30 transition-all duration-300 relative group flex flex-col h-full overflow-hidden">
                                    
                                    {/* Subtle decorative line */}
                                    <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 group-hover:bg-brand transition-colors"></div>

                                    {/* Header & Delete Button */}
                                    <div className="flex justify-between items-start mb-5 pt-2">
                                        <div className="pr-12">
                                            <span className="inline-block bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest mb-3 shadow-sm">
                                                {categories.find(c => c.id == item.category_id)?.name || 'General'}
                                            </span>
                                            <h6 className="font-black text-slate-900 text-xl tracking-tight leading-tight group-hover:text-brand transition-colors line-clamp-2">
                                                {item.service_name}
                                            </h6>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(item.id, item.service_name)}
                                            className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center absolute top-8 right-6 opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:bg-red-50 hover:border-red-200 hover:text-red-500 md:-translate-y-2 md:group-hover:translate-y-0 shadow-sm opacity-100 md:opacity-0"
                                            title="Delete Service"
                                        >
                                            <i className="fa-solid fa-trash-can"></i>
                                        </button>
                                    </div>

                                    {/* Description */}
                                    <p className="text-sm text-slate-500 font-medium flex-grow mb-8 leading-relaxed line-clamp-3">
                                        {item.description || "No description provided. Add details to help customers understand your offering."}
                                    </p>

                                    {/* Footer / Pricing */}
                                    <div className="pt-5 border-t border-slate-100 flex justify-between items-end mt-auto">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Estimated Base Rate</p>
                                            <p className="text-3xl font-black text-slate-900 tracking-tighter leading-none">
                                                ₹{parseFloat(item.price_per_hour || item.price).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-brand transition-colors">
                                            <i className="fa-solid fa-arrow-right -rotate-45"></i>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* === ADD SERVICE DIALOG === */}
            <Dialog isOpen={isAdding} onClose={() => setIsAdding(false)} title="Configure New Service">
                <form onSubmit={handleAdd} className="p-6 md:p-8 space-y-6">
                    
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Category <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <i className="fa-solid fa-layer-group absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                            <select
                                className="w-full pl-12 pr-10 py-4 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none text-slate-900 font-bold bg-slate-50 hover:bg-white transition-all appearance-none cursor-pointer shadow-inner"
                                value={newService.category_id}
                                onChange={(e) => setNewService({ ...newService, category_id: e.target.value })}
                                required
                            >
                                <option value="" disabled>Select a category...</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            <i className="fa-solid fa-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs"></i>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Service Name <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <i className="fa-solid fa-tag absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                            <input
                                type="text" 
                                className="w-full pl-12 pr-5 py-4 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none text-slate-900 font-bold bg-slate-50 hover:bg-white transition-all placeholder:text-slate-400 shadow-inner"
                                placeholder="e.g. AC Deep Cleaning"
                                value={newService.service_name}
                                onChange={(e) => setNewService({ ...newService, service_name: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Base Price (₹) <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black">₹</span>
                            <input
                                type="number" 
                                className="w-full pl-10 pr-5 py-4 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none text-slate-900 font-black text-xl bg-slate-50 hover:bg-white transition-all placeholder:text-slate-300 shadow-inner"
                                placeholder="499"
                                value={newService.price_per_hour}
                                onChange={(e) => setNewService({ ...newService, price_per_hour: e.target.value })}
                                required
                                min="0"
                            />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 mt-2"><i className="fa-solid fa-circle-info text-slate-300"></i> This is the minimum amount shown to customers.</p>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Description</label>
                        <textarea
                            className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none text-slate-900 font-medium bg-slate-50 hover:bg-white transition-all min-h-[120px] resize-none placeholder:text-slate-400 shadow-inner"
                            placeholder="Detail exactly what this service includes to set clear expectations for the customer..."
                            value={newService.description}
                            onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                        ></textarea>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className={`w-full text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95 mt-2 flex items-center justify-center gap-2 ${
                            isSubmitting ? 'bg-slate-400 cursor-not-allowed shadow-none' : 'bg-slate-900 hover:bg-brand shadow-slate-900/20 hover:shadow-brand/30'
                        }`}
                    >
                        {isSubmitting ? (
                            <><i className="fa-solid fa-circle-notch fa-spin text-lg"></i> Saving to Catalog...</>
                        ) : (
                            <><i className="fa-solid fa-check text-sm"></i> Add Service to Profile</>
                        )}
                    </button>
                </form>
            </Dialog>

        </div>
    );
}; 

export default MyServices;