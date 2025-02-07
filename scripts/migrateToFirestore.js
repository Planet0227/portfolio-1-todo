const admin = require("firebase-admin");
const fs = require("fs");

// Firebaseの認証情報を読み込む
const serviceAccount = require("../firebase-adminsdk.json"); // 認証キーを適宜設定

// Firebase 初期化
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firestore = admin.firestore();

// JSONファイルを読み込む
const rawData = fs.readFileSync("./mock/db.json", "utf8");
const data = JSON.parse(rawData);

async function migrateTodos() {
  try {
    const todosCollection = firestore.collection("todos");

    for (const todoGroup of data.todos) {
      // Firestoreの `todos` コレクションに新しいドキュメントを作成
      const todoDocRef = todosCollection.doc(todoGroup.id);
      await todoDocRef.set({
        title: todoGroup.title,
        date: todoGroup.date,
        category: todoGroup.category,
      });

      // `todos` 内の各タスクを `tasks` サブコレクションに追加
      const tasksCollection = todoDocRef.collection("tasks");
      for (const task of todoGroup.todos) {
        await tasksCollection.doc(task.id).set({
          content: task.content,
          completed: task.complete ?? false, // `undefined` 対策
        });
      }
    }

    console.log("🔥 データ移行が完了しました！");
  } catch (error) {
    console.error("Error migrating todos:", error);
  }
}

// 移行スクリプト実行
migrateTodos();
