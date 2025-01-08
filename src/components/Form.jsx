"use client";
import { useState } from "react";
import { useTodosDispatch } from "../context/TodoContext";
const Form = () => {
  const [inputValue, setInputValue] = useState("");
  const dispatch = useTodosDispatch();

  //　新しいTodoリスト
  const addTodoList = async (e) => {
    e.preventDefault();
    if (inputValue === "") {
      return;
    }

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
    const formattedDate = `${year}/${month}/${date} (${day}) ${hours}:${minutes}:${seconds}`;

    const newTodoList = {
      id: Math.floor(Math.random() * 1e7).toString(),
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
        body: JSON.stringify({ newTodoList }),
      });
      if (!response.ok)
        throw new Error("新規Todoリストを保存できませんでした。");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <div className="font-semibold">Todoリストを追加</div>
      <form onSubmit={addTodoList} className="flex">
        <button
          onClick={addTodoList}
          className="px-3 text-2xl text-zinc-600 bg-white rounded hover:shadow-[inset_0_2px_8px_rgba(0,0,0,0.1)]  hover:translate-y-[2px] transition-all duration-200"
        >
          +
        </button>
        <input
          type="text"
          placeholder="タイトルを入力"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="text-xl border-b w-96 focus:caret-black focus:outline-none"
        />
        
      </form>
    </div>
  );
};
export default Form;
