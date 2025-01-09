"use client";

import { useState } from "react";
import { useTodosDispatch } from "@/context/TodoContext";

const TodoDetailForm = ({ listId }) => {
  const [inputValue, setInputValue] = useState("");
  const dispatch = useTodosDispatch();

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
  return (
    <div className="flex w-full">
      <form onSubmit={addTodo} className="flex w-full">
        <button
          onClick={addTodo}
          className="px-3 text-2xl text-zinc-600 bg-white rounded hover:shadow-[inset_0_2px_8px_rgba(0,0,0,0.1)]  hover:translate-y-[2px] transition-all duration-200"
        >
          +
        </button>
        <input
          type="text"
          placeholder="タスクを入力"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-10/12 text-lg border-b focus:caret-black focus:outline-none"
        />
      </form>
    </div>
  );
};

export default TodoDetailForm;
