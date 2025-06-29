import { db } from "@/firebase/firebaseConfig";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { ResetDaysType, TaskType, TodoListType } from "@/context/TodoContext";

const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const isSameJpDay = (a: Date, b: Date) => a.toLocaleDateString("ja-JP") === b.toLocaleDateString("ja-JP");

/**
 * Firestore の complete フラグをリセットし、
 * 更新後の todos 配列を返す
 */
export const resetTasksIfNeeded = async (todos: TodoListType[]):Promise<TodoListType[]> => {
  const now = new Date();
  const last = localStorage.getItem("lastResetDate");
  if (last && isSameJpDay(new Date(last), now)) {
    // 同日リセット済みならそのまま返却
    return todos;
  }

  const userId = getAuth().currentUser?.uid;
  if (!userId) return todos;

  const todayKey = dayNames[now.getDay()] as keyof ResetDaysType ;

  const updated = await Promise.all(
    todos.map(async (todo) => {
      // そのリストが今日のリセット対象でないならスキップ
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
      const tasks: TaskType[] = snap.docs.map((t) => {
        const data = t.data() as TaskType;
        return {
          ...data,
          id: t.id,
          complete: false,
        };
      });
      return { ...todo, tasks };
    })
  );

  // リセット実行日を保存
  localStorage.setItem("lastResetDate", now.toISOString());
  return updated;
};
