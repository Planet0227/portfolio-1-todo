"use client";

import Todo from "./Todo";
import Form from "./Form";
import TodoColmun from "./TodoColumn";
import TodoDetail from "@/components/detail/TodoDetail";
import { useTodos, useTodosDispatch } from "../../context/TodoContext";
import { useEffect, useState, useRef } from "react";
import Modal from "../common/Modal";
import { checkAndResetTasks } from "@/utils/resetTasks";

// dnd
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  TouchSensor,
  MouseSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { CATEGORY_LIST } from "@/utils/categories";
import WarningMessage from "./WarningMessage";
import { TodosDescription } from "./TodosDescription";
import { useAuth } from "@/context/AuthContext";
import { useDnDTodos } from "@/hooks/useDnDTodos";

const Todos = () => {
  // モーダル
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTodoId, setSelectedTodoId] = useState(null);
  const [magnification, setMagnification] = useState(false);

  // フォーム表示制御
  const [formVisible, setFormVisible] = useState(false); // デスクトップ用自動表示
  const [formExpanded, setFormExpanded] = useState(false); // モバイルタップ表示
  const [isTouch, setIsTouch] = useState(false);
  const containerRef = useRef(null);

  // タッチデバイス判定
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsTouch(navigator.maxTouchPoints > 0);
    }
  }, []);

  const todos = useTodos();
  const dispatch = useTodosDispatch();

  // auth
  const { user } = useAuth();
  const isGuestOrNotLoggedIn = () => !user || user.isAnonymous;
  const [isShowWarning, setIsShowWarning] = useState(true);

  const [todosList, setTodosList] = useState(todos);

  // 初回リセットチェック
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // カスタムセンサーの設定
  const sensors = useSensors(
    useSensor(TouchSensor, {
      // タッチの検出を遅延させて、スクロールを優先
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(MouseSensor, {
      // マウスの検出は即時
      activationConstraint: {
        distance: 0,
      },
    })
  );

  // DnD
  const { dragItem, handleDragStart, handleDragOver, handleDragEnd } =
    useDnDTodos(todosList, setTodosList, dispatch);

  // 初回マウント時に一回だけ実行
  useEffect(() => {
    if (!initialCheckDone && todos && todos.length > 0) {
      checkAndResetTasks(todos, dispatch);
      setInitialCheckDone(true);
    }
  }, [todos, dispatch, initialCheckDone]);

  // ソート反映
  useEffect(() => {
    const sorted = [...todos].sort((a, b) => a.order - b.order);
    setTodosList(sorted);
  }, [todos]);

  // デスクトップ: マウス位置でフォーム表示
  useEffect(() => {
    if (!isTouch) {
      const handleMouseMove = (e) => {
        const h = window.innerHeight;
        setFormVisible(e.clientY > h - 200);
      };
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    } else {
      setFormVisible(false);
    }
  }, [isTouch]);

  // モバイル: タップ時にフォーム展開
  useEffect(() => {
    if (isTouch && containerRef.current) {
      const handleTap = (e) => {
        if (!formExpanded) {
          // フォーム領域内タップで展開
          const formEl = document.getElementById("todo-form");
          if (formEl && formEl.contains(e.target)) {
            setFormExpanded(true);
          }
        }
      };
      document.addEventListener("touchstart", handleTap);
      return () => document.removeEventListener("touchstart", handleTap);
    }
  }, [isTouch, formExpanded]);

  // モバイル: 展開中にフォーム外タップで閉じる
  useEffect(() => {
    if (isTouch && formExpanded) {
      const handleOutside = (e) => {
        const formEl = document.getElementById("todo-form");
        if (formEl && !formEl.contains(e.target)) {
          setFormExpanded(false);
        }
      };
      document.addEventListener("touchstart", handleOutside);
      return () => document.removeEventListener("touchstart", handleOutside);
    }
  }, [isTouch, formExpanded]);

  const openModal = (id) => {
    setSelectedTodoId(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTodoId(null);
    setIsModalOpen(false);
  };

  // モーダル開閉時のスクロール制御
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen]);

  return (
    <div ref={containerRef}>
      {isGuestOrNotLoggedIn() && isShowWarning && (
        <WarningMessage user={user} onClose={() => setIsShowWarning(false)} />
      )}
      <div className="relative">
        <TodosDescription />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="relative grid grid-cols-1 mt-3 mb-40 select-none md:mx-auto md:flex md:justify-center md:flex-nowrap">
          {CATEGORY_LIST.map((cat) => {
            const list = todosList.filter((t) => t.category === cat.id);
            return (
              <div key={cat.id} className="flex-none w-full p-2 md:w-80">
                <TodoColmun
                  category={cat.id}
                  todoList={list}
                  selectedTodoId={selectedTodoId}
                  openModal={openModal}
                />
              </div>
            );
          })}

          {todosList.length === 0 && (
            <div className="absolute left-0 right-0 flex justify-center top-60">
              <div className="p-20 text-center bg-white border-4 border-gray-500 rounded-lg shadow-lg">
                <div className="mb-4 text-4xl text-gray-300 md:text-6xl">
                  📝
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-600 md:text-2xl">
                  リストがありません
                </h3>
                <p className="mb-4 text-base text-gray-500 md:text-lg">
                  下部のフォームからリストを作成してください
                </p>
                <div className="text-2xl text-gray-400 animate-bounce">↓</div>
              </div>
            </div>
          )}

          <DragOverlay>
            {dragItem && (
              <Todo todo={todosList.find((t) => t.id === dragItem)} isOverlay />
            )}
          </DragOverlay>
        </div>
      </DndContext>

      {/* フォーム */}
      {!isModalOpen && (
        <div
          id="todo-form"
          className={`fixed left-0 right-0 bottom-0 transition-transform duration-300 pointer-events-none ${
            !isTouch
              ? formVisible && !dragItem
                ? "translate-y-0 pointer-events-auto"
                : "translate-y-24"
              : formExpanded
              ? "translate-y-0 pointer-events-auto"
              : "translate-y-24"
          }`}
        >
          <Form
            formVisible={formVisible}
            formExpanded={formExpanded}
            dragItem={dragItem}
            isTouchDevice={isTouch}
            categories={CATEGORY_LIST.map((c) => c.id)}
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
