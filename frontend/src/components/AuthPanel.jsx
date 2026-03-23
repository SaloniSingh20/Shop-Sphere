import { useState } from "react";
import { login, signup } from "../api/client";
import { useAuth } from "../hooks/useAuth";

export function AuthPanel() {
  const { isAuthenticated, user, logout, login: storeAuth } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const handler = mode === "login" ? login : signup;
      const payload = mode === "login" ? { email: form.email, password: form.password } : form;
      const data = await handler(payload);
      storeAuth(data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Authentication failed");
    }
  };

  if (isAuthenticated) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-4">
        <p className="font-semibold text-zinc-800">Signed in as {user?.name}</p>
        <button onClick={logout} className="mt-2 rounded-lg bg-zinc-900 px-3 py-2 text-sm text-white">
          Logout
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`rounded-lg px-3 py-1 text-sm ${mode === "login" ? "bg-zinc-900 text-white" : "bg-zinc-100"}`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`rounded-lg px-3 py-1 text-sm ${mode === "signup" ? "bg-zinc-900 text-white" : "bg-zinc-100"}`}
        >
          Sign up
        </button>
      </div>

      {mode === "signup" && (
        <input
          className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          placeholder="Name"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
        />
      )}
      <input
        className="w-full rounded-lg border border-zinc-300 px-3 py-2"
        placeholder="Email"
        type="email"
        value={form.email}
        onChange={(event) => setForm({ ...form, email: event.target.value })}
      />
      <input
        className="w-full rounded-lg border border-zinc-300 px-3 py-2"
        placeholder="Password"
        type="password"
        value={form.password}
        onChange={(event) => setForm({ ...form, password: event.target.value })}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" className="w-full rounded-lg bg-zinc-900 py-2 text-white">
        Continue
      </button>
    </form>
  );
}
