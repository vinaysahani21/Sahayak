import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Navbar(props) {
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h5 className="text-lg font-bold text-gray-900">{props.title}</h5>
      </div>
    </div>
  );
}