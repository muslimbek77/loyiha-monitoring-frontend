import { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Badge,
  Input,
  Select,
  Button,
  Tooltip,
  Space,
  Card,
  Statistic,
  Typography,
  Skeleton,
  Modal,
  Form,
  DatePicker,
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
  ReloadOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import api from "@/services/api/axios";
import Can from "@/shared/components/guards/Can";

const { Title, Text } = Typography;
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

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Fetch all pages using the axios instance */
async function fetchAllPages<T>(endpoint: string): Promise<T[]> {
  const results: T[] = [];
  let url: string | null = endpoint;

  while (url) {
    // If url is a full URL (next page), axios baseURL would double-prefix it,
    // so extract just the path+query after /api/v1/
    const path = url.includes("/api/v1/") ? url.split("/api/v1/")[1] : url;

    const res = await api.get<ApiResponse<T>>(path);
    results.push(...res.data.results);
    url = res.data.next;
  }

  return results;
}

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
};

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

// ── Component ──────────────────────────────────────────────────────────────────

const Talablar = () => {
  const [data, setData] = useState<Talab[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [notifApi, contextHolder] = notification.useNotification();

  const [boshqarmalar, setBoshqarmalar] = useState<Boshqarma[]>([]);
  const [kategoriyalar, setKategoriyalar] = useState<Kategoriya[]>([]);
  const [formDataLoading, setFormDataLoading] = useState(false);

  const navigate = useNavigate();

  // Load talablar list
  useEffect(() => {
    api
      .get<ApiResponse<Talab>>("talablar/")
      .then((res) => setData(res.data.results))
      .catch(() => {
        notifApi.error({
          message: "Xatolik",
          description: "Talablarni yuklashda muammo bo'ldi.",
          placement: "topRight",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  // Load boshqarmalar + kategoriyalar lazily when modal first opens
  useEffect(() => {
    if (!modalOpen) return;
    if (boshqarmalar.length > 0 && kategoriyalar.length > 0) return;

    setFormDataLoading(true);
    Promise.all([
      fetchAllPages<Boshqarma>("core/boshqarmalar/"),
      fetchAllPages<Kategoriya>("hujjatlar/kategoriyalar/"),
    ])
      .then(([boshs, kats]) => {
        setBoshqarmalar(boshs);
        setKategoriyalar(kats);
      })
      .catch(() => {
        notifApi.error({
          message: "Ma'lumot yuklashda xatolik",
          description: "Bo'limlar yoki kategoriyalarni yuklab bo'lmadi.",
          placement: "topRight",
        });
      })
      .finally(() => setFormDataLoading(false));
  }, [modalOpen]);

  const handleCreate = async (values: TalabCreatePayload) => {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        muddat: values.muddat
          ? values.muddat.format("YYYY-MM-DD")
          : undefined,
      };

      const res = await api.post<Talab>("talablar/", payload);
      setData((prev) => [res.data, ...prev]);
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

  const stats = {
    total: data.length,
    kechikkan: data.filter((d) => d.is_kechikkan).length,
    jarayonda: data.filter((d) => d.status === "jarayonda").length,
    bajarildi: data.filter((d) => d.status === "bajarildi").length,
  };

  const columns: ColumnsType<Talab> = [
    {
      title: "№",
      dataIndex: "id",
      key: "id",
      width: 60,
      render: (id) => (
        <span className="font-mono text-xs text-gray-400 font-semibold">
          #{id}
        </span>
      ),
    },
    {
      title: "Mavzu",
      dataIndex: "mavzu",
      key: "mavzu",
      render: (mavzu, record) => (
        <div className="flex items-center gap-2">
          <FileTextOutlined className="text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-medium text-gray-800 text-sm">{mavzu}</div>
            <div className="text-xs text-gray-400 mt-0.5">
              {formatDate(record.created_at)} da yaratildi
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "So'rovchi bo'lim",
      dataIndex: "sorovchi_boshqarma_nomi",
      key: "sorovchi",
      render: (val) => (
        <span className="text-sm text-gray-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
          {val}
        </span>
      ),
    },
    {
      title: "Ijrochi bo'lim",
      dataIndex: "ijrochi_boshqarma_nomi",
      key: "ijrochi",
      render: (val) => (
        <span className="text-sm text-gray-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
          {val}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status, record) => {
        const cfg = statusConfig[status] || statusConfig.kutilmoqda;
        return (
          <Tag
            icon={cfg.icon}
            style={{
              color: cfg.color,
              background: cfg.bg,
              borderColor: cfg.border,
              borderRadius: 20,
              padding: "2px 10px",
              fontWeight: 500,
              fontSize: 12,
            }}
          >
            {record.status_display}
          </Tag>
        );
      },
    },
    {
      title: "Muddat",
      dataIndex: "muddat",
      key: "muddat",
      width: 150,
      render: (muddat, record) => (
        <div className="flex items-center gap-1.5">
          {record.is_kechikkan ? (
            <Tooltip title="Muddat o'tib ketgan">
              <div className="flex items-center gap-1 bg-red-50 border border-red-200 text-red-500 rounded-lg px-2 py-1 text-xs font-medium">
                <ExclamationCircleOutlined />
                <span>{formatDate(muddat)}</span>
              </div>
            </Tooltip>
          ) : (
            <div className="flex items-center gap-1 bg-green-50 border border-green-200 text-green-600 rounded-lg px-2 py-1 text-xs font-medium">
              <ClockCircleOutlined />
              <span>{formatDate(muddat)}</span>
            </div>
          )}
        </div>
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
              <PlusOutlined className="text-white text-xs" />
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
        <Skeleton active loading={formDataLoading} paragraph={{ rows: 6 }}>
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
                rules={[{ required: true, message: "Kategoriyani tanlang" }]}
              >
                <Select
                  placeholder="Kategoriya"
                  size="large"
                  showSearch
                  optionFilterProp="children"
                  className="rounded-lg"
                >
                  {kategoriyalar.map((k) => (
                    <Option key={k.id} value={k.id}>
                      {k.boshqarma_nomi || k.nomi}
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
              <DatePicker
                placeholder="Sanani tanlang"
                size="large"
                className="w-full rounded-lg"
                format="YYYY-MM-DD"
                // onChange={(date) => {
                //   form.setFieldValue(
                //     "muddat",
                //     date ? date.format("YYYY-MM-DD") : undefined,
                //   );
                // }}
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
        </Skeleton>
      </Modal>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <div>
            <Title level={3} className="mb-0! text-gray-800!">
              Talablar
            </Title>
            <Text className="text-gray-400 text-sm">
              Barcha so'rovlar va talablar ro'yxati
            </Text>
          </div>
          <Space>
            <Can action="canCreate">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setModalOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 border-0 shadow-sm rounded-lg!"
              >
                Yangi talab
              </Button>
            </Can>
          </Space>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Jami talablar",
            value: stats.total,
            color: "#1677ff",
            bg: "from-blue-500 to-indigo-500",
          },
          {
            label: "Jarayonda",
            value: stats.jarayonda,
            color: "#fa8c16",
            bg: "from-orange-400 to-amber-400",
          },
          {
            label: "Bajarildi",
            value: stats.bajarildi,
            color: "#52c41a",
            bg: "from-green-400 to-emerald-500",
          },
          {
            label: "Kechikkan",
            value: stats.kechikkan,
            color: "#ff4d4f",
            bg: "from-red-400 to-rose-500",
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="border-0! shadow-sm! overflow-hidden relative"
            bodyStyle={{ padding: "16px 20px" }}
          >
            <div
              className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${stat.bg}`}
            />
            <Statistic
              title={
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                  {stat.label}
                </span>
              }
              value={loading ? "-" : stat.value}
              valueStyle={{
                color: stat.color,
                fontSize: 28,
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            />
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card
        className="!border-slate-200 !shadow-sm mb-5!"
        bodyStyle={{ padding: "12px 16px" }}
      >
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
            <Option value="qabul_qilindi">Qabul qilindi</Option>
            <Option value="jarayonda">Jarayonda</Option>
            <Option value="bajarildi">Bajarildi</Option>
            <Option value="kutilmoqda">Kutilmoqda</Option>
          </Select>
          <Space className="ml-auto">
            <Badge
              count={filtered.length}
              showZero
              style={{ backgroundColor: "#1677ff" }}
            >
              <span className="text-xs text-gray-400 pr-2">natija</span>
            </Badge>
          </Space>
        </div>
      </Card>

      {/* Table */}
      <Card className="!border-slate-200 !shadow-sm" bodyStyle={{ padding: 0 }}>
        {loading ? (
          <div className="p-6">
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
        ) : (
          <Table
            dataSource={filtered}
            columns={columns}
            rowKey="id"
            onRow={(record) => ({
              onClick: () => navigate(`/talablar/${record.id}`),
              style: { cursor: "pointer" },
            })}
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
              showTotal: (total) => (
                <span className="text-gray-400 text-sm">
                  Jami: <strong>{total}</strong> ta talab
                </span>
              ),
            }}
            rowClassName={(record) =>
              record.is_kechikkan
                ? "bg-red-50/40 hover:bg-red-50"
                : "hover:bg-blue-50/30"
            }
            className="[&_.ant-table-thead_th]:bg-slate-50 [&_.ant-table-thead_th]:text-gray-500 [&_.ant-table-thead_th]:text-xs [&_.ant-table-thead_th]:font-semibold [&_.ant-table-thead_th]:uppercase [&_.ant-table-thead_th]:tracking-wide [&_.ant-table-thead_th]:border-b [&_.ant-table-thead_th]:border-slate-200"
            locale={{
              emptyText: (
                <div className="py-12 text-center text-gray-400">
                  <FileTextOutlined className="text-4xl mb-3 opacity-30" />
                  <div>Ma'lumot topilmadi</div>
                </div>
              ),
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default Talablar;
