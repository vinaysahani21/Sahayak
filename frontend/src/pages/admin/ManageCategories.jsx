import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../../constants/api';
import Dialog from '../../components/ui/Dialog';

const ManageCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal & Form State
    const [showAddModal, setShowAddModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: '', slug: '' });
    const [imageFile, setImageFile] = useState(null);
    const fileInputRef = useRef(null);

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
            name: val,
            slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        });
    };

    // --- ADD CATEGORY ---
    const handleAdd = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.slug || !imageFile) {
            return alert("Please fill all fields and select an image.");
        }

        setIsSubmitting(true);
        const uploadData = new FormData();
        uploadData.append('name', formData.name);
        uploadData.append('slug', formData.slug);
        uploadData.append('image', imageFile);

        try {
            const res = await fetch(`${API_BASE_URL}/admin/add_category.php`, {
                method: 'POST',
                // Do NOT set Content-Type header when sending FormData!
                body: uploadData
            });
            const result = await res.json();

            if (result.status === 'success') {
                setShowAddModal(false);
                setFormData({ name: '', slug: '' });
                setImageFile(null);
                if(fileInputRef.current) fileInputRef.current.value = '';
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
        if (!window.confirm(`Are you sure you want to delete the "${name}" category? This might affect providers offering these services.`)) return;

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

    const getImg = (img) => {
        if (!img) return `https://ui-avatars.com/api/?name=C&background=f8fafc&color=334155`;
        // If the DB saves just the filename (e.g. 'plumber.png'), we prefix it with the uploads path.
        // Adjust this if your DB saves the full '/uploads/categories/...' path.
        return img.includes('/') ? `${API_BASE_URL}${img}` : `${API_BASE_URL}/uploads/categories/${img}`;
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 pb-20">
            
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Service Categories</h1>
                    <p className="text-sm font-medium text-slate-500">Manage the master list of services available on Sahaayak.</p>
                </div>
                
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center justify-center gap-2 bg-brand text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-brand/20"
                >
                    <i className="fa-solid fa-plus"></i> Add Category
                </button>
            </div>

            {/* Grid Layout */}
            {loading ? (
                <div className="flex justify-center py-20"><i className="fa-solid fa-circle-notch fa-spin text-4xl text-brand"></i></div>
            ) : categories.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 text-2xl">
                        <i className="fa-solid fa-layer-group"></i>
                    </div>
                    <h4 className="text-slate-900 font-bold text-lg">No categories found</h4>
                    <p className="text-slate-500 text-sm mt-1">Create your first service category to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                    {categories.map((cat) => (
                        <div key={cat.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group relative flex flex-col items-center text-center">
                            
                            {/* Delete Button (Hidden until hover) */}
                            <button 
                                onClick={() => handleDelete(cat.id, cat.name)}
                                className="absolute top-3 right-3 w-8 h-8 bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                                title="Delete Category"
                            >
                                <i className="fa-solid fa-trash-can text-xs"></i>
                            </button>

                            <img 
                                src={getImg(cat.image)} 
                                alt={cat.name} 
                                className="w-20 h-20 object-contain mb-4 mt-2 transition-transform group-hover:scale-110"
                            />
                            <h6 className="font-bold text-slate-900 leading-tight">{cat.name}</h6>
                            <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wider">/{cat.slug}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* === ADD MODAL === */}
            <Dialog isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create Category">
                <form onSubmit={handleAdd} className="p-1 space-y-4">
                    
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Category Name</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none text-slate-900 font-medium bg-slate-50"
                            placeholder="e.g. Pest Control"
                            value={formData.name}
                            onChange={handleNameChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">URL Slug (Auto-generated)</label>
                        <div className="flex items-center">
                            <span className="bg-slate-100 text-slate-400 px-3 py-3 border border-r-0 border-slate-200 rounded-l-xl font-medium text-sm">sahaayak.com/</span>
                            <input 
                                type="text" 
                                className="w-full px-4 py-3 rounded-r-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none text-slate-900 font-medium bg-slate-50"
                                value={formData.slug}
                                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Category Icon (PNG/JPG)</label>
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand outline-none text-slate-600 bg-slate-50 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-brand/10 file:text-brand hover:file:bg-brand/20 transition-all"
                            accept="image/png, image/jpeg"
                            onChange={(e) => setImageFile(e.target.files[0])}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className={`w-full text-white font-bold py-3.5 rounded-xl transition-all shadow-lg mt-2 ${isSubmitting ? 'bg-slate-400' : 'bg-black hover:bg-slate-800 shadow-black/20 active:scale-[0.98]'}`}
                    >
                        {isSubmitting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Save Category'}
                    </button>
                </form>
            </Dialog>

        </div>
    );
};

export default ManageCategories;