// "use client";

// import List from "./List";
// import Form from "./Form";
// import { TodoProvider, useTodos } from "../context/TodoContext";
// import { useState } from "react";


// const Todo = () => {
//   const todoLists = useTodos();
  
//   return (
//     <div className="flex flex-wrap justify-start gap-4">
//       {todoLists.map((todoList) => {
//         // console.log(todoList);
//         return (
//           <div key={todoList.id} className="w-full max-w-xs p-6 bg-white rounded-lg shadow-md">
//             <div className="flex items-center justify-between">
//               <h3 className="text-lg font-semibold">{todoList.title}</h3>
//               <button>→</button>
//             </div>
//             <List todo={todoList.todos} listId={todoList.id}/>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// const Todos = () => {
//   const todoLists = useTodos();
//   const [selectedTodoId, setSelectedTodoId] = useState(null);
//   return (
//     <TodoProvider>
//       <div className="min-h-screen p-10 bg-gray-100">

//         <Todo />

//         <div className="fixed w-full max-w-md p-6 transform -translate-x-1/2 bg-white rounded-lg shadow-md bottom-6 left-1/2 sw-full">
//           <Form />
//         </div>
        
//       </div>
//     </TodoProvider>
//   );
// };

// export default Todos;
