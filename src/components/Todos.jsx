"use client";

import Todo from "./Todo";
import Form from "./Form";
import TodoColmun from "./TodoColmun";
import TodoDetail from "@/features/todo/TodoDetail";
import { useTodos, useTodosDispatch, useTodosLoading } from "../context/TodoContext";
import { useEffect, useState } from "react";
import Modal from "./Modal";
import { checkAndResetTasks } from "@/utils/resetTasks";

//  dnd
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  rectSortingStrategy,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { arrayMove } from "@dnd-kit/sortable";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import { getAuth } from "firebase/auth";
import { authenticatedFetch } from "@/utils/auth";
import { CATEGORY_LIST } from "@/utils/categories";

const Todos = () => {
  //モーダル
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTodoId, setSelectedTodoId] = useState(null);
  const [magnification, setMagnification] = useState(false);

  const [formVisible, setFormVisible] = useState(false);
  const isTouchDevice = () => {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  };

  const todos = useTodos();
  const dispatch = useTodosDispatch();

  const isTodosLoading = useTodosLoading();

  //auth
  const auth = getAuth();
  const user = auth.currentUser;

  const [todosList, setTodosList] = useState(todos);
  const [activeId, setActiveId] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [overColumn, setOverColumn] = useState(null);

  // 初回マウント時のリセットチェック用フラグ
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  const [isShowWarning, setIsShowWarning] = useState(true);

  // 初回マウント時に1回だけ実行
  useEffect(() => {
    if (!initialCheckDone && todos && todos.length > 0) {
      console.log("Initial reset check...");
      checkAndResetTasks(todos, dispatch);
      setInitialCheckDone(true);
    }
  }, [todos, dispatch]);

  useEffect(() => {
    const sortedTodosList = [...todos].sort((a, b) => a.order - b.order);
    setTodosList(sortedTodosList);
  }, [todos]);

  // マウス位置によるフォームの表示切替（下部100px以内なら表示）
  useEffect(() => {
    if (!isTouchDevice()) {
      const handleMouseMove = (e) => {
        const windowHeight = window.innerHeight;
        if (e.clientY > windowHeight - 200) {
          setFormVisible(true);
        } else {
          setFormVisible(false);
        }
      };
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    } else {
      setFormVisible(true);
    }
  }, []);

  const findColumn = (id) => {
    if (!id) {
      return null;
    }
    // カテゴリーのIDリストを作成
    const categoryIds = CATEGORY_LIST.map((cat) => cat.id);
    // カテゴリーIDが直接渡された場合はそのまま返す
    if (categoryIds.includes(id)) {
      return id;
    }
    // itemのidが渡された場合、そのitemが属するカラムのidを返す
    return todosList.find((todo) => todo.id === id)?.category;
  };

  const handleDragStart = (event) => {
    const { active, over } = event;
    if (!active) return;
    setActiveId(active.id);
    setActiveItem(todosList.find((t) => t.id === active.id));
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const overId = String(over.id);
    const activeId = String(active.id);
    const overColumn = findColumn(overId);
    const activeColumn = findColumn(activeId);
    let updatedTodos = [...todosList];

    // ドラッグ元とターゲットが異なるカラムの場合
    if (activeColumn !== overColumn) {
      // まずはカテゴリー変更
      updatedTodos = updatedTodos.map((todo) =>
        todo.id === activeId ? { ...todo, category: overColumn } : todo
      );

      // カテゴリーIDのリストを取得
      const categoryIds = CATEGORY_LIST.map((cat) => cat.id);

      // もし over.id がカラム自体を示している場合（＝個々のアイテムと衝突していない場合）
      if (categoryIds.includes(overId)) {
        // ターゲットカラム内のアイテム（ドラッグ中のものを除く）を取得
        const targetItems = updatedTodos
          .filter(
            (todo) => todo.category === overColumn && todo.id !== activeId
          )
          .sort((a, b) => a.order - b.order);
        // 新規追加先は末尾とする（空なら先頭）
        const newOrder = targetItems.length + 1;
        updatedTodos = updatedTodos.map((todo) =>
          todo.id === activeId ? { ...todo, order: newOrder } : todo
        );
      } else {
        // もし個々の item と衝突している場合は通常通り再配置（ここでは必要に応じて arrayMove を利用）

        const oldIndex = todosList.findIndex((t) => t.id === active.id);
        const newIndex = todosList.findIndex((t) => t.id === over.id);
        updatedTodos = arrayMove(todosList, oldIndex, newIndex).map(
          (todo, index) => ({
            ...todo,
            order: index + 1,
          })
        );
      }
      setTodosList(updatedTodos);
    } else {
      // 同一カラム内での並べ替えは従来通り
      const oldIndex = todosList.findIndex((t) => t.id === active.id);
      const newIndex = todosList.findIndex((t) => t.id === over.id);
      updatedTodos = arrayMove(todosList, oldIndex, newIndex).map(
        (todo, index) => ({
          ...todo,
          order: index + 1,
        })
      );
      setTodosList(updatedTodos);
    }
  };

  const handleDragEnd = async (event) => {
    setActiveId(null);
    const { active, over } = event;

    const overId = String(over?.id);
    const activeId = String(active.id);
    const overColumn = findColumn(overId);
    const activeColumn = findColumn(activeId);

    let updatedTodos = [...todosList];

    if (activeColumn === overColumn) {
      const oldIndex = todosList.findIndex((t) => t.id === active.id);
      const newIndex = todosList.findIndex((t) => t.id === over.id);
      // if (oldIndex === -1 || newIndex === -1) {
      //   return; // IDが見つからなければ処理を中断
      // }

      // active.idからtodoを特定しstatusをcolumnのid(status)に変更する
      updatedTodos = arrayMove(todosList, oldIndex, newIndex);

      updatedTodos = updatedTodos.map((todo, index) => ({
        ...todo,
        order: index + 1, // 1から順に振り直す
      }));

      CATEGORY_LIST.forEach((cat) => {
        const itemsInCat = updatedTodos.filter(
          (todo) => todo.category === cat.id
        );
        itemsInCat.forEach((item, index) => {
          const idx = updatedTodos.findIndex((todo) => todo.id === item.id);
          if (idx !== -1) {
            updatedTodos[idx] = { ...updatedTodos[idx], order: index + 1 };
          }
        });
      });
      setTodosList(updatedTodos);

      // 状態更新
      dispatch({
        type: "todo/sort",
        payload: { updatedTodos },
      });

      try {
        await authenticatedFetch("/api/todos", {
          method: "PATCH",
          body: JSON.stringify({ updatedTodos }),
        });
      } catch (error) {
        console.error("タスク更新エラー:", error);
      }
    }
  };

  const openModal = (id) => {
    setSelectedTodoId(id);
    setIsModalOpen(true);

    // // モーダル展開時のスタイル維持
    // const scrollbarWidth =
    //   window.innerWidth - document.documentElement.clientWidth;
    // document.body.style.overflow = "hidden";

    // document.body.style.paddingRight = `${scrollbarWidth}px`;
  };

  const closeModal = () => {
    setSelectedTodoId(null);
    setIsModalOpen(false);

    // // スクロール復元
    // document.body.style.overflow = "";
    // document.body.style.paddingRight = "";
  };

  //5px動かすとドラッグと判定する。
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    })
  );

  // ユーザーの状態を判定する関数
  const isGuestOrNotLoggedIn = () => {
    // ユーザーがnullの場合は未ログイン
    if (!user) return true;
    // ユーザーが匿名（ゲスト）の場合
    if (user.isAnonymous) return true;
    // それ以外（通常のログインユーザー）の場合
    return false;
  };

  // if(!isTodosLoading){
  //   return <p>Loading...</p>
  // }

  return (
    <div>
      {/* 未ログインまたはゲストの場合に警告メッセージを表示 */}
      {isGuestOrNotLoggedIn() && isShowWarning && (
        <div className="relative p-4 border-l-8 bg-amber-50 border-amber-500 text-amber-700">
          <div className="flex items-center mb-1">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-semibold">注意</span>
          </div>
          <button
            onClick={() => setIsShowWarning(false)}
            className="absolute text-3xl font-bold top-2 right-2 focus:outline-none"
            aria-label="警告を閉じる"
          >
            ×
          </button>
          {!user ? (
            <>
              <p>
                現在、機能お試しモードです。作成されたリストはページのリロードなどで失われます。
              </p>
              <p className="mt-1 text-sm">
                ゲストログインまたはアカウント登録をしてください。
              </p>
            </>
          ) : (
            <>
              <p>
                現在ゲストモードです。ブラウザのキャッシュ削除やログアウトでデータが失われます。
              </p>
              <p className="mt-1 text-sm">
                新規登録をすることでデータを永続的に保存することができます。
              </p>
            </>
          )}
        </div>
      )}
      <div className="mx-8 mt-10 md:mx-auto md:max-w-5xl md:px-5">
        <div>
          <div className="text-4xl font-bold">タスク管理</div>
          <div>
            <div>
              タイトルを入力して+ボタンをクリックすると、リストの追加先に指定されているカラムにリストが新規作成されます。
            </div>
            <div>
              詳細ページではタスクの追加、変更、削除、チェックを付けて進捗を記録・確認出来ます。
            </div>
            <div>
              リストやタスクはドラッグアンドドロップで並べ替えられます。
            </div>
          </div>{" "}
        </div>
      </div>

      <DndContext
        id={"unique-dnd-context-id"}
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="relative grid grid-cols-1 mx-auto mb-40 select-none md:flex md:justify-center md:flex-nowrap">
          {CATEGORY_LIST.map((category) => {
            const filterdTodoList = todosList.filter(
              (todoList) => todoList.category === category.id
            );
            return (
              <div key={category.id} className="flex-none w-full p-2 md:w-80">
                <TodoColmun
                  category={category.id}
                  todoList={filterdTodoList}
                  selectedTodoId={selectedTodoId}
                  openModal={openModal}
                />
              </div>
            );
          })}

          {/* リストが空の場合のメッセージを追加 */}
          {(!todos || todos.length === 0) && (
            <div className="absolute left-0 right-0 flex justify-center top-24">
              <div className="text-center bg-white rounded-lg shadow-lg p-14">
                <div className="mb-4 text-6xl text-gray-300">📝</div>
                <h3 className="mb-2 text-xl font-semibold text-gray-600">
                  リストが存在しません
                </h3>
                <p className="mb-4 text-gray-500">
                  下部のフォームからリストを作成してください
                </p>
                <div className="text-2xl text-gray-400 animate-bounce">↓</div>
              </div>
            </div>
          )}

          <DragOverlay dropAnimation={{ sideEffects: null }}>
            {activeId ? (
              <Todo
                todo={todosList.find((t) => t.id === activeId)}
                isOverlay={true}
              />
            ) : null}
          </DragOverlay>
        </div>
      </DndContext>
      {!isModalOpen && (
        <div
          className={`
          fixed left-0 right-0 bottom-0 pointer-events-none transition-transform duration-300
          ${formVisible && !activeId ? "translate-y-0" : "translate-y-28"}
        `}
        >
          {/* Formコンポーネントは内部のスタイルのみを適用 */}
          <Form
            formVisible={formVisible}
            activeId={activeId}
            isTouchDevice={isTouchDevice}
            categories={CATEGORY_LIST.map((cat) => cat.id)}
          />
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        magnification={magnification}
      >
        <TodoDetail
          listId={selectedTodoId}
          onClose={closeModal}
          magnification={magnification}
          setMagnification={setMagnification}
        />
      </Modal>
    </div>
  );
};

export default Todos;
