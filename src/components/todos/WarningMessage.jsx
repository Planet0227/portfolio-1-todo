"use client";

import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";



const WarningMessage = ({
  user,
  onClose
}) => {
  const router = useRouter();

  const handleGuestLogin = async () => {
    try {
      await signInAsGuest();
      router.push("/");
      window.location.reload();
    } catch (error) {
      console.error("ゲストログイン失敗:", error);
    }
  };


  return (
    <div className="relative p-3 border-l-8 bg-amber-50 border-amber-500 text-amber-700">
      <div className="flex items-center mb-1">
        <FontAwesomeIcon
          icon={faTriangleExclamation}
          className="w-5 h-5 mr-2"
        />
        <span className="font-semibold">注意</span>
      </div>
      <button
        onClick={onClose}
        className="absolute text-3xl font-bold top-2 right-2 focus:outline-none"
        aria-label="警告を閉じる"
      >
        ×
      </button>
      {!user ? (
        <>
          <p>
            現在、機能お試しモードです。作成されたリストはページのリロードなどで失われます。
          </p>
          <span className="flex mt-1 text-xs md:text-sm">
            <p
              className="underline cursor-pointer hover:text-amber-900"
              onClick={handleGuestLogin}
            >
              ゲストログイン
            </p>
            <p>または</p>
            <p
              className="underline cursor-pointer hover:text-amber-900"
              onClick={() => router.push("/login?mode=register")}
            >
              新規登録
            </p>
            <p>をしてください。</p>
          </span>
        </>
      ) : (
        <>
          <p className="text-sm">
            現在ゲストモードです。ブラウザのキャッシュクリアやログアウトでデータが失われます。
          </p>
          <span className="flex mt-1 text-xs md:text-sm">
            <p
              className="underline cursor-pointer hover:text-amber-900"
              onClick={() => router.push("/login?mode=register")}
            >
              新規登録でデータを引き継げます。
            </p>
          </span>
        </>
      )}
    </div>
  );
};

export default WarningMessage;
