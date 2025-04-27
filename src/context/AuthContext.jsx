"use client";

import React, { createContext, useContext, useEffect, useReducer } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { authenticatedFetch } from "@/utils/authToken";
import { app } from "../firebase/firebaseConfig";

const auth = getAuth(app);

// 1. State と Dispatch 用の Context
const AuthStateContext = createContext();
const AuthDispatchContext = createContext();

const initialState = {
  user: null,
  accountInfo: null,
  loading: true,
};

const authReducer = (state, { type, payload }) => {
  switch (type) {
    case "SET_LOADING":
      return { ...state, loading: payload };
    case "SET_USER":
      return { ...state, user: payload };
    case "SET_ACCOUNT_INFO":
      return { ...state, accountInfo: payload };
    default:
      throw new Error(`アクションに失敗しました。: ${type}`);
  }
};

// 4. Provider コンポーネント
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    dispatch({ type: "SET_LOADING", payload: true });
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      dispatch({ type: "SET_USER", payload: currentUser });
      if (currentUser) {
        try {
          const res = await authenticatedFetch("/api/account", { method: "GET" });
          const data = res.ok ? await res.json() : null;
          dispatch({ type: "SET_ACCOUNT_INFO", payload: data });
        } catch (err) {
          console.error("Failed to fetch account info:", err);
        }
      } 
      dispatch({ type: "SET_LOADING", payload: false });
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthStateContext.Provider value={state}>
      <AuthDispatchContext.Provider value={dispatch}>
        {children}
      </AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  );
};

// 5. カスタムフック
export const useAuthState = () => useContext(AuthStateContext);
export const useAuthDispatch = () => useContext(AuthDispatchContext);
export const useAuth = () => {
  const state = useAuthState();
  const dispatch = useAuthDispatch();
  return { ...state, dispatch };
};