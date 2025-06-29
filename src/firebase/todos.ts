import { resetTasksIfNeeded } from "@/utils/resetTasks";
import { db } from "@/firebase/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  writeBatch,
} from "firebase/firestore";
import { ResetDaysType, TaskType, TodoAction, TodoListType } from "@/context/TodoContext";

type Unsubscribe = () => void;

// ---------------------------------------------取得------------------------------------------------
// ユーザーの全タスクリストを取得
export function subscribeUserTodos(userId: string, dispatch: React.Dispatch<TodoAction>, setLoading: React.Dispatch<React.SetStateAction<boolean>>) {
  // タスク購読解除関数を保存するマップ
  const tasksUnsubscribes: Record<string, Unsubscribe> = {};

  // 1) トップレベル todos 購読
  const todosRef = collection(db, `users/${userId}/todos`);
  const todosQ = query(todosRef, orderBy("order", "asc"));
  const unsubscribeTodos = onSnapshot(
    todosQ,
    async (snapshot) => {
      // 【A】リストの初期ロード＋リセット
      const rawLists: TodoListType[] = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          //　リスト単体のデータ
          const data = docSnap.data() as Omit<TodoListType, "id" | "tasks">;
          const todoMeta: Omit<TodoListType, "tasks"> = {
            id: docSnap.id,
            title: data.title,
            category: data.category,
            date: data.date,
            order: data.order,
            lock: data.lock,
            resetDays: data.resetDays,
          };

          // 初回タスク一括フェッチ
          const tasksSnap = await getDocs(
            collection(db, `users/${userId}/todos/${docSnap.id}/tasks`)
          );
          const tasks: TaskType[] = tasksSnap.docs
            .map((t) => {
              const td = t.data() as Omit<TaskType, "id">;
              return { id: t.id, ...td };
            })
            .sort((a, b) => a.order - b.order);

          return { ...todoMeta, tasks };
        })
      );
      const initTodos = await resetTasksIfNeeded(rawLists);
      dispatch({ type: "todo/init", payload: initTodos });

      // 【B】リスト単位でタスク購読の登録／解除 (todosに変更があったときに今回のリストのidを記録)
      const nextListIds = snapshot.docs.map((d) => d.id); // 取得したリストのidでできた配列

      // 登録：追加されたリストのタスクサブスク開始
      nextListIds.forEach((listId) => {
        if (!tasksUnsubscribes[listId]) {
          const tasksRef = collection(
            db,
            `users/${userId}/todos/${listId}/tasks`
          );
          const tasksQ = query(tasksRef, orderBy("order", "asc"));
          tasksUnsubscribes[listId] = onSnapshot(tasksQ, (tasksSnap) => {
            const tasks: TaskType[] = tasksSnap.docs.map((td) => {
              const tdData = td.data() as Omit<TaskType, "id">;
              return { id: td.id, ...tdData };
            });
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
          const unsub = tasksUnsubscribes[oldId];
          if (unsub) {
            unsub();
            delete tasksUnsubscribes[oldId];
          } // 解除用関数を格納しているオブジェクトから削除
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
export const addTodoList = async (userId: string, newTodoList: TodoListType) => {
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
export const addTask = async (userId: string, listId: string, newTask: TaskType) => {
  try {
    const { id: taskId, ...taskData } = newTask;
    const taskRef = doc(db, `users/${userId}/todos/${listId}/tasks/${taskId}`);
    await setDoc(taskRef, taskData);

    // 更新後のタスク一覧を取得
    const tasksRef = collection(db, `users/${userId}/todos/${listId}/tasks`);
    const tasksSnapshot = await getDocs(tasksRef);
    const tasks = tasksSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return tasks;
  } catch (error) {
    console.error("タスクの追加に失敗しました:", error);
    throw error;
  }
};

// ---------------------------------------------更新------------------------------------------------

// リストの更新
export const updateTitle = async (userId: string, listId: string, updatedTitle: string) => {
  try {
    const todoRef = doc(db, `users/${userId}/todos/${listId}`);
    await updateDoc(todoRef, { title: updatedTitle });
  } catch (error) {
    console.error("リストタイトルの更新に失敗しました:", error);
    throw error;
  }
};

// ロック更新
export const updateLock = async (userId: string, listId: string, updatedLock: boolean) => {
  try {
    const todoRef = doc(db, `users/${userId}/todos/${listId}`);
    await updateDoc(todoRef, { lock: updatedLock });
  } catch (error) {
    console.error("ロックの更新に失敗しました:", error);
    throw error;
  }
};
// 曜日ボタン更新
export const updateResetDays = async (userId: string, listId: string, updatedResetDays: ResetDaysType) => {
  try {
    const todoRef = doc(db, `users/${userId}/todos/${listId}`);
    await updateDoc(todoRef, { resetDays: updatedResetDays });
  } catch (error) {
    console.error("曜日ボタンの更新に失敗しました:", error);
    throw error;
  }
};

// カテゴリー変更
export const changeCategory = async (
  userId: string,
  listId: string,
  updatedCategory: string,
  updatedOrder: number
) => {
  try {
    const todoRef = doc(db, `users/${userId}/todos/${listId}`);
    await updateDoc(todoRef, {
      category: updatedCategory,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("カテゴリー変更に失敗しました:", error);
    throw error;
  }
};

// タスクの更新 (一括リセット、タスク並べ替え、タスク更新、チェックボックス更新)
export const updateTasks = async (userId: string, listId: string, updatedTasks: TaskType[]) => {
  try {
    const updatePromises = updatedTasks.map((task) => {
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
export const sortTodoList = async (userId: string, updatedTodos: TodoListType[]) => {
  try {
    const updatePromises = updatedTodos.map((todo) => {
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

/**
 * 指定の todo ドキュメントとその tasks サブコレクションをまとめて削除
 */
export const deleteTodoList = async (userId: string, listId: string) => {
  try {
    // 1) tasks サブコレクションの参照を作成
    const tasksColRef = collection(db, `users/${userId}/todos/${listId}/tasks`);
    // 2) 全ドキュメントを取得
    const tasksSnap = await getDocs(tasksColRef);

    // 3) バッチを作成
    const batch = writeBatch(db);

    // 4) サブコレクション内の全ドキュメントをバッチに追加
    tasksSnap.docs.forEach((taskDoc) => {
      batch.delete(taskDoc.ref);
    });

    // 5) 親ドキュメントをバッチに追加
    const todoRef = doc(db, "users", userId, "todos", listId);
    batch.delete(todoRef);

    // 6) 一括実行
    await batch.commit();
  } catch (error) {
    console.error("リストの削除に失敗しました:", error);
    throw error;
  }
};

// タスクの削除
export const deleteTask = async (userId: string, listId: string, taskId: string) => {
  try {
    const taskRef = doc(db, `users/${userId}/todos/${listId}/tasks/${taskId}`);
    await deleteDoc(taskRef);
    return true;
  } catch (error) {
    console.error("タスクの削除に失敗しました:", error);
    throw error;
  }
};
