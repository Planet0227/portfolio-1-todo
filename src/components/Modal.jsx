import React, { useState, useEffect } from "react";

const Modal = ({ isOpen, onClose, children }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true); // アニメーションを開始
      document.body.style.overflow = "hidden"; // 背景のスクロールを無効化
    } else if (!isOpen && isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 200); // アニメーション終了後に非表示
      document.body.style.overflow = ""; // 背景スクロールを有効化
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
        className={`md:w-1/2 w-full h-full transform transition-transform duration-200 bg-white shadow-lg  overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()} // モーダル内クリックを無効化
      >
          {children}
      </div>
    </div>
  );
};

export default Modal;
