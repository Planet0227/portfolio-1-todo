import { useTodosDispatch } from "../context/TodoContext";

const Item = ({ todo, listId }) => {
  const dispatch = useTodosDispatch();


  // //編集・更新
  const updateTodo = () => {
    const newTodo = {
      ...todo,
      complete: !todo.complete,
      content: editContent, // 編集中の値を反映
    };
    dispatch({ type: "todo/update", payload: newTodo });
  };

  return (
    <>
      <div>
        <input type="checkbox" checked={todo.complete} onChange={(e) => e.stopPropagation()} />
        <span className="ml-2">{todo.content}</span>
      </div>
    </>
  );
};
export default Item;
