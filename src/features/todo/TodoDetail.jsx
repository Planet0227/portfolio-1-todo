"use client";

import { useState, useEffect } from "react";
import { useTodos, useTodosDispatch } from "@/context/TodoContext";
import TodoDetailItem from "./TodoDetailItem";
import TodoDetailForm from "./TodoDetailForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

import { DndContext, DragOverlay, closestCenter, closestCorners, defaultDropAnimationSideEffects } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { arrayMove } from "@dnd-kit/sortable";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";

export default function TodoDetail({ listId, onClose }) {
  const todos = useTodos();
  const dispatch = useTodosDispatch();
  const [cachedList, setCachedList] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [editTitle, setEditTitle] = useState("");

// ドラッグ中のアイテムとIDを保持
  const [activeId, setActiveId] = useState(null); 
  const activeItem = cachedList?.todos.find((todo) => todo.id === activeId);
  const [indicatorIndex, setIndicatorIndex] = useState(null); // 挿入位置のインデックスを保持


  useEffect(() => {
    if (listId) {
      const foundList = todos.find((todoList) => todoList.id === listId);
      setCachedList(foundList || null);
    }
  }, [listId, todos]);

  useEffect(() => {
    if (cachedList) {
      setEditTitle(cachedList.title || "");
    }
  }, [cachedList]);

  //モーダルをEscで閉じる
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const deleteTodoList = async () => {
    dispatch({ type: "todo/deleteList", payload: { listId } });
    setCachedList(null);
    onClose();
    try {
      const response = await fetch("/api/todos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listId }),
      });
      if (!response.ok) throw new Error("リストの削除に失敗しました。");

      console.log("リストが削除されました。");
    } catch (error) {
      console.error(error);
    }
  };
  const handleTitleChange = (e) => {
    const updatedTitle = e.target.value;
    setEditTitle(updatedTitle);
    updateTitle(updatedTitle);
  };

  //　タイトル更新
  const updateTitle = async (updatedTitle) => {
    if (updatedTitle !== cachedList.title) {
      dispatch({ type: "todo/updateList", payload: { listId, updatedTitle } });

      try {
        const response = await fetch("/api/todos", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listId, updatedTitle }),
        });
        // const result = await response.json();
        // console.log(result);

        if (!response.ok) throw new Error("タイトルを更新できませんでした。");
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id); // ドラッグ開始時のIDを保存
  };

  // ドラッグ終了時の処理
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (over == null || active.id === over.id) {
      return;
    }

    if (active.id !== over.id) {
      const oldIndex = cachedList.todos.findIndex(
        (item) => item.id === active.id
      );
      const newIndex = cachedList.todos.findIndex(
        (item) => item.id === over.id
      );

      const updatedTodos = arrayMove(cachedList.todos, oldIndex, newIndex);

      setCachedList({ ...cachedList, todos: updatedTodos });

      // 状態更新
      dispatch({
        type: "todo/update",
        payload: { listId, updatedTodos },
      });

      // サーバー同期
      fetch("/api/todos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listId, updatedTodos }),
      }).catch((err) => console.error("サーバー同期エラー:", err));
    }
  };

  

  if (!cachedList) {
    return <div>指定されたTodoリストは見つかりませんでした。</div>;
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="sticky top-0 z-20 bg-white">
        <div className="relative flex items-center justify-between p-4">
          <div>
            <button
              className="mx-2 text-xl text-gray-300 hover:text-gray-500"
              onClick={onClose}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <div
              className={`absolute z-10 flex flex-col items-center p-1 text-xs text-white transform bg-gray-600 rounded shadow-lg left-2 transition-all duration-300 ${
                isHovered
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-90 pointer-events-none"
              }`}
            >
              <div>閉じる</div>
              <div>（esc）</div>
            </div>
          </div>

          <button
            onClick={deleteTodoList}
            className="px-5 py-2 text-sm font-medium text-center text-red-500 border border-red-500 rounded-lg hover:text-white hover:bg-red-500 focus:ring-4 focus:outline-none me-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white shrink-0"
          >
            リストを削除
          </button>
        </div>

        <div className="ml-7">
          <input
            type="text"
            maxLength="18"
            placeholder="タイトルを入力"
            value={editTitle}
            onChange={handleTitleChange}
            className="w-full mb-1 text-3xl font-bold focus:outline-none"
          />
          <p className="pb-1 text-gray-500 border-b-2 border-gray">
            作成した日付： {cachedList.date}
          </p>
        </div>
      </div>

      {/* メイン */}
      <div className="relative mx-10 mt-2 mb-40">
        <DndContext
          collisionDetection={closestCorners}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext strategy={verticalListSortingStrategy} items={cachedList.todos.map((todo) => todo.id)}>
            {cachedList.todos.map((todo) => (
              <TodoDetailItem
                key={todo.id}
                id={todo.id}
                todo={todo}
                todos={cachedList.todos}
                listId={listId}
              />
            ))}
            <div></div>
          </SortableContext>
          <DragOverlay 
             dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({
                styles: {},
              }),
            }}
          >
            {activeId ? (
              <TodoDetailItem
                id={activeItem.id}
                todo={activeItem}
                listId={listId}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
        <TodoDetailForm listId={listId} />
      </div>
    </div>
  );
}


//strategy={verticalListSortingStrategy}を書かないと入れ替えた時にアイテムがずれる。