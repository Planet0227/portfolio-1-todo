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


export async function GET() {
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
    return new Response(JSON.stringify({ error: "Failed to get todos" }), { status: 500 });
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
        return new Response(JSON.stringify({ error: "Todoリストが見つかりません" }), { status: 404 });
      }
      // サブコレクション「tasks」に新規タスクを追加
      const { id: taskId, ...newTodoData } = newTodo;

      await todoRef.collection("tasks").doc(taskId).set(newTodoData);
      // 追加後のタスク一覧を取得
      const tasksSnapshot = await todoRef.collection("tasks").get();
      const tasks = tasksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const updatedTodoList = { id: listId, ...docSnapshot.data(), todos: tasks };
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
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}


//　削除
export async function DELETE(request) {
  const { listId, taskId } = await request.json();
  // タスクを削除
  if (taskId) {
    const todoList = await fetch(`${TODOS_ENDPOINT}/${listId}`).then((res) =>
      res.json()
    );

    const updatedTodos = todoList.todos.filter((todo) => todo.id !== taskId);
    const updatedTodoList = { ...todoList, todos: updatedTodos };

    const updateResponse = await fetch(`${TODOS_ENDPOINT}/${listId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedTodoList),
    });

    if (!updateResponse.ok) {
      return new Response(JSON.stringify({ error: "Failed to delete task" }), {
        status: 500,
      });
    }
    return new Response(JSON.stringify(updatedTodoList), { status: 200 });
  } else if (listId) {
    // Todoリストを削除
    const response = await fetch(`${TODOS_ENDPOINT}/${listId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to delete list" }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }
}

// 更新
export async function PATCH(request) {
  const { listId, updatedTitle, updatedTasks} = await request.json();
  
  //リストのタイトルを更新
  if (updatedTitle !== undefined) {
    const todoList = await fetch(`${TODOS_ENDPOINT}/${listId}`).then((res) =>
      res.json()
    );
    const updatedTodoList = { ...todoList, title: updatedTitle };

    const updateResponse = await fetch(`${TODOS_ENDPOINT}/${listId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedTodoList),
    });

    if (!updateResponse.ok) {
      return new Response(JSON.stringify({ error: "Failed to save title" }), {
        status: 500,
      });
    }
    return new Response(JSON.stringify(updatedTodoList), { status: 200 });

  } else if (updatedTasks) {
    //該当listIdのタスクを更新
    const todoList = await fetch(`${TODOS_ENDPOINT}/${listId}`).then((res) =>
      res.json()
    );
    const updatedTodoList = { ...todoList, todos: updatedTasks };

    const updateResponse = await fetch(`${TODOS_ENDPOINT}/${listId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedTodoList),
    });

    if (!updateResponse.ok) {
      return new Response(JSON.stringify({ error: "Failed to save task" }), {
        status: 500,
      });
    }
    return new Response(JSON.stringify(updatedTodoList), { status: 200 });
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







