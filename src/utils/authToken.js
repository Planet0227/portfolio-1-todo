import { getAuth } from "firebase/auth";

// token取得簡略

export class AuthError extends Error {
  constructor(message = "認証エラーが発生しました") {
    super(message);
    this.name = "AuthError";
  }
}

export const authenticatedFetch = async (ENDPOINT, options = {}) => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    throw new AuthError("ユーザーが認証されていません");
  }

  try {
    const token = await user.getIdToken();
    const response = await fetch(ENDPOINT, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "リクエストに失敗しました");
    }

    return response;
  } catch (error) {
    console.error("API リクエストエラー:", error);
    throw error;
  }
};