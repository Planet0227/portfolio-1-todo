"use client";

import { useState, useEffect } from "react";
import { useTodos } from "@/context/TodoContext";
import TodoDetailItem from "./TodoDetailItem";
import TodoDetailForm from "./TodoDetailForm";

export default function TodoDetail({ listId }) {
  const todos = useTodos();
  const [cachedList, setCachedList] = useState(null);

  useEffect(() => {
    if (listId) {
      const foundList = todos.find((todoList) => todoList.id === listId);
      setCachedList(foundList || null);
    }
  }, [listId, todos]);

  if (!cachedList) {
    return <div>指定されたTodoリストは見つかりませんでした。</div>;
  }

  return (
    <div className="w-full h-full px-5 py-2 bg-white shadow-lg">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">{cachedList.title}</h1>
        <div className="text-red-500">リストを削除</div>
      </div>
      <p className="pb-1 text-gray-500 border-b-2 border-gray">
        作成した日付： {cachedList.date}
      </p>
      
      <div className="my-5">
        <TodoDetailForm listId={listId} />
      </div>
      <div className="my-3">
        {cachedList.todos.map((todo) => (
          <TodoDetailItem key={todo.id} todo={todo} listId={listId} />
        ))}
      </div>
    </div>
  );
}
