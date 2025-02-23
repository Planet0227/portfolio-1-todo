"use client";

import { useState } from "react";
import { registerWithEmail, loginWithEmail } from "@/firebase/auth";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const AuthForm = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // メールでログイン
  const handleLogin = async () => {
    const user = await loginWithEmail(email, password);
    if (user) router.push("/");
  };

  // メールでサインアップ（ユーザー名を displayName として設定）
  const handleRegister = async () => {
    const user = await registerWithEmail(email, password, username);
    if (user) router.push("/");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-500">
      <div className="w-full max-w-md p-8 transition duration-300 transform bg-white shadow-lg rounded-xl hover:scale-105">
        <header className="mb-6 text-center">
          <h3 className="text-4xl font-bold text-gray-800">✓Todoアプリ</h3>
          <p className="mt-2 text-lg text-gray-600">
            {isRegister ? "新規登録" : "ログイン"}
          </p>
        </header>
        <form>
          {isRegister && (
            <div className="mb-4">
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
            <input
              type="email"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="relative mb-6">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          <button
            type="button"
            onClick={isRegister ? handleRegister : handleLogin}
            className={`w-full p-3 mb-4 text-white rounded-lg transition duration-300 ${
              isRegister ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isRegister ? "新規登録して利用" : "ログイン"}
          </button>
        </form>
        <div className="text-center">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-sm text-blue-500 hover:underline"
          >
            {isRegister ? "既存のアカウントでログイン" : "新規登録はこちら"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
