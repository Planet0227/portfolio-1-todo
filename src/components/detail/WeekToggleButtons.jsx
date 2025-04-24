"use client";

import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { useTodosDispatch } from "@/context/TodoContext";
import { authenticatedFetch } from "@/utils/authToken";

const WeekToggleButtons = ({
  listId,
  initialResetDays,
  onResetDaysUpdated,
}) => {
  const [resetDays, setResetDays] = useState(initialResetDays);
  const dispatch = useTodosDispatch();

  // 親から初期状態が変更された場合、ローカルstateを更新
  useEffect(() => {
    setResetDays(initialResetDays);
  }, [initialResetDays]);

  // 曜日トグルの更新処理
  const updateResetDays = async (dayKey) => {
    // ローカルstateを更新
    const updatedResetDays = { ...resetDays, [dayKey]: !resetDays[dayKey] };
    setResetDays(updatedResetDays);

    // 親コンポーネントへも更新通知（状態を保持するため）
    if (onResetDaysUpdated) {
      onResetDaysUpdated(updatedResetDays);
    }

    dispatch({
      type: "todo/updateResetDays",
      payload: {
        listId,
        updatedResetDays,
      },
    });

    try {
      await authenticatedFetch("/api/todos", {
        method: "PATCH",
        body: JSON.stringify({ listId, updatedResetDays }),
      });
    } catch (error) {
      console.error("曜日設定更新エラー:", error);
    }
  };

  // 曜日の配列定義
  const days = [
    { key: "sun", label: "日" },
    { key: "mon", label: "月" },
    { key: "tue", label: "火" },
    { key: "wed", label: "水" },
    { key: "thu", label: "木" },
    { key: "fri", label: "金" },
    { key: "sat", label: "土" },
  ];

  return (
    <div className="flex items-center gap-2 mt-2">
      <p className="text-gray-500">繰り返し：</p>
      {days.map((day) => (
        <button
          key={day.key}
          onClick={() => updateResetDays(day.key)}
          className={`px-3 py-1 text-md rounded-md ${
            resetDays[day.key]
              ? day.key === "sun"
                ? "bg-red-500 text-white hover:bg-red-600"
                : day.key === "sat"
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-500 text-white hover:bg-gray-600"
              : "bg-gray-100 text-gray-400 hover:bg-gray-200"
          }`}
        >
          {day.label}
        </button>
      ))}
    </div>
  );
};

export default WeekToggleButtons;
