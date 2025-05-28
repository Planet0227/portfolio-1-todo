"use client";
import { useEffect, useRef, useState } from "react";
import { useTodos, useTodosDispatch } from "../../context/TodoContext";
import { addTodoList } from "@/firebase/todos";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCirclePlus,
  faMousePointer,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import CategoryHeader from "../common/CategoryHeader";
import { useAuth } from "@/context/AuthContext";
const Form = ({
  categories,
  formVisible,
  formExpanded,
  dragItem,
  isTouchDevice,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("notStarted");
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const todos = useTodos();
  const dispatch = useTodosDispatch();
  const { user } = useAuth();

  const toggleButtonRef = useRef(null);
  const inputRef = useRef(null);

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

  useEffect(() => {
    if (formVisible || formExpanded) {
      // 表示されたときは遅延して focus
      const handle = setTimeout(() => {
        inputRef.current?.focus();
      }, 450);
      return () => clearTimeout(handle);
    } else {
      // 非表示またはドラッグ中は即時に blur
      inputRef.current?.blur();
    }
  }, [formVisible, formExpanded]);

  // 新しいTodoリスト
  const handleAddTodoList = async (e) => {
    e.preventDefault();
    if (inputValue === "" || !user) {
      return;
    }

    const now = new Date();

    // 年、月、日を取得
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const date = String(now.getDate()).padStart(2, "0");
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

    try {
      // クライアントSDKを使用してリストを追加
      const createdTodoList = await addTodoList(user.uid, newTodoList);
      
      // ローカルステートを更新
      dispatch({ type: "todo/addList", payload: createdTodoList });
      setInputValue("");
    } catch (error) {
      console.error("リストの追加に失敗しました:", error);
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
            <span className="text-xs font-bold md:text-sm">
              Todoリストの新規作成
            </span>
          </>
        ) : !dragItem ? (
          <>
            {isTouchDevice ? (
              <>
                <FontAwesomeIcon icon={faPlus} />
                <span className="text-xs md:text-sm">
                  タップでフォームが表示されます
                </span>
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
          <span className="text-xs md:text-sm">ドロップで並べ替え</span>
        )}
      </div>
      {/* カテゴリ選択 */}
      <div className="relative flex justify-start mt-6 ml-16">
        <span className="flex items-center mr-2 text-sm cursor-pointer select-none md:text-base">
          追加先：
        </span>
        <button
          ref={toggleButtonRef}
          onClick={() => setShowCategorySelector(prev => !prev)}
          className="px-3 py-1 transition"
        >
          <CategoryHeader category={selectedCategory} />
        </button>

        {showCategorySelector && (formVisible || formExpanded) && (
          <div
            ref={toggleButtonRef}
            className="absolute z-10 grid w-full max-w-xs grid-cols-2 gap-2 p-2 mb-2 overflow-auto text-center bg-white border border-gray-300 rounded-md shadow-lg -left-7 bottom-full">
            {categories.map(cat => (
              <div
                key={cat}
                onClick={() => { setSelectedCategory(cat); setShowCategorySelector(false); }}
                className="py-1 transition rounded cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <CategoryHeader category={cat} />
              </div>
            ))}
          </div>
        )}
      </div>
      <form onSubmit={handleAddTodoList} className="flex justify-center mt-3">
        <button
          type="submit"
          className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-white transition rounded-full bg-cyan-400 hover:bg-cyan-500"
        >
          +
        </button>
        <input
          ref={inputRef}
          type="text"
          name={"todo-form"}
          maxLength="14"
          placeholder="タイトルを入力（14文字まで）"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="text-base md:text-lg border-b ml-2 border-gray-400 w-[400px] focus:caret-black focus:outline-none"
        />
      </form>
    </div>
  );
};

export default Form;
