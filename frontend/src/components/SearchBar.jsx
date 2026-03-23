import { motion } from "framer-motion";

export function SearchBar({ value, onChange, onSubmit, loading }) {
  return (
    <motion.form
      initial={{ y: 18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45 }}
      onSubmit={onSubmit}
      className="mx-auto flex w-full max-w-3xl items-center gap-3 rounded-2xl border border-zinc-200 bg-white/70 p-3 shadow-lg backdrop-blur"
    >
      <input
        className="h-12 flex-1 rounded-xl border border-zinc-200 bg-white px-4 font-medium text-zinc-800 outline-none transition focus:border-amber-500"
        placeholder="Search products across Amazon, Flipkart, Nykaa, Myntra"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <button
        type="submit"
        disabled={loading}
        className="h-12 rounded-xl bg-zinc-900 px-5 font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
      >
        {loading ? "Searching..." : "Compare"}
      </button>
    </motion.form>
  );
}
