"use client";

import { use } from "react";
import { useTodos } from "@/context/TodoContext";
import { useRouter } from "next/navigation";
import TodoDetailItem from "./TodoDetailItem";
import TodoDetailForm from "./TodoDetailForm";

export default function TodoDetail({ params }) {
  const { id } = use(params); // paramsからidを取得
  const router = useRouter();

  const todos = useTodos();
  const foundList = todos.find(
    (todoList) => todoList.id === id
  );
  console.log(todos);
  if (todos.length === 0) {
    return (
    <div>Todoリストを読み込んでいます...</div>
  );
  }

  if (!foundList) {
    return <div>指定されたTodoリストは見つかりませんでした。</div>;
  }


  return (
    <div className="fixed top-0 right-0 w-1/3 h-full p-6 bg-white shadow-lg">
      <button
        onClick={() => router.push("/")} // 編集ページを閉じる
        className="p-2 mt-4 text-white bg-blue-500 rounded"
      >
        閉じる
      </button>
      <h1 className="text-2xl font-bold">{foundList.title}</h1>
      <p>作成した日付: {foundList.date}</p>
      {foundList.todos.map((todo) => (
        <TodoDetailItem key={todo.id} todo={todo} />
      ))}
      <div className="fixed w-full max-w-md p-6 transform bg-white rounded-lg shadow-md -translate-x-1/3 bottom-6 left-1/2 sw-full">
        <TodoDetailForm listId={id} />
      </div>
    </div>
  );
}
