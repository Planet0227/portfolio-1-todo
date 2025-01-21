"use client";

import { useState, useEffect } from "react";
import { useTodos, useTodosDispatch } from "@/context/TodoContext";
import TodoDetailItem from "./TodoDetailItem";
import TodoDetailForm from "./TodoDetailForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

export default function TodoDetail({ listId, onClose }) {
  const todos = useTodos();
  const dispatch = useTodosDispatch();
  const [cachedList, setCachedList] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  useEffect(() => {
    if (listId) {
      const foundList = todos.find((todoList) => todoList.id === listId);
      setCachedList(foundList || null);
    }
  }, [listId, todos]);

  useEffect(() => {
    if (cachedList) {
      setEditTitle(cachedList.title || "");
    }
  }, [cachedList]);

  //モーダルをEscで閉じる
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
  const handleTitleChange = (e) => {
    const updatedTitle = e.target.value;
    setEditTitle(updatedTitle);
    updateTitle(updatedTitle);
  };

  //　タイトル更新
  const updateTitle = async (updatedTitle) => {
    if (updatedTitle !== cachedList.title) {
      dispatch({ type: "todo/updateList", payload: { listId, updatedTitle } });

      try {
        const response = await fetch("/api/todos", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listId, updatedTitle }),
        });
        // const result = await response.json();
        // console.log(result);

        if (!response.ok) throw new Error("タイトルを更新できませんでした。");
      } catch (error) {
        console.log(error);
      }
    }
  };

  if (!cachedList) {
    return <div>指定されたTodoリストは見つかりませんでした。</div>;
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="sticky top-0 z-10 bg-white">
        <div className="relative flex items-center justify-between p-4">
          <div>
            <button
              className="text-xl text-gray-300 hover:text-gray-500"
              onClick={onClose}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            {/* ホバーで表示 */}
            <div
              className={`absolute z-10 flex flex-col items-center p-1 text-xs text-white transform bg-gray-600 rounded shadow-lg left-0 transition-all duration-300 ${
                isHovered
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-90 pointer-events-none"
              }`}
            >
              <div>閉じる</div>
              <div>（esc）</div>
            </div>
          </div>

          <button
            onClick={deleteTodoList}
            className="px-5 py-2 text-sm font-medium text-center text-red-500 border border-red-500 rounded-lg hover:text-white hover:bg-red-500 focus:ring-4 focus:outline-none me-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white shrink-0"
          >
            リストを削除
          </button>
        </div>
        <div className="ml-7">
          <input
            type="text"
            maxLength="20"
            placeholder="タイトルを入力"
            value={editTitle}
            onChange={handleTitleChange}
            className="w-full text-3xl font-bold focus:outline-none"
          />
        <p className="pb-1 mb-3 text-gray-500 border-b-2 border-gray">
          作成した日付： {cachedList.date}
        </p>
        </div>
      </div>

      {/* メイン */}
      <div className="px-4 mt-5 mb-40 ml-7">
        <div className="my-1">
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
