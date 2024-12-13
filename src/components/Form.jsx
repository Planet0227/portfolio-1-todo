"use client";
import { useState } from "react";
import { useTodosDispatch } from "../context/TodoContext";
const Form = () => {
  const [inputValue, setInputValue ] = useState("");
  const dispatch = useTodosDispatch();

  const addTodo = () => {
    const newTodo = {
      id: Math.floor(Math.random() * 1e7),
      content: inputValue,
      complete: false

    }

    dispatch({type:"todo/add", payload: newTodo});
    
    setInputValue("");
  }


  return (
    <div>
      <div className="font-semibold">Todoを追加</div>
      <span>Todo:</span>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="mx-2 border border-gray-500 rounded"
      />
      <button onClick={addTodo} className="px-4 mx-3 font-semibold bg-blue-200 border ">+</button>
    </div>
  );
};
export default Form;
