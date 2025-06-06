import { resetTasksIfNeeded } from "@/utils/resetTasks";
import { db } from "./firebaseConfig";
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot
} from "firebase/firestore";

// ---------------------------------------------取得------------------------------------------------
// ユーザーの全タスクリストを取得
export function subscribeUserTodos(userId, dispatch, setLoading) {
  // タスク購読解除関数を保存するマップ
  const tasksUnsubscribes = {};

  // 1) トップレベル todos 購読
  const todosRef = collection(db, `users/${userId}/todos`);
  const todosQ = query(todosRef, orderBy("order", "asc"));
  const unsubscribeTodos = onSnapshot(
    todosQ,
    async (snapshot) => {
      // 【A】リストの初期ロード＋リセット
      const rawLists = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = { id: docSnap.id, ...docSnap.data() };
          // 初回タスク一括フェッチ
          const tasksSnap = await getDocs(
            collection(db, `users/${userId}/todos/${docSnap.id}/tasks`)
          );
          const tasks = tasksSnap.docs
            .map((td) => ({ id: td.id, ...td.data() }))
            .sort((a, b) => a.order - b.order);
          return { ...data, tasks };
        })
      );
      const initTodos = await resetTasksIfNeeded(rawLists);
      dispatch({ type: "todo/init", payload: initTodos });
      

      // 【B】リスト単位でタスク購読の登録／解除 (todosに変更があったときに今回のリストのidを記録)
      const nextListIds = snapshot.docs.map((d) => d.id); // 取得したリストのidでできた配列

      // 登録：追加されたリストのタスクサブスク開始
      nextListIds.forEach((listId) => {
        if (!tasksUnsubscribes[listId]) {
          const tasksRef = collection(db,`users/${userId}/todos/${listId}/tasks`);
          const tasksQ = query(tasksRef, orderBy("order", "asc"));
          tasksUnsubscribes[listId] = onSnapshot(tasksQ, (tasksSnap) => {
            const tasks = tasksSnap.docs
              .map((td) => ({ id: td.id, ...td.data() }))
            dispatch({
              type: "todo/update",
              payload: { listId, updatedTasks: tasks },
            });
          });
        }
      });

      // 解除：消えたリストのタスク購読をオフ
      Object.keys(tasksUnsubscribes)
        .filter((id) => !nextListIds.includes(id))
        .forEach((oldId) => {
          tasksUnsubscribes[oldId](); // 削除されたリストの購読を解除
          delete tasksUnsubscribes[oldId]; // 解除用関数を格納しているオブジェクトから削除
        });
        
        setLoading(false);
    },
    (error) => {
      console.error("subscribeUserTodos error:", error);
      dispatch({ type: "todo/init", payload: [] });
      setLoading(false);
    }
    
  );

  // 返り値は「トップ＋全サブスク解除」を行う関数
  return () => {
    unsubscribeTodos();
    Object.values(tasksUnsubscribes).forEach((unsub) => unsub());
  };
}

// ---------------------------------------------追加------------------------------------------------

// リストの追加
export const addTodoList = async (userId, newTodoList) => {
  try {
    const { tasks, id, ...todoData } = newTodoList;
    const docRef = doc(db, `users/${userId}/todos/${id}`);
    await setDoc(docRef, todoData);
    return { id, ...todoData, tasks: [] };
  } catch (error) {
    console.error("リストの追加に失敗しました:", error);
    throw error;
  }
};

// タスクの追加
export const addTask = async (userId, listId, newTask) => {
  try {
    const { id: taskId, ...taskData } = newTask;
    const taskRef = doc(db, `users/${userId}/todos/${listId}/tasks/${taskId}`);
    await setDoc(taskRef, taskData);
    
    // 更新後のタスク一覧を取得
    const tasksRef = collection(db, `users/${userId}/todos/${listId}/tasks`);
    const tasksSnapshot = await getDocs(tasksRef);
    const tasks = tasksSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return tasks;
  } catch (error) {
    console.error("タスクの追加に失敗しました:", error);
    throw error;
  }
};

// ---------------------------------------------更新------------------------------------------------

// リストの更新
export const updateTitle = async (userId, listId, updatedTitle) => {
  try {
    const todoRef = doc(db, `users/${userId}/todos/${listId}`);
    await updateDoc(todoRef, { title: updatedTitle });
  
  } catch (error) {
    console.error("リストタイトルの更新に失敗しました:", error);
    throw error;
  }
};

// ロック更新
export const updateLock = async (userId, listId, updatedLock) => {
  try {
    const todoRef = doc(db, `users/${userId}/todos/${listId}`);
    await updateDoc(todoRef, { lock: updatedLock });
  } catch (error) {
    console.error("ロックの更新に失敗しました:", error);
    throw error;
  }
};
// 曜日ボタン更新
export const updateResetDays = async (userId, listId, updatedResetDays) => {
  try {
    const todoRef = doc(db, `users/${userId}/todos/${listId}`);
    await updateDoc(todoRef, { resetDays: updatedResetDays });
  } catch (error) {
    console.error("曜日ボタンの更新に失敗しました:", error);
    throw error;
  }
};


// カテゴリー変更
export const changeCategory = async (userId, listId, updatedCategory, updatedOrder) => {
  try{
    const todoRef = doc(db, `users/${userId}/todos/${listId}`);
    await updateDoc(todoRef, { category: updatedCategory, order:updatedOrder });
  } catch {
    console.error("カテゴリー変更に失敗しました:", error);
    throw error;
  }
}

// タスクの更新 (一括リセット、タスク並べ替え、タスク更新、チェックボックス更新)
export const updateTasks = async (userId, listId, updatedTasks) => {
  try {
    const updatePromises = updatedTasks.map(task => {
      const { id, ...taskData } = task;
      const taskRef = doc(db, `users/${userId}/todos/${listId}/tasks/${id}`);
      return setDoc(taskRef, taskData, { merge: true });
    });
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error("タスクの更新に失敗しました:", error);
    throw error;
  }
};

// リストの並び替え
export const sortTodoList = async (userId, updatedTodos) => {
  try {
    const updatePromises = updatedTodos.map(todo => {
      const { id, order, category } = todo;
      if (!id) return Promise.resolve();
      const todoRef = doc(db, `users/${userId}/todos/${id}`);
      return updateDoc(todoRef, { order, category });
    });
    await Promise.all(updatePromises);
    return updatedTodos;
  } catch (error) {
    console.error("リストの並び替えに失敗しました:", error);
    throw error;
  }
};


// ---------------------------------------------削除------------------------------------------------

// リストの削除
export const deleteTodoList = async (userId, listId) => {
  try {
    const todoRef = doc(db, `users/${userId}/todos/${listId}`);
    await deleteDoc(todoRef);
    return true;
  } catch (error) {
    console.error("リストの削除に失敗しました:", error);
    throw error;
  }
};

// タスクの削除
export const deleteTask = async (userId, listId, taskId) => {
  try {
    const taskRef = doc(db, `users/${userId}/todos/${listId}/tasks/${taskId}`);
    await deleteDoc(taskRef);
    return true;
  } catch (error) {
    console.error("タスクの削除に失敗しました:", error);
    throw error;
  }
}; 