import { db } from "./firebaseConfig";
import { 
  doc, 
  setDoc, 
  getDoc
} from "firebase/firestore";

// 取得
export const fetchAccountInfo = async (userId) => {
  const ref = doc(db, "users", userId, "accountInfo", "default");
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : {};
}

// 更新
export const updateAccountInfo = async (userId, info) => {
  const ref = doc(db, "users", userId, "accountInfo", "default");
  await setDoc(ref, info, { merge: true });
};