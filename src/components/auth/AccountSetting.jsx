"use client";

import { useState, useEffect } from "react";
import { updateProfile } from "firebase/auth";
import { app } from "@/firebase/firebaseConfig";
import { useAuth } from "@/context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faUser } from "@fortawesome/free-solid-svg-icons";
import { authenticatedFetch } from "@/utils/authToken";

const AccountSettings = ({ onClose }) => {
  const { user, accountInfo, loading, dispatch } = useAuth();
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newIconUrl, setNewIconUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [isHoveredExit, setIsHoveredExit] = useState(false);

  // 初期値セット
  useEffect(() => {
    if (!loading && user) {
      setNewDisplayName(accountInfo?.displayName || user.displayName || "");
      setNewIconUrl(accountInfo?.iconDataUrl || "");
    }
  }, [user, accountInfo, loading]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 300;
        const scale = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;
  
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
        // JPEGに変換 & 画質70%
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
        setNewIconUrl(compressedBase64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setUploading(true);
    setError("");
    dispatch({
      type: "SET_ACCOUNT_INFO",
      payload: { displayName: newDisplayName, iconDataUrl: newIconUrl },
    });

    try {
      await authenticatedFetch("/api/account", {
        method: "PATCH",
        body: JSON.stringify({ displayName: newDisplayName,
          iconDataUrl: newIconUrl, }),
      });

      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="h-full mx-auto overflow-hidden bg-white shadow-lg rounded-2xl">
      {/* ヘッダー */}
      <div className="relative flex items-center justify-between p-4 border-b">
        <button
          className="p-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
          onMouseEnter={() => setIsHoveredExit(true)}
          onMouseLeave={() => setIsHoveredExit(false)}
          aria-label="閉じる"
        >
          <FontAwesomeIcon icon={faChevronLeft} size="lg" />
        </button>
        <div
          className={`absolute z-10 flex flex-col items-center p-1 text-xs text-white transform bg-gray-600 rounded shadow-lg left-2 top-12 transition-all duration-300 ${
            isHoveredExit ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"
          }`}
        >
          <div>閉じる</div>
          <div>（esc）</div>
        </div>
        <h2 className="text-lg font-semibold text-gray-800">アカウント設定</h2>
        <div className="w-6" />
      </div>

      {/* コンテンツ */}
      <div className="px-12 py-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* ユーザー名 */}
          <div className="flex flex-col">
            <label className="mb-2 text-sm font-medium text-gray-700">ユーザー名</label>
            <input
              type="text"
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="ユーザー名"
              required
            />
          </div>

          {/* プロフィール画像 */}
          <div className="flex flex-col">
            <label className="mb-2 text-sm font-medium text-gray-700">プロフィール画像</label>
            <div className="flex items-center space-x-4">
              {newIconUrl ? (
                <img
                  src={newIconUrl}
                  alt="アイコンプレビュー"
                  className="object-cover w-24 h-24 border rounded-full"
                />
              ) : (
                <div className="flex items-center justify-center w-16 h-16 bg-gray-400 border rounded-full">
                  <FontAwesomeIcon className="w-10 h-10 text-white" icon={faUser} />
                </div>
              )}
              <label className="px-4 py-2 text-green-700 bg-green-100 rounded-lg cursor-pointer hover:bg-green-200">
                画像を選択
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            {uploading && <p className="mt-2 text-xs text-gray-500">保存中...</p>}
            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
          </div>

          {/* 保存ボタン */}
          <div className="mt-20">
            <button
              type="submit"
              className="w-full py-3 text-white transition bg-green-500 rounded-lg hover:bg-green-600"
              disabled={uploading}
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountSettings;
