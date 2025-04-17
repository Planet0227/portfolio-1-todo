"use client";

import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";

const WarningMessage = ({
  user,
  isShowWarning,
  setIsShowWarning,
  handleGuestLogin,
}) => {
  const router = useRouter();

  if (!isShowWarning) return null;

  return (
    <div className="relative p-4 border-l-8 bg-amber-50 border-amber-500 text-amber-700">
      <div className="flex items-center mb-1">
        <FontAwesomeIcon
          icon={faTriangleExclamation}
          className="w-5 h-5 mr-2"
        />
        <span className="font-semibold">注意</span>
      </div>
      <button
        onClick={() => setIsShowWarning(false)}
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
          <span className="flex mt-1 text-sm">
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
          <p>
            現在ゲストモードです。ブラウザのキャッシュ削除やログアウトでデータが失われます。
          </p>
          <span className="flex mt-1 text-sm">
            <p
              className="underline cursor-pointer hover:text-amber-900"
              onClick={() => router.push("/login?mode=register")}
            >
              新規登録
            </p>
            <p>をすることでデータを永続的に保存することができます。</p>
          </span>
        </>
      )}
    </div>
  );
};

export default WarningMessage;
