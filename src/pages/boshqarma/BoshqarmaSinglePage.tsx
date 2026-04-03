import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  FileOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  SendOutlined,
  TeamOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Button, Empty, Form, Input, Modal, Select, Spin, message } from "antd";
import api from "@/services/api/axios";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface UserType {
  id: number;
  fio: string;
  lavozim: string;
  boshqarma_nomi: string;
  is_active: boolean;
  avatar?: string | null;
}

interface HujjatType {
  id: number;
  nomi: string;
  obyekt: number | null;
  obyekt_nomi: string;
  kategoriya: number | null;
  kategoriya_nomi: string;
  kategoriya_full_path?: string;
  boshqarma: number | null;
  boshqarma_nomi: string;
  yuklovchi: number | null;
  yuklovchi_fio: string;
  holat: string;
  holat_display: string;
  muddat: string;
  fayl_turi: string;
  is_kechikkan: boolean;
  yuklangan_vaqt: string;
}

interface ObyektType {
  id: number;
  nomi: string;
  manzil: string;
  holat: string;
  bajarilish_foizi: number;
  tugash_sanasi: string;
  hujjatlar_soni: number;
}

interface KategoriyaType {
  id: number;
  nomi: string;
  full_path: string;
  parent: number | null;
  obyekt: number | null;
  obyekt_nomi: string;
  hujjatlar_soni: number;
  oxirgi_yuklangan_vaqt: string | null;
}

interface BoshqarmaType {
  id: number;
  nomi: string;
  qisqa_nomi: string;
  reyting?: number;
}

interface StatistikaType {
  xodimlar_soni: number;
  hujjatlar_soni: number;
  jarimalar_soni: number;
  jami_minus: number;
  bajarilmagan_topshiriqlar: number;
  obyektlar_soni: number;
  kategoriyalar_soni: number;
  ochiq_talablar_soni: number;
}

interface OverviewResponse {
  boshqarma: BoshqarmaType;
  statistika: StatistikaType;
  xodimlar: UserType[];
  hujjatlar: HujjatType[];
  kategoriyalar: KategoriyaType[];
  obyektlar: ObyektType[];
}

interface BoshqarmaUpdatePayload {
  nomi: string;
  qisqa_nomi: string;
}

interface TalabCreatePayload {
  ijrochi_boshqarma: number;
  kategoriya?: number;
  mavzu: string;
  mazmun: string;
  muddat: string;
}

type TabKey = "xodimlar" | "hujjatlar" | "obyektlar";

const HOLAT_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  tasdiqlandi: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    dot: "bg-emerald-400",
  },
  kutilmoqda: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    dot: "bg-amber-400",
  },
  rad_etildi: {
    bg: "bg-red-50",
    text: "text-red-500",
    dot: "bg-red-400",
  },
  arxiv: {
    bg: "bg-slate-100",
    text: "text-slate-500",
    dot: "bg-slate-400",
  },
};

const STATUS_BADGE: Record<string, string> = {
  jarayonda: "bg-blue-50 text-blue-600",
  muammoli: "bg-red-50 text-red-500",
  tugatilgan: "bg-emerald-50 text-emerald-600",
  rejada: "bg-amber-50 text-amber-600",
  toxtatilgan: "bg-slate-100 text-slate-500",
};

