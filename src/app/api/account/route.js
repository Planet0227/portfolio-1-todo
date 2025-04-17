import admin from "firebase-admin";
import serviceAccount from "../../../../firebase-adminsdk.json";

// Firebase Admin 初期化
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
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

// GET: プロフィール取得
export async function GET(request) {
  try {
    const uid = await getUserUid(request);
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return new Response(JSON.stringify({}), { status: 200 });
    }
    return new Response(JSON.stringify(userDoc.data()), { status: 200 });
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

    const userRef = db.collection("users").doc(uid);
    const updateData = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (iconDataUrl !== undefined) updateData.iconDataUrl = iconDataUrl;

    await userRef.set(updateData, { merge: true });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
