import { useAuth } from "@/context/AuthContext";

export const fetchWithAuth = async (url, method, body = null) => {
  const { user } = useAuth();

  if (!user) {
    console.log("ユーザーが認証されていません");
    return;
  }

  try {
    const token = await user.getIdToken();

    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // 認証トークンをセット
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "サーバーエラー");
    }

    return await response.json(); // 成功時にJSONを返す
  } catch (error) {
    console.error("エラー:", error);
    throw error;
  }
};
