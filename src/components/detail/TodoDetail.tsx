"use client";

import { useState, useEffect, useRef, Dispatch, SetStateAction } from "react";
import { ResetDaysType, TodoListType, useTodos, useTodosDispatch } from "@/context/TodoContext";
import TodoDetailItem from "./TodoDetailItem";
import TodoDetailForm from "./TodoDetailForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import WeekToggleButtons from "./WeekToggleButtons";
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
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { arrayMove } from "@dnd-kit/sortable";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { useAuth } from "@/context/AuthContext";
import {
  changeCategory,
  deleteTodoList,
  updateLock,
  updateTasks,
  updateTitle,
} from "@/firebase/todos";

interface TodoDetailProps {
  listId: string | null;
  onClose: () => void;
  magnification: boolean;
  setMagnification: Dispatch<SetStateAction<boolean>>;
}

const TodoDetail: React.FC<TodoDetailProps> = ({
  listId,
  onClose,
  magnification,
  setMagnification,
}) => {
  const todos = useTodos();
  const dispatch = useTodosDispatch();
  const [cachedList, setCachedList] = useState<TodoListType | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMounted, setToastMounted] = useState(false);
  const { user } = useAuth();

  const toggleButtonRef = useRef<HTMLDivElement | null>(null);

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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "F2") setMagnification((prev) => !prev);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, setMagnification]);

  // トグルボタン以外がクリックされた場合にオプションを閉じる
  useEffect(() => {
    const handleClickOutside = (e: globalThis.MouseEvent) => {
      if (!(e.target instanceof Element)) return;
      if (toggleButtonRef.current && toggleButtonRef.current.contains(e.target)) return;
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
    return
  }, [showToast, toastMounted]);

  const handleUpdateLock = async () => {
    if (!listId) return;
    if (cachedList) {
      const newLock = !cachedList.lock;
      try {
        if (!user) {
          dispatch({
            type: "todo/updateLock",
            payload: { listId, lock: newLock },
          });
        } else {
          await updateLock(user.uid, listId, newLock);
        }
      } catch (error) {
        console.error("タイトル更新エラー:", error);
      }
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
    // const textToCopy = lines.join("\n");
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

  const handleDeleteList = async () => {
    if (!listId) return;
    if (!user) {
      dispatch({ type: "todo/deleteList", payload: { listId } });
    } else {
      await deleteTodoList(user.uid, listId);
    }
    setCachedList(null);
    onClose();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!listId) return;
    const updatedTitle = e.target.value;
    setEditTitle(updatedTitle);
    dispatch({
      type: "todo/updateListTitle",
      payload: { listId, updatedTitle },
    });
  };

  const handleTitleBlur = async () => {
    if (!listId) return;
    if (!user) return
    try {
      await updateTitle(user.uid, listId, editTitle);
    } catch (error) {
      console.error("タイトル更新エラー:", error);
      setEditTitle(cachedList?.title || ""); // エラー時は元のタイトルに戻す
    }
  };

  const handleChangeCategory = async (catId: string) => {
    if (!listId) return;
    if (!cachedList) return;
    // グローバルの todos 配列から、指定カテゴリーのリスト件数を取得
    const listsInCategory = todos.filter((list) => list.category === catId);
    const newOrder = listsInCategory.length + 1;

    // cachedList で category と order を更新
    const updatedList = { ...cachedList, category: catId, order: newOrder };
    setCachedList(updatedList);

    if (!user) {
      // グローバル状態も更新 (実装に合わせ、更新内容を直接指定)
      dispatch({
        type: "todo/updateList",
        payload: { listId, updatedCategory: catId, updatedOrder: newOrder },
      });
    } else {
      try {
        await changeCategory(user.uid, listId, catId, newOrder);
      } catch (error) {
        console.error("カテゴリー更新エラー:", error);
      }
    }
  };

  const onResetDaysUpdated = (updatedResetDays: ResetDaysType) => {
    if (!cachedList) return;
    setCachedList({ ...cachedList, resetDays: updatedResetDays });
  };

  // リセットボタン
  const resetComplete = async () => {
    if (!listId) return;
    if (!cachedList) return;
    const updatedTasks = cachedList.tasks.map((task) => ({
      ...task,
      complete: false,
    }));
    console.log(updatedTasks);

    setCachedList({ ...cachedList, tasks: updatedTasks });

    if (!user) {
      dispatch({
        type: "todo/update",
        payload: { listId, updatedTasks },
      });
    } else {
      try {
        await updateTasks(user.uid, listId, updatedTasks);
      } catch (error) {
        console.error("タスク更新エラー:", error);
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!listId) return;
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }
    if (!cachedList) return;

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


    if (!user) {
      dispatch({
        type: "todo/update",
        payload: { listId, updatedTasks },
      });
    } else {
      try {
        await updateTasks(user.uid, listId, updatedTasks);
      } catch (error) {
        console.error("タスク更新エラー:", error);
      }
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
        <div className="flex relative justify-between items-center px-3 py-3 bg-gradient-to-r from-green-200 via-blue-200 to-purple-200 border-b shadow-sm md:px-4">
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
              className={`absolute z-10 flex flex-col items-center p-1 text-xs text-white transform bg-gray-600 rounded shadow-lg left-2 transition-all duration-300 ${isHoveredExit
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
              className={`absolute z-10 flex flex-col items-center p-1 text-xs text-white transform bg-gray-600 rounded shadow-lg left-[53px] transition-all duration-300 ${isHoveredMg
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
              className={`absolute z-10 flex flex-col items-center px-2 py-1 text-xs text-white bg-gray-600 rounded shadow-lg left-9 md:left-24 transition-all duration-300 ${isHoveredCopy
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
          <div className="flex gap-4 justify-between mb-1 md:mb-3">
            <div className="flex">
              <button
                className="text-xl md:text-3xl"
                onClick={handleUpdateLock}
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
              onClick={handleDeleteList}
              disabled={cachedList?.lock}
              className={`px-3 p-1 md:px-5 md:py-2 text-xs md:text-sm font-medium text-center border rounded-lg focus:ring-4 focus:outline-none me-2 shrink-0 transition-colors duration-300 ${cachedList?.lock
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
            maxLength={14}
            placeholder="タイトルを入力（14文字まで）"
            value={editTitle}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            className="mb-1 w-full text-xl font-bold md:text-2xl focus:outline-none"
          />
          <div className="flex relative items-center mt-1 md:mt-2">
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
              className="overflow-hidden absolute top-32 left-36 bg-white rounded-md border border-gray-300 shadow-xl select-none md:top-36 md:left-48"
              onClick={(e) => e.stopPropagation()}
            >
              {CATEGORY_LIST.map((cat) => {
                return (
                  <div
                    data-todo
                    key={cat.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChangeCategory(cat.id);
                      setShowCategorySelector(false);
                    }}
                    className={`text-sm cursor-pointer md:text-base`}
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
              className="inline-flex px-1 py-1 ml-2 bg-white rounded-md border-2 border-sky-500 transition-colors hover:bg-sky-500 hover:border-sky-500 group"
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
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragEnd={handleDragEnd}
        >
          {/* スクロール可能なコンテナ */}
          <div className="relative max-h-[calc(100vh-400px)] space-y-2 overflow-y-auto mb-2 pt-2 pb-5 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
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

export default TodoDetail;