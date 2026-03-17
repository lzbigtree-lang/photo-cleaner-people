"use client";

import { useState } from "react";

interface Props {
  token: string;
  onChange: (token: string) => void;
}

export default function TokenInput({ token, onChange }: Props) {
  const [saved, setSaved] = useState(!!token);

  const handleSave = () => {
    const val = (document.getElementById("tokenInput") as HTMLInputElement).value.trim();
    if (!val) return;
    localStorage.setItem("replicate_token", val);
    onChange(val);
    setSaved(true);
  };

  return (
    <div className="flex items-center gap-2 mb-6 flex-wrap">
      <input
        id="tokenInput"
        type="password"
        defaultValue={token}
        placeholder="输入 Replicate API Token"
        className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        onChange={() => setSaved(false)}
      />
      <button
        onClick={handleSave}
        className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-700 transition"
      >
        保存
      </button>
      {saved && <span className="text-green-500 text-sm">✓ 已保存</span>}
    </div>
  );
}
