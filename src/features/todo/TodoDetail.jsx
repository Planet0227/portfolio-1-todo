"use client";

import { useState, useEffect } from "react";
import { useTodos, useTodosDispatch } from "@/context/TodoContext";
import TodoDetailItem from "./TodoDetailItem";
import TodoDetailForm from "./TodoDetailForm";

export default function TodoDetail({ listId, onClose }) {
  const todos = useTodos();
  const dispatch = useTodosDispatch();
  const [cachedList, setCachedList] = useState(null);

  useEffect(() => {
    if (listId) {
      const foundList = todos.find((todoList) => todoList.id === listId);
      setCachedList(foundList || null);
    }
  }, [listId, todos]);

  const deleteTodoList = async () => {
    dispatch({ type: "todo/deleteList", payload: { listId } });
    setCachedList(null);
    onClose();
    try {
      const response = await fetch("/api/todos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listId }),
      });
      if (!response.ok) throw new Error("リストの削除に失敗しました。");

      console.log("リストが削除されました。");
    } catch (error) {
      console.error(error);
    }
  };

  if (!cachedList) {
    return <div>指定されたTodoリストは見つかりませんでした。</div>;
  }

  return (
    <div className="w-full h-full py-5 bg-white rounded-l-lg shadow-lg px-7">
      <div>
        <button className="pb-3 text-gray-300 hover:text-gray-500" onClick={onClose}>
          ＞＞
        </button>
      </div>
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-bold">{cachedList.title}</h1>
        <button
          onClick={deleteTodoList}
          className="px-5 py-2 mb-2 text-sm font-medium text-center text-red-500 border border-red-500 rounded-lg hover:text-white hover:bg-red-500 focus:ring-4 focus:outline-none me-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white shrink-0"
        >
          リストを削除
        </button>
      </div>
      <p className="pb-1 text-gray-500 border-b-2 border-gray">
        作成した日付： {cachedList.date}
      </p>
      <div className="my-3">
        {cachedList.todos.map((todo) => (
          <TodoDetailItem key={todo.id} todo={todo} listId={listId} />
        ))}
      </div>
      <div>
        <TodoDetailForm listId={listId} />
      </div>
    </div>
  );
}
