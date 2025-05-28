"use client";

import React, { createContext, useContext, useEffect, useReducer } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../firebase/firebaseConfig";
import { fetchAccountInfo } from "@/firebase/account";

const auth = getAuth(app);

// State と Dispatch 用の Context
const AuthStateContext = createContext();
const AuthDispatchContext = createContext();

const initialState = {
  user: null,
  accountInfo: null,
  isAuthLoading: true,
};

const authReducer = (state, { type, payload }) => {
  switch (type) {
    case "SET_LOADING":
      return { ...state, isAuthLoading: payload };
    case "SET_USER":
      return { ...state, user: payload, isAuthLoading: false };
    case "SET_ACCOUNT_INFO":
      return { ...state, accountInfo: payload, isAuthLoading: false };
    default:
      throw new Error(`アクションに失敗しました。: ${type}`);
  }
};

//  Provider コンポーネント
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      dispatch({ type: "SET_USER", payload: currentUser });
      if (currentUser) {
        try {
          const accountInfo = await fetchAccountInfo(currentUser.uid);
          dispatch({ type: "SET_ACCOUNT_INFO", payload: accountInfo });
        } catch (err) {
          console.error("Failed to fetch account info:", err);
          dispatch({ type: "SET_LOADING", payload: false });
        }
      } else {
        dispatch({ type: "SET_LOADING", payload: false });
      }
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