"use client";

import { MainPage } from "@/components/layout/MainPage";
import Loading from "@/components/common/Loading";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { TodoProvider } from "@/context/TodoContext";


export default function Home() {
  

  // Auth の読み込みが完了していれば、TodoProvider をラップしたコンテンツを返す
  return (
    <AuthProvider>
      <TodoProvider>
        <MainPage />
      </TodoProvider>
    </AuthProvider>
  );
}
