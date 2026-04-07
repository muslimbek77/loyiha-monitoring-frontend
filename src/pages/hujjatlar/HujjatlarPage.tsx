import { useEffect, useState, useCallback } from "react";
import {
  Spin,
  Form,
  message,
  Modal,
  Input,
  Upload,
  Button,
  Select,
} from "antd";
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
import { useAuth } from "@/features/auth/hooks/useAuth";

interface Hujjat {
  id: number;
  nomi: string;
  kategoriya_nomi: string;
  boshqarma_nomi: string;
  obyekt_nomi: string;
  fayl_turi: string;
  holat: string;
  holat_display: string;
  korinish: string;
  korinish_display: string;
  muddat: string;
  yuklangan_vaqt: string;
  is_kechikkan: boolean;
}

interface KategoriyaNode {
  id: number;
  nomi: string;
  children?: KategoriyaNode[];
  bola_kategoriyalar?: KategoriyaNode[];
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
  kategoriya: string;
  ordering: string;
}

interface ResourceOption {
  id: number;
  nomi: string;
}

const PAGE_SIZE = 20;

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

const KORINISH_OPTIONS = [
  {
    value: "rahbariyat_va_boshqarma",
    label: "Rahbariyat va o'z boshqarmasi",
  },
  { value: "hammaga", label: "Hammaga" },
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
  kategoriya: "",
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
  const [kategoriyalarOptions, setKategoriyalarOptions] = useState<
    SelectOption[]
  >([]);
  const [kategoriyaLoading, setKategoriyaLoading] = useState(false);
  const [stats, setStats] = useState({ kutilmoqda: 0, kechikkan: 0 });

  const { user } = useAuth();
  const isRahbariyat =
    user?.lavozim === "rais" || user?.lavozim === "rais_orinbosari";

  const flattenKategoriyaTree = (
    nodes: KategoriyaNode[],
    prefix = "",
  ): SelectOption[] =>
    nodes.flatMap((node) => {
      const pathLabel = prefix ? `${prefix} / ${node.nomi}` : node.nomi;
      const children = node.children ?? node.bola_kategoriyalar ?? [];
      return [
        { value: String(node.id), label: pathLabel },
        ...flattenKategoriyaTree(children, pathLabel),
      ];
    });

  const fetchKategoriyalarOptions = async (boshqarmaId: string) => {
    setKategoriyalarOptions([]);
    if (!boshqarmaId) return;
    try {
      setKategoriyaLoading(true);
      const res = await api.get(API_ENDPOINTS.KATEGORIYALAR.BOSHQARMA, {
        params: { boshqarma: boshqarmaId },
      });
      const results = res.data?.results ?? res.data;
      setKategoriyalarOptions(
        flattenKategoriyaTree(Array.isArray(results) ? results : []),
      );
    } catch (e) {
      console.error(e);
    } finally {
      setKategoriyaLoading(false);
    }
  };

  const handleFilterBoshqarmaChange = async (val: string) => {
    setFilter("boshqarma", val || "");
    setFilter("kategoriya", "");
    await fetchKategoriyalarOptions(val);
  };

  const handleModalBoshqarmaChange = async (val: string) => {
    form.setFieldValue("boshqarma", val);
    form.setFieldValue("kategoriya", undefined);
    await fetchKategoriyalarOptions(val);
  };

  const [form] = Form.useForm();

  useEffect(() => {
    if (user?.boshqarma && !isRahbariyat) {
      form.setFieldValue("boshqarma", String(user.boshqarma));
      handleFilterBoshqarmaChange(String(user.boshqarma));
    }
  }, [user, isRahbariyat]);
  const navigate = useNavigate();

  const activeFilterCount = Object.entries(filters).filter(
    ([key, val]) => val && key !== "ordering",
  ).length;

  // Fetch boshqarmalar options
  useEffect(() => {
    api
      .get(API_ENDPOINTS.BOSHQARMA.LIST_ALL)
      .then((res) => {
        const results = res.data?.results ?? res.data;
        setBoshqarmalarOptions(
          results.map((b: ResourceOption) => ({
            value: String(b.id),
            label: b.nomi,
          })),
        );
      })
      .catch(console.error);
  }, []);

  // Fetch obyektlar options
  useEffect(() => {
    api
      .get(API_ENDPOINTS.OBYEKTLAR.LIST, { params: { page_size: 200 } })
      .then((res) => {
        const results = res.data?.results ?? res.data;
        setObyektlarOptions(
          results.map((o: ResourceOption) => ({
            value: String(o.id),
            label: o.nomi,
          })),
        );
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    Promise.all([
      api.get(API_ENDPOINTS.HUJJATLAR.KUTILMOQDA).catch(() => ({ data: [] })),
      api.get(API_ENDPOINTS.HUJJATLAR.KECHIKKAN).catch(() => ({ data: [] })),
    ]).then(([kutilmoqdaRes, kechikkanRes]) => {
      const kutilmoqdaItems =
        kutilmoqdaRes.data?.results ?? kutilmoqdaRes.data ?? [];
      const kechikkanItems = kechikkanRes.data?.results ?? kechikkanRes.data ?? [];
      setStats({
        kutilmoqda: Array.isArray(kutilmoqdaItems) ? kutilmoqdaItems.length : 0,
        kechikkan: Array.isArray(kechikkanItems) ? kechikkanItems.length : 0,
      });
    });
  }, []);

  const buildQueryString = (f: Filters, pageNumber: number) => {
    const params = new URLSearchParams();
    params.set("page", String(pageNumber));
    if (f.search) params.set("search", f.search);
    if (f.holat) params.set("holat", f.holat);
    if (f.boshqarma) params.set("boshqarma", f.boshqarma);
    if (f.obyekt) params.set("obyekt", f.obyekt);
    if (f.kategoriya) params.set("kategoriya", f.kategoriya);
    if (f.ordering) params.set("ordering", f.ordering);
    return params.toString();
  };

  const fetchHujjatlarData = useCallback(
    async (pageNumber = 1, activeFilters = filters) => {
      try {
        setLoading(true);
        const qs = buildQueryString(activeFilters, pageNumber);
        const response = await api.get(API_ENDPOINTS.HUJJATLAR.LIST, {
          params: Object.fromEntries(new URLSearchParams(qs).entries()),
        });
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

  const handleCreateHujjat = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append("obyekt", values.obyekt);
      formData.append("kategoriya", values.kategoriya);
      formData.append("nomi", values.nomi);
      formData.append("muddat", values.muddat || "");
      formData.append("izoh", values.izoh || "");
      formData.append("boshqarma", values.boshqarma);
      formData.append("korinish", values.korinish || "rahbariyat_va_boshqarma");
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
            onChange={(val) => {
              if (val) {
                handleFilterBoshqarmaChange(val);
                return;
              }
              form.setFieldValue("boshqarma", undefined);
              form.setFieldValue("kategoriya", undefined);
              setKategoriyalarOptions([]);
              setFilter("boshqarma", "");
              setFilter("kategoriya", "");
            }}
            options={boshqarmalarOptions}
            filterOption={(input, opt) =>
              (opt?.label as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
            className="min-w-[230px] py-1.5! rounded-xl!"
            size="middle"
          />

          <Select
            allowClear
            showSearch
            placeholder="Kategoriya"
            value={filters.kategoriya || undefined}
            onChange={(val) => setFilter("kategoriya", val ?? "")}
            options={kategoriyalarOptions}
            loading={kategoriyaLoading}
            disabled={!filters.boshqarma || kategoriyaLoading}
            filterOption={(input, opt) =>
              (opt?.label as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
            className="min-w-[260px] py-1.5! rounded-xl!"
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

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <QuickStatCard
          label="Jami hujjatlar"
          value={count}
          tone="slate"
          hint="Tanlangan filterlar bo'yicha"
        />
        <QuickStatCard
          label="Tasdiq kutilmoqda"
          value={stats.kutilmoqda}
          tone="amber"
          hint="Backenddagi kutilmoqda endpoint"
        />
        <QuickStatCard
          label="Kechikkan hujjatlar"
          value={stats.kechikkan}
          tone="rose"
          hint="Muddatdan o'tgan nazoratlar"
        />
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" />
          </div>
        ) : (
          <>
            {data.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                      <th className="px-4 py-3">Nomi</th>
                      <th className="px-4 py-3">Obyekt</th>
                      <th className="px-4 py-3">Boshqarma</th>
                      <th className="px-4 py-3">Ko'rinish</th>
                      <th className="px-4 py-3">Kategoriya</th>
                      <th className="px-4 py-3">Holat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((record) => (
                      <tr
                        key={record.id}
                        onClick={() => navigate(`/hujjatlar/${record.id}`)}
                        className="cursor-pointer border-t border-slate-100 transition hover:bg-slate-50"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-left">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 transition-colors">
                              <FileTextOutlined className="text-xs text-slate-400" />
                            </span>
                            <span className="text-sm font-medium text-slate-700">
                              {record.nomi}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {record.obyekt_nomi}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {record.boshqarma_nomi}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {record.korinish_display}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                            {record.kategoriya_nomi}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <HolatBadge
                            holat={record.holat}
                            label={record.holat_display}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex justify-between items-center px-5 py-4 border-t border-slate-100">
              <span className="text-xs text-slate-400">
                Jami{" "}
                <span className="font-semibold text-slate-600">{count}</span> ta
                hujjat
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
                  {page} / {Math.max(1, Math.ceil(count / PAGE_SIZE))}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPage((prev) =>
                      Math.min(Math.max(1, Math.ceil(count / PAGE_SIZE)), prev + 1),
                    )
                  }
                  disabled={page >= Math.max(1, Math.ceil(count / PAGE_SIZE))}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Keyingi
                </button>
              </div>
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
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        onOk={handleCreateHujjat}
        okText="Saqlash"
        okButtonProps={{
          className: "!bg-slate-800 !border-slate-800 hover:!bg-slate-700",
        }}
        cancelText="Bekor qilish"
        className="hujjat-modal"
        width={520}
      >
        <Form
          layout="vertical"
          form={form}
          className="pt-2"
          initialValues={{ korinish: "rahbariyat_va_boshqarma" }}
        >
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
                options={
                  user?.boshqarma && !isRahbariyat
                    ? boshqarmalarOptions.filter(
                        (b) => b.value === String(user.boshqarma),
                      )
                    : boshqarmalarOptions
                }
                // disabled={!!user?.boshqarma}
                onChange={handleModalBoshqarmaChange}
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
            name="korinish"
            label={<FieldLabel>Kimga ko'rinadi</FieldLabel>}
            rules={[{ required: true, message: "Ko'rinishni tanlang" }]}
          >
            <Select
              options={KORINISH_OPTIONS}
              className="rounded-lg"
              placeholder="Ko'rinishni tanlang"
            />
          </Form.Item>

          <Form.Item
            name="muddat"
            label={<FieldLabel>Muddat</FieldLabel>}
            rules={[{ required: true }]}
          >
            <input
              type="date"
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-slate-500"
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

const toneMap = {
  slate: {
    wrap: "bg-slate-50 border-slate-200",
    badge: "bg-white text-slate-600",
  },
  amber: {
    wrap: "bg-amber-50 border-amber-200",
    badge: "bg-white text-amber-600",
  },
  rose: {
    wrap: "bg-rose-50 border-rose-200",
    badge: "bg-white text-rose-600",
  },
} as const;

const QuickStatCard = ({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: number;
  hint: string;
  tone: keyof typeof toneMap;
}) => {
  const style = toneMap[tone];
  return (
    <div className={`rounded-2xl border px-4 py-4 ${style.wrap}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <span className={`rounded-xl px-3 py-1.5 text-2xl font-bold ${style.badge}`}>
          {value}
        </span>
        <span className="text-right text-xs text-slate-500">{hint}</span>
      </div>
    </div>
  );
};

export default HujjatlarPage;
