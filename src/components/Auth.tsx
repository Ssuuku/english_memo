"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browserClient";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const supabase = createClient();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("ログイン成功！");
      window.location.reload(); // 簡易的にリロード
    }
    setLoading(false);
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("確認メールを送信しました。メールを確認してください。");
    }
    setLoading(false);
  };

  const handleGitHubLogin = async () => {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">ログイン</h2>

      {/* GitHub Login */}
      <button
        onClick={handleGitHubLogin}
        disabled={loading}
        className="w-full bg-gray-800 text-white py-2 px-4 rounded mb-4 hover:bg-gray-700 disabled:opacity-50"
      >
        {loading ? "処理中..." : "GitHubでログイン"}
      </button>

      <div className="text-center mb-4">または</div>

      {/* Email/Password Login */}
      <form onSubmit={handleEmailLogin} className="space-y-4">
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "処理中..." : "ログイン"}
        </button>
      </form>

      <button
        onClick={handleEmailSignUp}
        disabled={loading}
        className="w-full mt-2 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
      >
        {loading ? "処理中..." : "新規登録"}
      </button>

      {message && <p className="mt-4 text-center text-red-500">{message}</p>}
    </div>
  );
}