"use client";

import { signInAsGuest } from "@/firebase/auth";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { User } from "firebase/auth";
import { useRouter } from "next/navigation";

interface WarningMessageProps {
  user: User | null;
  onClose: () => void;
}

const WarningMessage: React.FC<WarningMessageProps> = ({
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
    <div className="relative p-3 text-amber-700 bg-amber-50 border-l-8 border-amber-500">
      <div className="flex items-center mb-1">
        <FontAwesomeIcon
          icon={faTriangleExclamation}
          className="mr-2 w-5 h-5"
        />
        <span className="font-semibold">注意</span>
      </div>
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-3xl font-bold focus:outline-none"
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
