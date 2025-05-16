"use client";

import { useState, useEffect, useRef } from "react";
import { useTodos, useTodosDispatch } from "@/context/TodoContext";
import TodoDetailItem from "./TodoDetailItem";
import TodoDetailForm from "./TodoDetailForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import WeekToggleButtons from "./WeekToggleButtons";
import { authenticatedFetch } from "@/utils/authToken";
import { CATEGORY_LIST } from "@/utils/categories";
import CategoryHeader from "@/components/common/CategoryHeader";

// icon
import {
  faChevronLeft,
  faCopy,
  faDownLeftAndUpRightToCenter,
  faLock,
  faUnlock,
  faUpRightAndDownLeftFromCenter,
} from "@fortawesome/free-solid-svg-icons";

//  dnd
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { arrayMove } from "@dnd-kit/sortable";
import {
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";

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
  const [showToast, setShowToast] = useState(false);
  const [toastMounted, setToastMounted] = useState(false);

  const toggleButtonRef = useRef(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  );

  // ホバー表示用
  const [isHoveredExit, setIsHoveredExit] = useState(false);
  const [isHoveredMg, setIsHoveredMg] = useState(false);
  const [isHoveredCopy, setIsHoveredCopy] = useState(false);

  useEffect(() => {
    if (listId) {
      const foundList = todos.find((todoList) => todoList.id === listId);
      setCachedList(foundList || null);
    }
  }, [listId, todos]);

  useEffect(() => {
    if (cachedList) {
      setEditTitle(cachedList.title);
    }
  }, [cachedList]);

  //キー入力を検知
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

  // トグルボタン以外がクリックされた場合にオプションを閉じる
  useEffect(() => {
    const handleClickOutside = (e) => {
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

  //　コピークリック2秒後にトーストを消す
  useEffect(() => {
    if (!showToast && toastMounted) {
      const tid = setTimeout(() => setToastMounted(false), 500);
      return () => clearTimeout(tid);
    }
  }, [showToast, toastMounted]);

  const updateLock = async () => {
    const newLock = !cachedList.lock;
    dispatch({ type: "todo/updateLock", payload: { listId, lock: newLock } });
    try {
      await authenticatedFetch("/api/todos", {
        method: "PATCH",
        body: JSON.stringify({ listId, updatedLock: newLock }),
      });
    } catch (error) {
      console.error("タイトル更新エラー:", error);
    }
  };

  const handleCopy = () => {
    if (!cachedList) return;
    // タスクは order 順にソート
    const sortedTasks = [...cachedList.tasks].sort((a, b) => a.order - b.order);
    // コピー用テキストを組み立て
    const lines = [`-${cachedList.title}-`, ""];
    sortedTasks.forEach((task) => {
      const checkbox = task.complete ? "✓" : " ";
      lines.push(`[${checkbox}] ${task.content}`);
    });
    const textToCopy = lines.join("\n");
    // クリップボードに書き込み
    navigator.clipboard
      .writeText(lines.join("\n"))
      .then(() => {
        setToastMounted(true);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000); // 2秒後に不透明度を0%
      })
      .catch(console.error);
  };

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
    dispatch({
      type: "todo/updateListTitle",
      payload: { listId, updatedTitle },
    });
  };

  const handleTitleBlur = async () => {
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
        }),
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
    const updatedTasks = cachedList.tasks.map((task) => ({
      ...task,
      complete: false,
    }));
    console.log(updatedTasks);

    setCachedList({ ...cachedList, tasks: updatedTasks });

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
    const sortedTasks = [...cachedList.tasks].sort((a, b) => a.order - b.order);
    const oldIndex = sortedTasks.findIndex((item) => item.id === active.id);
    const newIndex = sortedTasks.findIndex((item) => item.id === over.id);

    const updatedTasks = arrayMove(sortedTasks, oldIndex, newIndex).map(
      (todo, index) => ({
        ...todo,
        order: index + 1,
      })
    );

    setCachedList({ ...cachedList, tasks: updatedTasks });

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

  const sortedTasks = [...cachedList.tasks].sort((a, b) => a.order - b.order);

  return (
    <div className="select-none">
      {/* トースト */}
      {/* 不透明度の変更に0.5秒かける */}
      {toastMounted && (
        <div
          className={`fixed z-50 px-4 py-2 text-white transform -translate-x-1/2 rounded shadow-lg top-5 
            bg-lime-500 left-1/2 transition-opacity duration-500 
            ${showToast ? "opacity-100" : "opacity-0"}`}
        >
          コピーしました
        </div>
      )}
      {/* ヘッダー */}
      <div className="sticky top-0 z-20 bg-white">
        <div className="relative flex items-center justify-between px-3 py-3 border-b shadow-sm md:px-4 bg-gradient-to-r from-green-200 via-blue-200 to-purple-200">
          <div>
            <button
              className="mx-2 text-xl text-white hover:text-gray-500"
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
              className="hidden mx-2 ml-5 text-xl text-white hover:text-gray-500 md:inline"
              onClick={() => setMagnification((prev) => !prev)}
              onMouseEnter={() => setIsHoveredMg(true)}
              onMouseLeave={() => setIsHoveredMg(false)}
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

            {/* コピー */}
            <button
              className="mx-2 ml-5 text-xl text-white hover:text-gray-500 md:inline"
              onClick={handleCopy}
              onMouseEnter={() => setIsHoveredCopy(true)}
              onMouseLeave={() => setIsHoveredCopy(false)}
            >
              <FontAwesomeIcon icon={faCopy} />
            </button>
            <div
              className={`absolute z-10 flex flex-col items-center px-2 py-1 text-xs text-white bg-gray-600 rounded shadow-lg left-9 md:left-24 transition-all duration-300 ${
                isHoveredCopy
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-90 pointer-events-none"
              }`}
            >
              <div>
                テキスト
                <br />
                でコピー
              </div>
            </div>
          </div>
        </div>
        {/* main*/}
        <div className="pt-2 mx-4 md:mx-14">
          <div className="flex justify-between gap-4 mb-1 md:mb-3">
            <div className="flex">
              <button
                className="text-xl md:text-3xl"
                onClick={updateLock}
                title={cachedList?.lock ? "ロック解除" : "ロックする"}
              >
                {cachedList.lock ? (
                  <FontAwesomeIcon
                    icon={faLock}
                    className="text-gray-600 hover:text-gray-800"
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={faUnlock}
                    className="text-gray-400 hover:text-gray-600"
                  />
                )}
              </button>
            </div>

            <button
              onClick={deleteTodoList}
              disabled={cachedList?.lock}
              className={`px-3 p-1 md:px-5 md:py-2 text-xs md:text-sm font-medium text-center border rounded-lg focus:ring-4 focus:outline-none me-2 shrink-0 transition-colors duration-300 ${
                cachedList?.lock
                  ? "text-gray-400 border-gray-400 cursor-not-allowed"
                  : "text-red-500  border-red-500 hover:text-white hover:bg-red-500 dark:border-red-500 dark:text-red-500 dark:hover:text-white"
              }`}
            >
              リストを削除
            </button>
          </div>
          <input
            type="text"
            name={`todo-${listId}-input`}
            maxLength="14"
            placeholder="タイトルを入力（14文字まで）"
            value={editTitle}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            className="w-full mb-1 text-xl font-bold md:text-2xl focus:outline-none"
          />
          <div className="relative flex items-center mt-1 md:mt-2">
            <span className="text-sm text-gray-500 md:text-base">進捗：</span>
            <span
              className={`cursor-pointer`}
              onClick={() => setShowCategorySelector((prev) => !prev)}
            >
              <CategoryHeader
                category={cachedList.category}
                className="text-sm rounded-md md:text-base"
              />
            </span>
          </div>
          {showCategorySelector && (
            <div
              ref={toggleButtonRef}
              className="absolute overflow-hidden bg-white border border-gray-300 rounded-md shadow-xl select-none top-32 left-36 md:top-36 md:left-48"
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
                    className={`cursor-pointer text-sm md:text-base`}
                  >
                    <CategoryHeader category={cat.id} />
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-1 text-gray-500 border-gray-400 md:mt-2">
            <span className="text-sm md:text-base">作成日： </span>
            <span className="ml-1 text-sm md:ml-2 md:text-base">
              {cachedList.date}
            </span>
          </div>

          {/* WeekToggleButtonsに初期値と更新後のコールバックを渡す */}
          <WeekToggleButtons
            listId={listId}
            initialResetDays={cachedList?.resetDays}
            onResetDaysUpdated={onResetDaysUpdated}
          />
          <div className="flex items-center mt-1 md:mt-2">
            <p className="text-sm text-gray-500 md:text-base">リセット：</p>
            <button
              className="inline-flex px-1 py-1 ml-2 transition-colors bg-white border-2 rounded-md border-sky-500 hover:bg-sky-500 hover:border-sky-500 group"
              onClick={resetComplete}
            >
              <p className="w-4 h-4 md:w-5 md:h-5 mt-0.5 rounded-full border-2 bg-green-400 border-white before:content-['✓'] before:text-xs before:text-white md:before:text-sm before:flex before:items-center before:justify-center"></p>
              <span className="text-xs text-gray-500 group-hover:text-white md:text-base">
                をすべて外す
              </span>
            </button>
          </div>
          <div className="relative mt-2">
            <TodoDetailForm listId={listId} />
          </div>
        </div>
      </div>

      {/* メイン */}
      <div className="relative mx-4 md:mx-14">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          {/* スクロール可能なコンテナ */}
          <div className="relative max-h-[calc(100vh-400px)] overflow-y-auto mb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <SortableContext
              strategy={verticalListSortingStrategy}
              items={sortedTasks.map((task) => task.id)}
            >
              {sortedTasks.map((task) => (
                <TodoDetailItem
                  key={task.id}
                  id={task.id}
                  task={task}
                  tasks={sortedTasks}
                  listId={listId}
                  magnification={magnification}
                />
              ))}
            </SortableContext>
          </div>
        </DndContext>
      </div>
    </div>
  );
}
