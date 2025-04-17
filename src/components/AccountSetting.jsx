"use client";

import { useState, useEffect } from "react";
import { updateProfile } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "@/firebase/firebaseConfig";
import { useAuth } from "@/context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faUser } from "@fortawesome/free-solid-svg-icons";

const AccountSettings = ({ onClose }) => {
  const { user } = useAuth();
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newIconUrl, setNewIconUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [isHoveredExit, setIsHoveredExit] = useState(false);

  useEffect(() => {
    if (user) {
      setNewDisplayName(user.displayName || "");
      setNewIconUrl(user.photoURL || "");
    }
  }, [user]);

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    // if (!file) return;
    setUploading(true);
    setError("");
    try {
      const storage = getStorage(app);
      const fileRef = ref(storage, `users/${user.uid}/profile.jpg`);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);
      console.log("画像URL:", downloadURL);
      setNewIconUrl(downloadURL);
    } catch (error) {
      console.error("画像アップロードエラー:", error);
      setError("画像のアップロードに失敗しました。");
    } finally {
      setUploading(false);
    }
  };

  const handleAccountSave = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(user, {
        displayName: newDisplayName,
        photoURL: newIconUrl,
      });
      onClose();
    } catch (error) {
      console.error("アカウント更新エラー:", error);
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
            isHoveredExit
              ? "opacity-100 scale-100"
              : "opacity-0 scale-90 pointer-events-none"
          }`}
        >
          <div>閉じる</div>
          <div>（esc）</div>
        </div>
        <h2 className="text-lg font-semibold text-gray-800">アカウント設定</h2>
        <div className="w-6" /> {/* スペーサー */}
      </div>

      {/* コンテンツ */}
      <div className="px-12 py-6">
        <form onSubmit={handleAccountSave} className="flex flex-col gap-6">
          <div className="flex flex-col">
            <label className="mb-2 text-sm font-medium text-gray-700">
              ユーザー名
            </label>
            <input
              type="text"
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="ユーザー名"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 text-sm font-medium text-gray-700">
              プロフィール画像
            </label>
            <div className="flex items-center space-x-4">
              {newIconUrl ? (
                // <img
                //   src={newIconUrl}
                //   alt="プロフィールプレビュー"
                //   className="object-cover w-16 h-16 border rounded-full"
                // />
                <img
                  src={user.photoURL}
                  alt="プロフィールアイコン"
                  style={{ width: 64, height: 64, borderRadius: "50%" }}
                />
              ) : (
                <div className="flex items-center justify-center w-16 h-16 bg-gray-400 border rounded-full">
                  <FontAwesomeIcon
                    className="w-10 h-10 text-white"
                    icon={faUser}
                  />
                </div>
              )}
              {/* <label className="px-4 py-2 text-green-700 bg-green-100 rounded-lg cursor-pointer hover:bg-green-200">
                画像を選択
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label> */}
              <label className="flex flex-col w-full">
                アイコンURL
                <input
                  type="text"
                  value={newIconUrl}
                  onChange={(e) => setNewIconUrl(e.target.value)}
                  className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                webサイトの画像をURLを指定してください。
                <br />
                大きすぎる画像はアスペクト比が崩れます。
              </label>
            </div>
            {uploading && (
              <p className="mt-2 text-xs text-gray-500">アップロード中...</p>
            )}
            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
          </div>

          <div className="mt-20">
            <button
              type="submit"
              className="w-full py-3 text-white transition bg-green-500 rounded-lg hover:bg-green-600"
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
