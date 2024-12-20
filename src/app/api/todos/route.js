//サーバー側で行うcrudのメソッド書くとこ
import { TODOS_ENDPOINT } from "@/constants";

export async function GET() {
  const todos = await fetch(TODOS_ENDPOINT).then((res) => res.json());
  return Response.json(todos);
}

export async function POST(request) {
  const newTodo = await request.json()
  const response = await fetch(TODOS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newTodo),
  });
  
  if(!response.ok){
    return new Response(JSON.stringify({ error:"Failed to save Todo" }, { status: 500 }) )
  }

  return new Response(JSON.stringify(newTodo), { status: 201 });
}

export async function PATCH(request) {
  const { listId, newTodo } = await request.json();

  // 特定のリストを取得
  const todoList = await fetch(`${TODOS_ENDPOINT}/${listId}`).then((res) => res.json());

  // 新しいTodoをリストのtodos配列に追加
  const updatedTodos = [...todoList.todos, newTodo];
  const updatedTodoList = { ...todoList, todos: updatedTodos };

  // 更新されたリストをサーバーへ送信
  const updateResponse = await fetch(`${TODOS_ENDPOINT}/${listId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedTodoList),
  });

  // レスポンスの確認
  if (!updateResponse.ok) {
    return new Response(
      JSON.stringify({ error: "Failed to save Todo" }),
      { status: 500 }
    );
  }

  // 更新後のデータを返す
  return new Response(JSON.stringify(updatedTodoList), { status: 200 });
}
