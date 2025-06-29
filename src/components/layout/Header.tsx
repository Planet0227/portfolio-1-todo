"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import Modal from "@/components/common/Modal";
import { deleteUser } from "firebase/auth";
import { deleteUserData } from "@/firebase/firebase";
import AccountSettings from "@/components/auth/AccountSetting";
import { logout, signInAsGuest } from "@/firebase/auth";
import {
  faGear,
  faRightToBracket,
  faSignInAlt,
  faSignOutAlt,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "@/context/AuthContext";
import ConfirmOverlay from "../common/ConfirmOverlay";
import AppIcon from "../icons/AppIcon";

interface HeaderProps {
  simple?: boolean;
}

export const Header:React.FC<HeaderProps> = ({ simple = false }) => {
  const router = useRouter();
  const { user, isAuthLoading, accountInfo } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const isGuest = user && user.isAnonymous;

  const displayName =
    accountInfo?.displayName || user?.displayName || (isGuest ? "ゲスト" : "");
  const iconUrl = accountInfo?.iconDataUrl;

  const [newDisplayName, setNewDisplayName] = useState(displayName);
  const [newIconUrl, setNewIconUrl] = useState(iconUrl);

  const dropDownRef = useRef<HTMLDivElement | null>(null);

  // Escキーでモーダル閉じる
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setIsAccountModalOpen(false);
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  // クリック外でドロップダウン閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        dropDownRef.current?.contains(target) ||
        (target instanceof Element && target.closest("[data-todo]"))
      ){

        return;
      }

      setDropdownOpen(false);
    };

    if (dropdownOpen) document.addEventListener("click", handleClickOutside);

    return () => document.removeEventListener("click", handleClickOutside);
  }, [dropdownOpen]);

  const handleLogout = async () => {
    try {
      if (isGuest) {
        await deleteUserData(user.uid);
        await deleteUser(user);
      }
      await logout();
      setIsLogoutConfirmOpen(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  const handleGuestLogin = async () => {
    try {
      await signInAsGuest();
      router.push("/");
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  // ユーザー情報が更新されたタイミングでフォームの初期値を設定
  useEffect(() => {
    if (!isAuthLoading && user) {
      setNewDisplayName(
        accountInfo?.displayName ||
          user.displayName ||
          (isGuest ? "ゲスト" : "")
      );
      setNewIconUrl(accountInfo?.iconDataUrl || "");
    }
  }, [user, accountInfo, isAuthLoading, isGuest]);

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-green-200 via-blue-200 to-purple-200 shadow-sm">
    <div className="container flex justify-between items-center px-6 py-3 mx-auto">
      <h1
        className="flex items-center space-x-2 font-extrabold text-white cursor-pointer text-md md:text-3xl"
        onClick={() => router.push("/")}
      >
        <AppIcon size={30} />
        <span>List-Board</span>
        </h1>
        {simple ? null : (
          <>
            {/* 未ログイン */}
            {!user ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleGuestLogin}
                  className="flex items-center px-3 py-1 space-x-1 bg-white rounded-lg border border-white transition hover:bg-white/80"
                >
                  <FontAwesomeIcon icon={faSignInAlt} />
                  <span className="text-xs text-lime-500 md:text-base">
                    ゲスト
                    <br />
                    ログイン
                  </span>
                </button>
                <button
                  onClick={() => router.push("/login")}
                  className="flex items-center px-3 py-1 space-x-1 bg-white rounded-lg border border-white transition hover:bg-white/80"
                >
                  <FontAwesomeIcon icon={faRightToBracket} />
                  <span className="text-xs text-lime-500 md:text-base">
                    ログイン / <br />
                    新規登録
                  </span>
                </button>
              </div>
            ) : (
              // ログイン済み
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  {newIconUrl ? (
                    <img
                      src={newIconUrl}
                      alt="ユーザーアイコン"
                      className="object-cover w-10 h-10 rounded-full border-2 border-white"
                    />
                  ) : (
                    <FontAwesomeIcon
                      icon={faUser}
                      className="w-8 h-8 text-white"
                    />
                  )}
                  <span className="font-semibold text-white">
                    {newDisplayName}
                  </span>
                </button>

                {dropdownOpen && (
                  <div
                    ref={dropDownRef}
                    className="overflow-hidden absolute -right-4 top-9 w-32 bg-white rounded-lg ring-1 ring-black ring-opacity-5 shadow-xl md:left-0 md:w-40"
                  >
                    {isGuest ? (
                      <>
                        <button
                          onClick={() => router.push("/login?mode=register")}
                          className="flex items-center px-3 py-2 w-full text-xs text-lime-600 transition md:text-sm hover:bg-lime-50"
                        >
                          <FontAwesomeIcon
                            icon={faSignInAlt}
                            className="mr-2"
                          />
                          新規登録
                        </button>
                        <button
                          onClick={() => router.push("/login")}
                          className="flex items-center px-3 py-2 w-full text-xs text-sky-500 transition md:text-sm hover:bg-sky-50"
                        >
                          <FontAwesomeIcon
                            icon={faSignInAlt}
                            className="mr-2"
                          />
                          ログイン
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setIsAccountModalOpen(true);
                            setDropdownOpen(false);
                          }}
                          className="flex items-center px-3 py-2 w-full text-xs text-left text-gray-700 transition md:text-sm hover:bg-gray-100"
                        >
                          <FontAwesomeIcon icon={faGear} className="mr-2"/>
                          アカウント
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setIsLogoutConfirmOpen(true)}
                      className="flex items-center px-3 py-2 w-full text-xs text-red-500 transition md:text-sm hover:bg-red-50"
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                      ログアウト
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* モーダル & オーバーレイ */}
      <Modal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      >
        <AccountSettings onClose={() => setIsAccountModalOpen(false)} />
      </Modal>

      {isLogoutConfirmOpen && (
        <ConfirmOverlay
          isOpen={isLogoutConfirmOpen}
          title={isGuest ? "ゲストログアウト" : "ログアウト"}
          description={
            isGuest ? (
              <>
                <p>
                  ゲストアカウントは
                  <span className="text-red-500">再ログインできません。</span>
                </p>
                <p>本当にログアウトしますか？</p>
              </>
            ) : (
              <p>本当にログアウトしますか？</p>
            )
          }
          onCancel={() => setIsLogoutConfirmOpen(false)}
          onConfirm={handleLogout}
          confirmText="ログアウト"
          cancelText="キャンセル"
        />
      )}
    </header>
  );
};
