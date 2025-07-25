import React, { useState, useEffect, useRef, ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  magnification?: boolean;
  children: ReactNode;
}

const Modal:React.FC<ModalProps> = ({ isOpen, onClose, magnification, children }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (isOpen) {
      setIsAnimating(true);
    } else if (isAnimating) {
      timer = setTimeout(() => setIsAnimating(false), 200);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen, isAnimating]);
  

  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // クリックがモーダル内なら何もしない
      const target = e.target as Element;
      if (modalRef.current && modalRef.current.contains(target)) return;
      // クリックが todo リスト内なら何もしない
      if (target.closest("[data-todo]")) return;
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
      className={`fixed w-full ${magnification ? "md:w-full"  : "md:w-2/5"} top-0 bottom-0 z-50 right-0 flex transition-opacity duration-200 ${
        isOpen || isAnimating ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      <div
        className={`absolute w-full h-full transform transition-transform duration-200 bg-white shadow-2xl   overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        
      >
          {children}
      </div>
    </div>
  );
};

export default Modal;
