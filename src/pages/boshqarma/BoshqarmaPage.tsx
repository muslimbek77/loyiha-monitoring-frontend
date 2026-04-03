import { useEffect, useState } from "react";
import { Spin, Modal, Form, Input, message } from "antd";
import {
  PlusOutlined,
  RiseOutlined,
  TeamOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import api from "@/services/api/axios";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import { useNavigate } from "react-router-dom";
import Can from "@/shared/components/guards/Can";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface Boshqarma {
  id: number;
  nomi: string;
  qisqa_nomi: string;
  reyting: number;
  xodimlar_soni: number;
}

const topConfig = [
  {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-600",
    badge: "bg-amber-100 text-amber-600",
    icon: "🥇",
  },
  {
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-500",
    badge: "bg-slate-100 text-slate-500",
    icon: "🥈",
  },
  {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-500",
    badge: "bg-orange-100 text-orange-500",
    icon: "🥉",
  },
];

const FormLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
    {children}
  </span>
);

const BoshqarmaPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<Boshqarma[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { user } = useAuth();

  const hasAccess = user?.lavozim !== "pto";

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(API_ENDPOINTS.BOSHQARMA.LIST_ALL);
      const sorted = response.data.sort(
        (a: Boshqarma, b: Boshqarma) => b.reyting - a.reyting,
      );
      setData(sorted);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values: { nomi: string; qisqa_nomi: string }) => {
    try {
      await api.post(API_ENDPOINTS.BOSHQARMA.LIST, values);
      message.success("Boshqarma muvaffaqiyatli qo'shildi");
      form.resetFields();
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      message.error("Xatolik yuz berdi");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8 rounded-xl">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex flex-col">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.2em] mb-1">
            Tashkilot tuzilmasi
          </p>
          <span className="text-[9px] font-medium text-slate-400 uppercase tracking-[0.2em] mb-1">
            <strong>{data.length}</strong> ta boshqarma
          </span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
            Boshqarmalar Reytingi
          </h1>
          <Can action="canCreate">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-xl transition-colors duration-150 cursor-pointer"
            >
              <PlusOutlined className="text-xs" />
              Yangi boshqarma
            </button>
          </Can>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {data.map((item, index) => {
          const isTop = index < 3;
          const top = isTop ? topConfig[index] : null;

          return (
            <div
              key={item.id}
              onClick={() =>
                hasAccess ? navigate(`${item.id}`) : navigate("/unauthorized")
              }
              className={`
                relative bg-white rounded-2xl border cursor-pointer
                shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden
                ${isTop ? `${top!.border}` : "border-slate-200"}
              `}
            >
              {/* Top rank stripe */}
              {isTop && (
                <div
                  className={`h-1 w-full ${
                    index === 0
                      ? "bg-amber-400"
                      : index === 1
                        ? "bg-slate-400"
                        : "bg-orange-400"
                  }`}
                />
              )}

              <div className="px-5 pt-4 pb-5">
                {/* Header row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-slate-800 text-base leading-snug truncate pr-2">
                      {item.nomi}
                    </h2>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-500 text-[11px] font-semibold rounded-md">
                      {item.qisqa_nomi}
                    </span>
                  </div>

                  {isTop ? (
                    <span
                      className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${top!.badge}`}
                    >
                      <span>{top!.icon}</span>
                      TOP {index + 1}
                    </span>
                  ) : (
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center">
                      <RiseOutlined className="text-slate-400 text-[10px]" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 leading-none mb-0.5">
                        Reyting
                      </p>
                      <p className="text-sm font-bold text-slate-700 tabular-nums leading-none">
                        {item.reyting}%
                      </p>
                    </div>
                  </div>

                  <div className="w-px h-7 bg-slate-100" />

                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center">
                      <TeamOutlined className="text-slate-400 text-[10px]" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 leading-none mb-0.5">
                        Xodimlar
                      </p>
                      <p className="text-sm font-bold text-slate-700 tabular-nums leading-none">
                        {item.xodimlar_soni}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.reyting}%`,
                        background: isTop
                          ? index === 0
                            ? "#f59e0b"
                            : index === 1
                              ? "#94a3b8"
                              : "#f97316"
                          : "#3b82f6",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {data.length === 0 && (
        <div className="text-center py-20 text-slate-400 text-sm">
          Hozircha boshqarmalar mavjud emas
        </div>
      )}

      {/* Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-1">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
              <TrophyOutlined className="text-slate-500 text-sm" />
            </div>
            <span className="text-base font-semibold text-slate-800">
              Yangi boshqarma qo'shish
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={440}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          className="pt-2"
        >
          <Form.Item
            label={<FormLabel>Nomi</FormLabel>}
            name="nomi"
            rules={[{ required: true, message: "Nomi majburiy" }]}
          >
            <Input className="rounded-lg" placeholder="Boshqarma nomi" />
          </Form.Item>

          <Form.Item
            label={<FormLabel>Qisqa nomi</FormLabel>}
            name="qisqa_nomi"
            rules={[{ required: true, message: "Qisqa nomi majburiy" }]}
          >
            <Input className="rounded-lg" placeholder="Masalan: IT, HR, MOL" />
          </Form.Item>

          <button
            type="submit"
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-xl transition-colors duration-150 mt-1"
          >
            Saqlash
          </button>
        </Form>
      </Modal>
    </div>
  );
};

export default BoshqarmaPage;
