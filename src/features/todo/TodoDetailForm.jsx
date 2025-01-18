"use client";

import { useEffect, useRef, useState } from "react";
import { useTodosDispatch } from "@/context/TodoContext";

const TodoDetailForm = ({ listId }) => {
  const [inputValue, setInputValue] = useState("");
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
        <button
          onClick={addTodo}
          className="px-3 text-2xl text-zinc-600 bg-white rounded hover:shadow-[inset_0_2px_8px_rgba(0,0,0,0.1)]  hover:translate-y-[2px] transition-all duration-200"
        >
          +
        </button>
        <textarea
          ref={textareaRef}
          type="text"
          placeholder="タスクを入力"
          value={inputValue}
          rows={1}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 w-10/12 ml-2 overflow-hidden text-lg break-words whitespace-pre-wrap border-b resize-none focus:outline-none"
        />
      </form>
    </div>
  );
};

export default TodoDetailForm;
