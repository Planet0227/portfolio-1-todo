"use client";

import { MainPage } from "@/components/layout/MainPage";
import Loading from "@/components/common/Loading";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { TodoProvider } from "@/context/TodoContext";


export default function Home() {
  const { loading } = useAuth();
  // （AuthContext の読み込み中の場合は下記で返す）
  if (loading) {
    return <Loading />;
  }

  // Auth の読み込みが完了していれば、TodoProvider をラップしたコンテンツを返す
  return (
    <AuthProvider>
      <TodoProvider>
        <MainPage />
      </TodoProvider>
    </AuthProvider>
  );
}
