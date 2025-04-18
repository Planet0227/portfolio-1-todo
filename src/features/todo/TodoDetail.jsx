"use client";

import { useState, useEffect, useRef } from "react";
import { useTodos, useTodosDispatch } from "@/context/TodoContext";
import TodoDetailItem from "./TodoDetailItem";
import TodoDetailForm from "./TodoDetailForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faDownLeftAndUpRightToCenter,
  faUpRightAndDownLeftFromCenter,
} from "@fortawesome/free-solid-svg-icons";
//  dnd
import {
  DndContext,
  DragOverlay,
  closestCorners,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { arrayMove } from "@dnd-kit/sortable";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import WeekToggleButtons from "./WeekToggleButtons";
import { authenticatedFetch } from "@/utils/auth";
import { CATEGORY_LIST, getCategoryInfo } from "@/utils/categories";

export default function TodoDetail({
  listId,
  onClose,
  magnification,
  setMagnification,
}) {
  const todos = useTodos();
  const dispatch = useTodosDispatch();
  const [cachedList, setCachedList] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  // const [selectedCategory, setSelectedCategory] = useState(
  //   cachedList?.category
  // );
  const toggleButtonRef = useRef(null);

  // ホバー表示用
  const [isHoveredExit, setIsHoveredExit] = useState(false);
  const [isHoveredMg, setIsisHoveredMg] = useState(false);

  useEffect(() => {
    if (listId) {
      const foundList = todos.find((todoList) => todoList.id === listId);
      setCachedList(foundList || null);
    }
  }, [listId, todos]);

  useEffect(() => {
    if (cachedList) {
      setEditTitle(cachedList?.title || "");
    }
  }, [cachedList]);

  //モーダルをEscで閉じる
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
      if (e.key === "F2") {
        setMagnification((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

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

  const deleteTodoList = async () => {
    dispatch({ type: "todo/deleteList", payload: { listId } });
    setCachedList(null);
    onClose();
    try {
      await authenticatedFetch("/api/todos", {
        method: "DELETE",
        body: JSON.stringify({ listId }),
      });
    } catch (error) {
      console.error("タイトル更新エラー:", error);
    }
  };

  const handleTitleChange = (e) => {
    const updatedTitle = e.target.value;
    setEditTitle(updatedTitle);
    dispatch({ type: "todo/updateList", payload: { listId, updatedTitle } });
  };

  const handleTitleBlur = async () => {
    // if (editTitle === cachedList.title) return;
    dispatch({
      type: "todo/updateListTitle",
      payload: { listId, updatedTitle: editTitle },
    });
    try {
      await authenticatedFetch("/api/todos", {
        method: "PATCH",
        body: JSON.stringify({ listId, updatedTitle: editTitle }),
      });
    } catch (error) {
      console.error("タイトル更新エラー:", error);
      setEditTitle(cachedList.title); // エラー時は元のタイトルに戻す
    }
  };

  const changeCategory = async (catId) => {
    // グローバルの todos 配列から、指定カテゴリーのリスト件数を取得
    const listsInCategory = todos.filter((list) => list.category === catId);
    const newOrder = listsInCategory.length + 1;
  
    // cachedList で category と order を更新
    const updatedList = { ...cachedList, category: catId, order: newOrder };
    setCachedList(updatedList);
  
    // グローバル状態も更新 (実装に合わせ、更新内容を直接指定)
    dispatch({
      type: "todo/updateList",
      payload: { listId, updatedCategory: catId, updatedOrder: newOrder },
    });
  
    try {
      await authenticatedFetch("/api/todos", {
        method: "PATCH",
        body: JSON.stringify({
          listId,
          updatedCategory: catId,
          updatedOrder: newOrder,
        })
      });
    } catch (error) {
      console.error("カテゴリー更新エラー:", error);
    }
  };
  

  const onResetDaysUpdated = (updatedResetDays) => {
    setCachedList({ ...cachedList, resetDays: updatedResetDays });
  };

  // リセットボタン
  const resetComplete = async () => {
    const updatedTasks = cachedList.todos.map((task) => ({
      ...task,
      complete: false,
    }));
    console.log(updatedTasks);

    setCachedList({ ...cachedList, todos: updatedTasks });

    dispatch({
      type: "todo/update",
      payload: { listId, updatedTasks },
    });

    try {
      await authenticatedFetch("/api/todos", {
        method: "PATCH",
        body: JSON.stringify({ listId, updatedTasks }),
      });
    } catch (error) {
      console.error("タスク更新エラー:", error);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    // ソート済みのタスク配列を利用する
    const sortedTasks = [...cachedList.todos].sort((a, b) => a.order - b.order);
    const oldIndex = sortedTasks.findIndex((item) => item.id === active.id);
    const newIndex = sortedTasks.findIndex((item) => item.id === over.id);

    const updatedTasks = arrayMove(sortedTasks, oldIndex, newIndex).map(
      (todo, index) => ({
        ...todo,
        order: index + 1,
      })
    );

    setCachedList({ ...cachedList, todos: updatedTasks });

    dispatch({
      type: "todo/update",
      payload: { listId, updatedTasks },
    });

    // 認証ユーザーの確認と更新処理
    try {
      await authenticatedFetch("/api/todos", {
        method: "PATCH",
        body: JSON.stringify({ listId, updatedTasks }),
      });
    } catch (error) {
      console.error("タスク更新エラー:", error);
    }
  };

  if (!cachedList) {
    return <div>存在しないリストです。</div>;
  }

  const sortedTodos = [...cachedList.todos].sort((a, b) => a.order - b.order);

  return (
    <div className="select-none">
      {/* ヘッダー */}
      <div className="sticky top-0 z-20 bg-white">
        <div className="relative flex items-center justify-between p-4">
          <div>
            <button
              className="mx-2 text-xl text-gray-300 hover:text-gray-500"
              onClick={onClose}
              onMouseEnter={() => setIsHoveredExit(true)}
              onMouseLeave={() => setIsHoveredExit(false)}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <div
              className={`absolute z-10 flex flex-col items-center p-1 text-xs text-white transform bg-gray-600 rounded shadow-lg left-2 transition-all duration-300 ${
                isHoveredExit
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-90 pointer-events-none"
              }`}
            >
              <div>閉じる</div>
              <div>（esc）</div>
            </div>

            <button
              className="hidden mx-2 ml-5 text-xl text-gray-300 hover:text-gray-500 md:inline"
              onClick={() => setMagnification((prev) => !prev)}
              onMouseEnter={() => setIsisHoveredMg(true)}
              onMouseLeave={() => setIsisHoveredMg(false)}
            >
              {magnification ? (
                <FontAwesomeIcon icon={faDownLeftAndUpRightToCenter} />
              ) : (
                <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} />
              )}
            </button>
            <div
              className={`absolute z-10 flex flex-col items-center p-1 text-xs text-white transform bg-gray-600 rounded shadow-lg left-[53px] transition-all duration-300 ${
                isHoveredMg
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-90 pointer-events-none"
              }`}
            >
              <div className="flex flex-col items-center">
                <div>{magnification ? "縮小" : "拡大"}</div>
                <div>（F2）</div>
              </div>
            </div>
          </div>

          <button
            onClick={deleteTodoList}
            className="px-5 py-2 text-sm font-medium text-center text-red-500 border border-red-500 rounded-lg hover:text-white hover:bg-red-500 focus:ring-4 focus:outline-none me-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white shrink-0"
          >
            リストを削除
          </button>
        </div>

        <div className="mx-14">
          <input
            type="text"
            name={`todo-${listId}-input`}
            maxLength="18"
            placeholder="タイトルを入力"
            value={editTitle}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            className="w-full mb-1 text-3xl font-bold focus:outline-none"
          />
          <div className="relative mt-2">
            <span className="text-gray-500">進捗：</span>
            <span
              className={`p-1 mb-3 text-lg ml-2
                 border-white rounded-md cursor-pointer ${
                   getCategoryInfo(cachedList.category).styles.baseColor
                 } ${getCategoryInfo(cachedList.category).styles.hover}`}
              onClick={() => setShowCategorySelector((prev) => !prev)}
            >
              {getCategoryInfo(cachedList.category).title}
            </span>
          </div>
          {showCategorySelector && (
            <div
              ref={toggleButtonRef}
              className="absolute bg-white border border-gray-300 rounded-md shadow-xl select-none bottom-14 left-44"
              onClick={(e) => e.stopPropagation()}
            >
              {CATEGORY_LIST.map((cat) => {
                return (
                  <div
                    data-todo
                    key={cat.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      changeCategory(cat.id);
                      setShowCategorySelector(false);
                    }}
                    className={`p-1 cursor-pointer ${
                      getCategoryInfo(cat.id).styles.baseColor
                    } ${getCategoryInfo(cat.id).styles.hover}`}
                  >
                    {getCategoryInfo(cat.id).title}
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-2 text-gray-500 border-gray-400">
            <span>作成日： </span>
            <span className="ml-2">{cachedList.date}</span>
          </div>

          {/* WeekToggleButtonsに初期値と更新後のコールバックを渡す */}
          <WeekToggleButtons
            listId={listId}
            initialResetDays={cachedList?.resetDays}
            onResetDaysUpdated={onResetDaysUpdated}
          />
          <div className="flex items-center mt-2">
            <p className="text-gray-500">リセット：</p>
            <button
              className="inline-flex px-2 py-1 ml-2 transition-colors bg-white border-2 rounded-md border-sky-500 hover:bg-sky-500 hover:border-sky-500 group"
              onClick={resetComplete}
            >
              <p className="w-5 h-5 mt-0.5 rounded-full border-2 bg-green-500 border-white before:content-['✓'] before:text-white before:text-sm before:flex before:items-center before:justify-center"></p>
              <span className="text-gray-500 group-hover:text-white">
                をすべて外す
              </span>
            </button>
          </div>
          <div className="mt-2 border-b-2 border-gray-400"></div>
        </div>
      </div>

      {/* メイン */}
      <div className="relative mx-14">
        <DndContext
          collisionDetection={closestCorners}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragEnd={handleDragEnd}
        >
          {/* スクロール可能なコンテナ */}
          <div className="relative h-[calc(100vh-386px)] overflow-y-auto pr-2 mb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pt-2 border-b-2 border-gray-400">
            <SortableContext
              strategy={verticalListSortingStrategy}
              items={sortedTodos.map((todo) => todo.id)}
            >
              {sortedTodos.map((todo) => (
                <TodoDetailItem
                  key={todo.id}
                  id={todo.id}
                  todo={todo}
                  todos={sortedTodos}
                  listId={listId}
                />
              ))}
            </SortableContext>
          </div>
        </DndContext>
        <TodoDetailForm listId={listId} />
      </div>
    </div>
  );
}
