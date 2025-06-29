import { db } from "@/firebase/firebaseConfig";
import { 
  doc, 
  setDoc, 
  getDoc
} from "firebase/firestore";

export interface AccountInfo {
  displayName: string;
  iconDataUrl: string;
}

// 取得
export const fetchAccountInfo = async (userId: string): Promise<AccountInfo> => {
  const ref = doc(db, "users", userId, "accountInfo", "default");
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    throw new Error("アカウントデータが存在しません");
  }
  return snap.data() as AccountInfo;
};


// 更新
export const updateAccountInfo = async (userId: string, info: AccountInfo): Promise<void> => {
  const ref = doc(db, "users", userId, "accountInfo", "default");
  await setDoc(ref, info, { merge: true });
};