import { useNavigate } from "react-router-dom";
import { ShieldOff } from "lucide-react";
import { Button } from "antd";

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="relative flex items-center justify-center h-[85vh] bg-[#f5f6fa] overflow-hidden rounded-2xl">
      {/* Ambient background blobs */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-indigo-400/15 blur-[120px] -top-32 -left-32 pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-purple-400/15 blur-[100px] -bottom-24 -right-24 pointer-events-none" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Card */}
      <div className="relative z-10 flex flex-col items-center gap-6 bg-white border border-gray-200 rounded-2xl px-12 py-14 text-center max-w-md w-full mx-4 shadow-xl">
        {/* Icon */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full bg-red-400/15 blur-xl" />
          <div className="relative w-20 h-20 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center">
            <ShieldOff size={36} className="text-red-500" strokeWidth={1.5} />
          </div>
        </div>

        {/* Error code */}
        <div>
          <p className="text-xs font-semibold tracking-[0.3em] text-red-500/80 uppercase mb-2">
            Xato 403
          </p>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">
            Ruxsat yo'q
          </h1>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-400 leading-relaxed">
          Siz bu sahifaga kirish huquqiga ega emassiz.
        </p>

        {/* Divider */}
        <div className="w-full h-px bg-gray-100" />

        {/* Actions */}
        <div className="flex gap-3 w-full">
          <Button
            onClick={() => navigate(-1)}
            className="flex-1 !h-10 !rounded-lg !bg-gray-50 !border-gray-200 !text-gray-600 hover:!bg-gray-100 hover:!text-gray-800 hover:!border-gray-300 transition-all"
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