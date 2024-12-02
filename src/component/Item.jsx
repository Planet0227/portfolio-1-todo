import { useState } from "react";
import { useTodosDispatch } from "../context/TodoContext";

const Item = ({ todo }) => {
  const [editContent, setEditContent] = useState(todo.content);
  const dispatch = useTodosDispatch();

  const changeContent = (e) => {
    setEditContent(e.target.value);
  }

  //削除
  const deleteTodo = () => {
    dispatch({type:"todo/delete", payload: todo.id})
  };

  // //編集・更新
  const updateTodo = () => {
    if(todo.locked){
      const newTodo = { ...todo, locked: !todo.locked }; 
      dispatch({type: "todo/update", payload: newTodo});
    } else {
      const newTodo = {...todo, locked: !todo.locked, content: editContent};
      dispatch({type: "todo/update", payload: newTodo});
    }

    
  };

  return (
    <>
      <div key={todo.id}>
        
        {todo.locked ? (
        <span>{todo.content}</span>
      ) : (
         <input
          type="text"
          value={editContent}
          onChange={changeContent}
          />
        )
      }
      <input
          type="checkbox"
          checked={todo.locked}
          onChange={updateTodo}
        />
      <button onClick={deleteTodo}>削除</button>
      </div>
    </>
  );
};
export default Item;
