import List from "./List";
import Form from "./Form";
import { TodoProvider } from "../context/TodoContext";
const Todo = () => {
  

  return (
    <div>
      <div className="min-h-screen p-10 bg-gray-100">
        <TodoProvider>
          <div className="flex flex-wrap justify-start gap-4">
            <div className="w-full max-w-xs p-6 bg-white rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">カレーの準備</h3>
                <button>→</button>
              </div>
              <List />
            </div>
          </div>
          <div className="fixed w-full max-w-md transform -translate-x-1/2 bottom-4 left-1/2">
            <div className="max-w-md p-6 bg-white rounded-lg shadow-md sw-full">
              <Form />
            </div>
          </div>
        </TodoProvider>
      </div>
    </div>
  );
};

export default Todo;
