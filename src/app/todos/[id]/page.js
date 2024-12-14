"use client";

import { TodoProvider } from "@/context/TodoContext";
import TodoDetail from "./TodoDetail";

export default function EditHome({ params }) {
  return (
    <TodoProvider>
      <TodoDetail params={params} />
    </TodoProvider>
  );
}
