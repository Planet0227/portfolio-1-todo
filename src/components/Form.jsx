"use client";
import { useState } from "react";
import { useTodosDispatch } from "../context/TodoContext";
const Form = () => {
  const [inputValue, setInputValue] = useState("");
  const dispatch = useTodosDispatch();

  //　新しいTodoリスト
  const addTodoList = async () => {
    const now = new Date();

    // 年、月、日を取得
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // 月は0から始まるので+1
    const date = String(now.getDate()).padStart(2, "0");

    // 曜日を配列で定義
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const day = days[now.getDay()];

    // 時間、分、秒を取得
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    // フォーマットする
    const formattedDate = `${year}/${month}/${date}(${day}) ${hours}:${minutes}:${seconds}`;

    const newTodoList = {
      id: Math.floor(Math.random() * 1e7),
      title: inputValue,
      date: formattedDate,
      todos: [],
    };
    dispatch({ type: "todo/addList", payload: newTodoList });
    setInputValue("");

    //POSTリクエスト
    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTodoList),
      });
      if (!response.ok)
        throw new Error("新規Todoリストを保存できませんでした。");
    } catch (error) {
      console.log(error);
    }
  };

  //　新しいTodo
  const addTodo = () => {
    const newTodo = {
      id: Math.floor(Math.random() * 1e7),
      content: inputValue,
      complete: false,
    };

    dispatch({ type: "todo/add", payload: newTodo });

    setInputValue("");
  };

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
      <button
        onClick={addTodoList}
        className="px-4 mx-3 font-semibold bg-blue-200 border rounded"
      >
        +
      </button>

      {/* <span>Todo:</span>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="mx-2 border border-gray-500 rounded"
      />
      <button onClick={addTodo} className="px-4 mx-3 font-semibold bg-blue-200 border rounded">+</button> */}
    </div>
  );
};
export default Form;
