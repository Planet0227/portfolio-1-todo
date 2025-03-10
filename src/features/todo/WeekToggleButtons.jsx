"use client";

import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";

// 曜日トグルのデフォルト状態
const defaultResetDays = {
  sun: false,
  mon: false,
  tue: false,
  wed: false,
  thu: false,
  fri: false,
  sat: false,
};

const WeekToggleButtons = ({ listId, initialResetDays, onResetDaysUpdated }) => {
  // 親から渡された初期状態を元にローカルstateを設定
  const [resetDays, setResetDays] = useState(initialResetDays || defaultResetDays);

  // 親から初期状態が変更された場合、ローカルstateを更新
  useEffect(() => {
    if (initialResetDays) {
      setResetDays(initialResetDays);
    }
  }, [initialResetDays]);

  // 曜日トグルの更新処理
  const updateResetDays = async (dayKey) => {
    // ローカルstateを更新
    const newResetDays = { ...resetDays, [dayKey]: !resetDays[dayKey] };
    setResetDays(newResetDays);

    // 親コンポーネントへも更新通知（状態を保持するため）
    if (onResetDaysUpdated) {
      onResetDaysUpdated(newResetDays);
    }

    // 認証ユーザーを確認してサーバーへPATCHリクエスト
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      console.error("ユーザーが認証されていません");
      return;
    }
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/todos", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ listId, updatedResetDays: newResetDays }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "曜日設定の更新に失敗しました。");
      }
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
    <div className="flex items-center gap-2 my-2">
      <p>繰り返し：</p>
      {days.map((day) => (
        <button
          key={day.key}
          onClick={() => updateResetDays(day.key)}
          className={`px-3 py-1 text-sm font-medium rounded ${
            resetDays[day.key] ? "bg-green-500 text-white" : "bg-gray-300 text-gray-700"
          }`}
        >
          {day.label}
        </button>
      ))}
    </div>
  );
};

export default WeekToggleButtons;
