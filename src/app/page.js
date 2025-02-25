"use client";

import { useEffect } from "react";
import Todos from "@/components/Todos";
import { TodoProvider } from "@/context/TodoContext";
import { signInAsGuest, logout } from "@/firebase/auth";
import { faRightToBracket, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // ログイン画面へ遷移
  const handleLoginClick = () => {
    router.push("/login");
  };

  // ログアウト処理
  const handleLogoutClick = async () => {
    await logout();
    router.push("/"); // ログアウト後、トップページへ
  };

  if (loading) return <p className="text-lg">Loading...</p>;

  return (
    <TodoProvider>
      <div>
        <header className="sticky top-0 z-30 flex items-center justify-between w-full p-1 px-10 py-3 text-white bg-green-500">
          <h3 className="text-3xl">✓Task-Board</h3>
          {!user || user.isAnonymous ? (
            // 匿名ユーザーならログイン画面への遷移ボタンを表示
            <button onClick={handleLoginClick} className="flex items-center gap-2 text-lg">
              <FontAwesomeIcon icon={faRightToBracket} className="text-2xl" />
              <p>ログイン</p>
            </button>
          ) : user ? (
            // メールアドレスや displayName が設定されている場合
            <div className="flex items-center gap-2">
              <span className="pr-4">{user.displayName || user.email}</span>
              <button onClick={handleLogoutClick} className="flex items-center gap-2 text-lg">
                <FontAwesomeIcon icon={faSignOutAlt} className="text-2xl" />
                <p>ログアウト</p>
              </button>
            </div>
          ) : null}
        </header>

        <Todos />
      </div>
    </TodoProvider>
  );
}
