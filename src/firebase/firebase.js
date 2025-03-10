import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";

const db = getFirestore();

export const deleteUserData = async (userId) => {
  try {
    const todosRef = collection(db, `users/${userId}/todos`);
    const snapshot = await getDocs(todosRef);

    // タスクをすべて削除
    const deletePromises = snapshot.docs.map((docItem) =>
      deleteDoc(doc(db, `users/${userId}/todos/${docItem.id}`))
    );
    await Promise.all(deletePromises);

    // ユーザードキュメント削除
    await deleteDoc(doc(db, `users/${userId}`));
  } catch (error) {
    console.error("Error deleting user data:", error);
  }
};
