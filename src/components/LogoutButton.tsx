"use client";

import { createClient } from "@/lib/supabase/browserClient";

export default function LogoutButton() {
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <button
      onClick={handleLogout}
      className="text-xs text-zinc-500 hover:text-zinc-700"
    >
      ログアウト
    </button>
  );
}