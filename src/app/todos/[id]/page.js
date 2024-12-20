import { TodoProvider } from "@/context/TodoContext";
import TodoDetail from "./TodoDetail";
import { TODOS_ENDPOINT } from "@/constants";

export default  function EditHome({ params }) {
  // const todos = await fetch(TODOS_ENDPOINT, {
  //   cache: "no-store",
  // }).then((res) => res.json());

  return (
    <TodoProvider>
      <TodoDetail params={params}/>

    </TodoProvider>
  );
}
