import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, Modal, Form, Input, message } from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  TeamOutlined,
  FileOutlined,
  FileDoneOutlined,
  ClockCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  WarningOutlined,
  MinusCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import api from "@/services/api/axios";

interface UserType {
  id: number;
  fio: string;
  lavozim: string;
  boshqarma_nomi: string;
  is_active: boolean;
}

interface HujjatType {
  id: number;
  nomi: string;
  obyekt_nomi: string;
  kategoriya_nomi: string;
  boshqarma_nomi: string;
  holat: string;
  holat_display: string;
  muddat: string;
  fayl_turi: string;
  is_kechikkan: boolean;
  yuklangan_vaqt: string;
}

interface BoshqarmaType {
  id: number;
  nomi: string;
  qisqa_nomi: string;
}

interface StatistikaType {
  xodimlar_soni: number;
  hujjatlar_soni: number;
  jarimalar_soni: number;
  jami_minus: number;
  bajarilmagan_topshiriqlar: number;
}

interface BoshqarmaUpdatePayload {
  nomi: string;
  qisqa_nomi: string;
}

type TabKey = "xodimlar" | "hujjatlar";

const HOLAT_CONFIG: Record<
  string,
  { bg: string; text: string; dot: string; label: string }
> = {
  tasdiqlandi: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    dot: "bg-emerald-400",
    label: "Tasdiqlandi",
  },
  kutilmoqda: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    dot: "bg-amber-400",
    label: "Kutilmoqda",
  },
  rad_etildi: {
    bg: "bg-red-50",
    text: "text-red-500",
    dot: "bg-red-400",
    label: "Rad etildi",
  },
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
    key: "jarimalar_soni" as keyof StatistikaType,
    label: "Jarimalar",
    icon: <WarningOutlined />,
    bg: "bg-amber-50",
    text: "text-amber-600",
    iconBg: "bg-amber-100",
  },
  {
    key: "jami_minus" as keyof StatistikaType,
    label: "Jami minus",
    icon: <MinusCircleOutlined />,
    bg: "bg-red-50",
    text: "text-red-500",
    iconBg: "bg-red-100",
  },
  {
    key: "bajarilmagan_topshiriqlar" as keyof StatistikaType,
    label: "Bajarilmagan topshiriqlar",
    icon: <ExclamationCircleOutlined />,
    bg: "bg-orange-50",
    text: "text-orange-500",
    iconBg: "bg-orange-100",
  },
];

const BoshqarmaSinglePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabKey>("xodimlar");

  const [users, setUsers] = useState<UserType[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [hujjatlar, setHujjatlar] = useState<HujjatType[]>([]);
  const [hujjatlarLoading, setHujjatlarLoading] = useState(false);

  const [statistika, setStatistika] = useState<StatistikaType | null>(null);
  const [statistikaLoading, setStatistikaLoading] = useState(false);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editFetchLoading, setEditFetchLoading] = useState(false);
  const [form] = Form.useForm<BoshqarmaUpdatePayload>();

  const fetchBoshqarmaDetail = async () => {
    try {
      setEditFetchLoading(true);
      const res = await api.get<BoshqarmaType>(`core/boshqarmalar/${id}/`);
      form.setFieldsValue({
        nomi: res.data.nomi,
        qisqa_nomi: res.data.qisqa_nomi,
      });
    } catch (error) {
      console.error("Error fetching boshqarma detail:", error);
      message.error("Ma'lumotlarni yuklashda xatolik yuz berdi");
    } finally {
      setEditFetchLoading(false);
    }
  };

  const handleEditOpen = () => {
    setEditModalOpen(true);
    fetchBoshqarmaDetail();
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await api.get(`auth/users/?boshqarma=${id}`);
      setUsers(res.data.results);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchHujjatlar = async () => {
    try {
      setHujjatlarLoading(true);
      const res = await api.get(
        `hujjatlar/boshqarma_hujjatlari/?boshqarma=${id}`,
      );
      setHujjatlar(res.data);
    } catch (error) {
      console.error("Error fetching hujjatlar:", error);
    } finally {
      setHujjatlarLoading(false);
    }
  };

  const fetchStatistika = async () => {
    try {
      setStatistikaLoading(true);
      const res = await api.get<StatistikaType>(
        `core/boshqarmalar/${id}/statistika/`,
      );
      setStatistika(res.data);
    } catch (error) {
      console.error("Error fetching statistika:", error);
    } finally {
      setStatistikaLoading(false);
    }
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      setEditLoading(true);
      await api.put(`core/boshqarmalar/${id}/`, values);
      message.success("Boshqarma muvaffaqiyatli yangilandi");
      setEditModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error("Error updating boshqarma:", error);
      message.error("Yangilashda xatolik yuz berdi");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`core/boshqarmalar/${id}/`);
      message.success("Boshqarma muvaffaqiyatli o'chirildi");
      navigate("/boshqarma");
    } catch (error) {
      console.error("Error deleting boshqarma:", error);
      message.error("O'chirishda xatolik yuz berdi");
    }
  };

  const handleEditCancel = () => {
    setEditModalOpen(false);
    form.resetFields();
  };

  useEffect(() => {
    if (id) {
      fetchUsers();
      fetchHujjatlar();
      fetchStatistika();
    }
  }, [id]);

  const isLoading = activeTab === "xodimlar" ? usersLoading : hujjatlarLoading;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("uz-UZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const getHolatConfig = (holat: string) =>
    HOLAT_CONFIG[holat] ?? {
      bg: "bg-slate-100",
      text: "text-slate-500",
      dot: "bg-slate-300",
      label: holat,
    };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8 rounded-xl">
      {/* Back + header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors mb-3 cursor-pointer"
        >
          <ArrowLeftOutlined className="text-[10px]" />
          Boshqarmalar
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
              {activeTab === "xodimlar"
                ? "Xodimlar ro'yxati"
                : "Hujjatlar ro'yxati"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Edit button */}
            <button
              onClick={handleEditOpen}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-full transition-colors cursor-pointer"
            >
              <EditOutlined className="text-[11px]" />
              Tahrirlash
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-full transition-colors cursor-pointer"
            >
              <DeleteOutlined className="text-[11px]" />
              O'chirish
            </button>
          </div>
        </div>
      </div>

      {/* ── STATISTIKA CARDS ── */}
      <div className="mb-6">
        {statistikaLoading ? (
          <div className="flex justify-center items-center py-8">
            <Spin size="small" />
          </div>
        ) : statistika ? (
          <div className="grid grid-cols-5 gap-3">
            {STAT_CARDS.map((card) => (
              <div
                key={card.key}
                className={`${card.bg} rounded-2xl px-4 py-4 flex items-center gap-3 border border-white shadow-sm`}
              >
                <div
                  className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center flex-shrink-0 ${card.text} text-base`}
                >
                  {card.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 leading-none mb-1 truncate">
                    {card.label}
                  </p>
                  <p className={`text-xl font-bold leading-none ${card.text}`}>
                    {statistika[card.key]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-white border border-slate-200 rounded-xl p-1 w-fit shadow-sm">
        {(
          [
            { key: "xodimlar", label: "Xodimlar", icon: <TeamOutlined /> },
            { key: "hujjatlar", label: "Hujjatlar", icon: <FileOutlined /> },
          ] as { key: TabKey; label: string; icon: React.ReactNode }[]
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
              activeTab === tab.key
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center items-center py-32">
          <Spin size="large" />
        </div>
      ) : activeTab === "xodimlar" ? (
        /* ── USERS TABLE ── */
        users.length === 0 ? (
          <EmptyState
            icon={<TeamOutlined />}
            text="Bu boshqarmada xodimlar yo'q"
          />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["#", "F.I.O", "Lavozim", "Boshqarma", "Holati"].map(
                    (col) => (
                      <th
                        key={col}
                        className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400"
                      >
                        {col}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => navigate(`/users/${user.id}`)}
                    className="border-b border-slate-100 last:border-b-0 cursor-pointer hover:bg-slate-50 transition-colors duration-100"
                  >
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-medium text-slate-400 tabular-nums">
                        {user.id}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                          {user.avatar ? (
                            <img
                              className="rounded-full w-full h-full"
                              src={user.avatar.replace("http", "https")}
                            />
                          ) : (
                            <UserOutlined className="text-slate-400 text-xs" />
                          )}
                        </div>
                        <span className="text-sm font-semibold text-slate-700">
                          {user.fio}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">
                        {user.lavozim}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-slate-600">
                        {user.boshqarma_nomi}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {user.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Aktiv
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          Nofaol
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : /* ── HUJJATLAR TABLE ── */
      hujjatlar.length === 0 ? (
        <EmptyState
          icon={<FileDoneOutlined />}
          text="Bu boshqarmada hujjatlar yo'q"
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {[
                  "#",
                  "Nomi",
                  "Obyekt",
                  "Kategoriya",
                  "Fayl turi",
                  "Muddat",
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
              {hujjatlar.map((doc) => {
                const holat = getHolatConfig(doc.holat);
                return (
                  <tr
                    key={doc.id}
                    className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors duration-100 cursor-pointer"
                    onClick={() => navigate(`/hujjatlar/${doc.id}`)}
                  >
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-medium text-slate-400 tabular-nums">
                        {doc.id}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 max-w-[220px]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <FileOutlined className="text-slate-400 text-xs" />
                        </div>
                        <button className="text-sm text-start cursor-pointer hover:underline hover:text-slate-900 font-semibold text-slate-700 line-clamp-2">
                          {doc.nomi}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 max-w-[160px]">
                      <span className="text-sm text-slate-600 line-clamp-2">
                        {doc.obyekt_nomi}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-600">
                        {doc.kategoriya_nomi}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 font-mono">
                        {doc.fayl_turi}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {doc.is_kechikkan && (
                          <ClockCircleOutlined className="text-red-400 text-xs" />
                        )}
                        <span
                          className={`text-xs font-medium tabular-nums ${
                            doc.is_kechikkan ? "text-red-500" : "text-slate-500"
                          }`}
                        >
                          {formatDate(doc.muddat)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${holat.bg} ${holat.text}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${holat.dot}`}
                        />
                        {doc.holat_display}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-1">
            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
              <EditOutlined className="text-slate-500 text-xs" />
            </div>
            <span className="text-sm font-semibold text-slate-700">
              Boshqarmani tahrirlash
            </span>
          </div>
        }
        open={editModalOpen}
        onCancel={handleEditCancel}
        onOk={handleEditSubmit}
        okText="Saqlash"
        cancelText="Bekor qilish"
        confirmLoading={editLoading}
        okButtonProps={{
          className: "bg-slate-800 hover:bg-slate-700 border-slate-800",
        }}
        width={440}
        centered
      >
        <Spin spinning={editFetchLoading}>
          <Form
            form={form}
            layout="vertical"
            className="mt-4"
            requiredMark={false}
          >
            <Form.Item
              name="nomi"
              label={
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Nomi
                </span>
              }
              rules={[{ required: true, message: "Nomi kiritilishi shart" }]}
            >
              <Input
                placeholder="Boshqarma nomini kiriting"
                className="rounded-lg text-sm"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="qisqa_nomi"
              label={
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Qisqa nomi
                </span>
              }
              rules={[
                { required: true, message: "Qisqa nomi kiritilishi shart" },
              ]}
            >
              <Input
                placeholder="Qisqa nomini kiriting"
                className="rounded-lg text-sm"
                size="large"
              />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
};

/* ── Reusable empty state ── */
const EmptyState = ({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-20 gap-3">
    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 text-xl">
      {icon}
    </div>
    <p className="text-sm text-slate-400 font-medium">{text}</p>
  </div>
);

export default BoshqarmaSinglePage;
