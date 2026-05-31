"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function SearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim()) {
      return;
    }

    setLoading(true);
    const response = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    });
    const session = await response.json();
    router.push(`/search/${session.id}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
      <input
        aria-label="商品关键词或链接"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="min-h-12 flex-1 rounded-md border border-line px-4 text-base"
        placeholder="输入商品关键词或链接"
      />
      <button
        type="submit"
        disabled={loading}
        className="min-h-12 rounded-md bg-accent px-5 font-medium text-white disabled:opacity-60"
      >
        {loading ? "搜索中" : "搜索"}
      </button>
    </form>
  );
}
