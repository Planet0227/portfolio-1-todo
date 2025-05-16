// utils/resetTasks.js
import { db } from "@/firebase/firebaseConfig";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const dayNames = ["sun","mon","tue","wed","thu","fri","sat"];
const isSameJpDay = (a, b) => a.toLocaleDateString("ja-JP") === b.toLocaleDateString("ja-JP");

/**
 * Firestore の complete フラグをリセットし、
 * 更新後の todos 配列を返す
 */
export const resetTasksIfNeeded = async (todos) => {
  const now = new Date();
  const last = localStorage.getItem("lastResetDate");
  if (last && isSameJpDay(new Date(last), now)) {
    // 同日リセット済みならそのまま返却
    return todos;
  }

  const userId = getAuth().currentUser?.uid;
  const todayKey = dayNames[now.getDay()];

  const updated = await Promise.all(
    todos.map(async (todo) => {
      if (!todo.resetDays?.[todayKey]) return todo;

      const snap = await getDocs(
        collection(db, `users/${userId}/todos/${todo.id}/tasks`)
      );
      if (snap.empty) return todo;

      // Firestore 側を一括リセット
      await Promise.all(
        snap.docs.map((t) =>
          updateDoc(
            doc(db, `users/${userId}/todos/${todo.id}/tasks/${t.id}`),
            { complete: false }
          )
        )
      );

      // ローカル用に complete=false のタスク配列を再構築
      const tasks = snap.docs.map((t) => ({
        id: t.id,
        ...t.data(),
        complete: false,
      }));
      return { ...todo, tasks };
    })
  );

  // リセット実行日を保存
  localStorage.setItem("lastResetDate", now.toISOString());
  return updated;
};
