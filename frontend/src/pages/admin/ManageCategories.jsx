import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../constants/api';
import Dialog from '../../components/ui/Dialog';

const ManageCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal & Form State
    const [showAddModal, setShowAddModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Default to 'fa-wrench' as the starting icon
    const [formData, setFormData] = useState({ name: '', slug: '', icon: 'fa-wrench' });

    // A curated list of high-quality FontAwesome icons for home services
    const iconLibrary = [
        'fa-wrench', 'fa-bolt', 'fa-broom', 'fa-snowflake', 
        'fa-paint-roller', 'fa-hammer', 'fa-bug', 'fa-plug', 
        'fa-droplet', 'fa-fire', 'fa-truck-fast', 'fa-scissors',
        'fa-fan', 'fa-couch', 'fa-bath', 'fa-screwdriver-wrench'
    ];

    // --- FETCH CATEGORIES ---
    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/get_categories.php`);
            const result = await res.json();
            if (result.status === 'success') {
                setCategories(result.data);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Auto-generate slug when name changes
    const handleNameChange = (e) => {
        const val = e.target.value;
        setFormData({
            ...formData,
            name: val,
            slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        });
    };

    // --- ADD CATEGORY ---
    const handleAdd = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.slug || !formData.icon) {
            return alert("Please fill all fields and select an icon.");
        }

        setIsSubmitting(true);

        try {
            const res = await fetch(`${API_BASE_URL}/admin/add_category.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const result = await res.json();

            if (result.status === 'success') {
                setShowAddModal(false);
                setFormData({ name: '', slug: '', icon: 'fa-wrench' });
                fetchCategories(); // Refresh list
            } else {
                alert(result.message || "Failed to add category");
            }
        } catch (error) {
            alert("Server error processing request.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- DELETE CATEGORY ---
    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to permanently delete the "${name}" category?`)) return;

        try {
            const res = await fetch(`${API_BASE_URL}/admin/delete_category.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category_id: id })
            });
            const result = await res.json();

            if (result.status === 'success') {
                setCategories(categories.filter(c => c.id !== id));
            } else {
                alert(result.message || "Failed to delete.");
            }
        } catch (error) {
            alert("Error deleting category.");
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 pb-24 font-sans selection:bg-brand/20 selection:text-brand">
            
            {/* --- HEADER --- */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Service Categories</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Manage the platform's master list of available services.</p>
                </div>
                
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-xl text-sm font-bold hover:bg-brand transition-all shadow-lg active:scale-95"
                >
                    <i className="fa-solid fa-plus text-xs"></i> Create Category
                </button>
            </div>

            {/* --- GRID LAYOUT --- */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <div className="w-14 h-14 border-4 border-slate-200 border-t-brand rounded-full animate-spin mb-6 shadow-sm"></div>
                    <p className="text-slate-500 font-bold tracking-tight">Syncing catalog...</p>
                </div>
            ) : categories.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-[2rem] border border-dashed border-slate-300 shadow-sm animate-fade-in-up">
                    <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-300 text-4xl shadow-inner border border-slate-100">
                        <i className="fa-solid fa-layer-group"></i>
                    </div>
                    <h4 className="text-slate-900 font-black text-2xl tracking-tight mb-2">No categories found</h4>
                    <p className="text-slate-500 text-sm font-medium">Create your first service category to populate the directory.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 animate-fade-in-up">
                    {categories.map((cat) => (
                        <div key={cat.id} className="bg-white rounded-[2rem] p-6 border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-brand/30 transition-all duration-300 group relative flex flex-col items-center text-center cursor-default overflow-hidden">
                            
                            {/* Decorative Top Accent */}
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 group-hover:bg-brand transition-colors duration-300"></div>

                            {/* Delete Button (Hidden until hover) */}
                            <button 
                                onClick={() => handleDelete(cat.id, cat.name)}
                                className="absolute top-4 right-4 w-8 h-8 bg-slate-50 border border-slate-200 text-slate-400 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-500 hover:border-red-200 shadow-sm active:scale-95 md:translate-y-2 md:group-hover:translate-y-0"
                                title="Delete Category"
                            >
                                <i className="fa-solid fa-trash-can text-sm"></i>
                            </button>

                            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center text-2xl mb-4 mt-2 transition-all duration-300 group-hover:scale-110 group-hover:bg-brand group-hover:text-white group-hover:border-transparent shadow-inner">
                                {/* If your old DB rows still have images like 'plumber.png', this will fallback safely. But new ones use the icon string. */}
                                <i className={`fa-solid ${cat.icon || 'fa-screwdriver-wrench'}`}></i>
                            </div>
                            
                            <h6 className="font-black text-slate-900 leading-tight text-lg group-hover:text-brand transition-colors">{cat.name}</h6>
                            <p className="text-[10px] text-slate-400 font-black mt-1.5 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md">/{cat.slug}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* === ADD CATEGORY MODAL === */}
            <Dialog isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create Category">
                <form onSubmit={handleAdd} className="p-6 md:p-8 space-y-6">
                    
                    {/* Live Preview Card */}
                    <div className="flex justify-center mb-6">
                        <div className="bg-white rounded-[1.5rem] p-6 border border-slate-200 shadow-lg flex flex-col items-center text-center w-40 transform scale-110">
                            <div className="w-14 h-14 rounded-2xl bg-brand text-white flex items-center justify-center text-xl mb-3 shadow-inner">
                                <i className={`fa-solid ${formData.icon}`}></i>
                            </div>
                            <h6 className="font-black text-slate-900 leading-tight text-sm truncate w-full">{formData.name || 'Preview Name'}</h6>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Category Name</label>
                        <div className="relative">
                            <i className="fa-solid fa-tag absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                            <input 
                                type="text" 
                                className="w-full pl-12 pr-5 py-4 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none text-slate-900 font-bold bg-slate-50 hover:bg-white transition-all shadow-inner placeholder:text-slate-300"
                                placeholder="e.g. Pest Control"
                                value={formData.name}
                                onChange={handleNameChange}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">URL Slug</label>
                        <div className="flex items-center shadow-inner rounded-xl overflow-hidden border border-slate-200 focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10 transition-all">
                            <span className="bg-slate-100 text-slate-400 px-4 py-4 font-bold text-sm border-r border-slate-200">/category/</span>
                            <input 
                                type="text" 
                                className="w-full px-4 py-4 outline-none text-slate-900 font-bold bg-slate-50 hover:bg-white transition-colors"
                                value={formData.slug}
                                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest">Select Icon</label>
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                            {iconLibrary.map(iconClass => (
                                <button
                                    key={iconClass}
                                    type="button"
                                    onClick={() => setFormData({...formData, icon: iconClass})}
                                    className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center text-lg transition-all active:scale-95 ${
                                        formData.icon === iconClass 
                                        ? 'bg-slate-900 text-white shadow-md transform -translate-y-1' 
                                        : 'bg-white text-slate-400 border border-slate-200 hover:border-brand hover:text-brand shadow-sm'
                                    }`}
                                >
                                    <i className={`fa-solid ${iconClass}`}></i>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className={`w-full text-white font-bold py-4 rounded-xl transition-all shadow-lg mt-4 active:scale-95 flex items-center justify-center gap-2 ${
                            isSubmitting ? 'bg-slate-400 cursor-not-allowed shadow-none' : 'bg-slate-900 hover:bg-brand shadow-slate-900/20 hover:shadow-brand/30'
                        }`}
                    >
                        {isSubmitting ? <><i className="fa-solid fa-circle-notch fa-spin text-lg"></i> Saving...</> : <><i className="fa-solid fa-check text-sm"></i> Publish Category</>}
                    </button>
                </form>
            </Dialog>

        </div>
    );
};

export default ManageCategories;