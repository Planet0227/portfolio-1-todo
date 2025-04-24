import React, { useState, useEffect, useRef } from "react";

const Modal = ({ isOpen, onClose, magnification, children }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true); // アニメーションを開始
    } else if (!isOpen && isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 200); // アニメーション終了後に非表示
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      // クリックがモーダル内なら何もしない
      if (modalRef.current && modalRef.current.contains(e.target)) return;
      // クリックが todo リスト内なら何もしない
      if (e.target.closest("[data-todo]")) return;
      // 上記以外の場合、モーダルを閉じる
      onClose();
    };

    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div
    ref={modalRef}
      className={`fixed w-full ${magnification ? "md:w-full"  : "md:w-1/2"} top-0 bottom-0 z-50 right-0 flex  transition-opacity duration-200 ${
        isOpen || isAnimating ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      <div
        className={`absolute w-full h-full transform transition-transform duration-200 bg-white shadow-lg  overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        
      >
          {children}
      </div>
    </div>
  );
};

export default Modal;
