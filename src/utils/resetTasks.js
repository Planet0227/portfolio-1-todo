import { db } from '@/firebase/firebaseConfig';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// リセットチェックとタスク更新のユーティリティ関数
export const checkAndResetTasks = async (todos, dispatch) => {
  const today = new Date();
  const lastResetDate = localStorage.getItem('lastResetDate');
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  // デバッグ用ログ
  console.log('Current local time:', today.toLocaleString('ja-JP'));
  console.log('Last reset date:', lastResetDate ? new Date(lastResetDate).toLocaleString('ja-JP') : 'none');

  if (!lastResetDate || !isSameDay(new Date(lastResetDate), today)) {
    const dayNames = {
      0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat'
    };
    const currentDay = dayNames[today.getDay()];
    
    try {
      // リセット対象のtodosを抽出し、更新処理を実行
      const resetResults = await Promise.all(
        todos.map(async (todo) => {
          if (!todo.resetDays || !todo.resetDays[currentDay]) {
            return { ...todo };
          }

          const tasksRef = collection(db, `users/${userId}/todos/${todo.id}/tasks`);
          const tasksSnapshot = await getDocs(tasksRef);

          if (tasksSnapshot.empty) {
            return { ...todo };
          }

          // Firestore更新用のPromiseを作成と実行
          await Promise.all(
            tasksSnapshot.docs.map(taskDoc =>
              updateDoc(
                doc(db, `users/${userId}/todos/${todo.id}/tasks/${taskDoc.id}`),
                { complete: false }
              )
            )
          );

          // 更新後のタスクデータを準備
          const updatedTasks = tasksSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            complete: false
          }));

          return {
            ...todo,
            todos: updatedTasks
          };
        })
      );
    // 日本時間でのISOString
    const jpDate = new Date(today.getTime() + (9 * 60 * 60 * 1000));
    localStorage.setItem('lastResetDate', jpDate.toISOString());

      // 更新があった場合のみdispatchを実行
      const hasUpdates = resetResults.some((todo, index) => 
        todo.todos !== todos[index].todos
      );

      if (hasUpdates) {
        dispatch({
          type: "todo/sort",
          payload: { updatedTodos: resetResults }
        });
        
      }

    } catch (error) {
      console.error('タスクのリセットに失敗しました:', error);
    }
  }
};

// 日付が同じかどうかをチェック
const isSameDay = (date1, date2) => {
  // 日本時間での日付を取得
  const d1 = new Date(date1.getTime() + (9 * 60 * 60 * 1000)); // UTC+9に調整
  const d2 = new Date(date2.getTime() + (9 * 60 * 60 * 1000)); // UTC+9に調整

  return d1.getUTCFullYear() === d2.getUTCFullYear() &&
         d1.getUTCMonth() === d2.getUTCMonth() &&
         d1.getUTCDate() === d2.getUTCDate();
}; 