import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../constants/api';

const ManageCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // --- FETCH CUSTOMERS ---
    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/get_customers.php`);
            const result = await res.json();
            if (result.status === 'success') {
                setCustomers(result.data);
            }
        } catch (error) {
            console.error("Error fetching customers:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    // --- FILTER & SEARCH LOGIC ---
    const filteredCustomers = customers.filter(customer => {
        return customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
               customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
               customer.phone.includes(searchTerm);
    });

    // Helper for Avatar
    const getImg = (img, name) => (!img || img === 'default_user.png') ? `https://ui-avatars.com/api/?name=${name}&background=e2e8f0&color=475569` : (img.startsWith('http') ? img : `${API_BASE_URL}/${img}`);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 pb-20">
            
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Manage Customers</h1>
                    <p className="text-sm font-medium text-slate-500">View registered users and their platform activity.</p>
                </div>
                
                {/* Search */}
                <div className="relative w-full sm:w-72">
                    <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input 
                        type="text" 
                        placeholder="Search by name, email, phone..." 
                        className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 w-full transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                                <th className="p-4 font-bold pl-6">Customer Info</th>
                                <th className="p-4 font-bold">Contact</th>
                                <th className="p-4 font-bold">Location</th>
                                <th className="p-4 font-bold text-center">Total Bookings</th>
                                <th className="p-4 font-bold text-right pr-6">Joined Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center"><i className="fa-solid fa-circle-notch fa-spin text-2xl text-brand"></i></td>
                                </tr>
                            ) : filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-400 font-medium">No customers found.</td>
                                </tr>
                            ) : (
                                filteredCustomers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors">
                                        
                                        {/* User Info */}
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <img src={getImg(customer.profile_img, customer.name)} alt={customer.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                                                <div>
                                                    <h6 className="font-bold text-slate-900">{customer.name}</h6>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ID: #USR-{customer.id}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Contact */}
                                        <td className="p-4">
                                            <p className="text-slate-700 font-medium">{customer.phone}</p>
                                            <p className="text-xs text-slate-500">{customer.email}</p>
                                        </td>

                                        {/* Location */}
                                        <td className="p-4 max-w-[200px]">
                                            <p className="font-bold text-slate-700 truncate">{customer.locality || 'Not specified'}</p>
                                            <p className="text-xs text-slate-500 truncate">{customer.address || 'No address added'}</p>
                                        </td>

                                        {/* Stats */}
                                        <td className="p-4 text-center">
                                            <span className={`inline-block px-3 py-1 rounded-lg font-bold text-xs ${
                                                customer.total_bookings > 0 ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                                {customer.total_bookings} Jobs
                                            </span>
                                        </td>

                                        {/* Joined Date */}
                                        <td className="p-4 pr-6 text-right">
                                            <p className="font-medium text-slate-700">
                                                {new Date(customer.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageCustomers;