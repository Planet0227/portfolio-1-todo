import { TodoProvider } from "@/context/TodoContext";
import TodoDetail from "./TodoDetail";
import { TODOS_ENDPOINT } from "@/constants";

export default async function EditHome({ params }) {
  const todos = await fetch(TODOS_ENDPOINT, {
    cache: "no-store",
  }).then((res) => res.json());

console.log(todos);
  return (
    <TodoProvider>
      <TodoDetail params={params} todos={todos}/>

    </TodoProvider>
  );
}
