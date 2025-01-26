/* eslint-disable @next/next/no-html-link-for-pages */
import React from "react";

export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-800 text-white p-4 fixed h-full">
      <h2 className="text-2xl font-bold">PopReel</h2>
      <ul className="mt-4 space-y-4">
        <li>
          <a href="/" className="hover:text-gray-400">
            Home
          </a>
        </li>
        <li>
          <a href="/upload" className="hover:text-gray-400">
            Upload
          </a>
        </li>
        <li>
          <a href="/profile" className="hover:text-gray-400">
            Profile
          </a>
        </li>
      </ul>
    </div>
  );
}
