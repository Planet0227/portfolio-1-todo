"use client";
import { useEffect, useRef, useState } from "react";
import { useTodos, useTodosDispatch } from "../context/TodoContext";
import { getAuth } from "firebase/auth";
const Form = ({ categories }) => {
  const [inputValue, setInputValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("notStarted");
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const todos = useTodos();
  const dispatch = useTodosDispatch();

  const toggleButtonRef = useRef(null);

  // クリックが外部で行われたらオプションを閉じる
  useEffect(() => {
    const handleClickOutside = (event) => {
      // トグルボタン以外がクリックされた場合にオプションを閉じる
      if (
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(event.target)
      ) {
        setShowCategorySelector(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
    const days = ["日", "月", "火", "水", "木", "金", "土"];
    const day = days[now.getDay()];

    // 時間、分、秒を取得
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    // フォーマットする
    const formattedDate = `${year}/${month}/${date} (${day}) ${hours}:${minutes}:${seconds}`;

    const filteredTodos = todos.filter(
      (todo) => todo.category === selectedCategory
    );
    const resetDays = {
      sun: false,
      mon: false,
      tue: false,
      wed: false,
      thu: false,
      fri: false,
      sat: false,
    };
    const order = filteredTodos?.length + 1;

    const newTodoList = {
      id: Math.floor(Math.random() * 1e7).toString(),
      title: inputValue,
      date: formattedDate,
      category: selectedCategory,
      resetDays: resetDays,
      order: order,
      todos: [],
    };
    dispatch({ type: "todo/addList", payload: newTodoList });
    setInputValue("");

    //POSTリクエスト
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.error("ユーザーが認証されていません");
    return;
  }

  try {
    const token = await user.getIdToken();
    const response = await fetch("/api/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // トークンをヘッダーにセット
      },
      body: JSON.stringify({ newTodoList }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "サーバーエラー");
    }
  } catch (error) {
    console.error("エラー:", error);
  }
  };

  return (
    <div className="fixed p-5 transform -translate-x-1/2 bg-white border-2 border-gray-300 rounded-lg shadow-xl select-none bottom-5 left-1/2">
      <div className="mb-2">
        {/* relative コンテナ内にポップアップ表示用の span を配置 */}
        <div ref={toggleButtonRef} className="relative inline">
          <span className="cursor-pointer select-none" onClick={() => setShowCategorySelector((prev) => !prev)}>リストの追加先：</span>
          <button
            className={`p-1 rounded-md text-lg cursor-pointer ${
              selectedCategory === "notStarted"
                ? "bg-red-200 hover:bg-red-300"
                : selectedCategory === "inProgress"
                ? "bg-orange-200 hover:bg-orange-300"
                : "bg-green-200 hover:bg-green-300"
            }`}
            onClick={() => setShowCategorySelector((prev) => !prev)}
          >
            {selectedCategory === "notStarted"
              ? "未着手"
              : selectedCategory === "inProgress"
              ? "実行中"
              : "完了"}
          </button>
        </div>
        {showCategorySelector && (
          <div ref={toggleButtonRef}
          className="absolute flex gap-2 p-2 bg-white border border-gray-300 rounded-md shadow-lg select-none bottom-24 left-20">
            {categories.map((cat) => {
              return (
                <div
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setShowCategorySelector(false);
                  }}
                  className={`px-2 py-2 cursor-pointer rounded-md ${
                    cat === "notStarted"
                      ? "bg-red-200 hover:bg-red-300"
                      : cat === "inProgress"
                      ? "bg-orange-200 hover:bg-orange-300"
                      : "bg-green-200 hover:bg-green-300"
                  }`}
                >
                  {cat === "notStarted"
                    ? "未着手"
                    : cat === "inProgress"
                    ? "実行中"
                    : "完了"}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <form onSubmit={addTodoList} className="flex">
        <button
          onClick={addTodoList}
          className="px-3 text-2xl text-zinc-600 bg-white rounded hover:shadow-[inset_0_2px_8px_rgba(0,0,0,0.1)]  hover:translate-y-[2px] transition-all duration-200"
        >
          +
        </button>
        <input
          type="text"
          name={"todo-form"}
          maxLength="20"
          placeholder="タイトルを入力"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="text-lg border-b border-gray-400 w-96 focus:caret-black focus:outline-none"
        />
      </form>
    </div>
  );
};
export default Form;
