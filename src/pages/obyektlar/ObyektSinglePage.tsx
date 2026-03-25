import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Spin, message } from "antd";
import dayjs from "dayjs";
import api from "@/services/api/axios";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  EnvironmentOutlined,
  UserOutlined,
  CloseOutlined,
  CheckOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { UZBEKISTAN_LOCATIONS } from "@/shared/components/const/constValues";
import Can from "@/shared/components/guards/Can";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ObyektForm {
  nomi: string;
  manzil: string;
  buyurtmachi: string;
  pudratchi: string;
  holat: "rejada" | "jarayonda" | "tugatilgan" | "to'xtatilgan";
  reja_foizi: number;
  bajarilish_foizi: number;
  boshlanish_sanasi: string;
  tugash_sanasi: string;
  shartnoma_summasi: string;
  sarflangan_summa: string;
  masul_xodim: number;
  tavsif: string;
}

interface Xodim {
  id: number;
  fio: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const HOLAT_OPTIONS = [
  { value: "rejada", label: "Rejada", dot: "bg-slate-400" },
  { value: "jarayonda", label: "Jarayonda", dot: "bg-blue-400" },
  { value: "tugatilgan", label: "Tugatilgan", dot: "bg-emerald-400" },
  { value: "to'xtatilgan", label: "To'xtatilgan", dot: "bg-rose-400" },
] as const;

const EMPTY_FORM: ObyektForm = {
  nomi: "",
  manzil: "",
  buyurtmachi: "",
  pudratchi: "",
  holat: "rejada",
  reja_foizi: 0,
  bajarilish_foizi: 0,
  boshlanish_sanasi: "",
  tugash_sanasi: "",
  shartnoma_summasi: "",
  sarflangan_summa: "",
  masul_xodim: 0,
  tavsif: "",
};

// ─── Small UI helpers ─────────────────────────────────────────────────────────

const Label = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-400 mb-1.5">
    {children}
  </p>
);

const baseInput =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all duration-200";

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`${baseInput} ${props.className ?? ""}`} />
);

const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    rows={4}
    className={`${baseInput} resize-none ${props.className ?? ""}`}
  />
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className={`${baseInput} appearance-none cursor-pointer ${props.className ?? ""}`}
  />
);

const SectionDivider = ({ title }: { title: string }) => (
  <div className="flex items-center gap-3 my-7 mt-3">
    <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400 whitespace-nowrap">
      {title}
    </span>
    <div className="flex-1 h-px bg-slate-100" />
  </div>
);

