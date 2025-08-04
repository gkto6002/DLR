"use client";

import { useState } from "react";

export default function CheckDLsite() {
  const [prefix, setPrefix] = useState("2506late");
  const [filename, setFilename] = useState("032.json");
  const [tagData, setTagData] = useState(null);
  const [tagCounts, setTagCounts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTag = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/dlsite/tag?prefix=${prefix}&filename=${filename}`
      );
      const json = await res.json();
      setTagData(json);
    } catch (err) {
      console.log(err);
      setError("Tag fetch failed.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTagCounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/dlsite/tag_counts?prefix=${prefix}`);
      const json = await res.json();
      setTagCounts(json);
    } catch (err) {
      console.log(err);
      setError("Tag count fetch failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-xl p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">DLsite データチェッカー</h1>

        <div className="mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Prefix</label>
            <input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="例: 2506late"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Filename</label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="例: 032.json"
            />
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          <button
            onClick={fetchTag}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-md transition"
          >
            タグデータ取得
          </button>
          <button
            onClick={fetchTagCounts}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-md transition"
          >
            タグ数取得
          </button>
        </div>

        {loading && <p className="text-blue-600 mb-4">読み込み中...</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">タグデータ</h2>
          <div className="bg-black rounded-md p-4 overflow-auto max-h-96 text-sm whitespace-pre-wrap">
            {tagData ? JSON.stringify(tagData, null, 2) : "データなし"}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">タグ数</h2>
          <div className="bg-black rounded-md p-4 overflow-auto max-h-96 text-sm whitespace-pre-wrap">
            {tagCounts ? JSON.stringify(tagCounts, null, 2) : "データなし"}
          </div>
        </div>
      </div>
    </div>
  );
}
