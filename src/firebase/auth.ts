import {
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  linkWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { app } from "@/firebase/firebaseConfig";

const auth = getAuth(app);

// 🔹 匿名ログイン
export const signInAsGuest = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.error("匿名ログインエラー:", error);
    throw error;
  }
};

// 🔹 メールアドレス＆パスワードでサインアップ
export const registerWithEmail = async (email: string, password: string, displayName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await updateProfile(userCredential.user, { displayName });
    return userCredential.user;
  } catch (error) {
    console.error("サインアップエラー:", error);
    throw error;
  }
};

// 🔹 メールアドレス＆パスワードでログイン
export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error("ログインエラー:", error);
    throw error;
  }
};

// 🔹 匿名アカウントをメール認証と紐付ける
export const linkAnonymousAccount = async (email: string, password: string) => {
  try {
    if (!auth.currentUser || !auth.currentUser.isAnonymous) return null;

    const credential = EmailAuthProvider.credential(email, password);
    const linkedUser = await linkWithCredential(auth.currentUser, credential);
    return linkedUser.user;
  } catch (error) {
    console.error("アカウント紐付けエラー:", error);
    throw error;
  }
};

// 🔹 ログアウト
export const logout = async () => {
  await signOut(auth);
};