const PercentSlider = ({
  label,
  name,
  value,
  color,
  onChange,
}: {
  label: string;
  name: string;
  value: number;
  color: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <Label>{label}</Label>
      <span className="text-sm font-bold tabular-nums" style={{ color }}>
        {value}%
      </span>
    </div>
    <input
      type="range"
      name={name}
      min={0}
      max={100}
      value={value}
      onChange={onChange}
      className="w-full h-2 rounded-full appearance-none cursor-pointer"
      style={{
        background: `linear-gradient(to right, ${color} ${value}%, #e2e8f0 ${value}%)`,
        accentColor: color,
      }}
    />
    <div className="flex justify-between text-[10px] text-slate-300 mt-1">
      <span>0%</span>
      <span>100%</span>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const ObyektEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState<ObyektForm>(EMPTY_FORM);
  const [rasmFile, setRasmFile] = useState<File | null>(null);
  const [rasmPreview, setRasmPreview] = useState<string>("");
  const [xodimlar, setXodimlar] = useState<Xodim[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ObyektForm, string>>
  >({});

  // Fetch existing data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [obyektRes, xodimRes] = await Promise.all([
          api.get(`${API_ENDPOINTS.OBYEKTLAR.LIST}${id}/`),
          api.get("/auth/users/").catch(() => ({ data: [] })), // graceful fallback
        ]);
        const d = obyektRes.data;
        setForm({
          nomi: d.nomi ?? "",
          manzil: d.manzil ?? "",
          buyurtmachi: d.buyurtmachi ?? "",
          pudratchi: d.pudratchi ?? "",
          holat: d.holat ?? "rejada",
          reja_foizi: d.reja_foizi ?? 0,
          bajarilish_foizi: d.bajarilish_foizi ?? 0,
          boshlanish_sanasi: d.boshlanish_sanasi ?? "",
          tugash_sanasi: d.tugash_sanasi ?? "",
          shartnoma_summasi: d.shartnoma_summasi ?? "",
          sarflangan_summa: d.sarflangan_summa ?? "",
          masul_xodim: d.masul_xodim ?? 0,
          tavsif: d.tavsif ?? "",
        });
        if (d.rasm) setRasmPreview(d.rasm);
        setXodimlar(xodimRes.data.results ?? []);
      } catch (err) {
        console.error(err);
        message.error("Ma'lumot yuklanmadi");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Generic field handler
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "reja_foizi" ||
        name === "bajarilish_foizi" ||
        name === "masul_xodim"
          ? Number(value)
          : value,
    }));
    if (errors[name as keyof ObyektForm]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ObyektForm, string>> = {};
    if (!form.nomi.trim()) newErrors.nomi = "Nomi majburiy";
    if (!form.manzil.trim()) newErrors.manzil = "Manzil majburiy";
    if (!form.buyurtmachi.trim())
      newErrors.buyurtmachi = "Buyurtmachi majburiy";
    if (!form.pudratchi.trim()) newErrors.pudratchi = "Pudratchi majburiy";
    if (!form.boshlanish_sanasi) newErrors.boshlanish_sanasi = "Sana majburiy";
    if (!form.tugash_sanasi) newErrors.tugash_sanasi = "Sana majburiy";
    if (!form.shartnoma_summasi) newErrors.shartnoma_summasi = "Summa majburiy";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      message.warning("Iltimos, barcha maydonlarni to'ldiring");
      return;
    }
    try {
      setSaving(true);
      const formData = new FormData();
      // Append only plain text fields — never append rasm as a string
      (Object.keys(form) as (keyof ObyektForm)[]).forEach((key) => {
        formData.append(key, String(form[key]));
      });
      // Only send rasm when the user actually picked a new file
      if (rasmFile instanceof File) {
        formData.append("rasm", rasmFile, rasmFile.name);
      }
      // If no new file chosen, omit "rasm" entirely so the server keeps the existing one
      await api.put(`${API_ENDPOINTS.OBYEKTLAR.LIST}${id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      message.success("Obyekt muvaffaqiyatli yangilandi");
      navigate(`/obyekt/${id}`);
    } catch (err: any) {
      console.error(err);
      const detail =
        err?.response?.data?.detail ??
        "Xatolik yuz berdi. Qayta urinib ko'ring";
      message.error(detail);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`${API_ENDPOINTS.OBYEKTLAR.LIST}${id}/`);
      message.success("Obyekt muvaffaqiyatli o'chirildi");
      navigate("/obyekt");
    } catch (err: any) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  const selectedHolat = HOLAT_OPTIONS.find((o) => o.value === form.holat);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8 rounded-xl">
      {/* Header */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors mb-3 cursor-pointer"
        >
          <ArrowLeftOutlined className="text-[10px]" />
          Obyektlar
        </button>

        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
              {form.nomi || "—"}
            </h1>
            {form.manzil && (
              <div className="flex items-center gap-1.5 mt-1.5 text-slate-400 text-sm">
                <EnvironmentOutlined className="text-xs" />
                {form.manzil}
              </div>
            )}
          </div>

          {/* Status preview */}
          {selectedHolat && (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold mt-1 ${
                form.holat === "jarayonda"
                  ? "bg-blue-50 text-blue-600"
                  : form.holat === "tugatilgan"
                    ? "bg-emerald-50 text-emerald-600"
                    : form.holat === "to'xtatilgan"
                      ? "bg-rose-50 text-rose-500"
                      : "bg-slate-100 text-slate-500"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${selectedHolat.dot}`}
              />
              {selectedHolat.label}
            </span>
          )}
        </div>
      </div>

      {/* Form card */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          {/* ── Asosiy ma'lumotlar ── */}
          <SectionDivider title="Asosiy ma'lumotlar" />
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <Label>Nomi *</Label>
              <Input
                name="nomi"
                value={form.nomi}
                onChange={handleChange}
                placeholder="Obyekt nomini kiriting"
              />
              {errors.nomi && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.nomi}</p>
              )}
            </div>

            <div>
              <Label>Manzil *</Label>
              <Input
                name="manzil"
                value={form.manzil}
                onChange={handleChange}
                placeholder="Manzilni kiriting"
              />
              {errors.manzil && (
                <p className="text-[11px] text-rose-500 mt-1">
                  {errors.manzil}
                </p>
              )}
            </div>

            <div>
              <Label>Buyurtmachi *</Label>
              <Input
                name="buyurtmachi"
                value={form.buyurtmachi}
                onChange={handleChange}
                placeholder="Buyurtmachi nomi"
              />
              {errors.buyurtmachi && (
                <p className="text-[11px] text-rose-500 mt-1">
                  {errors.buyurtmachi}
                </p>
              )}
            </div>

            <div>
              <Label>Pudratchi *</Label>
              <Input
                name="pudratchi"
                value={form.pudratchi}
                onChange={handleChange}
                placeholder="Pudratchi nomi"
              />
              {errors.pudratchi && (
                <p className="text-[11px] text-rose-500 mt-1">
                  {errors.pudratchi}
                </p>
              )}
            </div>

            <div>
              <Label>Holat</Label>
              <div className="relative">
                <Select name="holat" value={form.holat} onChange={handleChange}>
                  {HOLAT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                  ▾
                </span>
              </div>
            </div>

            <div>
              <Label>Mas'ul xodim</Label>
              <div className="relative">
                {xodimlar.length > 0 ? (
                  <>
                    <Select
                      name="masul_xodim"
                      value={form.masul_xodim}
                      onChange={handleChange}
                    >
                      <option value={0}>— Tanlang —</option>
                      {xodimlar.map((x) => (
                        <option key={x.id} value={x.id}>
                          {x.fio}
                        </option>
                      ))}
                    </Select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                      ▾
                    </span>
                  </>
                ) : (
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300">
                      <UserOutlined className="text-xs" />
                    </span>
                    <Input
                      name="masul_xodim"
                      type="number"
                      value={form.masul_xodim || ""}
                      onChange={handleChange}
                      placeholder="Xodim ID"
                      className="pl-9"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Muddatlar ── */}
          <SectionDivider title="Muddatlar" />
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <Label>Boshlanish sanasi *</Label>
              <Input
                type="date"
                name="boshlanish_sanasi"
                value={form.boshlanish_sanasi}
                onChange={handleChange}
              />
              {errors.boshlanish_sanasi && (
                <p className="text-[11px] text-rose-500 mt-1">
                  {errors.boshlanish_sanasi}
                </p>
              )}
            </div>

            <div>
              <Label>Tugash sanasi *</Label>
              <Input
                type="date"
                name="tugash_sanasi"
                value={form.tugash_sanasi}
                onChange={handleChange}
              />
              {errors.tugash_sanasi && (
                <p className="text-[11px] text-rose-500 mt-1">
                  {errors.tugash_sanasi}
                </p>
              )}
            </div>
          </div>

          {/* ── Bajarilish holati ── */}
          <SectionDivider title="Bajarilish holati" />
          <div className="grid md:grid-cols-2 gap-8">
            <PercentSlider
              label="Bajarilish foizi"
              name="bajarilish_foizi"
              value={form.bajarilish_foizi}
              color="#3b82f6"
              onChange={handleChange}
            />
            <PercentSlider
              label="Reja foizi"
              name="reja_foizi"
              value={form.reja_foizi}
              color="#a855f7"
              onChange={handleChange}
            />
          </div>

          {/* ── Moliyaviy ko'rsatkichlar ── */}
          <SectionDivider title="Moliyaviy ko'rsatkichlar" />
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <Label>Shartnoma summasi (so'm) *</Label>
              <div className="relative">
                <Input
                  type="text"
                  name="shartnoma_summasi"
                  value={Number(form.shartnoma_summasi || 0).toLocaleString(
                    "ru-RU",
                  )}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\s/g, "");
                    handleChange({
                      ...e,
                      target: {
                        ...e.target,
                        name: "shartnoma_summasi",
                        value: raw,
                      },
                    } as any);
                  }}
                  placeholder="0"
                  className="pr-14"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-300 pointer-events-none">
                  so'm
                </span>
              </div>
              {errors.shartnoma_summasi && (
                <p className="text-[11px] text-rose-500 mt-1">
                  {errors.shartnoma_summasi}
                </p>
              )}
            </div>

            <div>
              <Label>Sarflangan summa (so'm)</Label>
              <div className="relative">
                <Input
                  type="text"
                  name="sarflangan_summa"
                  value={Number(form.sarflangan_summa || 0).toLocaleString(
                    "ru-RU",
                  )}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\s/g, "");
                    handleChange({
                      ...e,
                      target: {
                        ...e.target,
                        name: "sarflangan_summa",
                        value: raw,
                      },
                    } as any);
                  }}
                  placeholder="0"
                  className="pr-14"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-300 pointer-events-none">
                  so'm
                </span>
              </div>
              {/* Live spend % preview */}
              {form.shartnoma_summasi && form.sarflangan_summa && (
                <div className="mt-2">
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-400 transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          Math.round(
                            (Number(form.sarflangan_summa) /
                              Number(form.shartnoma_summasi)) *
                              100,
                          ),
                          100,
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 tabular-nums">
                    {Math.min(
                      Math.round(
                        (Number(form.sarflangan_summa) /
                          Number(form.shartnoma_summasi)) *
                          100,
                      ),
                      100,
                    )}
                    % sarflandi
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Rasm ── */}
          <SectionDivider title="Rasm" />
          <div>
            <Label>Rasm yuklash</Label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setRasmFile(file);
                  setRasmPreview(URL.createObjectURL(file));
                }
              }}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer file:cursor-pointer"
            />
            {rasmPreview && (
              <div className="mt-3 rounded-xl overflow-hidden border border-slate-100 max-h-52 relative group">
                <img
                  src={rasmPreview.replace(/^http:/, "https:")}
                  alt="preview"
                  className="object-contain"
                />
                <button
                  type="button"
                  onClick={() => {
                    setRasmFile(null);
                    setRasmPreview("");
                  }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 hover:bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  <CloseOutlined className="text-[10px]" />
                </button>
              </div>
            )}
          </div>

          {/* ── Tavsif ── */}
          <SectionDivider title="Tavsif" />
          <div>
            <Textarea
              name="tavsif"
              value={form.tavsif}
              onChange={handleChange}
              placeholder="Obyekt haqida qo'shimcha ma'lumot..."
            />
          </div>

          {/* ── Action buttons ── */}
          <Can action="canManageUsers">
            <div className="mt-2 pt-5 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white text-sm font-semibold shadow-sm shadow-rose-200 transition-all duration-200 cursor-pointer"
              >
                <CloseOutlined className="text-xs" />
                O'chirish
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-sm font-semibold shadow-sm shadow-blue-200 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {saving ? (
                  <LoadingOutlined className="text-xs" />
                ) : (
                  <CheckOutlined className="text-xs" />
                )}
                {saving ? "Saqlanmoqda..." : "Saqlash"}
              </button>
            </div>
          </Can>
        </div>
      </form>
    </div>
  );
};

export default ObyektEditPage;
