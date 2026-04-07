import { useState, useEffect } from "react";
import {
  Input,
  Select,
  Button,
  Modal,
  Form,
  notification,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  FileTextOutlined,
  PlusOutlined,
  SendOutlined,
  InboxOutlined,
  UnorderedListOutlined,
  CheckOutlined,
  CloseOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "@/services/api/axios";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import Can from "@/shared/components/guards/Can";
import { usePermissions } from "@/features/auth/hooks/usePermissions";

const { Option } = Select;
const { TextArea } = Input;

// ── Types ──────────────────────────────────────────────────────────────────────

interface Talab {
  id: number;
  mavzu: string;
  sorovchi_boshqarma_nomi: string;
  ijrochi_boshqarma_nomi: string;
  status: string;
  status_display: string;
  muddat: string;
  is_kechikkan: boolean;
  created_at: string;
}

interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface TalabCreatePayload {
  ijrochi_boshqarma: number;
  kategoriya: number;
  mavzu: string;
  mazmun: string;
  muddat: string;
}

interface Boshqarma {
  id: number;
  nomi: string;
  qisqa_nomi: string;
  reyting: number;
  xodimlar_soni: number;
}

interface Kategoriya {
  id: number;
  nomi: string;
  boshqarma: number;
  boshqarma_nomi: string;
  parent: number | null;
  tartib: number;
  tavsif: string;
  full_path: string;
  children: Kategoriya[];
  hujjatlar_soni: number;
}

const flattenKategoriyaTree = (
  nodes: Kategoriya[],
  prefix = "",
): Kategoriya[] =>
  nodes.flatMap((node) => {
    const full_path = prefix ? `${prefix} / ${node.nomi}` : node.nomi;
    return [
      { ...node, full_path },
      ...flattenKategoriyaTree(node.children ?? [], full_path),
    ];
  });

// ── Status config ──────────────────────────────────────────────────────────────

const statusConfig: Record<
  string,
  { color: string; icon: React.ReactNode; bg: string; border: string }
> = {
  qabul_qilindi: {
    color: "#1677ff",
    icon: <CheckCircleOutlined />,
    bg: "#e6f4ff",
    border: "#91caff",
  },
  jarayonda: {
    color: "#fa8c16",
    icon: <SyncOutlined spin />,
    bg: "#fff7e6",
    border: "#ffd591",
  },
  bajarildi: {
    color: "#52c41a",
    icon: <CheckCircleOutlined />,
    bg: "#f6ffed",
    border: "#b7eb8f",
  },
  kutilmoqda: {
    color: "#8c8c8c",
    icon: <ClockCircleOutlined />,
    bg: "#fafafa",
    border: "#d9d9d9",
  },
  yangi: {
    color: "#722ed1",
    icon: <FileTextOutlined />,
    bg: "#f9f0ff",
    border: "#d3adf7",
  },
  rad_etildi: {
    color: "#ff4d4f",
    icon: <CloseOutlined />,
    bg: "#fff1f0",
    border: "#ffa39e",
  },
};

// Status-based action guards
const canQabulQilish = (status: string) => status === "yangi";
const canRadEtish = (status: string) => status === "yangi";
const canBajarish = (status: string) =>
  status === "qabul_qilindi" || status === "jarayonda";

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const PAGE_SIZE = 10;

// ── Reusable TalabTable ────────────────────────────────────────────────────────

interface TalabTableProps {
  data: Talab[];
  loading: boolean;
  showActions?: boolean;
  onUpdateRecord?: (updated: Talab) => void;
}

const TalabTable = ({
  data,
  loading,
  showActions = false,
  onUpdateRecord,
}: TalabTableProps) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {},
  );
  const [page, setPage] = useState(1);
  const [notifApi, contextHolder] = notification.useNotification();

  const { can, role } = usePermissions();


  const setLoadingKey = (id: number, action: string, val: boolean) =>
    setActionLoading((prev) => ({ ...prev, [`${id}_${action}`]: val }));

  const isLoadingKey = (id: number, action: string) =>
    !!actionLoading[`${id}_${action}`];

  const runAction = async (
    id: number,
    action: "qabul_qilish" | "rad_etish" | "bajarish",
  ) => {
    const prompts = {
      qabul_qilish: "Talabni qabul qilasizmi?",
      rad_etish: "Talabni rad etasizmi?",
      bajarish: "Talab bajarildi deb belgilansinmi?",
    };

    if (!window.confirm(prompts[action])) {
      return;
    }

    setLoadingKey(id, action, true);
    try {
      const endpoint =
        action === "qabul_qilish"
          ? API_ENDPOINTS.TALABLAR.QABUL_QILISH(id)
          : action === "rad_etish"
            ? API_ENDPOINTS.TALABLAR.RAD_ETISH(id)
            : API_ENDPOINTS.TALABLAR.BAJARISH(id);
      const res = await api.post<Talab>(endpoint);
      onUpdateRecord?.(res.data);
      const labels = {
        qabul_qilish: "Talab qabul qilindi",
        rad_etish: "Talab rad etildi",
        bajarish: "Talab bajarildi deb belgilandi",
      };
      notifApi.success({ message: labels[action], placement: "topRight" });
    } catch {
      notifApi.error({
        message: "Xatolik",
        description: "Amalni bajarishda muammo bo'ldi.",
        placement: "topRight",
      });
    } finally {
      setLoadingKey(id, action, false);
    }
  };

  const filtered = data.filter((item) => {
    const matchSearch =
      item.mavzu.toLowerCase().includes(search.toLowerCase()) ||
      item.sorovchi_boshqarma_nomi
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      item.ijrochi_boshqarma_nomi.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, data]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      {contextHolder}

      {/* Filters */}
      <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex flex-wrap gap-3 items-center">
          <Input
            placeholder="Mavzu yoki bo'lim bo'yicha qidiring..."
            prefix={<SearchOutlined className="text-gray-300" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
            allowClear
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 170 }}
            suffixIcon={<FilterOutlined className="text-gray-400" />}
          >
            <Option value="all">Barcha statuslar</Option>
            <Option value="yangi">Yangi</Option>
            <Option value="qabul_qilindi">Qabul qilindi</Option>
            <Option value="jarayonda">Jarayonda</Option>
            <Option value="bajarildi">Bajarildi</Option>
            <Option value="kutilmoqda">Kutilmoqda</Option>
            <Option value="rad_etildi">Rad etildi</Option>
          </Select>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-400">natija</span>
            <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-blue-500 px-2 py-1 text-xs font-semibold text-white">
              {filtered.length}
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-6">
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-12 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <FileTextOutlined className="mb-3 text-4xl opacity-30" />
                <div>Ma'lumot topilmadi</div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <th className="px-4 py-3">№</th>
                        <th className="px-4 py-3">Mavzu</th>
                        <th className="px-4 py-3">So'rovchi bo'lim</th>
                        <th className="px-4 py-3">Ijrochi bo'lim</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Muddat</th>
                        {showActions ? <th className="px-4 py-3 text-right">Amallar</th> : null}
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((record) => {
                        const cfg = statusConfig[record.status] || statusConfig.kutilmoqda;
                        const hasAny =
                          canQabulQilish(record.status) ||
                          canRadEtish(record.status) ||
                          canBajarish(record.status);

                        return (
                          <tr
                            key={record.id}
                            onClick={() => navigate(`/talablar/${record.id}`)}
                            className={`cursor-pointer border-b border-slate-100 align-top last:border-b-0 ${
                              record.is_kechikkan
                                ? "bg-red-50/40 hover:bg-red-50"
                                : "hover:bg-blue-50/30"
                            }`}
                          >
                            <td className="px-4 py-3">
                              <span className="font-mono text-xs font-semibold text-gray-400">
                                #{record.id}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <FileTextOutlined className="mt-0.5 shrink-0 text-blue-400" />
                                <div>
                                  <div className="text-sm font-medium text-gray-800">
                                    {record.mavzu}
                                  </div>
                                  <div className="mt-0.5 text-xs text-gray-400">
                                    {formatDate(record.created_at)}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-sm text-gray-600">
                                {record.sorovchi_boshqarma_nomi}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="rounded-md border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-sm text-gray-600">
                                {record.ijrochi_boshqarma_nomi}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium"
                                style={{
                                  color: cfg.color,
                                  background: cfg.bg,
                                  borderColor: cfg.border,
                                }}
                              >
                                <span>{cfg.icon}</span>
                                {record.status_display}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {record.is_kechikkan ? (
                                <div
                                  title="Muddat o'tib ketgan"
                                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-500"
                                >
                                  <ExclamationCircleOutlined />
                                  <span>{formatDate(record.muddat)}</span>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-2 py-1 text-xs font-medium text-green-600">
                                  <ClockCircleOutlined />
                                  <span>{formatDate(record.muddat)}</span>
                                </div>
                              )}
                            </td>
                            {showActions ? (
                              <td className="px-4 py-3">
                                {can("canAnswerTalab") && role !== "rais" && hasAny ? (
                                  <div
                                    className="flex justify-end gap-1"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {canQabulQilish(record.status) && (
                                      <Button
                                        size="small"
                                        type="text"
                                        title="Qabul qilish"
                                        loading={isLoadingKey(record.id, "qabul_qilish")}
                                        icon={<CheckOutlined />}
                                        onClick={() => runAction(record.id, "qabul_qilish")}
                                        className="!rounded-lg !border !border-blue-200 !text-blue-500 hover:!bg-blue-50"
                                      />
                                    )}
                                    {canRadEtish(record.status) && (
                                      <Button
                                        size="small"
                                        type="text"
                                        title="Rad etish"
                                        loading={isLoadingKey(record.id, "rad_etish")}
                                        icon={<CloseOutlined />}
                                        onClick={() => runAction(record.id, "rad_etish")}
                                        className="!rounded-lg !border !border-red-200 !text-red-500 hover:!bg-red-50"
                                      />
                                    )}
                                    {canBajarish(record.status) && (
                                      <Button
                                        size="small"
                                        type="text"
                                        title="Bajarildi deb belgilash"
                                        loading={isLoadingKey(record.id, "bajarish")}
                                        icon={<PlayCircleOutlined />}
                                        onClick={() => runAction(record.id, "bajarish")}
                                        className="!rounded-lg !border !border-green-200 !text-green-600 hover:!bg-green-50"
                                      />
                                    )}
                                  </div>
                                ) : null}
                              </td>
                            ) : null}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
                  <span className="text-sm text-gray-400">
                    Jami: <strong>{filtered.length}</strong> ta talab
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      disabled={page === 1}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Oldingi
                    </button>
                    <span className="text-sm text-slate-500">
                      {page} / {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={page === totalPages}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Keyingi
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────

const Talablar = () => {
  const [allData, setAllData] = useState<Talab[]>([]);
  const [yuborgan, setYuborgan] = useState<Talab[]>([]);
  const [kelgan, setKelgan] = useState<Talab[]>([]);

  const [allLoading, setAllLoading] = useState(true);
  const [yuborganLoading, setYuborganLoading] = useState(true);
  const [kelganLoading, setKelganLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("kelgan");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [notifApi, contextHolder] = notification.useNotification();

  const [boshqarmalar, setBoshqarmalar] = useState<Boshqarma[]>([]);
  const [kategoriyalar, setKategoriyalar] = useState<Kategoriya[]>([]);
  const [formDataLoading, setFormDataLoading] = useState(false);
  const [kategoriyaLoading, setKategoriyaLoading] = useState(false);

  useEffect(() => {
    api
      .get<ApiResponse<Talab>>(API_ENDPOINTS.TALABLAR.LIST)
      .then((res) => setAllData(res.data.results))
      .catch(() =>
        notifApi.error({
          message: "Xatolik",
          description: "Talablarni yuklashda muammo bo'ldi.",
          placement: "topRight",
        }),
      )
      .finally(() => setAllLoading(false));

    api
      .get<Talab[]>(API_ENDPOINTS.TALABLAR.YUBORGAN)
      .then((res) => setYuborgan(res.data))
      .catch(() =>
        notifApi.error({
          message: "Xatolik",
          description: "Yuborgan talablarni yuklashda muammo bo'ldi.",
          placement: "topRight",
        }),
      )
      .finally(() => setYuborganLoading(false));

    api
      .get<Talab[]>(API_ENDPOINTS.TALABLAR.KELGAN)
      .then((res) => setKelgan(res.data))
      .catch(() =>
        notifApi.error({
          message: "Xatolik",
          description: "Kelgan talablarni yuklashda muammo bo'ldi.",
          placement: "topRight",
        }),
      )
      .finally(() => setKelganLoading(false));
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    if (boshqarmalar.length > 0) return;

    setFormDataLoading(true);
    api
      .get<ApiResponse<Boshqarma>>(API_ENDPOINTS.BOSHQARMA.LIST, {
        params: { all: true },
      })
      .then((res) => {
        const items = Array.isArray(res.data) ? res.data : (res.data.results ?? []);
        setBoshqarmalar(items);
      })
      .catch(() =>
        notifApi.error({
          message: "Ma'lumot yuklashda xatolik",
          description: "Bo'limlarni yuklab bo'lmadi.",
          placement: "topRight",
        }),
      )
      .finally(() => setFormDataLoading(false));
  }, [modalOpen, boshqarmalar.length, notifApi]);

  const handleBoshqarmaSelect = async (boshqarmaId: number) => {
    form.setFieldValue("ijrochi_boshqarma", boshqarmaId);
    form.setFieldValue("kategoriya", undefined);
    setKategoriyalar([]);

    if (!boshqarmaId) return;

    try {
      setKategoriyaLoading(true);
      const res = await api.get<Kategoriya[] | ApiResponse<Kategoriya>>(
        API_ENDPOINTS.KATEGORIYALAR.BOSHQARMA,
        {
          params: { boshqarma: boshqarmaId },
        },
      );
      const items = Array.isArray(res.data) ? res.data : (res.data.results ?? []);
      setKategoriyalar(flattenKategoriyaTree(items));
    } catch {
      notifApi.error({
        message: "Kategoriya yuklanmadi",
        description: "Tanlangan boshqarma uchun kategoriyalarni olishda muammo bo'ldi.",
        placement: "topRight",
      });
    } finally {
      setKategoriyaLoading(false);
    }
  };

  /** Sync updated record across all three lists */
  const handleUpdateRecord = (updated: Talab) => {
    const patch = (list: Talab[]) =>
      list.map((t) => (t.id === updated.id ? updated : t));
    setAllData(patch);
    setYuborgan(patch);
    setKelgan(patch);
  };

  const handleCreate = async (values: TalabCreatePayload) => {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        muddat: values.muddat || undefined,
      };

      const res = await api.post<Talab>(API_ENDPOINTS.TALABLAR.LIST, payload);
      setAllData((prev) => [res.data, ...prev]);
      setYuborgan((prev) => [res.data, ...prev]);
      notifApi.success({
        message: "Talab muvaffaqiyatli yaratildi",
        description: `"${values.mavzu}" talabi qo'shildi.`,
        placement: "topRight",
      });
      form.resetFields();
      setModalOpen(false);
    } catch {
      notifApi.error({
        message: "Xatolik yuz berdi",
        description:
          "Talabni yaratishda muammo bo'ldi. Qaytadan urinib ko'ring.",
        placement: "topRight",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const allStats = {
    total: allData.length,
    kechikkan: allData.filter((d) => d.is_kechikkan).length,
    jarayonda: allData.filter((d) => d.status === "jarayonda").length,
    bajarildi: allData.filter((d) => d.status === "bajarildi").length,
  };

  const tabItems = [
    {
      key: "all",
      label: (
        <Can action="rais">
          <span className="flex items-center gap-1.5">
            <UnorderedListOutlined />
            Barcha talablar
            <TabCount value={allData.length} tone="blue" />
          </span>
        </Can>
      ),
      children: (
        <Can action="rais">
          <TalabTable
            data={allData}
            loading={allLoading}
            showActions
            onUpdateRecord={handleUpdateRecord}
          />
        </Can>
      ),
    },
    {
      key: "yuborgan",
      label: (
        <span className="flex items-center gap-1.5">
          <SendOutlined />
          Yuborgan
          <TabCount value={yuborgan.length} tone="violet" />
        </span>
      ),
      children: (
        // No actions on sent items — user is the requester, not the executor
        <TalabTable data={yuborgan} loading={yuborganLoading} />
      ),
    },
    {
      key: "kelgan",
      label: (
          <span className="flex items-center gap-1.5">
            <InboxOutlined />
          Kelib tushgan
          <TabCount value={kelgan.length} tone="green" />
        </span>
      ),
      children: (
        <TalabTable
          data={kelgan}
          loading={kelganLoading}
          showActions
          onUpdateRecord={handleUpdateRecord}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6 rounded-xl">
      {contextHolder}

      {/* Create Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-1">
            <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
              <PlusOutlined className="text-white! text-xs" />
            </div>
            <span className="font-semibold text-gray-800">
              Yangi talab yaratish
            </span>
          </div>
        }
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={560}
        className="[&_.ant-modal-content]:rounded-2xl [&_.ant-modal-header]:rounded-t-2xl"
        destroyOnClose
      >
        {formDataLoading ? (
          <div className="space-y-3 py-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-11 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreate}
            className="pt-2"
            requiredMark={false}
          >
            <Form.Item
              label={
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Mavzu
                </span>
              }
              name="mavzu"
              rules={[{ required: true, message: "Mavzuni kiriting" }]}
            >
              <Input
                placeholder="Talab mavzusini kiriting..."
                size="large"
                className="rounded-lg"
              />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label={
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Ijrochi bo'lim
                  </span>
                }
                name="ijrochi_boshqarma"
                rules={[{ required: true, message: "Bo'limni tanlang" }]}
              >
                <Select
                  placeholder="Bo'limni tanlang"
                  size="large"
                  showSearch
                  optionFilterProp="children"
                  className="rounded-lg"
                  onChange={handleBoshqarmaSelect}
                >
                  {boshqarmalar.map((b) => (
                    <Option key={b.id} value={b.id}>
                      {b.nomi}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Kategoriya
                  </span>
                }
                name="kategoriya"
              >
                <Select
                  placeholder="Kategoriya"
                  size="large"
                  showSearch
                  loading={kategoriyaLoading}
                  disabled={!form.getFieldValue("ijrochi_boshqarma") || kategoriyaLoading}
                  optionFilterProp="children"
                  className="rounded-lg"
                >
                  {kategoriyalar.map((k) => (
                    <Option key={k.id} value={k.id}>
                      {k.full_path || k.nomi}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            <Form.Item
              label={
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Mazmun
                </span>
              }
              name="mazmun"
              rules={[{ required: true, message: "Mazmunni kiriting" }]}
            >
              <TextArea
                placeholder="Talab mazmunini batafsil yozing..."
                rows={4}
                className="rounded-lg resize-none"
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Muddat
                </span>
              }
              name="muddat"
              rules={[{ required: true, message: "Muddatni tanlang" }]}
            >
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500"
              />
            </Form.Item>

            <div className="flex gap-3 justify-end pt-2 border-t border-slate-100 mt-2">
              <Button
                onClick={() => {
                  setModalOpen(false);
                  form.resetFields();
                }}
                className="border-slate-200 text-gray-500 rounded-lg px-5"
                size="large"
              >
                Bekor qilish
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                icon={<PlusOutlined />}
                size="large"
                className="rounded-lg px-6 bg-blue-500 hover:bg-blue-600 border-0 shadow-sm"
              >
                Yaratish
              </Button>
            </div>
          </Form>
        )}
      </Modal>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-3xl font-semibold text-gray-800">
              Talablar
            </h1>
            <p className="text-sm text-gray-400">
              Barcha so'rovlar va talablar ro'yxati
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Can action="canCreateTalab">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setModalOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 border-0 shadow-sm rounded-lg!"
              >
                Talab yaratish
              </Button>
            </Can>
          </div>
        </div>
      </div>

      {/* Stats — only for canCreate role */}
      <Can action="canSeeTalablar">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Jami talablar",
              value: allStats.total,
              color: "#1677ff",
              bg: "from-blue-500 to-indigo-500",
            },
            {
              label: "Jarayonda",
              value: allStats.jarayonda,
              color: "#fa8c16",
              bg: "from-orange-400 to-amber-400",
            },
            {
              label: "Bajarildi",
              value: allStats.bajarildi,
              color: "#52c41a",
              bg: "from-green-400 to-emerald-500",
            },
            {
              label: "Kechikkan",
              value: allStats.kechikkan,
              color: "#ff4d4f",
              bg: "from-red-400 to-rose-500",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
            >
              <div
                className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${stat.bg}`}
              />
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                {stat.label}
              </p>
              <p
                className="mt-2 text-3xl font-bold leading-none"
                style={{ color: stat.color }}
              >
                {allLoading ? "-" : stat.value}
              </p>
            </div>
          ))}
        </div>
      </Can>

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
        {tabItems.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.key
                ? "bg-blue-50 text-blue-600"
                : "text-gray-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabItems.find((tab) => tab.key === activeTab)?.children}
    </div>
  );
};

const TabCount = ({
  value,
  tone,
}: {
  value: number;
  tone: "blue" | "violet" | "green";
}) => {
  const toneClass = {
    blue: "bg-blue-500",
    violet: "bg-violet-600",
    green: "bg-green-500",
  }[tone];

  return (
    <span
      className={`ml-1 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold text-white ${toneClass}`}
    >
      {value}
    </span>
  );
};

export default Talablar;
