"use client";

import Todos from "@/components/todo/Todos";
import { useAuth } from "@/context/AuthContext";
import { useTodosLoading } from "@/context/TodoContext";
import Loading from "../common/Loading";
import { Header } from "./Header";

export const MainPage = () => {
  const { user, loading } = useAuth();
  const isTodosLoading = useTodosLoading();

  if (loading || (user && isTodosLoading)) return <Loading />;

  return (
    <div className="select-none">
      <Header />
      <Todos />
    </div>
  );
};
