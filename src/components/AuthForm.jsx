"use client";

import { useState } from "react";
import {
  registerWithEmail,
  loginWithEmail,
  linkAnonymousAccount,
  signInAsGuest,
} from "@/firebase/auth";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { getAuth, updateProfile } from "firebase/auth";
import { useAuth } from "@/context/AuthContext";

const AuthForm = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const {user} = useAuth();

  const isGuest = user && user.isAnonymous;

  

  // ゲストログイン
  const handleGuestLogin = async () => {
    try {
      await signInAsGuest();
      router.push("/");
    } catch (error) {
      console.error("ゲストログイン失敗:", error);
      setErrorMessage("ゲストログインに失敗しました。");
    }
  };

  // メールでログイン
  const handleLogin = async () => {
    setErrorMessage("");
    try {
      const user = await loginWithEmail(email, password);
      router.push("/");
    } catch (error) {
      if (error.code === "auth/invalid-email") {
        setErrorMessage("メールアドレスが間違っています。");
      } else if (error.code === "auth/invalid-credential") {
        setErrorMessage("メールアドレスかパスワードが間違っています。");
      } else if (error.code === "auth/missing-password") {
        setErrorMessage("パスワードを入力してください。");
      }
    }
  };

  // メールでサインアップ
  const handleRegister = async () => {
    if (!username || !email || !password) return;
    setErrorMessage("");
    try {
      const authInstance = getAuth();
      let user;
      // すでに匿名ユーザーとしてログインしている場合はリンク処理を行う
      if (authInstance.currentUser && authInstance.currentUser.isAnonymous) {
        await authInstance.currentUser.reload();
        user = await linkAnonymousAccount(email, password);
      } else {
        // 匿名ユーザーが存在しない場合は新規作成
        console.log("新規");
        user = await registerWithEmail(email, password, username);
      }
      if (user) {
        // リンク後、displayName を更新
        console.log("リンク");
        await updateProfile(user, { displayName: username });
      }
      router.push("/");
    } catch (error) {
      if (error.code === "auth/invalid-email") {
        setErrorMessage("メールアドレスの形式が正しくありません。");
      } else if (error.code === "auth/password-does-not-meet-requirements") {
        setErrorMessage("パスワードは英数字を含む8〜20文字にしてください。");
      } else if (error.code === "auth/email-already-in-use") {
        setErrorMessage("既にアカウントが存在しているメールアドレスです。");
      } else {
        setErrorMessage("登録時にエラーが発生しました。");
      }
    }
  };

  return (
    <div>
      <header className="sticky top-0 z-30 flex items-center justify-between w-full p-1 px-10 py-3 text-white bg-green-500">
        <h3
          className="text-3xl cursor-pointer"
          onClick={() => router.push("/")}
        >
          ✓Task-Board
        </h3>
      </header>
      <div
        className={`flex items-center justify-center min-h-screen bg-gradient-to-br ${
          isRegister ? "from-green-400" : " from-blue-400"
        } `}
      >
        <div className="w-full max-w-md p-8 transition duration-300 transform bg-white shadow-lg rounded-xl">
          <header className="mb-6 text-center">
            <h3 className="text-4xl font-bold text-gray-800">✓Task-Board</h3>
            <p className="mt-2 text-lg text-gray-600">
              {isRegister ? "新規登録" : "ログイン"}
            </p>
          </header>
          <form>
            {isRegister && (
              <div className="mb-4">
                <p>ユーザー名</p>
                <input
                  type="text"
                  placeholder="ユーザー名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            )}
            <div className="mb-4">
              <p>メールアドレス</p>
              <input
                type="email"
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMessage("");
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="mb-6">
              <p>パスワード</p>
              <p className="text-sm text-gray-400">英数字を含む8〜20文字</p>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="パスワード"
                  minLength={8}
                  maxLength={20}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage("");
                  }}
                  className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-red-500 text-sm min-h-[1.5rem]">
                {errorMessage || "\u00A0"}
              </p>
            </div>

            {/* 新規登録 */}
            <button
              type="button"
              onClick={isRegister ? handleRegister : handleLogin}
              disabled={isRegister && (!username || !email || !password)}
              className={`w-full p-3 mb-4 text-white rounded-lg transition duration-300 ${
                isRegister
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-blue-500 hover:bg-blue-600"
              } ${
                isRegister && (!username || !email || !password)
                  ? "opacity-60 cursor-not-allowed"
                  : ""
              }`}
            >
              {isRegister ? "新規登録して利用" : "ログイン"}
            </button>
          </form>
          {isRegister && (
            <button
            type="button"
            onClick={handleGuestLogin}
            disabled={isRegister && (username || email || password) || isGuest}
              className={`w-full p-3 mb-4 text-white bg-gray-500 rounded-lg hover:bg-gray-600  ${
                isRegister && (username || email || password) || isGuest
                  ? "opacity-60 cursor-not-allowed"
                  : ""
              }`}
              
            >
              ゲストとして機能を試す
            </button>
          )}
          <div className="text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setErrorMessage("");
              }}
              className="text-sm text-blue-500 hover:underline"
            >
              {isRegister
                ? "既存のアカウントでログイン"
                : "新規登録/ゲストログインはこちら"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
