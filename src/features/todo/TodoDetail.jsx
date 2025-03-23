"use client";

import { useState, useEffect } from "react";
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
import { getAuth } from "firebase/auth";
import WeekToggleButtons from "./WeekToggleButtons";

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


// ホバー表示用
  const [isHoveredExit, setIsHoveredExit] = useState(false);
  const [isHoveredMg, setIsisHoveredMg] = useState(false);

  // ドラッグ中のアイテムとIDを保持
  const [activeId, setActiveId] = useState(null);
  const activeItem = cachedList?.todos.find((todo) => todo.id === activeId);

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
      if (e.key === "F2") {
        setMagnification((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const deleteTodoList = async () => {
    dispatch({ type: "todo/deleteList", payload: { listId } });

    //auth
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error("ユーザーが認証されていません");
      return;
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/todos", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // トークンをヘッダーにセット
        },
        body: JSON.stringify({ listId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "リストの削除に失敗しました。");
      }
    } catch (error) {
      console.error("リストが削除されました。:", error);
    }
    setCachedList(null);
    onClose();
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

      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        console.error("ユーザーが認証されていません");
        return;
      }

      try {
        const token = await user.getIdToken();
        const response = await fetch("/api/todos", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            // ヘッダーのテンプレートリテラルはバッククォートで囲む必要があります
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ listId, updatedTitle }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "タイトルを更新できませんでした。"
          );
        }
      } catch (error) {
        console.error("エラー:", error);
      }
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

    // 認証ユーザーの確認と更新処理
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      console.error("ユーザーが認証されていません");
      return;
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/todos", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ listId, updatedTasks }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "タスクを並び替えられませんでした。"
        );
      }
    } catch (error) {
      console.error("エラー:", error);
    }
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id); // ドラッグ開始時のIDを保存
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

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
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      console.error("ユーザーが認証されていません");
      return;
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/todos", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          // ヘッダーのテンプレートリテラルはバッククォートで囲む必要があります
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ listId, updatedTasks }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "タスクを並び替えられませんでした。"
        );
      }
    } catch (error) {
      console.error("エラー:", error);
    }
  };

  if (!cachedList) {
    return <div>指定されたTodoリストは見つかりませんでした。</div>;
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
            className="w-full mb-1 text-3xl font-bold focus:outline-none"
          />
          <p className="text-gray-500 border-b-2 border-gray-400">
            作成日： {cachedList.date}
          </p>


          {/* WeekToggleButtonsに初期値と更新後のコールバックを渡す */}
          <WeekToggleButtons
            listId={listId}
            initialResetDays={cachedList?.resetDays}
            onResetDaysUpdated={onResetDaysUpdated}
          />
          <div className="flex items-center">
            <p>リセット：</p>
            <button
              className="inline-flex px-2 py-1 ml-2 transition-colors bg-white border-2 rounded-md border-sky-500 hover:bg-sky-500 hover:border-sky-500 group"
              onClick={resetComplete}
            >
              <p className="w-5 h-5 mt-0.5 rounded-full border-2 bg-green-500 border-white before:content-['✓'] before:text-white before:text-sm before:flex before:items-center before:justify-center"></p>
              <span className="text-gray-500 group-hover:text-white">をすべて外す</span>
            </button>
          </div>
        </div>
      </div>

      {/* メイン */}
      <div className="relative pt-2 mt-2 mb-40 border-t-2 border-gray-400 mx-14 ">
        <DndContext
          collisionDetection={closestCorners}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
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
