"use client";


import React, { createContext, useContext, useEffect, useReducer, ReactNode } from "react";
import { getAuth, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import type { Unsubscribe } from "firebase/auth";
import { app } from "@/firebase/firebaseConfig";
import { fetchAccountInfo } from "@/firebase/account";
import type { AccountInfo } from "@/firebase/account";


const auth = getAuth(app);

interface AuthState {
  user: FirebaseUser | null;
  accountInfo: AccountInfo | null;
  isAuthLoading: boolean;
}

type AuthAction = 
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: FirebaseUser | null }
  | { type: "SET_ACCOUNT_INFO"; payload: AccountInfo | null };

type AuthDispatch = React.Dispatch<AuthAction>;

const initialState: AuthState = {
  user: null,
  accountInfo: null,
  isAuthLoading: true,
};

// State と Dispatch 用の Context
const AuthStateContext = createContext<AuthState | undefined>(undefined);
const AuthDispatchContext = createContext<AuthDispatch | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isAuthLoading: action.payload };
    case "SET_USER":
      return { ...state, user: action.payload, isAuthLoading: false };
    case "SET_ACCOUNT_INFO":
      return { ...state, accountInfo: action.payload, isAuthLoading: false };
    default:
      throw new Error(`アクションに失敗しました。: ${(action as any).type}`);
  }
};


//  Provider コンポーネント
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const unsubscribe: Unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      dispatch({ type: "SET_USER", payload: currentUser });
      if (currentUser) {
        try {
          const accountInfo: AccountInfo = await fetchAccountInfo(currentUser.uid);
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


export const useAuthState = (): AuthState =>  {
  const ctx = useContext(AuthStateContext);
  if(!ctx){
    throw new Error("useAuthState は AuthProvider の中で使ってください")
  }
  return ctx;
}
export const useAuthDispatch = (): AuthDispatch => {
  const ctx = useContext(AuthDispatchContext);
  if (!ctx) {
    throw new Error("useAuthDispatch は AuthProvider の中で使ってください");
  }
  return ctx;
};
export const useAuth = (): AuthState & { dispatch: AuthDispatch } => {
  const state = useAuthState();
  const dispatch = useAuthDispatch();
  return { ...state, dispatch };
};