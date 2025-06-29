"use client";
import { CATEGORY_LIST } from "@/utils/categories";
import { arrayMove } from "@dnd-kit/sortable";
import { DragEndEvent, DragOverEvent, DragStartEvent, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useCallback, useId, useState } from "react";
import { sortTodoList } from "@/firebase/todos";
import { TodoAction, TodoListType } from "@/context/TodoContext";

interface UseDnDTodosProps {
  todosList: TodoListType[];
  setTodosList: React.Dispatch<React.SetStateAction<TodoListType[]>>;
  dispatch: React.Dispatch<TodoAction>;
  userId?: string | undefined;
}

interface UseDnDTodosResult {
  dragItem: string | null; 
  sensors: ReturnType<typeof useSensors>; 
  handleDragStart: (event: DragStartEvent) => void; 
  handleDragOver: (event: DragOverEvent) => void; 
  handleDragEnd: (event: DragEndEvent) => void;
}

export function useDnDTodos({ todosList, setTodosList, dispatch, userId }: UseDnDTodosProps): UseDnDTodosResult {
  const [dragItem, setDragItem] = useState<string | null>(null);

  //5px動かすとドラッグと判定する。
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    })
  );

  const findColumn = (id: string): string => {
    const categoryIds = CATEGORY_LIST.map((cat) => cat.id);
    if (categoryIds.includes(id)) {
      return id;
    }
    const category = todosList.find((todo) => todo.id === id)?.category;
    return category ?? ""; // 必ず string を返すようにする
  };
  

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    if (!active) return;
    setDragItem(String(active.id));
  }, []);

  const handleDragOver = (event: DragOverEvent) => {
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
      }
      setTodosList(updatedTodos);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setDragItem(null);
    const { active, over } = event;

    // if (!over || active.id === over.id) {
    //   return;
    // }
    
    const overId = String(over?.id);
    const activeId = String(active.id);
    const overColumn = findColumn(overId);
    const activeColumn = findColumn(activeId);

    let updatedTodos = [...todosList];

    if (activeColumn === overColumn) {
      const oldIndex = todosList.findIndex((t) => t.id === active.id);
      const newIndex = todosList.findIndex((t) => t.id === over?.id);

      // active.idからtodoを特定しstatusをcolumnのidに変更する
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
            updatedTodos[idx] = { ...updatedTodos[idx], order: index + 1 } as TodoListType;
          }
        });
      });

      setTodosList(updatedTodos);

      if (!useId) {
        dispatch({
          type: "todo/sort",
          payload: { updatedTodos },
        });
      } else {
        await sortTodoList(userId, updatedTodos);
      }
    }
  };

  return { dragItem, sensors, handleDragStart, handleDragOver, handleDragEnd };
};
