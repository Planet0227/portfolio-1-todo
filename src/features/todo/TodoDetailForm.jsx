"use client";

import { useEffect, useRef, useState } from "react";
import { useTodosDispatch } from "@/context/TodoContext";

const TodoDetailForm = ({ listId }) => {
  const [inputValue, setInputValue] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const dispatch = useTodosDispatch();
  const textareaRef = useRef(null);

  const addTodo = async (e) => {
    e.preventDefault();
    if (inputValue === "") {
      return;
    }

    const newTodo = {
      id: Math.floor(Math.random() * 1e7).toString(),
      content: inputValue,
      complete: false,
    };

    dispatch({ type: "todo/add", payload: { id: listId, newTodo } });
    setInputValue("");
    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listId, newTodo }),
      });
      const result = await response.json();
      console.log(result);

      if (!response.ok) throw new Error("新規Todoを保存できませんでした。");
    } catch (error) {
      console.log(error);
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
      addTodo(e); // フォーム送信
    }
  };
  return (
    <div className="flex w-full">
      <form onSubmit={addTodo} className="flex w-full">
        <div className="relative">
          <button
            onClick={addTodo}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="flex items-center mt-0.5 justify-center flex-shrink-0 w-5 h-5 text-2xl text-white transition-transform duration-200 transform bg-gray-600 rounded-full hover:bg-gray-800 active:scale-75"
          >
            +
          </button>
          <div
            className={`absolute z-10 flex flex-col items-center p-1 text-xs text-white transform bg-gray-600 rounded shadow-lg left-[-20px] top-6 transition-all duration-300 ${
              isHovered
                ? "opacity-100 scale-100"
                : "opacity-0 scale-90 pointer-events-none"
            }`}
          >
            <div>追加</div>
            <div>（Enter）</div>
          </div>
        </div>
        <textarea
          ref={textareaRef}
          type="text"
          placeholder="タスクを入力"
          value={inputValue}
          rows={1}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 w-9/12 ml-2 overflow-hidden text-lg break-words whitespace-pre-wrap border-b resize-none focus:outline-none"
        />
      </form>
      <div className="ml-11"></div>
    </div>
  );
};

export default TodoDetailForm;
