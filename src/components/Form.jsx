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
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="border border-gray-500 rounded"
      />
      <button onClick={addTodo}>追加</button>
    </div>
  );
};
export default Form;