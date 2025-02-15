import { TODOS_ENDPOINT } from "@/constants";

export async function GET() {
  const todos = await fetch(TODOS_ENDPOINT).then((res) => res.json());
  return Response.json(todos);
}

//　追加
export async function POST(request) {
  const { newTodoList, newTodo, listId } = await request.json();

  //Todoリストに新規タスクを追加
  if (listId) {
    const todoList = await fetch(`${TODOS_ENDPOINT}/${listId}`).then((res) =>
      res.json()
    );

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
      return new Response(JSON.stringify({ error: "Failed to add task" }), {
        status: 500,
      });
    }
    return new Response(JSON.stringify(updatedTodoList), { status: 200 });

    //新規Todoリスト作成
  } else if (newTodoList) {
    const response = await fetch(TODOS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTodoList),
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Failed to add list" }), {
        status: 500,
      });
    }

    const createdTodoList = await response.json();
    return new Response(JSON.stringify(createdTodoList), { status: 201 });
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
  const { listId, updatedTitle, updatedTodos } = await request.json();
  const todoList = await fetch(`${TODOS_ENDPOINT}/${listId}`).then((res) =>
    res.json()
  );
  //リストのタイトルを更新
  if (updatedTitle) {
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
  } else if (updatedTodos) {
    const updatedTodoList = { ...todoList, todos: updatedTodos };

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
