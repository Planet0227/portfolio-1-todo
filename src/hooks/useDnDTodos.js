"use client";
import { CATEGORY_LIST } from "@/utils/categories";
import { arrayMove } from "@dnd-kit/sortable";
import { MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useState } from "react";
import { authenticatedFetch } from "@/utils/authToken";

export const useDnDTodos = (todosList, setTodosList, dispatch) => {
  const [dragItem, setDragItem] = useState(null);

  //5px動かすとドラッグと判定する。
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    })
  );

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
    setDragItem(active.id);
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
    setDragItem(null);
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

  return { dragItem, sensors, handleDragStart, handleDragOver, handleDragEnd };
};
