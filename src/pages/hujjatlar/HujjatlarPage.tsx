import { useEffect, useState, useCallback } from "react";
import {
  Table,
  Pagination,
  Spin,
  Form,
  message,
  Modal,
  Input,
  DatePicker,
  Upload,
  Button,
  Select,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import api from "@/services/api/axios";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import { useNavigate } from "react-router-dom";
import {
  PlusOutlined,
  UploadOutlined,
  FileTextOutlined,
  SearchOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

interface Hujjat {
  id: number;
  nomi: string;
  kategoriya_nomi: string;
  boshqarma_nomi: string;
  obyekt_nomi: string;
  fayl_turi: string;
  holat: string;
  holat_display: string;
  muddat: string;
  yuklangan_vaqt: string;
  is_kechikkan: boolean;
}

interface SelectOption {
  value: string;
  label: string;
}

interface Filters {
  search: string;
  holat: string;
  boshqarma: string;
  obyekt: string;
  ordering: string;
}

const holatColor: Record<string, { bg: string; text: string; dot: string }> = {
  default: { bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400" },
  kutilmoqda: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    dot: "bg-amber-400",
  },
  tasdiqlandi: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    dot: "bg-emerald-400",
  },
  rad_etildi: { bg: "bg-rose-50", text: "text-rose-500", dot: "bg-rose-400" },
  arxiv: { bg: "bg-slate-50", text: "text-slate-600", dot: "bg-slate-400" },
};

const HOLAT_OPTIONS = [
  { value: "kutilmoqda", label: "Kutilmoqda" },
  { value: "tasdiqlandi", label: "Tasdiqlandi" },
  { value: "rad_etildi", label: "Rad etildi" },
  { value: "arxiv", label: "Arxiv" },
];

const ORDERING_OPTIONS = [
  { value: "-yuklangan_vaqt", label: "Eng yangi" },
  { value: "yuklangan_vaqt", label: "Eng eski" },
  { value: "nomi", label: "Nomi (A-Z)" },
  { value: "-nomi", label: "Nomi (Z-A)" },
  { value: "muddat", label: "Muddat (yaqin)" },
  { value: "-muddat", label: "Muddat (uzoq)" },
];

const HolatBadge = ({ holat, label }: { holat: string; label: string }) => {
  const style = holatColor[holat] ?? holatColor.default;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {label}
    </span>
  );
};

const defaultFilters: Filters = {
  search: "",
  holat: "",
  boshqarma: "",
  obyekt: "",
  ordering: "-yuklangan_vaqt",
};

