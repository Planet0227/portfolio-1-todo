"use client";

import { useState } from "react";
import { useTodosDispatch } from "@/context/TodoContext";


const TodoDetailForm = ({ listId }) => {
  const [inputValue, setInputValue] = useState("");
  const dispatch = useTodosDispatch();

  const addTodo = async (e) => {
    const newTodo = {
      id: Math.floor(Math.random() * 1e7),
      content: inputValue,
      complete: false,
    };

    dispatch({ type: "todo/add", payload: { id: listId, newTodo } });

    try {
      const response = await fetch("/api/todos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listId, newTodo }),
      });
      const result = await response.json();
      console.log(result);
      
      if (!response.ok)
        throw new Error("新規Todoを保存できませんでした。");
    } catch (error) {
      console.log(error);
    }



    setInputValue("");
  };
  return (
    <div className="flex"> {/*ここで中断　mt-5が反映されない */} 
      <div>Todo:</div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="block mx-2 border border-gray-500 rounded"
      />
      <button onClick={addTodo} className="px-4 mx-1 font-semibold bg-blue-200 border rounded">+</button>
    </div>
  );
};

export default TodoDetailForm;
