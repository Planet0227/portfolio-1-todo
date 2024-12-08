import List from "./List";
import Form from "./Form";
import { TodoProvider } from "../context/TodoContext";
const Todo = () => {
  return (
    <>
      <h3>タスク管理Todoアプリ</h3>
      <TodoProvider>
          <List  />
          <Form  />
      </TodoProvider>
    </>
  );
};

export default Todo;
