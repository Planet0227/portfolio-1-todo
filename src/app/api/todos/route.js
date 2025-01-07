import { TODOS_ENDPOINT } from "@/constants";

export async function GET() {
  const todos = await fetch(TODOS_ENDPOINT).then((res) => res.json());
  return Response.json(todos);
}

//新規Todoリスト作成
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

//Todoリストに新規タスクを追加
export async function PATCH(request) {
  const { listId, newTodo } = await request.json();

  const todoList = await fetch(`${TODOS_ENDPOINT}/${listId}`).then((res) => res.json());

  const updatedTodos = [...todoList.todos, newTodo];
  const updatedTodoList = { ...todoList, todos: updatedTodos };

  const updateResponse = await fetch(`${TODOS_ENDPOINT}/${listId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedTodoList),
  });

  if (!updateResponse.ok) {
    return new Response(
      JSON.stringify({ error: "Failed to save Todo" }),
      { status: 500 }
    );
  }
  return new Response(JSON.stringify(updatedTodoList), { status: 200 });
}

// Todoリストを削除
export async function DELETE(request) {
  const { listId } = await request.json();

  const response = await fetch(`${TODOS_ENDPOINT}/${listId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    return new Response(
      JSON.stringify({ error: "Failed to delete Todo list" }),
      { status: 500 }
    );
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}


