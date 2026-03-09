"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => {
      if (r.ok) router.replace("/dashboard");
      else setChecking(false);
    });
  }, [router]);

  if (checking) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Survey App</h1>
        <p className="text-xl text-gray-600 mb-8">
          Create beautiful surveys, share them with a public link, and analyze responses in real-time.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push("/login")}
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Login
          </button>
          <button
            onClick={() => router.push("/register")}
            className="px-8 py-3 border border-indigo-600 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}
