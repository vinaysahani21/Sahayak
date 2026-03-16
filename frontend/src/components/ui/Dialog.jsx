import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Dialog.css'; // <--- IMPORT THE CSS HERE

const Dialog = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="dialog-overlay" onClick={onClose}>
          
          {/* STOP PROPAGATION so clicking inside doesn't close it */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()} 
            className="dialog-content"
          >
            {/* Header */}
            <div className="dialog-header">
              <h3 className="dialog-title">{title}</h3>
              <button onClick={onClose} className="dialog-close-btn">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Body */}
            <div className="dialog-body">
              {children}
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Dialog;