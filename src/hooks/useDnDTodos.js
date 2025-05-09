"use client";
import { CATEGORY_LIST } from "@/utils/categories";
import { arrayMove } from "@dnd-kit/sortable";
import { closestCenter, MouseSensor, pointerWithin, rectIntersection, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useCallback, useState } from "react";
import { authenticatedFetch } from "@/utils/authToken";

export const useDnDTodos = (todosList, setTodosList, dispatch) => {
  const [dragItem, setDragItem] = useState(null);

  // 5px 動かすとドラッグ開始
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  );

  const categoryIds = CATEGORY_LIST.map((c) => c.id);
  // id から所属カラムを返す（todosList をクロージャから参照）
  const findColumn = (id) => {
    if (categoryIds.includes(id)) return id;
    const todo = todosList.find((t) => t.id === id);
    return todo ? todo.category : null;
  };

  const collisionDetection = useCallback(
    (args) => {
      const { droppableContainers } = args;
      const ids = CATEGORY_LIST.map((c) => c.id);

      // 1) Column detection via pointerWithin
      const columns = droppableContainers.filter((c) => ids.includes(c.id));
      const columnHits = pointerWithin({ ...args, droppableContainers: columns });
      if (columnHits.length) return columnHits;

      // 2) Item detection via closestCenter
      const items = droppableContainers.filter((c) => !ids.includes(c.id));
      const collision = closestCenter({ ...args, droppableContainers: items });
      if (collision.length) return collision;

      // 3) Fallback rectIntersection
      const rects = rectIntersection(args);
      if (rects.length) return rects;

      return [];
    },
    [todosList]
  );

  const handleDragStart = useCallback((event) => {
    const { active } = event;
    if (!active) return;
    setDragItem(active.id);
  }, []);

  const handleDragOver = ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const sourceCol = findColumn(activeId);
    const targetCol = findColumn(overId);

    setTodosList((list) => {
      let updated = [...list];
      const movingItem = updated.find((t) => t.id === activeId);

      // 1) カラムそのものへのドロップ → 末尾追加
      if (categoryIds.includes(overId)) {
        updated = updated.map((t) =>
          t.id === activeId
            ? {
                ...t,
                category: overId,
                order:
                  Math.max(
                    0,
                    ...list.filter((x) => x.category === overId).map((x) => x.order)
                  ) + 1,
              }
            : t
        );
        return updated;
      }

      // 2) 別カラム内のアイテム上ドロップ → 中間挿入
      if (sourceCol && targetCol && sourceCol !== targetCol && movingItem) {
        // カテゴリ切替
        updated = updated.map((t) =>
          t.id === activeId ? { ...t, category: targetCol } : t
        );

        // ターゲット列のアイテムを抽出し order 順にソート
        const targetItems = updated
          .filter((t) => t.category === targetCol && t.id !== activeId)
          .sort((a, b) => a.order - b.order);

        // overId の index を取得
        const overIndex = targetItems.findIndex((t) => t.id === overId);
        const insertAt = overIndex < 0 ? targetItems.length : overIndex;

        // 新しい並びの配列を作成し order を再設定
        const reorderedTarget = [
          ...targetItems.slice(0, insertAt),
          { ...movingItem, category: targetCol },
          ...targetItems.slice(insertAt),
        ].map((t, idx) => ({ ...t, order: idx + 1 }));

        // 他列はそのまま
        const otherItems = updated.filter((t) => t.category !== targetCol);
        return [...otherItems, ...reorderedTarget];
      }

      // 3) 同一カラム内ソート
      if (sourceCol && sourceCol === targetCol) {
        // 同じカラムのアイテムだけ抽出
        const sameItems = list.filter((t) => t.category === sourceCol);
        const oldIndex = sameItems.findIndex((t) => t.id === activeId);
        const newIndex = sameItems.findIndex((t) => t.id === overId);
        const moved = arrayMove(sameItems, oldIndex, newIndex);

        const reordered = moved.map((t, idx) => ({ ...t, order: idx + 1 }));
        const others = list.filter((t) => t.category !== sourceCol);
        return [...others, ...reordered];
      }

      return list;
    });
  };

  const handleDragEnd = async (event) => {
    setDragItem(null);

    // サーバーへ最終更新
    dispatch({ type: "todo/sort", payload: { updatedTodos: todosList } });
    try {
      await authenticatedFetch("/api/todos", {
        method: "PATCH",
        body: JSON.stringify({ updatedTodos: todosList }),
      });
    } catch (error) {
      console.error("タスク更新エラー:", error);
    }
  };

  return { dragItem, sensors, handleDragStart, handleDragOver, handleDragEnd, collisionDetection };
};