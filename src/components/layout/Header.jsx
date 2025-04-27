import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import Modal from "@/components/common/Modal";
import { deleteUser } from "firebase/auth";
import { deleteUserData } from "@/firebase/firebase";
import AccountSettings from "@/components/auth/AccountSetting";
import { logout, signInAsGuest } from "@/firebase/auth";
import {
  faRightToBracket,
  faSignInAlt,
  faSignOutAlt,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "@/context/AuthContext";
import ConfirmOverlay from "../common/ConfirmOverlay";

export const Header = () => {
  const router = useRouter();
  const { user, loading, accountInfo } = useAuth();
  // ドロップダウン表示の状態管理
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // モーダル表示の状態管理（アカウント設定）
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  // ログアウト確認オーバーレイの状態管理
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const isGuest = user && user.isAnonymous;
  const displayName =
    accountInfo?.displayName || user?.displayName || (isGuest ? "ゲスト" : "");
  const iconUrl = accountInfo?.iconDataUrl;
  // アカウント設定フォームの状態（例：ユーザー名とアイコン）
  const [newDisplayName, setNewDisplayName] = useState(displayName);
  const [newIconUrl, setNewIconUrl] = useState(iconUrl);

  const dropDownRef = useRef();

  //モーダルをEscで閉じる
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsAccountModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      // クリックがモーダル内なら何もしない
      if (
        dropDownRef.current?.contains(e.target) ||
        e.target.closest("[data-todo]")
      )
        return;

      setDropdownOpen(false);
    };

    if (dropdownOpen) document.addEventListener("click", handleClickOutside);

    return () => document.removeEventListener("click", handleClickOutside);
  }, [dropdownOpen]);

  // ログアウト処理（実行後、確認オーバーレイを閉じてページリロード）
  const handleLogoutClick = async () => {
    try {
      if (isGuest) {
        await deleteUserData(user.uid);
        await deleteUser(user);
      }
      await logout();
      setIsLogoutConfirmOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("ログアウトエラー", error);
    }
  };

  const handleGuestLogin = async () => {
    try {
      await signInAsGuest();
      router.push("/");
      window.location.reload();
    } catch (error) {
      console.error("ゲストログイン失敗:", error);
    }
  };

  // ユーザー情報が更新されたタイミングでフォームの初期値を設定
  useEffect(() => {
    if (!loading && user) {
      setNewDisplayName(accountInfo.displayName || user.displayName || "");
      if (accountInfo && accountInfo.iconDataUrl) {
        setNewIconUrl(accountInfo.iconDataUrl);
      }
    }
  }, [user, accountInfo, loading]);

  // ユーザー表示部分（アイコンと名前）のクリックでドロップダウンを切替
  const toggleAccountDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between w-full p-1 px-10 py-3 text-white bg-lime-500">
        <h3 className="text-3xl">✓Task-Board</h3>
        {!user ? (
          // 未ログインの場合
          <div className="flex gap-4">
            <button
              onClick={handleGuestLogin}
              className="flex items-center gap-2 text-lg hover:underline"
            >
              <FontAwesomeIcon icon={faSignInAlt} className="text-2xl" />
              <p>ゲストログイン</p>
            </button>
            <button
              onClick={() => router.push("/login")}
              className="flex items-center gap-2 text-lg hover:underline"
            >
              <FontAwesomeIcon icon={faRightToBracket} className="text-2xl" />
              <p>ログイン/新規登録</p>
            </button>
          </div>
        ) : isGuest ? (
          // ゲストログインの場合
          <div className="relative inline-block">
            <button
              onClick={toggleAccountDropdown}
              className="flex items-center gap-2 text-lg hover:underline"
            >
              <FontAwesomeIcon
                icon={faUser}
                className="p-1.5 bg-gray-400 rounded-full w-7 h-7"
              />
              <span>ゲスト</span>
            </button>
          </div>
        ) : (
          // 通常ログインの場合
          <div className="relative inline-block">
            <button
              onClick={toggleAccountDropdown}
              className="flex items-center gap-2 hover:underline"
            >
              {newIconUrl ? (
                <img
                  src={newIconUrl}
                  alt="ユーザーアイコン"
                  className="object-cover w-12 h-12 rounded-full"
                />
              ) : (
                <FontAwesomeIcon
                  icon={faUser}
                  className="p-1.5 bg-gray-400 rounded-full w-7 h-7"
                />
              )}
              <span className="text-lg">{newDisplayName}</span>
            </button>
          </div>
        )}
      </header>

      {dropdownOpen && (
        <div
          ref={dropDownRef}
          className="fixed right-0 z-50 w-40 text-black bg-white rounded shadow-lg top-16"
        >
          {isGuest ? (
            <>
              <button
                onClick={() => router.push("/login?mode=register")}
                className="flex items-center w-full px-6 py-3 text-left text-lime-500 hover:bg-gray-200"
              >
                <p>新規登録</p>
                <FontAwesomeIcon icon={faSignInAlt} className="pl-3" />
              </button>
              <button
                onClick={() => router.push("/login")}
                className="flex items-center w-full px-6 py-3 text-left text-blue-500 hover:bg-gray-200"
              >
                <p>ログイン</p>
                <FontAwesomeIcon icon={faSignInAlt} className="pl-3" />
              </button>
              <button
                onClick={() => setIsLogoutConfirmOpen(true)}
                className="flex items-center w-full px-6 py-3 text-left text-red-400 hover:bg-gray-200"
              >
                <p>ログアウト</p>
                <FontAwesomeIcon icon={faSignOutAlt} className="pl-3" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setIsAccountModalOpen(true);
                  setDropdownOpen(false);
                }}
                className="block w-full px-6 py-3 text-left hover:bg-gray-200"
              >
                アカウント設定
              </button>
              <button
                onClick={() => {
                  setIsLogoutConfirmOpen(true);
                  setDropdownOpen(false);
                }}
                className="flex items-center w-full px-6 py-3 text-left text-red-400 hover:bg-gray-200"
              >
                <p>ログアウト</p>
                <FontAwesomeIcon icon={faSignOutAlt} className="pl-3" />
              </button>
            </>
          )}
        </div>
      )}

      {/* アカウント設定用モーダル（通常ユーザーのみ対象） */}
      <Modal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      >
        <AccountSettings onClose={() => setIsAccountModalOpen(false)} />
      </Modal>

      {/* ログアウト確認オーバーレイ */}
      {isLogoutConfirmOpen && (
        <ConfirmOverlay
          isOpen={isLogoutConfirmOpen}
          title={isGuest ? "ゲストログアウト" : "ログアウト"}
          description={
            isGuest ? (
              <>
                <p>
                  ゲストアカウントの場合は{" "}
                  <span className="text-red-500">再ログインできません</span>。
                </p>
                <p>本当にログアウトしてよろしいですか？</p>
              </>
            ) : (
              <p>本当にログアウトしてよろしいですか？</p>
            )
          }
          onCancel={() => setIsLogoutConfirmOpen(false)}
          onConfirm={handleLogoutClick}
          confirmText="ログアウト"
          cancelText="キャンセル"
        />
      )}
    </>
  );
};
