import admin from "firebase-admin";
import serviceAccount from "../../../../firebase-adminsdk.json";

// Firebase Admin SDK の初期化（すでに初期化済みの場合はスキップ）
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function getUserUid(request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }
  const token = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    const decodedToken = await admin.auth().verifyIdToken(token);
  return decodedToken.uid;
  }
}

export async function GET(request) {
  try {
    // 認証トークンがない場合は空のリストを返す
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify([]), { status: 200 });
    }
    
    const uid = await getUserUid(request);
    // 以下、ユーザーごとの todos を取得する処理
    const todosSnapshot = await db
      .collection("users")
      .doc(uid)
      .collection("todos")
      .get();

    const todos = await Promise.all(
      todosSnapshot.docs.map(async (doc) => {
        const tasksSnapshot = await doc.ref.collection("tasks").get();
        const tasks = tasksSnapshot.docs.map((taskDoc) => ({
          id: taskDoc.id,
          ...taskDoc.data(),
        }));
        return { id: doc.id, ...doc.data(), tasks: tasks };
      })
    );
    return new Response(JSON.stringify(todos), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Failed to get todos" }),
      { status: 500 }
    );
  }
}


export async function POST(request) {
  try {
    const uid = await getUserUid(request);
    const { newTodoList, newTask, listId } = await request.json();
    
    const todosCollection = db.collection("users").doc(uid).collection("todos");

    if (listId) {
      // 既存リストにタスクを追加
      const todoRef = todosCollection.doc(listId);
      const docSnapshot = await todoRef.get();
      if (!docSnapshot.exists) {
        return new Response(
          JSON.stringify({ error: "Todoリストが見つかりません" }),
          { status: 404 }
        );
      }
      // サブコレクション「tasks」に新規タスクを追加
      const { id: taskId, ...newTaskData } = newTask;
      await todoRef.collection("tasks").doc(taskId).set(newTaskData);
      // 追加後のタスク一覧を取得
      const tasksSnapshot = await todoRef.collection("tasks").get();
      const tasks = tasksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const updatedTodoList = {
        id: listId,
        ...docSnapshot.data(),
        tasks: tasks,
      };
      return new Response(JSON.stringify(updatedTodoList), { status: 200 });
    } else if (newTodoList) {
      // 新規 Todo リスト作成
      // newTodoList から tasks フィールドを除外して todoData を作成
      const { todos, id, ...todoData } = newTodoList;
      // クライアント側で生成された id をドキュメントIDとして利用
      const docRef = todosCollection.doc(id);
      await docRef.set(todoData);
      // サブコレクション tasks はまだ存在しないため、todos は空の配列として返す
      const createdTodoList = { id: id, ...todoData, tasks: [] };
      return new Response(JSON.stringify(createdTodoList), { status: 201 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

// DELETE: Todo リストまたはリスト内タスクの削除
export async function DELETE(request) {
  try {
    const uid = await getUserUid(request);
    const { listId, taskId } = await request.json();
    const todosCollection = db.collection("users").doc(uid).collection("todos");

    const todoRef = todosCollection.doc(listId);
    const listSnapshot = await todoRef.get();
    if (!listSnapshot.exists) {
      return new Response(
        JSON.stringify({ error: "Todoリストが見つかりません" }),
        { status: 404 }
      );
    }

    if (taskId) {
      // タスク削除処理：サブコレクション "tasks" から対象タスクを削除
      const taskRef = todoRef.collection("tasks").doc(taskId);
      await taskRef.delete();
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } else if (listId) {
      // Todoリスト全体の削除処理（ドキュメントとサブコレクションを削除）
      await db.recursiveDelete(todoRef);
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

// PATCH: Todo リストまたはタスクの更新
export async function PATCH(request) {
  try {
    const uid = await getUserUid(request);
    const { listId, updatedTitle, updatedTasks, updatedTodos, updatedResetDays, updatedCategory,updatedOrder, updatedLock   } = await request.json();
    const todosCollection = db.collection("users").doc(uid).collection("todos");

    // リストの並び替え
    if (updatedTodos) {
      const updatePromises = updatedTodos.map((todo) => {
        const { id, order, category } = todo;
        if (!id) return Promise.resolve(); // id がない場合はスキップ
        return todosCollection.doc(id).update({ order, category });
      });
      await Promise.all(updatePromises);
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    if (!listId) {
      return new Response(JSON.stringify({ error: "listIdが必要です" }), { status: 400 });
    }

    const todoRef = todosCollection.doc(listId);
    const listSnapshot = await todoRef.get();
    if (!listSnapshot.exists) {
      return new Response(
        JSON.stringify({ error: "Todoリストが見つかりません" }),
        { status: 404 }
      );
    }

    if (updatedTitle !== undefined) {
      // --- リストのタイトル更新 ---
      await todoRef.update({ title: updatedTitle });
      // 更新後のドキュメント取得などの処理…
      const updatedListSnapshot = await todoRef.get();
      const tasksSnapshot = await todoRef.collection("tasks").get();
      const tasks = tasksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const updatedTodoList = {
        id: listId,
        ...updatedListSnapshot.data(),
        tasks: tasks,
      };
      return new Response(JSON.stringify(updatedTodoList), { status: 200 });
    } else if (updatedTasks !== undefined) {
      // --- リストのタスク更新 ---
      const tasksCollectionRef = todoRef.collection("tasks");
      const updatePromises = updatedTasks.map((task) => {
        const { id, ...taskData } = task;
        return tasksCollectionRef.doc(id).set(taskData, { merge: true });
      });
      await Promise.all(updatePromises);
      const tasksSnapshot = await tasksCollectionRef.get();
      const tasks = tasksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const updatedListSnapshot = await todoRef.get();
      const updatedTodoList = {
        id: listId,
        ...updatedListSnapshot.data(),
        tasks: tasks,
      };
      return new Response(JSON.stringify(updatedTodoList), { status: 200 });
    } else if (updatedResetDays !== undefined) {
      // resetDays 更新処理を追加
      await todoRef.update({ resetDays: updatedResetDays });
      const updatedListSnapshot = await todoRef.get();
      const tasksSnapshot = await todoRef.collection("tasks").get();
      const tasks = tasksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const updatedTodoList = { id: listId, ...updatedListSnapshot.data(), todos: tasks };
      return new Response(JSON.stringify(updatedTodoList), { status: 200 });
    } else if (updatedCategory !== undefined && updatedOrder !== undefined) {
      await todoRef.update({ category: updatedCategory, order: updatedOrder });
      const updatedListSnapshot = await todoRef.get();
      // tasksの取得処理など…
      const tasksSnapshot = await todoRef.collection("tasks").get();
      const tasks = tasksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const updatedTodoList = { id: listId, ...updatedListSnapshot.data(), todos: tasks };
      return new Response(JSON.stringify(updatedTodoList), { status: 200 });
    } else if (updatedLock !== undefined) {
      // --- ロック状態の更新 ---
      await todoRef.update({ lock: updatedLock });
      const updatedListSnapshot = await todoRef.get();
      const tasksSnapshot = await todoRef.collection("tasks").get();
      const tasks = tasksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const updatedTodoList = { id: listId, ...updatedListSnapshot.data(), tasks: tasks };
      return new Response(JSON.stringify(updatedTodoList), { status: 200 });
    }
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "更新に必要なデータがありません" }),
      { status: 500 }
    );
  }
}



