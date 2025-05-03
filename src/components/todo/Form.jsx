"use client";
import { useEffect, useRef, useState } from "react";
import { useTodos, useTodosDispatch } from "../../context/TodoContext";
import { authenticatedFetch } from "@/utils/authToken";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCirclePlus,
  faMousePointer,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import CategoryHeader from "../common/CategoryHeader";
const Form = ({ categories, formVisible, formExpanded, dragItem, isTouchDevice }) => {
  const [inputValue, setInputValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("notStarted");
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const todos = useTodos();
  const dispatch = useTodosDispatch();

  const toggleButtonRef = useRef(null);

  // クリックが外部で行われたらオプションを閉じる
  useEffect(() => {
    const handleClickOutside = (e) => {
      // トグルボタン以外がクリックされた場合にオプションを閉じる
      if (toggleButtonRef.current && toggleButtonRef.current.contains(e.target))
        return;
      if (e.target.closest("[data-todo]")) return;
      setShowCategorySelector(false);
    };
    if (showCategorySelector) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showCategorySelector]);

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
      lock: false,
      order: order,
      tasks: [],
    };
    dispatch({ type: "todo/addList", payload: newTodoList });
    setInputValue("");

    try {
      await authenticatedFetch("/api/todos", {
        method: "POST",
        body: JSON.stringify({ newTodoList }),
      });
    } catch (error) {
      console.error("タスク更新エラー:", error);
    }
  };

  return (
    <div className="relative p-2 md:p-3 mx-auto bg-white border-2 border-gray-500 rounded-lg shadow-xl pointer-events-auto select-none md:px-5 w-full md:w-[600px]">
      <div
        className={`flex items-center justify-center gap-2 mb-2 text-gray-600 ${
          !formVisible && "animate-pulse"
        }`}
      >
        {(formVisible || formExpanded) && !dragItem ? (
          <>
            <FontAwesomeIcon icon={faCirclePlus} />
            <span className="text-xs font-bold md:text-sm">Todoリストの新規作成</span>
          </>
        ) : !dragItem ? (
          <>
            {isTouchDevice ? (
              <>
                <FontAwesomeIcon icon={faPlus} />
                <span className="text-xs md:text-sm">タップでフォームが表示されます</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faMousePointer} />
                <span className="text-xs md:text-sm">
                  マウスを画面下に移動するとフォームが表示されます
                </span>
              </>
            )}
          </>
        ) : (
          ""
        )}
      </div>
      <div className="flex justify-start mt-6 ml-16">
        {/* relative コンテナ内にポップアップ表示用の span を配置 */}
        <div className="relative flex">
          <span
            className="flex items-center text-sm cursor-pointer select-none md:text-base"
            onClick={() => setShowCategorySelector((prev) => !prev)}
          >
            リストの追加先：
          </span>
          <span
            className={`cursor-pointer`}
            onClick={() => setShowCategorySelector((prev) => !prev)}
          >
            <CategoryHeader category={selectedCategory} className="rounded-md" />
          </span>
        </div>
        {showCategorySelector && (formVisible || formExpanded) && (
          <div
            ref={toggleButtonRef}
            className="absolute flex bg-white border border-gray-300 rounded-md shadow-md select-none left-3 md:left-24 bottom-20"
          >
            {categories.map((cat) => {
              return (
                <div
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setShowCategorySelector(false);
                  }}
                  className={`cursor-pointer`}
                >
                  <CategoryHeader category={cat} />
                </div>
              );
            })}
          </div>
        )}
      </div>
      <form onSubmit={addTodoList} className="flex justify-center">
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
          className="text-base md:text-lg border-b border-gray-400 w-[400px] focus:caret-black focus:outline-none"
        />
      </form>
    </div>
  );
};
export default Form;
