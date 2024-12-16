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
