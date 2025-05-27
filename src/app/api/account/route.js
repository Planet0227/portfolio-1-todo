import admin from "firebase-admin";
import { readFileSync } from "fs";
import { join } from "path";

if (!admin.apps.length) {
  let credential;
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    // 本番 or 環境変数が設定されているとき
    credential = admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    });
  } else {
    // ローカル開発環境用 JSON を使う
    const serviceAccount = JSON.parse(
      readFileSync(join(process.cwd(), "firebase-adminsdk.json"), "utf8")
    );
    credential = admin.credential.cert(serviceAccount);
  }

  admin.initializeApp({ credential });
}

const db = admin.firestore();

async function getUserUid(request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }
  const token = authHeader.split("Bearer ")[1];
  const decodedToken = await admin.auth().verifyIdToken(token);
  return decodedToken.uid;
}

// ドキュメントIDを固定値 "default" にする
const INFO_DOC_ID = "default";

// GET: プロフィール取得
export async function GET(request) {
  try {
    const uid = await getUserUid(request);
    const docRef = db.collection("users").doc(uid)
                     .collection("accountInfo").doc(INFO_DOC_ID);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return new Response(JSON.stringify({}), { status: 200 });
    }
    return new Response(JSON.stringify(docSnap.data()), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 401,
    });
  }
}

// PATCH: プロフィール更新
export async function PATCH(request) {
  try {
    const uid = await getUserUid(request);
    const { displayName, iconDataUrl } = await request.json();

    const docRef = db.collection("users").doc(uid)
                     .collection("accountInfo").doc(INFO_DOC_ID);

    const updateData = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (iconDataUrl !== undefined) updateData.iconDataUrl = iconDataUrl;

    await docRef.set(updateData, { merge: true });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
