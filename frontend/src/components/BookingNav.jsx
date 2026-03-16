import React from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function BookingNav() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const activeTab = searchParams.get('tab') || 'active';

    const handleTabChange = (tab) => {
        setSearchParams({ tab: tab });
    };
    return (
        <div>
            <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">

                    {/* Title Section */}
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="md:hidden text-gray-500">
                            <i className="fa-solid fa-arrow-left text-lg"></i>
                        </button>
                        <div>
                            <h3 className="text-xl font-bold font-display text-gray-900 leading-none">My Bookings</h3>
                            <p className="text-xs text-gray-500 mt-1">Track your service status</p>
                        </div>
                    </div>

                    {/* Toggle Switch */}
                    <div className="bg-gray-100 p-1 rounded-lg flex w-full md:w-auto">
                        <button
                            className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-bold transition-all duration-200 ${activeTab === 'active' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => handleTabChange('active')}
                        >
                            Upcoming
                        </button>
                        <button
                            className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-bold transition-all duration-200 ${activeTab === 'history' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => handleTabChange('history')}
                        >
                            History
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}
