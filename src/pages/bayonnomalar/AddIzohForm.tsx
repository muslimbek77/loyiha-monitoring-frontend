import { useState, useRef } from "react";
import { message } from "antd";
import {
  SendOutlined,
  PaperClipOutlined,
  CloseOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import api from "@/services/api/axios";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import { IzohCard } from "./Const";
import Can from "@/shared/components/guards/Can";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Izoh {
  id: number;
  topshiriq: number;
  muallif: number;
  muallif_fio: string;
  matn: string;
  fayl: string;
  created_at: string;
}

// ─── AddIzohForm ──────────────────────────────────────────────────────────────

interface AddIzohFormProps {
  topshiriqId: number;
  onSuccess: (newIzoh: Izoh) => void;
}

export const AddIzohForm = ({ topshiriqId, onSuccess }: AddIzohFormProps) => {
  const [matn, setMatn] = useState("");
  const [fayl, setFayl] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!matn.trim()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("topshiriq", String(topshiriqId));
      formData.append("matn", matn.trim());
      if (fayl) formData.append("fayl", fayl);

      const res = await api.post<Izoh>(
        API_ENDPOINTS.TOPSHIRIQLAR.IZOH_QOSHISH(topshiriqId),
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      onSuccess(res.data);
      setMatn("");
      setFayl(null);
      message.success("Izoh qo'shildi");
    } catch {
      message.error("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className={`mt-4 rounded-xl border transition-all duration-200 overflow-hidden ${
        focused
          ? "border-indigo-300 shadow-sm shadow-indigo-100"
          : "border-slate-200"
      } bg-white`}
    >
      {
        <Can action="canCreate">
          <textarea
            rows={2}
            value={matn}
            onChange={(e) => setMatn(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="Izoh yozing… (Ctrl+Enter — yuborish)"
            disabled={loading}
            className="w-full resize-none px-4 pt-3 pb-2 text-sm text-slate-700 placeholder-slate-300 outline-none bg-transparent leading-relaxed"
          />
          <div className="flex items-center justify-between px-3 pb-2.5 gap-2">
            <div className="flex items-center gap-2">
              {/* File attach */}
              <button
                type="button"
                title="Fayl biriktirish"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-500"
              >
                <PaperClipOutlined />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => setFayl(e.target.files?.[0] ?? null)}
              />

              {/* Selected file pill */}
              {fayl && (
                <span className="flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-600 max-w-[160px]">
                  <PaperClipOutlined className="shrink-0" />
                  <span className="truncate">{fayl.name}</span>
                  <button
                    type="button"
                    onClick={() => setFayl(null)}
                    className="shrink-0 text-indigo-400 hover:text-indigo-600 cursor-pointer"
                  >
                    <CloseOutlined style={{ fontSize: 10 }} />
                  </button>
                </span>
              )}
            </div>

            {/* Submit button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !matn.trim()}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                matn.trim() && !loading
                  ? "bg-indigo-500 text-white hover:bg-indigo-600 shadow-sm"
                  : "bg-slate-100 text-slate-300 cursor-not-allowed"
              }`}
            >
              {loading ? <LoadingOutlined style={{ fontSize: 12 }} spin /> : (
                <SendOutlined style={{ fontSize: 11 }} />
              )}
              Yuborish
            </button>
          </div>
        </Can>
      }
    </div>
  );
};

interface IzohlarSectionProps {
  topshiriqId: number;
  initialIzohlar: Izoh[];
}

export const IzohlarSection = ({
  topshiriqId,
  initialIzohlar,
}: IzohlarSectionProps) => {
  const [izohlar, setIzohlar] = useState<Izoh[]>(initialIzohlar);

  const handleNewIzoh = (newIzoh: Izoh) => {
    setIzohlar((prev) => [...prev, newIzoh]);
  };

  return (
    <div className="mt-4">
      {izohlar.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-3">
            {/* MessageOutlined imported from antd icons in your file */}
            <span className="text-slate-400 text-xs">💬</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Izohlar ({izohlar.length})
            </span>
          </div>
          <div className="space-y-2 mb-2">
            {izohlar.map((iz) => (
              <IzohCard key={iz.id} izoh={iz} />
            ))}
          </div>
        </>
      )}

      <AddIzohForm topshiriqId={topshiriqId} onSuccess={handleNewIzoh} />
    </div>
  );
};
