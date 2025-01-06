import React, { useState, useEffect } from "react";

const Modal = ({ isOpen, onClose, children }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true); // アニメーションを開始
    } else if (!isOpen && isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 200); // アニメーション終了後に非表示
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-200 ${
        isOpen || isAnimating ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
      onClick={onClose}
    >
      
      <div
        className={`w-5/12 h-full bg-gray-100 transform transition-transform duration-200 rounded-l-2xl over ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()} // モーダル内クリックを無効化
      >
        <button className="p-4 text-blue-500" onClick={onClose}>＞＞</button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
