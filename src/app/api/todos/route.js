// import { TODOS_ENDPOINT } from "@/constants";
import admin from "firebase-admin";
import serviceAccount from "../../../../firebase-adminsdk.json";

// Firebase Admin SDK の初期化（すでに初期化済みの場合はスキップ）
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export async function GET(request) {
  try {
    const todosSnapshot = await db.collection("todos").get();
    const todos = await Promise.all(
      todosSnapshot.docs.map(async (doc) => {
        // 各 Todo リストのサブコレクション「tasks」からタスクを取得
        const tasksSnapshot = await doc.ref.collection("tasks").get();
        const tasks = tasksSnapshot.docs.map((taskDoc) => ({
          id: taskDoc.id,
          ...taskDoc.data(),
        }));
        return { id: doc.id, ...doc.data(), todos: tasks };
      })
    );
    return new Response(JSON.stringify(todos), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to get todos" }), {
      status: 500,
    });
  }
}

//　追加
export async function POST(request) {
  try {
    const { newTodoList, newTodo, listId } = await request.json();
    if (listId) {
      // 既存リストにタスクを追加
      const todoRef = db.collection("todos").doc(listId);
      const docSnapshot = await todoRef.get();
      if (!docSnapshot.exists) {
        return new Response(
          JSON.stringify({ error: "Todoリストが見つかりません" }),
          { status: 404 }
        );
      }
      // サブコレクション「tasks」に新規タスクを追加
      const { id: taskId, ...newTodoData } = newTodo;

      await todoRef.collection("tasks").doc(taskId).set(newTodoData);
      // 追加後のタスク一覧を取得
      const tasksSnapshot = await todoRef.collection("tasks").get();
      const tasks = tasksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const updatedTodoList = {
        id: listId,
        ...docSnapshot.data(),
        todos: tasks,
      };
      return new Response(JSON.stringify(updatedTodoList), { status: 200 });
    } else if (newTodoList) {
      // 新規Todoリスト作成
      // newTodoList から todos フィールドを除外して todoData を作成
      const { todos, id, ...todoData } = newTodoList;
      // クライアント側で生成された id をドキュメントIDとして利用
      const docRef = db.collection("todos").doc(id);
      await docRef.set(todoData);
      // サブコレクション tasks はまだ存在しないため、todos は空の配列として返す
      const createdTodoList = { id: id, ...todoData, todos: [] };
      return new Response(JSON.stringify(createdTodoList), { status: 201 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

//　削除
export async function DELETE(request) {
  try {
    const { listId, taskId } = await request.json();

    if (taskId) {
      // タスク削除処理：Todo リスト内のサブコレクション "tasks" から対象タスクを削除
      const taskRef = db
        .collection("todos")
        .doc(listId)
        .collection("tasks")
        .doc(taskId);
      await taskRef.delete();

      // // 削除後、最新のタスク一覧を取得（必要に応じてクライアントに返す）
      // const tasksSnapshot = await db.collection("todos").doc(listId)
      //                               .collection("tasks").get();
      // const tasks = tasksSnapshot.docs.map((doc) => ({
      //   id: doc.id,
      //   ...doc.data()
      // }));

      // // Todoリスト本体の情報を取得（リスト自体の情報が必要な場合）
      // const listSnapshot = await db.collection("todos").doc(listId).get();
      // if (!listSnapshot.exists) {
      //   return new Response(JSON.stringify({ error: "Todoリストが見つかりません" }), { status: 404 });
      // }
      // const updatedTodoList = {
      //   id: listId,
      //   ...listSnapshot.data(),
      //   todos: tasks
      // };

      // return new Response(JSON.stringify(updatedTodoList), { status: 200 });

      //一旦リターンはこれ
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } else if (listId) {
      // Todoリスト全体の削除処理
      const listRef = db.collection("todos").doc(listId);

      // // サブコレクション "tasks" のタスクをすべて削除する
      // const tasksSnapshot = await listRef.collection("tasks").get();
      // const deleteTasksPromises = tasksSnapshot.docs.map((doc) => doc.ref.delete());
      // await Promise.all(deleteTasksPromises);

      // Todoリストのドキュメントとサブコレクションを削除する recursiveDelete
      await db.recursiveDelete(listRef);

      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

// 更新
export async function PATCH(request) {
  try {
    const { listId, updatedTitle, updatedTasks, updatedTodos } =
      await request.json();

    if (updatedTitle !== undefined) {
      // --- リストのタイトル更新 ---
      const listRef = db.collection("todos").doc(listId);

      await listRef.update({ title: updatedTitle });

      // 更新後のドキュメントを取得
      const updatedListSnapshot = await listRef.get();
      const tasksSnapshot = await listRef.collection("tasks").get();
      const tasks = tasksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const updatedTodoList = {
        id: listId,
        ...updatedListSnapshot.data(),
        todos: tasks,
      };

      return new Response(JSON.stringify(updatedTodoList), { status: 200 });
    } else if (updatedTasks !== undefined) {
      // --- リストのタスク更新 ---
      // updatedTasks は、各タスクに id フィールドを含むタスクオブジェクトの配列とする
      const listRef = db.collection("todos").doc(listId);

      const tasksCollectionRef = listRef.collection("tasks");

      // updatedTasks の各タスクを更新（存在しないタスクに関する処理は行わない）
      const updatePromises = updatedTasks.map((task) => {
        const { id, ...taskData } = task;
        return tasksCollectionRef.doc(id).set(taskData, { merge: true });
      });
      await Promise.all(updatePromises);

      // 更新後のタスク一覧を取得
      const tasksSnapshot = await tasksCollectionRef.get();
      const tasks = tasksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Todoリスト本体の最新情報を取得
      const updatedListSnapshot = await listRef.get();
      const updatedTodoList = {
        id: listId,
        ...updatedListSnapshot.data(),
        todos: tasks,
      };

      return new Response(JSON.stringify(updatedTodoList), { status: 200 });
    } else if (updatedTodos) {
      const updatePromises = updatedTodos.map((todo) => {
        const { id, order, category } = todo;
        if (!id) return Promise.resolve(); // id がない場合はスキップ
        return db.collection("todos").doc(id).update({ order, category });
      });

      await Promise.all(updatePromises);

      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: "更新に必要なデータがありません" }), {
      status: 500,
    });
  }
}

// export async function PUT(request) {
//   try {
//     // リクエストボディの確認
//     const { updatedTodos } = await request.json();
//     console.log(Array.isArray(updatedTodos)); // trueなら配列、falseならオブジェクト

//     console.log(JSON.stringify(updatedTodos, null, 2));

//     // サーバーへPUTリクエストを送信
//     const updateResponse = await fetch(TODOS_ENDPOINT, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({updatedTodos}),
//     });

//     // 失敗時の処理
//     if (!updateResponse.ok) {
//       throw new Error(`Failed to overwrite todos: ${updateResponse.status}`);
//     }

//     // 正常時のレスポンス
//     return new Response(JSON.stringify(updatedTodos), { status: 200 });

//   } catch (error) {
//     console.error("PUT API エラー:", error);
//     return new Response(JSON.stringify({ error: error.message }), { status: 500 });
//   }
// }
