import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await login({ username, password });

    if (result.success) {
      navigate("/");
    }
  };

  return (
    <div className="relative">
      <div className="mb-8 text-center">
        <p className="page-kicker mb-3 text-sky-300">Tizimga kirish</p>
        <h2 className="mb-3 text-4xl font-semibold tracking-tight text-white">
          Ish jarayonlarini bir joydan boshqaring
        </h2>
        <p className="text-sm leading-6 text-slate-300">
          Hisobingizga kirib hujjatlar, topshiriqlar va monitoring bo'limlarini davom ettiring.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            Foydalanuvchi nomi yoki parol noto'g'ri.
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="username" className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
            Foydalanuvchi nomi
          </label>
          <input
            id="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="username"
            required
            className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-400/60 focus:outline-none focus:ring-4 focus:ring-sky-400/10"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
            Parol
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3.5 pr-12 text-sm text-white placeholder:text-slate-500 focus:border-sky-400/60 focus:outline-none focus:ring-4 focus:ring-sky-400/10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 transition hover:text-sky-300"
            >
              {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(37,99,235,0.35)] transition hover:translate-y-[-1px] hover:from-sky-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? "Tekshirilmoqda..." : "Tizimga kirish"}
        </button>

        <div className="flex items-center justify-between text-sm text-slate-400">
          <Link to="/auth/register" className="transition hover:text-sky-300">
            Ro'yxatdan o'tish
          </Link>
          <span>Monitoring paneli</span>
        </div>
      </form>
    </div>
  );
}
