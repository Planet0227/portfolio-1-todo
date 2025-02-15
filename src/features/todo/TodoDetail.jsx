"use client";

import { useState, useEffect } from "react";
import { useTodos, useTodosDispatch } from "@/context/TodoContext";
import TodoDetailItem from "./TodoDetailItem";
import TodoDetailForm from "./TodoDetailForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesRight } from "@fortawesome/free-solid-svg-icons";

export default function TodoDetail({ listId, onClose }) {
  const todos = useTodos();
  const dispatch = useTodosDispatch();
  const [cachedList, setCachedList] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (listId) {
      const foundList = todos.find((todoList) => todoList.id === listId);
      setCachedList(foundList || null);
    }
  }, [listId, todos]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);
  
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

  //　タイトル更新
  const updateTitle = async (e) => {
    const updatedTitle = e.target.innerText.trim();
    if (updatedTitle.length === 0) {
      alert("タイトルは最低1文字以上入力してください。");
      e.target.innerText = cachedList.title;
      return;
    }
    if (updatedTitle !== cachedList.title) {
      dispatch({ type: "todo/updateList", payload: { listId, updatedTitle } });

      try {
        const response = await fetch("/api/todos", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listId, updatedTitle }),
        });
        const result = await response.json();
        console.log(result);

        if (!response.ok) throw new Error("タイトルを更新できませんでした。");
      } catch (error) {
        console.log(error);
      }
    }
  };
  // Enterキーが押された場合は改行を防ぎ、フォーカスを外す。
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.target.blur();
    }
  };

  if (!cachedList) {
    return <div>指定されたTodoリストは見つかりませんでした。</div>;
  }

  return (
    <div className="w-full h-full bg-white rounded-l-lg shadow-lg">
      <div className="relative">
        <button
          className="mt-3 ml-3 text-lg text-gray-300 hover:text-gray-500"
          onClick={onClose}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <FontAwesomeIcon icon={faAnglesRight} />
        </button>
        {/* ホバーで表示 */}
        <div
          className={`absolute z-10 flex flex-col items-center p-1 text-xs text-white transform bg-gray-600 rounded shadow-lg left-0 transition-all duration-300 ${
            isHovered
              ? "opacity-100 scale-100 "
              : "opacity-0 scale-90 pointer-events-none"
          }`}
        >
          <div>閉じる</div>
          <div>（esc）</div>
        </div>
      </div>

      <div className="px-6 mt-8 ml-7">
        <div className="flex items-center justify-between">
          <h1
            contentEditable
            suppressContentEditableWarning
            onBlur={updateTitle}
            onKeyDown={handleKeyDown}
            className="w-full text-3xl font-bold focus:outline-none"
          >
            {cachedList.title}
          </h1>
          <button
            onClick={deleteTodoList}
            className="px-5 py-2 text-sm font-medium text-center text-red-500 border border-red-500 rounded-lg hover:text-white hover:bg-red-500 focus:ring-4 focus:outline-none me-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white shrink-0"
          >
            リストを削除
          </button>
        </div>
        <p className="pb-1 text-gray-500 border-b-2 border-gray">
          作成した日付： {cachedList.date}
        </p>
        <div className="my-3">
          {cachedList.todos.map((todo) => (
            <TodoDetailItem
              key={todo.id}
              todo={todo}
              todos={cachedList.todos}
              listId={listId}
            />
          ))}
        </div>
        <div>
          <TodoDetailForm listId={listId} />
        </div>
      </div>
    </div>
  );
}
