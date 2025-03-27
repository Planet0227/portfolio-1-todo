"use client";

import { useState, useEffect, useRef } from "react";
import Todos from "@/components/Todos";
import { TodoProvider } from "@/context/TodoContext";
import { logout } from "@/firebase/auth";
import {
  faChevronLeft,
  faRightToBracket,
  faSignInAlt,
  faSignOutAlt,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Modal from "@/components/Modal";
import { deleteUser, updateProfile } from "firebase/auth";
import { deleteUserData } from "@/firebase/firebase";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  // ドロップダウン表示の状態管理
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  // モーダル表示の状態管理（アカウント設定）
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  // ログアウト確認オーバーレイの状態管理
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  // アカウント設定フォームの状態（例：ユーザー名とアイコン）
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newIconUrl, setNewIconUrl] = useState("");
  const [isHoveredExit, setIsHoveredExit] = useState(false);
  // ゲストログインかどうかの判定
  const isGuest = user && user.isAnonymous;
  
  
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
      if (dropDownRef.current && dropDownRef.current.contains(e.target)) return;
      // クリックが todo リスト内なら何もしない
      if (e.target.closest("[data-todo]")) return;
      // 上記以外の場合、モーダルを閉じる
      setAccountDropdownOpen(false);
    };

    if (accountDropdownOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [accountDropdownOpen]);

  // 未ログインの場合はログイン画面へ遷移
  const handleLoginClick = () => {
    router.push("/login");
  };

  // ログアウト処理（実行後、確認オーバーレイを閉じてページリロード）
  const handleLogoutClick = async () => {
    try {
      if(isGuest){
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

  // ユーザー情報が更新されたタイミングでフォームの初期値を設定
  useEffect(() => {
    if (user) {
      setNewDisplayName(user.displayName || "");
      setNewIconUrl(user.photoURL || "");
    }
  }, [user]);

  // アカウント設定モーダルの保存処理（通常ユーザーのみ対象）
  const handleAccountSave = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(user, {
        displayName: newDisplayName,
        photoURL: newIconUrl,
      });
      setIsAccountModalOpen(false);
      setAccountDropdownOpen(false);
    } catch (error) {
      console.error("アカウント更新エラー:", error);
    }
  };

  // ユーザー表示部分（アイコンと名前）のクリックでドロップダウンを切替
  const toggleAccountDropdown = () => {
    setAccountDropdownOpen((prev) => !prev);
  };



  if (loading) return <p className="text-lg">Loading...</p>;

  return (
    <TodoProvider>
      <div className="select-none">
        <header className="sticky top-0 z-30 flex items-center justify-between w-full p-1 px-10 py-3 text-white bg-lime-500">
          <h3 className="text-3xl">✓Task-Board</h3>
          {!user ? (
            // 未ログインの場合
            <button
              onClick={handleLoginClick}
              className="flex items-center gap-2 text-lg hover:underline"
            >
              <FontAwesomeIcon icon={faRightToBracket} className="text-2xl" />
              <p>ログイン</p>
            </button>
          ) : isGuest ? (
            // ゲストログインの場合
            <div className="relative inline-block">
              <button
                onClick={toggleAccountDropdown}
                className="flex items-center gap-2 text-lg focus:outline-none"
              >
                <FontAwesomeIcon icon={faUser} className="text-2xl" />
                <span>ゲスト</span>
              </button>
            </div>
          ) : (
            // 通常ログインの場合
            <div className="relative inline-block">
              <button
                onClick={toggleAccountDropdown}
                className="flex items-center gap-2 text-lg focus:outline-none"
              >
                <FontAwesomeIcon icon={faUser} className="text-2xl" />
                <span>{user.displayName || user.email}</span>
              </button>
            </div>
          )}
        </header>

        {accountDropdownOpen && (
          <div
            ref={dropDownRef}
            className="fixed right-0 z-50 w-40 text-black bg-white rounded shadow-lg top-12"
          >
            {isGuest ? (
              <>
                <button
                  onClick={handleLoginClick}
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
                    setAccountDropdownOpen(false);
                  }}
                  className="block w-full px-6 py-3 text-left hover:bg-gray-200"
                >
                  アカウント設定
                </button>
                <button
                  onClick={() => {
                    setIsLogoutConfirmOpen(true);
                    setAccountDropdownOpen(false);
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

        <Todos />

        {/* アカウント設定用モーダル（通常ユーザーのみ対象） */}
        <Modal
          isOpen={isAccountModalOpen}
          onClose={() => setIsAccountModalOpen(false)}
        >
          <div>
            <div className="relative flex items-center justify-between p-4">
              <button
                className="mx-2 text-xl text-gray-300 hover:text-gray-500"
                onClick={() => setIsAccountModalOpen(false)}
                onMouseEnter={() => setIsHoveredExit(true)}
                onMouseLeave={() => setIsHoveredExit(false)}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <div
                className={`absolute z-10 flex flex-col items-center p-1 text-xs text-white transform bg-gray-600 rounded shadow-lg left-2 transition-all top-11 duration-300 ${
                  isHoveredExit
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-90 pointer-events-none"
                }`}
              >
                <div>閉じる</div>
                <div>（esc）</div>
              </div>
            </div>
            <div className="p-4">
              <h2 className="mb-4 text-xl font-bold">アカウント設定</h2>
              <form
                onSubmit={handleAccountSave}
                className="flex flex-col gap-3 p-8"
              >
                <label className="flex flex-col">
                  ユーザー名
                  <input
                    type="text"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    className="p-2 mt-1 border"
                    required
                  />
                </label>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
                >
                  保存
                </button>
              </form>
            </div>
          </div>
        </Modal>

        {/* ログアウト確認オーバーレイ */}
        {isLogoutConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="p-6 bg-white rounded shadow-lg">
              {isGuest ? (
                <div className="flex flex-col items-center">
                  <h2 className="mb-4 text-xl font-bold">ゲストログアウト</h2>
                  <p>
                    ゲストアカウントからログアウトすると
                    <span className="text-red-500">再ログインできません</span>。
                  </p>
                  <p>本当にログアウトしてよろしいですか？</p>
                </div>
              ) : (
                <div>
                  <h2 className="mb-4 text-xl font-bold">ログアウト</h2>
                  <p>本当にログアウトしてよろしいですか？</p>
                </div>
              )}

              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={() => setIsLogoutConfirmOpen(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-200"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleLogoutClick}
                  className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
                >
                  ログアウト
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TodoProvider>
  );
}
