"use client";

import { useEffect, useRef, useState } from "react";
import { useTodos, useTodosDispatch } from "@/context/TodoContext";
import { getAuth } from "firebase/auth";
import { authenticatedFetch } from "@/utils/authToken";

const TodoDetailForm = ({ listId }) => {
  const [inputValue, setInputValue] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const dispatch = useTodosDispatch();
  const todos = useTodos();
  const textareaRef = useRef(null);

  const addTask = async (e) => {
    e.preventDefault();
    if (inputValue === "") {
      return;
    }
    const targetListTasks =
      todos.filter((todo) => todo.id === listId).map((todo) => todo.tasks)[0] ||
      [];
    const order = targetListTasks?.length + 1;

    const newTask = {
      id: Math.floor(Math.random() * 1e7).toString(),
      content: inputValue,
      complete: false,
      order: order,
    };

    dispatch({ type: "todo/add", payload: { id: listId, newTask } });
    setInputValue("");

    try {
      await authenticatedFetch("/api/todos", {
        method: "POST",
        body: JSON.stringify({ listId, newTask }),
      });
    } catch (error) {
      console.error("タスク更新エラー:", error);
    }
  };
  // textareaの高さの調整
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // 改行を防止
      addTask(e); // フォーム送信
    }
  };
  return (
    <div className="flex w-full p-2 rounded-lg shadow-sm bg-gradient-to-r from-green-100 via-blue-100 to-purple-100">
    <form onSubmit={addTask} className="flex items-center w-full space-x-2">
      {/* 追加ボタン */}
      <div className="relative">
        <button
          onClick={addTask}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="flex items-center justify-center w-8 h-8 text-2xl text-white transition rounded-full bg-cyan-400 hover:bg-cyan-500 active:scale-95"
        >
          +
        </button>
        <div
          className={`absolute z-10 flex flex-col items-center p-1 text-xs text-gray-700 bg-white rounded-lg shadow-md top-10 left-0 transition-opacity duration-200 ${
            isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <span>追加</span>
          <span>(Enter)</span>
        </div>
      </div>

      {/* 入力欄 */}
      <textarea
        ref={textareaRef}
        placeholder="タスクを入力"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        className="flex-1 p-2 overflow-hidden text-gray-700 placeholder-gray-400 break-words whitespace-pre-wrap transition-all bg-white border border-gray-200 rounded-lg resize-none bg-opacity-80 focus:bg-white focus:outline-none"
      />
    </form>
  </div>
  );
};

export default TodoDetailForm;
