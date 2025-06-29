"use client";

import { useState, FC, FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  registerWithEmail,
  loginWithEmail,
  linkAnonymousAccount,
} from "@/firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { getAuth, updateProfile } from "firebase/auth";
import { Header } from "@/components/layout/Header";



const AuthForm: FC = () => {
  const searchParams = useSearchParams();
  const initialRegister = searchParams.get("mode") === "register";
  const [isRegister, setIsRegister] = useState(initialRegister);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isShowPassword, setIsShowPassword] = useState(false);

  const router = useRouter();

  // メールでログイン
  const handleLogin = async (): Promise<void> => {
    setErrorMessage("");
    try {
      await loginWithEmail(email, password);
      router.push("/");
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error) {  // typeof だけではnullを排除できないのでerror !== nullで弾く
        const code = (error as { code: string }).code;
        if (code === "auth/invalid-email") {
          setErrorMessage("メールアドレスの形式が正しくありません。");
        } else if (code === "auth/password-does-not-meet-requirements") {
          setErrorMessage("パスワードは英数字を含む8〜20文字にしてください。");
        } else if (code === "auth/email-already-in-use") {
          setErrorMessage("既にアカウントが存在しているメールアドレスです。");
        } else if (code === "auth/too-many-requests") {
          setErrorMessage("試行回数が多すぎます。しばらく時間をおいて再度お試しください。");
        } else if (code === "auth/invalid-credential") {
          setErrorMessage("メールアドレスまたはパスワードが間違っています。");
        }
      } else {
        setErrorMessage("予期せぬエラーが発生しました。");
      }
    }
  };

  // メールでサインアップ
  const handleRegister = async (): Promise<void> => {
    if (!username || !email || !password || !confirmPassword) return;
    setErrorMessage("");
    // パスワードが一致しない場合はエラー表示
    if (password !== confirmPassword) {
      setErrorMessage("パスワードが一致しません。");
      return;
    }
    try {
      const authInstance = getAuth();
      let user;
      // すでに匿名ユーザーとしてログインしている場合はリンク処理を行う
      if (authInstance.currentUser && authInstance.currentUser.isAnonymous) {
        await authInstance.currentUser.reload();
        user = await linkAnonymousAccount(email, password);
      } else {
        // 匿名ユーザーが存在しない場合は新規作成
        user = await registerWithEmail(email, password, username);
      }
      if (user) {
        // リンク後、displayName を更新
        await updateProfile(user, { displayName: username });
      }
      router.push("/");
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error) {
        const code = (error as { code: string }).code;
        if (code === "auth/invalid-email") {
          setErrorMessage("メールアドレスの形式が正しくありません。");
        } else if (code === "auth/password-does-not-meet-requirements") {
          setErrorMessage("パスワードは英数字を含む8〜20文字にしてください。");
        } else if (code === "auth/email-already-in-use") {
          setErrorMessage("既にアカウントが存在しているメールアドレスです。");
        }
      } else {
        setErrorMessage("登録時にエラーが発生しました。");
      }
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    isRegister ? handleRegister() : handleLogin();
  };

  return (
    <div className="select-none">
      <Header simple />
      <div
        className={`flex items-center justify-center min-h-screen bg-gradient-to-br ${isRegister ? "from-green-400" : "from-blue-400"
          }`}
      >
        <div className="p-8 w-full max-w-md bg-white rounded-xl shadow-lg transition duration-300 transform">
          <header className="mb-6 text-center">
            <h3 className="text-4xl font-bold text-gray-800">✓Task-Board</h3>
            <p className="mt-2 text-lg text-gray-600">
              {isRegister ? "新規登録" : "ログイン"}
            </p>
          </header>
          <form onSubmit={handleSubmit}>
            {isRegister && (
              <div className="mb-4">
                <p>ユーザー名</p>
                <input
                  type="text"
                  placeholder="ユーザー名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="p-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                className="p-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="mb-6">
              <p>パスワード</p>
              <p className="text-sm text-gray-400">英数字を含む8〜20文字</p>
              <div className="relative">
                <input
                  type={isShowPassword ? "text" : "password"}
                  placeholder="パスワード"
                  minLength={8}
                  maxLength={20}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage("");
                  }}
                  className="p-3 pr-12 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setIsShowPassword((prev) => !prev)}
                  className="flex absolute inset-y-0 right-0 items-center pr-3 text-gray-500"
                >
                  <FontAwesomeIcon icon={isShowPassword ? faEye : faEyeSlash} />
                </button>
              </div>
            </div>
            {isRegister && (
              <div className="mb-6">
                <p>パスワード（確認用）</p>
                <div className="relative">
                  <input
                    type={isShowPassword ? "text" : "password"}
                    placeholder="確認用パスワード"
                    minLength={8}
                    maxLength={20}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrorMessage("");
                    }}
                    className="p-3 pr-12 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setIsShowPassword((prev) => !prev)}
                    className="flex absolute inset-y-0 right-0 items-center pr-3 text-gray-500"
                  >
                    <FontAwesomeIcon
                      icon={isShowPassword ? faEye : faEyeSlash}
                    />
                  </button>
                </div>
              </div>
            )}

            <div className="mb-4">
              <p className="text-red-500 text-sm min-h-[1.5rem]">
                {errorMessage || "\u00A0"}
              </p>
            </div>

            <button
              type="submit"
              disabled={
                isRegister &&
                (!username || !email || !password || !confirmPassword)
              }
              className={`w-full p-3 mb-4 text-white rounded-lg transition duration-300 ${isRegister
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-blue-500 hover:bg-blue-600"
                } ${isRegister &&
                  (!username || !email || !password || !confirmPassword)
                  ? "opacity-60 cursor-not-allowed"
                  : ""
                }`}
            >
              {isRegister ? "新規登録して利用" : "ログイン"}
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setErrorMessage("");
              }}
              className="text-sm text-blue-500 hover:underline"
            >
              {isRegister ? "既存のアカウントでログイン" : "新規登録はこちら"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