const HujjatlarPage = () => {
  const [data, setData] = useState<Hujjat[]>([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [boshqarmalarOptions, setBoshqarmalarOptions] = useState<
    SelectOption[]
  >([]);
  const [obyektlarOptions, setObyektlarOptions] = useState<SelectOption[]>([]);
  // Add these new states inside HujjatlarPage:
  const [kategoriyalarOptions, setKategoriyalarOptions] = useState<
    SelectOption[]
  >([]);
  const [kategoriyaLoading, setKategoriyaLoading] = useState(false);

  // Add this handler:
  const handleBoshqarmaChange = async (val: string) => {
    form.setFieldValue("boshqarma", val);
    form.setFieldValue("kategoriya", undefined); // reset kategoriya
    setKategoriyalarOptions([]);
    if (!val) return;
    try {
      setKategoriyaLoading(true);
      const res = await api.get(
        `/hujjatlar/boshqarma_kategoriyalar/?boshqarma=${val}`,
      );
      // API returns tree structure — flatten it
      const flatten = (nodes: any[]): SelectOption[] =>
        nodes.flatMap((n) => [
          { value: String(n.id), label: n.nomi },
          ...(n.children ? flatten(n.children) : []),
        ]);
      const results = res.data?.results ?? res.data;
      setKategoriyalarOptions(
        flatten(Array.isArray(results) ? results : [results]),
      );
    } catch (e) {
      console.error(e);
    } finally {
      setKategoriyaLoading(false);
    }
  };

  const [form] = Form.useForm();
  const navigate = useNavigate();

  const activeFilterCount = Object.entries(filters).filter(
    ([key, val]) => val && key !== "ordering",
  ).length;

  // Fetch boshqarmalar options
  useEffect(() => {
    api
      .get("/core/boshqarmalar/")
      .then((res) => {
        const results = res.data?.results ?? res.data;
        setBoshqarmalarOptions(
          results.map((b: any) => ({ value: String(b.id), label: b.nomi })),
        );
      })
      .catch(console.error);
  }, []);

  // Fetch obyektlar options
  useEffect(() => {
    api
      .get("/obyektlar/")
      .then((res) => {
        const results = res.data?.results ?? res.data;
        setObyektlarOptions(
          results.map((o: any) => ({ value: String(o.id), label: o.nomi })),
        );
      })
      .catch(console.error);
  }, []);

  const buildQueryString = (f: Filters, pageNumber: number) => {
    const params = new URLSearchParams();
    params.set("page", String(pageNumber));
    if (f.search) params.set("search", f.search);
    if (f.holat) params.set("holat", f.holat);
    if (f.boshqarma) params.set("boshqarma", f.boshqarma);
    if (f.obyekt) params.set("obyekt", f.obyekt);
    if (f.ordering) params.set("ordering", f.ordering);
    return params.toString();
  };

  const fetchHujjatlarData = useCallback(
    async (pageNumber = 1, activeFilters = filters) => {
      try {
        setLoading(true);
        const qs = buildQueryString(activeFilters, pageNumber);
        const response = await api.get(`${API_ENDPOINTS.HUJJATLAR.LIST}?${qs}`);
        setData(response.data.results);
        setCount(response.data.count);
      } catch (error) {
        console.error("Error fetching hujjatlar data:", error);
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    fetchHujjatlarData(page, filters);
  }, [page, filters]);

  const setFilter = (key: keyof Filters, val: string) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    setPage(1);
  };

  const columns: ColumnsType<Hujjat> = [
    {
      title: "Nomi",
      dataIndex: "nomi",
      render: (_, record) => (
        <button
          onClick={() => navigate(`/hujjatlar/${record.id}`)}
          className="flex items-center gap-2 text-left group cursor-pointer!"
        >
          <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 transition-colors">
            <FileTextOutlined className="text-slate-400 group-hover:text-blue-500 text-xs transition-colors" />
          </span>
          <span className="text-slate-700 font-medium group-hover:text-blue-600 transition-colors text-sm">
            {record.nomi}
          </span>
        </button>
      ),
    },
    {
      title: "Obyekt",
      dataIndex: "obyekt_nomi",
      render: (val) => <span className="text-slate-600 text-sm">{val}</span>,
    },
    {
      title: "Boshqarma",
      dataIndex: "boshqarma_nomi",
      render: (val) => <span className="text-slate-600 text-sm">{val}</span>,
    },
    {
      title: "Kategoriya",
      dataIndex: "kategoriya_nomi",
      render: (val) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">
          {val}
        </span>
      ),
    },
    {
      title: "Holat",
      dataIndex: "holat_display",
      render: (val, record) => <HolatBadge holat={record.holat} label={val} />,
    },
  ];

  const handleCreateHujjat = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append("obyekt", values.obyekt);
      formData.append("kategoriya", values.kategoriya);
      formData.append("nomi", values.nomi);
      formData.append("muddat", dayjs(values.muddat).format("YYYY-MM-DD"));
      formData.append("izoh", values.izoh || "");
      formData.append("boshqarma", values.boshqarma);
      if (values.fayl?.fileList?.length > 0) {
        formData.append("fayl", values.fayl.fileList[0].originFileObj);
      }
      await api.post(API_ENDPOINTS.HUJJATLAR.LIST, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      message.success("Hujjat muvaffaqiyatli qo'shildi");
      setIsModalOpen(false);
      form.resetFields();
      fetchHujjatlarData(page, filters);
    } catch (error) {
      console.error("Create error:", error);
      message.error("Hujjat qo'shishda xatolik");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8 rounded-xl">
      {/* Page header */}
      <div className="mb-6">
        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.2em] mb-1">
          Hujjatlar boshqaruvi
        </p>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
            Hujjatlar
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-xl transition-colors duration-150 cursor-pointer!"
          >
            <PlusOutlined className="text-xs" />
            Yangi Hujjat
          </button>
        </div>
      </div>

      {/* Filter toolbar — always visible */}
      <div className="mb-4 bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[250px]">
            <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
            <input
              value={filters.search}
              onChange={(e) => setFilter("search", e.target.value)}
              placeholder="Qidirish..."
              className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white transition"
            />
            {filters.search && (
              <button
                onClick={() => setFilter("search", "")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer!"
              >
                <CloseOutlined style={{ fontSize: 10 }} />
              </button>
            )}
          </div>

          {/* Holat */}
          <Select
            allowClear
            placeholder="Holat"
            value={filters.holat || undefined}
            onChange={(val) => setFilter("holat", val ?? "")}
            options={HOLAT_OPTIONS}
            className="min-w-[140px] py-1.5! rounded-xl!"
            size="middle"
          />

          {/* Boshqarma */}
          <Select
            allowClear
            showSearch
            placeholder="Boshqarma"
            value={filters.boshqarma || undefined}
            onChange={(val) => setFilter("boshqarma", val ?? "")}
            options={boshqarmalarOptions}
            filterOption={(input, opt) =>
              (opt?.label as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
            className="min-w-[230px] py-1.5! rounded-xl!"
            size="middle"
          />

          {/* Obyekt */}
          <Select
            allowClear
            showSearch
            placeholder="Obyekt"
            value={filters.obyekt || undefined}
            onChange={(val) => setFilter("obyekt", val ?? "")}
            options={obyektlarOptions}
            filterOption={(input, opt) =>
              (opt?.label as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
            className="min-w-[250px] grow py-1.5! rounded-xl!"
            size="middle"
          />

          {/* Ordering */}
          <Select
            value={filters.ordering}
            onChange={(val) => setFilter("ordering", val)}
            options={ORDERING_OPTIONS}
            className="min-w-[140px] py-1.5! rounded-xl!"
            size="middle"
          />

          {/* Clear */}
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-500 hover:text-rose-600 hover:bg-rose-50 border border-rose-100 transition-all cursor-pointer! whitespace-nowrap"
            >
              <CloseOutlined style={{ fontSize: 10 }} />
              Tozalash
            </button>
          )}
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" />
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              dataSource={data}
              rowKey="id"
              pagination={false}
              className="hujjatlar-table"
              rowClassName="hover:bg-slate-50 transition-colors"
              locale={{ emptyText: <EmptyState /> }}
            />
            <div className="flex justify-between items-center px-5 py-4 border-t border-slate-100">
              <span className="text-xs text-slate-400">
                Jami{" "}
                <span className="font-semibold text-slate-600">{count}</span> ta
                hujjat
              </span>
              <Pagination
                current={page}
                total={count}
                pageSize={20}
                onChange={(p) => setPage(p)}
                size="small"
              />
            </div>
          </>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-1">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
              <FileTextOutlined className="text-slate-500 text-sm" />
            </div>
            <span className="text-base font-semibold text-slate-800">
              Yangi Hujjat Qo'shish
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleCreateHujjat}
        okText="Saqlash"
        okButtonProps={{
          className: "!bg-slate-800 !border-slate-800 hover:!bg-slate-700",
        }}
        cancelText="Bekor qilish"
        className="hujjat-modal"
        width={520}
      >
        <Form layout="vertical" form={form} className="pt-2">
          <Form.Item
            name="nomi"
            label={<FieldLabel>Hujjat nomi</FieldLabel>}
            rules={[{ required: true, message: "Nomi majburiy" }]}
          >
            <Input
              className="rounded-lg"
              placeholder="Hujjat nomini kiriting"
            />
          </Form.Item>

          {/* Replace the grid with boshqarma and kategoriya */}
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="boshqarma"
              label={<FieldLabel>Boshqarma</FieldLabel>}
              rules={[{ required: true, message: "Boshqarma majburiy" }]}
            >
              <Select
                showSearch
                placeholder="Boshqarmani tanlang"
                options={boshqarmalarOptions}
                onChange={handleBoshqarmaChange}
                filterOption={(input, opt) =>
                  (opt?.label as string)
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="kategoriya"
              label={<FieldLabel>Kategoriya</FieldLabel>}
              rules={[{ required: true, message: "Kategoriya majburiy" }]}
            >
              <Select
                showSearch
                placeholder={
                  form.getFieldValue("boshqarma")
                    ? "Kategoriyani tanlang"
                    : "Avval boshqarma tanlang"
                }
                options={kategoriyalarOptions}
                loading={kategoriyaLoading}
                disabled={!form.getFieldValue("boshqarma") || kategoriyaLoading}
                filterOption={(input, opt) =>
                  (opt?.label as string)
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
                className="rounded-lg"
              />
            </Form.Item>
          </div>

          {/* Replace obyekt Input with Select */}
          <Form.Item
            name="obyekt"
            label={<FieldLabel>Obyekt</FieldLabel>}
            rules={[{ required: true, message: "Obyekt majburiy" }]}
          >
            <Select
              showSearch
              placeholder="Obyektni tanlang"
              options={obyektlarOptions}
              filterOption={(input, opt) =>
                (opt?.label as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            name="muddat"
            label={<FieldLabel>Muddat</FieldLabel>}
            rules={[{ required: true }]}
          >
            <DatePicker
              className="w-full rounded-lg"
              placeholder="Sanani tanlang"
            />
          </Form.Item>

          <Form.Item name="izoh" label={<FieldLabel>Izoh</FieldLabel>}>
            <Input.TextArea
              rows={3}
              className="rounded-lg"
              placeholder="Izoh (ixtiyoriy)"
            />
          </Form.Item>

          <Form.Item
            name="fayl"
            label={<FieldLabel>Fayl yuklash</FieldLabel>}
            valuePropName="file"
          >
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />} className="rounded-lg">
                Fayl tanlash
              </Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .hujjatlar-table .ant-table { background: transparent; }
        .hujjatlar-table .ant-table-thead > tr > th {
          background: #f8fafc;
          color: #94a3b8;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          border-bottom: 1px solid #e2e8f0;
          padding: 12px 16px;
        }
        .hujjatlar-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f1f5f9;
          padding: 13px 16px;
        }
        .hujjatlar-table .ant-table-tbody > tr:last-child > td { border-bottom: none; }
        .hujjatlar-table .ant-table-tbody > tr:hover > td { background: #f8fafc !important; }
      `}</style>
    </div>
  );
};

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
    {children}
  </span>
);

const EmptyState = () => (
  <div className="py-16 flex flex-col items-center gap-2 text-slate-400">
    <FileTextOutlined style={{ fontSize: 32, opacity: 0.3 }} />
    <p className="text-sm">Hujjat topilmadi</p>
  </div>
);

export default HujjatlarPage;
