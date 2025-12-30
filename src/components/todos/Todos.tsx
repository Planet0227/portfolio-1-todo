"use client";

import Todo from "./Todo";
import Form from "./Form";
import TodoColmun from "./TodoColumn";
import TodoDetail from "@/components/detail/TodoDetail";
import { useTodos, useTodosDispatch } from "../../context/TodoContext";
import { useEffect, useState, useRef } from "react";
import Modal from "../common/Modal";

// dnd
import {
  DndContext,
  DragOverlay,
  pointerWithin,
} from "@dnd-kit/core";

import { CATEGORY_LIST } from "@/utils/categories";
import WarningMessage from "./WarningMessage";
import { TodosDescription } from "./TodosDescription";
import { useAuth } from "@/context/AuthContext";
import { useDnDTodos } from "@/hooks/useDnDTodos";

export default function Todos() {
  // モーダル
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);
  const [magnification, setMagnification] = useState(false);

  // フォーム表示制御
  const [formVisible, setFormVisible] = useState(false); // デスクトップ用自動表示
  const [formExpanded, setFormExpanded] = useState(false); // モバイルタップ表示
  const [isTouch, setIsTouch] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // DnD
  const { dragItem, sensors, handleDragStart, handleDragOver, handleDragEnd } =
    useDnDTodos({
      todosList,
      setTodosList,
      dispatch,
      userId: user?.uid,
    });

  // ソート反映
  useEffect(() => {
    if (!todos) return;
    const sorted = [...todos].sort((a, b) => a.order - b.order);
    setTodosList(sorted);

  }, [todos]);

  // デスクトップ: マウス位置でフォーム表示
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setFormVisible(e.clientY > window.innerHeight - 200);
    };

    if (!isTouch) {
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }

    setFormVisible(false);
    return () => { }; // 空のクリーンアップ関数
  }, [isTouch]);


  // モバイル: タップ時にフォーム開閉
  useEffect(() => {
    if (!isTouch || !containerRef.current) return;

    const handleTouch = (e: TouchEvent) => {
      const target = e.target as Node;
      const formEl = document.getElementById("todo-form");
      if (!formEl) return;

      if (!formExpanded && formEl.contains(target)) {
        // 未展開時：フォーム内タップで展開
        setFormExpanded(true);
      } else if (formExpanded && !formEl.contains(target)) {
        // 展開中：フォーム外タップで閉じる
        setFormExpanded(false);
      }
    };

    document.addEventListener("touchstart", handleTouch);
    return () => document.removeEventListener("touchstart", handleTouch);
  }, [isTouch, formExpanded]);


  const openModal = (id: string) => {
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
        <div className="grid relative grid-cols-1 mt-3 mb-40 select-none md:mx-auto md:flex md:justify-center md:flex-nowrap">
          {CATEGORY_LIST.map((cat) => {
            const list = todosList.filter((t) => t.category === cat.id);
            return (
              <div key={cat.id} className="flex-none px-2 pt-2 w-full md:w-80">
                <TodoColmun
                  category={cat.id}
                  todoList={list}
                  selectedTodoId={selectedTodoId}
                  openModal={openModal}
                  isTouch={isTouch}
                />
              </div>
            );
          })}

          {todosList.length === 0 && (


            <div className="flex absolute right-0 left-0 top-60 justify-center">
              <div className="p-20 text-center bg-white rounded-lg border-4 border-gray-500 shadow-lg">
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
            {dragItem && (() => {
              const overlayTodo = todosList.find(t => t.id === dragItem);
              if (!overlayTodo) return null;
              return (
                <Todo
                  todo={overlayTodo}
                  isOverlay
                />
              );
            })()}
          </DragOverlay>

        </div>
      </DndContext>

      {/* フォーム */}
      {!isModalOpen && (
        <div
          id="todo-form"
          className={`fixed left-0 right-0 bottom-0 transition-transform duration-300 pointer-events-none ${!isTouch
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

