"use client";

import React, { useState, useEffect } from "react";
import { ResetDaysType, useTodosDispatch } from "@/context/TodoContext";
import { useAuth } from "@/context/AuthContext";
import { updateResetDays } from "@/firebase/todos";

interface WeekToggleButtonsProps {
  listId: string | null;
  initialResetDays: ResetDaysType;
  onResetDaysUpdated: (updatedResetDays: ResetDaysType) => void;
}

const WeekToggleButtons: React.FC<WeekToggleButtonsProps> = ({
  listId,
  initialResetDays,
  onResetDaysUpdated,
}) => {
  const [resetDays, setResetDays] = useState(initialResetDays);
  const dispatch = useTodosDispatch();
  const { user } = useAuth();

  // 親から初期状態が変更された場合、ローカルstateを更新
  useEffect(() => {
    setResetDays(initialResetDays);
  }, [initialResetDays]);

  type DayKey = keyof ResetDaysType;

  // 曜日トグルの更新処理
  const handleUpdateResetDays = async (dayKey: DayKey) => {
    if(!listId) return;
    // ローカルstateを更新
    const updatedResetDays = { ...resetDays, [dayKey]: !resetDays[dayKey] };
    setResetDays(updatedResetDays);

    // 親コンポーネントへも更新通知（状態を保持するため）
    if (onResetDaysUpdated) {
      onResetDaysUpdated(updatedResetDays);
    }

    if (!user) {
      dispatch({
        type: "todo/updateResetDays",
        payload: {
          listId,
          updatedResetDays,
        },
      });
    } else {
      try {
        await updateResetDays(user.uid, listId, updatedResetDays);
      } catch (error) {
        console.error("曜日設定更新エラー:", error);
      }
    }
  };

  // 曜日の配列定義
  const days: {key: DayKey; label: string}[] = [
    { key: "sun", label: "日" },
    { key: "mon", label: "月" },
    { key: "tue", label: "火" },
    { key: "wed", label: "水" },
    { key: "thu", label: "木" },
    { key: "fri", label: "金" },
    { key: "sat", label: "土" },
  ];

  return (
    <div className="flex gap-2 items-center mt-1 md:mt-2">
      <p className="text-xs text-gray-500 md:text-base">繰り返し：</p>
      {days.map((day) => (
        <button
          key={day.key}
          onClick={() => handleUpdateResetDays(day.key)}
          className={`px-2.5 md:px-3 py-1 text-sm md:text-base rounded-md ${resetDays[day.key]
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
