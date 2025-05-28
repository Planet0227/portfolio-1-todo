import { db } from "./firebaseConfig";
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc 
} from "firebase/firestore";

// ---------------------------------------------取得------------------------------------------------
// ユーザーの全タスクリストを取得
export const fetchUserTodos = async (userId) => {
  try {
    const todosRef = collection(db, `users/${userId}/todos`);
    const q = query(todosRef, orderBy("order", "asc"));
    const snapshot = await getDocs(q);
    
    // 各todoリストのサブコレクション（tasks）を取得
    const todos = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const tasksRef = collection(db, `users/${userId}/todos/${doc.id}/tasks`);
        const tasksSnapshot = await getDocs(tasksRef);
        const tasks = tasksSnapshot.docs.map(taskDoc => ({
          id: taskDoc.id,
          ...taskDoc.data()
        }));
        
        return {
          id: doc.id, ...doc.data(), tasks: tasks};
      })
    );
    
    return todos;
  } catch (error) {
    console.error("リストの取得に失敗しました:", error);
    throw error;
  }
};

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
    console.error("リストの更新に失敗しました:", error);
    throw error;
  }
};

// ロック更新
export const updateLock = async (userId, listId, updatedLock) => {
  try {
    const todoRef = doc(db, `users/${userId}/todos/${listId}`);
    await updateDoc(todoRef, { lock: updatedLock });
  } catch (error) {
    console.error("リストの更新に失敗しました:", error);
    throw error;
  }
};
// 曜日ボタン更新
export const updateResetDays = async (userId, listId, updatedResetDays) => {
  try {
    const todoRef = doc(db, `users/${userId}/todos/${listId}`);
    await updateDoc(todoRef, { resetDays: updatedResetDays });
  } catch (error) {
    console.error("リストの更新に失敗しました:", error);
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