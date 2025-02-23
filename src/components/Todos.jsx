"use client";

import Todo from "./Todo";
import Form from "./Form";
import TodoColmun from "./TodoColmun";
import TodoDetail from "@/features/todo/TodoDetail";
import { useTodos, useTodosDispatch } from "../context/TodoContext";
import { useCallback, useEffect, useState } from "react";
import Modal from "./Modal";

//  dnd
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  closestCenter,
  closestCorners,
  defaultDropAnimationSideEffects,
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

const Todos = () => {
  //モーダル
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTodoId, setSelectedTodoId] = useState(null);
  const [magnification, setMagnification] = useState(false);

  const todos = useTodos();
  const dispatch = useTodosDispatch();

  const [todosList, setTodosList] = useState(todos);
  const [activeId, setActiveId] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [overColumn, setOverColumn] = useState(null);

  useEffect(() => {
    setTodosList(todos);
  }, [todos]);

  const findColumn = (id) => {
    if (!id) {
      return null;
    }
    // colmunのidが返ってきた場合はそのまま返す
    if (id === "notStarted" || id === "inProgress" || id === "completed") {
      return id;
    }
    // itemのidが渡された場合、itemもつカラムのidを返したい
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
      return null;
    }
    if (over) {
      const overId = String(over.id);
      const activeId = String(active.id);
      const overColumn = findColumn(overId);
      const activeColumn = findColumn(activeId);

      let updatedTodos = [...todosList];

      if (active.id !== over.id) {
        if (activeColumn !== overColumn) {
          updatedTodos = todosList.map((todo) =>
            todo.id === activeId ? { ...todo, category: overColumn } : todo
          );
          updatedTodos = updatedTodos.map((todo, index) => ({
            ...todo,
            order: index + 1, // 1から順に振り直す
          }));

          setTodosList(updatedTodos);
        }
      }
    }
  };

  const handleDragEnd = async (event) => {
    setActiveId(null);
    const { active, over } = event;

    const overId = String(over.id);
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

      const categories = ["notStarted", "inProgress", "completed"];
      categories.forEach((cat) => {
        // 現在の updatedTodos から該当カラムのアイテムを抽出（表示順は updatedTodos 内の順序通り）
        const itemsInCat = updatedTodos.filter((todo) => todo.category === cat);
        // 各アイテムに対して order を 1 から連番で割り当てる
        itemsInCat.forEach((item, index) => {
          // updatedTodos 内の該当アイテムを更新
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

      // サーバー同期
      try {
        const response = await fetch("/api/todos", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ updatedTodos }),
        });

        if (!response.ok) {
          throw new Error("タスクの並び順を保存できませんでした。");
        }
      } catch (error) {
        console.error(error);
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
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } })
  );

  // 進行状況で分類
  const categories = ["notStarted", "inProgress", "completed"];
  return (
    <div>
      <div className="px-10 pt-10 mx-auto md:max-w-5xl md:px-5">
        <div className="text-4xl font-bold">タスク管理</div>
        <div>
          <div>
            タイトルを入力して+ボタンをクリックすると、リストの追加先に指定されているカラムにリストが新規作成されます。
          </div>
          <div>
            詳細ページではタスクの追加、変更、削除、チェックを付けて進捗を記録・確認出来ます。
          </div>
          <div>リストやタスクはドラッグアンドドロップで並べ替えられます。</div>
        </div>
      </div>
      <DndContext
        id={"unique-dnd-context-id"}
        sensors={sensors}
        collisionDetection={closestCenter} //これにしないと無限ループが発生する。
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 mx-auto mb-40 select-none md:grid-cols-3 md:max-w-5xl">
          {categories.map((category) => {
            const filterdTodoList = todosList.filter(
              (todoList) => todoList.category === category
            );
            return (
              <div key={category} className="w-full p-3">
                <TodoColmun
                  category={category}
                  todoList={filterdTodoList}
                  selectedTodoId={selectedTodoId}
                  openModal={openModal}
                />
              </div>
            );
          })}

          <DragOverlay
            dropAnimation={{
              sideEffects: null,
            }}
          >
            {activeId ? (
              <Todo
                todo={todosList.find((t) => t.id === activeId)}
                isOverlay={true}
              />
            ) : null}
          </DragOverlay>
        </div>
      </DndContext>
      <div>
        {!selectedTodoId && <Form categories={categories} />}
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
    </div>
  );
};

export default Todos;
