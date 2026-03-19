import { useNavigate } from "react-router-dom";
import { ShieldOff } from "lucide-react";
import { Button } from "antd";

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[#0f1117] overflow-hidden rounded-2xl">

      {/* Ambient background blobs */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px] -top-32 -left-32 pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[100px] -bottom-24 -right-24 pointer-events-none" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Card */}
      <div className="relative z-10 flex flex-col items-center gap-6 bg-white/[0.03] border border-white/10 rounded-2xl px-12 py-14 text-center max-w-md w-full mx-4 shadow-2xl backdrop-blur-sm">

        {/* Icon */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full bg-red-500/10 blur-xl" />
          <div className="relative w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <ShieldOff size={36} className="text-red-400" strokeWidth={1.5} />
          </div>
        </div>

        {/* Error code */}
        <div>
          <p className="text-xs font-semibold tracking-[0.3em] text-red-400/80 uppercase mb-2">
            Xato 403
          </p>
          <h1 className="text-3xl font-bold text-white leading-tight">
            Ruxsat yo'q
          </h1>
        </div>

        {/* Description */}
        <p className="text-sm text-white/40 leading-relaxed">
          Siz bu sahifaga kirish huquqiga ega emassiz.
          <br />
          Iltimos, administratorga murojaat qiling.
        </p>

        {/* Divider */}
        <div className="w-full h-px bg-white/[0.06]" />

        {/* Actions */}
        <div className="flex gap-3 w-full">
          <Button
            onClick={() => navigate(-1)}
            className="flex-1 !h-10 !rounded-lg !bg-white/5 !border-white/10 !text-white/70 hover:!bg-white/10 hover:!text-white hover:!border-white/20 transition-all"
          >
            Orqaga
          </Button>
          <Button
            type="primary"
            onClick={() => navigate("/")}
            className="flex-1 !h-10 !rounded-lg !bg-indigo-600 hover:!bg-indigo-500 !border-0 !text-white font-medium transition-all"
          >
            Bosh sahifa
          </Button>
        </div>
      </div>
    </div>
  );
}