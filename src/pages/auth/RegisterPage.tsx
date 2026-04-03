import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import api from "@/services/api/axios";
import { API_ENDPOINTS } from "@/services/api/endpoints";

type BoshqarmaOption = {
  id: number;
  nomi: string;
};

const LAVOZIM_OPTIONS = [
  { value: "xodim", label: "Oddiy xodim" },
  { value: "boshqarma_boshi", label: "Boshqarma boshlig'i" },
  { value: "pto", label: "PTO xodimi" },
  { value: "iqtisod", label: "Iqtisodchi" },
  { value: "buxgalter", label: "Buxgalter" },
  { value: "kadr", label: "Kadrlar xodimi" },
  { value: "uchastka_rahbari", label: "Uchastka rahbari" },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingBoshqarmalar, setLoadingBoshqarmalar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [boshqarmalar, setBoshqarmalar] = useState<BoshqarmaOption[]>([]);
  const [form, setForm] = useState({
    pnfl: "",
    fio: "",
    username: "",
    email: "",
    telefon: "",
    boshqarma: "",
    lavozim: "xodim",
    password: "",
    password_confirm: "",
  });

  useEffect(() => {
    const fetchBoshqarmalar = async () => {
      try {
        setLoadingBoshqarmalar(true);
        const response = await api.get(API_ENDPOINTS.BOSHQARMA.LIST_ALL);
        const payload = Array.isArray(response.data)
          ? response.data
          : response.data?.results ?? [];
        setBoshqarmalar(payload);
      } catch (fetchError: any) {
        console.error(fetchError);
        setError("Boshqarmalar ro'yxatini yuklab bo'lmadi.");
      } finally {
        setLoadingBoshqarmalar(false);
      }
    };

    fetchBoshqarmalar();
  }, []);

  const canSubmit = useMemo(() => {
    return (
      form.pnfl &&
      form.fio &&
      form.username &&
      form.email &&
      form.telefon &&
      form.boshqarma &&
      form.lavozim &&
      form.password &&
      form.password_confirm
    );
  }, [form]);

  const updateField =
    (field: keyof typeof form) =>
    (
      event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (form.password !== form.password_confirm) {
      setError("Parollar mos kelmadi.");
      return;
    }

    try {
      setIsLoading(true);
      await api.post(API_ENDPOINTS.AUTH.REGISTER, {
        ...form,
        boshqarma: Number(form.boshqarma),
      });
      navigate("/auth/login");
    } catch (submitError: any) {
      const payload = submitError?.response?.data;
      const message = payload
        ? Object.values(payload).flat().join(" ")
        : "Ro'yxatdan o'tishda xatolik yuz berdi.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="mb-8 text-center">
        <p className="page-kicker mb-3 text-sky-300">Yangi akkaunt</p>
        <h2 className="mb-3 text-3xl font-semibold tracking-tight text-white">
          Frontend va API bilan tayyor integratsiya
        </h2>
        <p className="text-sm leading-6 text-slate-300">
          Ro'yxatdan o'tish formasi backenddagi haqiqiy boshqarma endpointlari bilan ishlaydi.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="F.I.O">
            <input
              value={form.fio}
              onChange={updateField("fio")}
              placeholder="Familiya Ism"
              className={inputClassName}
              required
            />
          </Field>
          <Field label="JSHSHIR">
            <input
              value={form.pnfl}
              onChange={updateField("pnfl")}
              placeholder="14 xonali"
              className={inputClassName}
              required
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Username">
            <input
              value={form.username}
              onChange={updateField("username")}
              placeholder="username"
              className={inputClassName}
              required
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={form.email}
              onChange={updateField("email")}
              placeholder="email@example.com"
              className={inputClassName}
              required
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Telefon">
            <input
              value={form.telefon}
              onChange={updateField("telefon")}
              placeholder="+998901234567"
              className={inputClassName}
              required
            />
          </Field>
          <Field label="Boshqarma">
            <select
              value={form.boshqarma}
              onChange={updateField("boshqarma")}
              className={inputClassName}
              required
              disabled={loadingBoshqarmalar}
            >
              <option value="">Tanlang</option>
              {boshqarmalar.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nomi}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Lavozim">
          <select
            value={form.lavozim}
            onChange={updateField("lavozim")}
            className={inputClassName}
            required
          >
            {LAVOZIM_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PasswordField
            label="Parol"
            value={form.password}
            onChange={updateField("password")}
            visible={showPassword}
            onToggle={() => setShowPassword((value) => !value)}
          />
          <PasswordField
            label="Parolni tasdiqlang"
            value={form.password_confirm}
            onChange={updateField("password_confirm")}
            visible={showConfirmPassword}
            onToggle={() => setShowConfirmPassword((value) => !value)}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !canSubmit}
          className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(37,99,235,0.35)] transition hover:translate-y-[-1px] hover:from-sky-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? "Ro'yxatdan o'tilmoqda..." : "Ro'yxatdan o'tish"}
        </button>

        <div className="text-center text-sm text-slate-400">
          Hisobingiz bormi?{" "}
          <Link to="/auth/login" className="font-medium text-sky-300 transition hover:text-sky-200">
            Tizimga kirish
          </Link>
        </div>
      </form>
    </div>
  );
}

const inputClassName =
  "w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-400/60 focus:outline-none focus:ring-4 focus:ring-sky-400/10";

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <label className="block space-y-2">
    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
      {label}
    </span>
    {children}
  </label>
);

const PasswordField = ({
  label,
  value,
  onChange,
  visible,
  onToggle,
}: {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  visible: boolean;
  onToggle: () => void;
}) => (
  <Field label={label}>
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        className={`${inputClassName} pr-12`}
        required
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 transition hover:text-sky-300"
      >
        {visible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
      </button>
    </div>
  </Field>
);
