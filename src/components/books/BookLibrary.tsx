// "use client";

// // === Imports ===
// import { useUserBooks } from "@/hooks/useUserBooks";

// // === Component: BookLibrary ===
// export default function BookLibrary() {
//   // === Custom Hook ===
//   const { savedBooks, finishedBooks, addBook, removeBook, finishBook } =
//     useUserBooks();

//   // === Render ===
//   return (
//     <div className="p-4">
//       {/* --- Saved Books Section --- */}
//       <h2 className="font-bold text-xl mb-2">📚 Saved Books</h2>
//       <ul>
//         {savedBooks.map((id) => (
//           <li key={id} className="flex gap-2 items-center">
//             {id}
//             <button
//               onClick={() => finishBook(id)}
//               className="bg-green-500 text-white px-2 rounded"
//             >
//               Mark Finished
//             </button>
//             <button
//               onClick={() => removeBook(id)}
//               className="bg-red-500 text-white px-2 rounded"
//             >
//               Remove
//             </button>
//           </li>
//         ))}
//       </ul>

//       {/* --- Finished Books Section --- */}
//       <h2 className="font-bold text-xl mt-4 mb-2">✅ Finished Books</h2>
//       <ul>
//         {finishedBooks.map((id) => (
//           <li key={id}>{id}</li>
//         ))}
//       </ul>

//       {/* --- Test Utility: Add Random Book --- */}
//       <div className="mt-4">
//         <button
//           onClick={() => addBook(`book-${Date.now()}`)}
//           className="bg-blue-500 text-white px-3 py-1 rounded"
//         >
//           Add Random Book
//         </button>
//       </div>
//     </div>
//   );
// }
