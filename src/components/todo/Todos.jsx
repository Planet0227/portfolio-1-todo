"use client";

import Todo from "./Todo";
import Form from "./Form";
import TodoColmun from "./TodoColumn";
import TodoDetail from "@/components/detail/TodoDetail";
import {
  useTodos,
  useTodosDispatch,
  useTodosLoading,
} from "../../context/TodoContext";
import { useEffect, useState } from "react";
import Modal from "../common/Modal";
import { checkAndResetTasks } from "@/utils/resetTasks";

//  dnd
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
import Loading from "../common/Loading";

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



  
  //auth
  const { user, loading } = useAuth();
  const isGuestOrNotLoggedIn = () => !user || user.isAnonymous;
  const [isShowWarning, setIsShowWarning] = useState(true);

  const [todosList, setTodosList] = useState(todos);


  // 初回マウント時のリセットチェック用フラグ
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // DnD ロジックをフックで切り出し
  const { dragItem, sensors, handleDragStart, handleDragOver, handleDragEnd } =
    useDnDTodos(todosList, setTodosList, dispatch);

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

  // マウス位置によるフォームの表示切替（下部200px以内なら表示）
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


  const openModal = (id) => {
    setSelectedTodoId(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTodoId(null);
    setIsModalOpen(false);
  };
  
  return (
    <div>
      
      {isGuestOrNotLoggedIn() && isShowWarning && (
        <WarningMessage user={user} onClose={() => setIsShowWarning(false)} />
      )}

      <TodosDescription />

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
          {(!todosList || todosList.length === 0) && (
            <div className="absolute left-0 right-0 flex justify-center top-40">
              <div className="p-20 text-center bg-white rounded-lg shadow-lg">
                <div className="mb-4 text-6xl text-gray-300">📝</div>
                <h3 className="mb-2 text-2xl font-semibold text-gray-600">
                  リストがありません
                </h3>
                <p className="mb-4 text-lg text-gray-500">
                  下部のフォームからリストを作成してください
                </p>
                <div className="text-2xl text-gray-400 animate-bounce">↓</div>
              </div>
            </div>
          )}

          <DragOverlay >
            {dragItem ? (
              <Todo
                todo={todosList.find((t) => t.id === dragItem)}
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
          ${formVisible && !dragItem ? "translate-y-0" : "translate-y-28"}
        `}
        >
          <Form
            formVisible={formVisible}
            dragItem={dragItem}
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