const STAT_CARDS = [
  {
    key: "xodimlar_soni" as keyof StatistikaType,
    label: "Xodimlar",
    icon: <TeamOutlined />,
    bg: "bg-blue-50",
    text: "text-blue-600",
    iconBg: "bg-blue-100",
  },
  {
    key: "hujjatlar_soni" as keyof StatistikaType,
    label: "Hujjatlar",
    icon: <FileOutlined />,
    bg: "bg-violet-50",
    text: "text-violet-600",
    iconBg: "bg-violet-100",
  },
  {
    key: "obyektlar_soni" as keyof StatistikaType,
    label: "Obyektlar",
    icon: <CheckCircleOutlined />,
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    iconBg: "bg-emerald-100",
  },
  {
    key: "jarimalar_soni" as keyof StatistikaType,
    label: "Jarimalar",
    icon: <WarningOutlined />,
    bg: "bg-amber-50",
    text: "text-amber-600",
    iconBg: "bg-amber-100",
  },
  {
    key: "ochiq_talablar_soni" as keyof StatistikaType,
    label: "Ochiq talablar",
    icon: <SendOutlined />,
    bg: "bg-cyan-50",
    text: "text-cyan-600",
    iconBg: "bg-cyan-100",
  },
  {
    key: "jami_minus" as keyof StatistikaType,
    label: "Jami minus",
    icon: <MinusCircleOutlined />,
    bg: "bg-red-50",
    text: "text-red-500",
    iconBg: "bg-red-100",
  },
];

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("uz-UZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("uz-UZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const EmptyState = ({ title }: { title: string }) => (
  <div className="rounded-2xl border border-slate-200 bg-white py-16">
    <Empty description={title} />
  </div>
);

const BoshqarmaSinglePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<TabKey>("xodimlar");
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editForm] = Form.useForm<BoshqarmaUpdatePayload>();

  const [talabModalOpen, setTalabModalOpen] = useState(false);
  const [talabLoading, setTalabLoading] = useState(false);
  const [talabForm] = Form.useForm<TalabCreatePayload>();

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await api.get<OverviewResponse>(API_ENDPOINTS.BOSHQARMA.OVERVIEW(id!));
      setOverview(res.data);
      editForm.setFieldsValue({
        nomi: res.data.boshqarma.nomi,
        qisqa_nomi: res.data.boshqarma.qisqa_nomi,
      });
    } catch (error) {
      console.error("Error fetching boshqarma overview:", error);
      message.error("Boshqarma ma'lumotlarini yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOverview();
    }
  }, [id]);

  const availableKategoriyalar = useMemo(
    () => overview?.kategoriyalar ?? [],
    [overview],
  );

  const populatedKategoriyalar = useMemo(
    () => availableKategoriyalar.filter((item) => item.hujjatlar_soni > 0),
    [availableKategoriyalar],
  );

  const boshqarmaSummary = overview?.statistika
    ? [
        `${overview.statistika.xodimlar_soni} ta faol xodim bor.`,
        `${overview.statistika.hujjatlar_soni} ta hujjat va ${overview.statistika.kategoriyalar_soni} ta faol kategoriya shakllangan.`,
        `${overview.statistika.obyektlar_soni} ta obyekt ushbu boshqarma hujjatlari bilan bog'langan.`,
      ].join(" ")
    : "";

  const handleEditSubmit = async () => {
    try {
      const values = await editForm.validateFields();
      setEditLoading(true);
      await api.put(API_ENDPOINTS.BOSHQARMA.DETAIL(id!), values);
      message.success("Boshqarma yangilandi");
      setEditModalOpen(false);
      await fetchOverview();
    } catch (error) {
      console.error("Error updating boshqarma:", error);
      message.error("Yangilashda xatolik yuz berdi");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await api.delete(API_ENDPOINTS.BOSHQARMA.DETAIL(id!));
      message.success("Boshqarma o'chirildi");
      navigate("/boshqarma");
    } catch (error) {
      console.error("Error deleting boshqarma:", error);
      message.error("O'chirishda xatolik yuz berdi");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleTalabCreate = async () => {
    try {
      const values = await talabForm.validateFields();
      setTalabLoading(true);
      await api.post(API_ENDPOINTS.TALABLAR.LIST, {
        ...values,
        ijrochi_boshqarma: Number(id),
      });
      message.success("Talab muvaffaqiyatli yaratildi");
      setTalabModalOpen(false);
      talabForm.resetFields();
      await fetchOverview();
    } catch (error) {
      console.error("Error creating talab:", error);
      message.error("Talab yaratishda xatolik yuz berdi");
    } finally {
      setTalabLoading(false);
    }
  };

  if (loading && !overview) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen rounded-xl bg-gray-50 px-6 py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="mb-3 inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-slate-600"
          >
            <ArrowLeftOutlined className="text-[10px]" />
            Boshqarmalar
          </button>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Boshqarma overview
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
            {overview?.boshqarma.nomi || "Boshqarma"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {overview?.boshqarma.qisqa_nomi || "—"} • Hujjatlar, obyektlar va talablar boshqaruvi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {user?.boshqarma !== Number(id) ? (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="!rounded-full !border-0 !bg-blue-600"
              onClick={() => setTalabModalOpen(true)}
            >
              Talab yaratish
            </Button>
          ) : null}
          <Button
            icon={<EditOutlined />}
            className="!rounded-full"
            onClick={() => setEditModalOpen(true)}
          >
            Tahrirlash
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            className="!rounded-full"
            loading={deleteLoading}
            onClick={handleDelete}
          >
            O'chirish
          </Button>
        </div>
      </div>

      {overview?.statistika ? (
        <div className="mb-6 grid gap-3 xl:grid-cols-6 md:grid-cols-3">
          {STAT_CARDS.map((card) => (
            <div
              key={card.key}
              className={`${card.bg} rounded-2xl border border-white px-4 py-4 shadow-sm`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg} ${card.text}`}
                >
                  {card.icon}
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-400">{card.label}</p>
                  <p className={`text-xl font-bold ${card.text}`}>
                    {overview.statistika[card.key]}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mb-6 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700">
            Operativ xulosa
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-700">{boshqarmaSummary}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Kategoriya kesimi
          </p>
          <div className="mt-3 space-y-2">
            {populatedKategoriyalar.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-700">
                    {item.full_path}
                  </p>
                  <p className="text-xs text-slate-400">
                    {item.obyekt_nomi || "Obyektsiz"} • {formatDateTime(item.oxirgi_yuklangan_vaqt)}
                  </p>
                </div>
                <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-600">
                  {item.hujjatlar_soni} ta
                </span>
              </div>
            ))}
            {populatedKategoriyalar.length === 0 ? (
              <p className="text-sm text-slate-400">Hali kategoriyalar bo'yicha hujjatlar mavjud emas.</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mb-5 flex w-fit gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        {(
          [
            { key: "xodimlar", label: "Xodimlar", icon: <TeamOutlined /> },
            { key: "hujjatlar", label: "Hujjatlar", icon: <FileOutlined /> },
            { key: "obyektlar", label: "Obyektlar", icon: <CheckCircleOutlined /> },
          ] as { key: TabKey; label: string; icon: React.ReactNode }[]
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === tab.key
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "xodimlar" ? (
        overview?.xodimlar.length ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {["#", "F.I.O", "Lavozim", "Holati"].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {overview.xodimlar.map((xodim) => (
                  <tr
                    key={xodim.id}
                    className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3.5 text-xs font-medium text-slate-400">{xodim.id}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-slate-700">{xodim.fio}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-600">{xodim.lavozim}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          xodim.is_active
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            xodim.is_active ? "bg-emerald-400" : "bg-slate-300"
                          }`}
                        />
                        {xodim.is_active ? "Aktiv" : "Nofaol"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="Bu boshqarmada xodimlar topilmadi" />
        )
      ) : null}

      {activeTab === "hujjatlar" ? (
        overview?.hujjatlar.length ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {[
                    "#",
                    "Nomi",
                    "Kategoriya",
                    "Obyekt",
                    "Yuklovchi",
                    "Yuklangan sana",
                    "Holati",
                  ].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {overview.hujjatlar.map((doc) => {
                  const holat = HOLAT_CONFIG[doc.holat] ?? HOLAT_CONFIG.arxiv;
                  return (
                    <tr
                      key={doc.id}
                      className="cursor-pointer border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                      onClick={() => navigate(`/hujjatlar/${doc.id}`)}
                    >
                      <td className="px-4 py-3.5 text-xs font-medium text-slate-400">{doc.id}</td>
                      <td className="px-4 py-3.5">
                        <div className="max-w-[220px]">
                          <p className="line-clamp-2 text-sm font-semibold text-slate-700">
                            {doc.nomi}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {doc.fayl_turi || "Fayl turi yo'q"} • muddat {formatDate(doc.muddat)}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="max-w-[240px]">
                          <p className="text-sm text-slate-700">{doc.kategoriya_full_path || doc.kategoriya_nomi || "—"}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-600">{doc.obyekt_nomi || "—"}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-600">{doc.yuklovchi_fio || "—"}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-600">{formatDateTime(doc.yuklangan_vaqt)}</td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${holat.bg} ${holat.text}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${holat.dot}`} />
                          {doc.holat_display}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="Bu boshqarmada hujjatlar topilmadi" />
        )
      ) : null}

      {activeTab === "obyektlar" ? (
        overview?.obyektlar.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {overview.obyektlar.map((obyekt) => (
              <button
                key={obyekt.id}
                type="button"
                onClick={() => navigate(`/obyektlar/${obyekt.id}`)}
                className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-800">{obyekt.nomi}</p>
                    <p className="mt-1 text-sm text-slate-500">{obyekt.manzil}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      STATUS_BADGE[obyekt.holat] ?? "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {obyekt.holat}
                  </span>
                </div>
                <div className="mt-5 space-y-3">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                      <span>Bajarilish</span>
                      <span>{obyekt.bajarilish_foizi}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${Math.min(100, Math.max(0, obyekt.bajarilish_foizi))}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Hujjatlar</span>
                    <span className="font-semibold">{obyekt.hujjatlar_soni} ta</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Tugash sanasi</span>
                    <span className="font-semibold">{formatDate(obyekt.tugash_sanasi)}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState title="Bu boshqarma bilan bog'langan obyektlar topilmadi" />
        )
      ) : null}

      <Modal
        title="Boshqarmani tahrirlash"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={handleEditSubmit}
        okText="Saqlash"
        cancelText="Bekor qilish"
        confirmLoading={editLoading}
      >
        <Form form={editForm} layout="vertical" requiredMark={false}>
          <Form.Item
            name="nomi"
            label="Nomi"
            rules={[{ required: true, message: "Nomi kiritilishi shart" }]}
          >
            <Input size="large" />
          </Form.Item>
          <Form.Item
            name="qisqa_nomi"
            label="Qisqa nomi"
            rules={[{ required: true, message: "Qisqa nomi kiritilishi shart" }]}
          >
            <Input size="large" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`${overview?.boshqarma.nomi || "Boshqarma"} uchun talab yaratish`}
        open={talabModalOpen}
        onCancel={() => {
          setTalabModalOpen(false);
          talabForm.resetFields();
        }}
        onOk={handleTalabCreate}
        okText="Yaratish"
        cancelText="Bekor qilish"
        confirmLoading={talabLoading}
      >
        <Form form={talabForm} layout="vertical" requiredMark={false}>
          <Form.Item
            name="mavzu"
            label="Mavzu"
            rules={[{ required: true, message: "Mavzu kiritilishi shart" }]}
          >
            <Input size="large" placeholder="Talab mavzusi" />
          </Form.Item>
          <Form.Item name="kategoriya" label="Kategoriya">
            <Select
              size="large"
              allowClear
              placeholder="Kategoriya tanlang"
              options={availableKategoriyalar.map((item) => ({
                value: item.id,
                label: item.full_path,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="mazmun"
            label="Mazmun"
            rules={[{ required: true, message: "Mazmun kiritilishi shart" }]}
          >
            <Input.TextArea rows={4} placeholder="Talab mazmuni" />
          </Form.Item>
          <Form.Item
            name="muddat"
            label="Muddat"
            rules={[{ required: true, message: "Muddat kiritilishi shart" }]}
          >
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BoshqarmaSinglePage;
