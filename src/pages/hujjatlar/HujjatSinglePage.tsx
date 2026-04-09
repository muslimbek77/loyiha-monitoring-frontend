import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Spin,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  message,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import dayjs from "dayjs";
import api from "@/services/api/axios";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { usePermissions } from "@/features/auth/hooks/usePermissions";

interface Hujjat {
  id: number;
  nomi: string;
  kategoriya_nomi: string;
  kategoriya: number;
  boshqarma_nomi: string;
  boshqarma: number;
  obyekt_nomi: string;
  obyekt: number;
  yuklovchi_fio: string;
  fayl: string | null;
  fayl_hajmi: number;
  fayl_turi: string;
  holat: string;
  holat_display: string;
  muddat: string;
  yuklangan_vaqt: string;
  izoh: string;
  rad_sababi: string;
  versiya: number;
  is_kechikkan: boolean;
  created_at: string;
  updated_at: string;
}

interface Obyekt {
  id: number;
  nomi: string;
}

interface BoshqarmaOption {
  id: number;
  nomi: string;
}

interface KategoriyaOption {
  id: number;
  nomi: string;
  children?: KategoriyaOption[];
}

interface HujjatTarixItem {
  id: number;
  versiya: number;
  yuklovchi_fio: string;
  izoh: string;
  created_at: string;
}

const holatConfig: Record<string, { bg: string; text: string; dot: string }> = {
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
  arxiv: { bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400" },
};

const HolatBadge = ({ holat, label }: { holat: string; label: string }) => {
  const cfg = holatConfig[holat] ?? holatConfig.arxiv;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {label}
    </span>
  );
};

const DetailRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 mb-1">
      {label}
    </p>
    <div className="text-sm font-medium text-slate-700">{children}</div>
  </div>
);

const SectionDivider = ({ title }: { title?: string }) => (
  <div className="flex items-center gap-3 my-6">
    {title && (
      <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400 whitespace-nowrap">
        {title}
      </span>
    )}
    <div className="flex-1 h-px bg-slate-100" />
  </div>
);

const HujjatSinglePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { can } = usePermissions();
  const [data, setData] = useState<Hujjat | null>(null);
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [obyektlar, setObyektlar] = useState<Obyekt[]>([]);
  const [kategoriyalar, setKategoriyalar] = useState<KategoriyaOption[]>([]);
  const [obyektlarLoading, setObyektlarLoading] = useState(false);
  const [boshqarmalar, setBoshqarmalar] = useState<BoshqarmaOption[]>([]);
  const [tarix, setTarix] = useState<HujjatTarixItem[]>([]);
  const [tarixLoading, setTarixLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [form] = Form.useForm();

  const fetchSingle = async () => {
    try {
      setLoading(true);
      const response = await api.get(API_ENDPOINTS.HUJJATLAR.DETAIL(id!));
      setData(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchObyektlar = async () => {
    try {
      setObyektlarLoading(true);
      const response = await api.get(API_ENDPOINTS.OBYEKTLAR.LIST);
      setObyektlar(response.data?.results ?? response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setObyektlarLoading(false);
    }
  };

  const flattenKategoriyaTree = (
    nodes: KategoriyaOption[],
    prefix = "",
  ): KategoriyaOption[] =>
    nodes.flatMap((node) => {
      const label = prefix ? `${prefix} / ${node.nomi}` : node.nomi;
      const current = { ...node, nomi: label };
      return [current, ...flattenKategoriyaTree(node.children ?? [], label)];
    });

  const getKategoriyalar = async (boshqarmaId?: number) => {
    try {
      const response = await api.get(API_ENDPOINTS.KATEGORIYALAR.BOSHQARMA, {
        params: {
          boshqarma: boshqarmaId ?? data?.boshqarma,
        },
      });
      const items = response.data?.results ?? response.data;
      setKategoriyalar(flattenKategoriyaTree(Array.isArray(items) ? items : []));
    } catch (error) {
      console.error(error);
    }
  };

  const getBoshqarmalar = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.BOSHQARMA.LIST_ALL);
      setBoshqarmalar(response.data?.results ?? response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTarix = async () => {
    try {
      setTarixLoading(true);
      const response = await api.get(API_ENDPOINTS.HUJJATLAR.TARIX(id!));
      setTarix(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setTarixLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchSingle();
      fetchTarix();
    }
  }, [id]);

  const handleEditOpen = () => {
    if (!data) return;
    form.setFieldsValue({
      nomi: data.nomi,
      obyekt: data.obyekt,
      kategoriya: data.kategoriya,
      boshqarma: data.boshqarma,
      holat: data.holat,
      muddat: data.muddat || "",
      rad_sababi: data.rad_sababi || "",
      izoh: data.izoh || "",
    });
    setFileList([]);
    fetchObyektlar();
    getKategoriyalar(data.boshqarma);
    getBoshqarmalar();
    setEditOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      setEditLoading(true);
      const payload = {
        nomi: values.nomi,
        obyekt: values.obyekt,
        kategoriya: values.kategoriya,
        boshqarma: values.boshqarma,
        holat: values.holat,
        muddat: values.muddat || "",
        rad_sababi: values.rad_sababi || "",
        izoh: values.izoh || "",
      };

      await api.patch(API_ENDPOINTS.HUJJATLAR.DETAIL(id!), payload);

      if (fileList.length > 0 && fileList[0].originFileObj) {
        const versionData = new FormData();
        versionData.append("fayl", fileList[0].originFileObj);
        versionData.append("izoh", values.izoh || "");

        await api.post(API_ENDPOINTS.HUJJATLAR.YANGILASH(id!), versionData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      message.success(
        fileList.length > 0
          ? "Hujjat yangi versiya bilan yangilandi"
          : "Hujjat muvaffaqiyatli yangilandi",
      );
      setEditOpen(false);
      fetchSingle();
      fetchTarix();
    } catch (error) {
      console.error(error);
      message.error("Xatolik yuz berdi");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = () => {
    Modal.confirm({
      title: "Hujjatni o'chirish",
      content: "Hujjatni o'chirishni tasdiqlaysizmi?",
      okText: "O'chirish",
      okType: "danger",
      cancelText: "Bekor qilish",
      onOk: async () => {
        try {
          setDeleteLoading(true);
          await api.delete(API_ENDPOINTS.HUJJATLAR.DETAIL(id!));
          message.success("Hujjat o'chirildi");
          navigate(-1);
        } catch (error) {
          console.error(error);
          message.error("Xatolik yuz berdi");
        } finally {
          setDeleteLoading(false);
        }
      },
    });
  };

  const handFileOpen = () => {
    if (
      data?.fayl &&
      data?.fayl_turi !== "DOCX" &&
      data?.fayl_turi !== "PDF" &&
      data?.fayl_turi !== "XLSX"
    ) {
      setPreviewOpen((prev) => !prev);
    }
  };

  const handleTasdiqlash = async (holat: "tasdiqlandi" | "rad_etildi") => {
    try {
      setActionLoading(true);
      await api.post(API_ENDPOINTS.HUJJATLAR.TASDIQLASH(id!), {
        holat,
        rad_sababi:
          holat === "rad_etildi" ? "Frontend orqali rad etildi" : undefined,
      });
      message.success(
        holat === "tasdiqlandi" ? "Hujjat tasdiqlandi" : "Hujjat rad etildi",
      );
      fetchSingle();
    } catch (error) {
      console.error(error);
      message.error("Amalni bajarishda xatolik yuz berdi");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  const reviewSummary = [
    data.is_kechikkan
      ? "Muddat o'tgan, nazorat talab etiladi."
      : "Muddat me'yorida.",
    `Holati: ${data.holat_display}.`,
    data.versiya > 1 ? `${data.versiya} ta versiya mavjud.` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8 rounded-xl">
      {/* Back + breadcrumb */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors mb-3 cursor-pointer"
        >
          <ArrowLeftOutlined className="text-[10px]" />
          Hujjatlar
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl pl-1 font-semibold text-slate-800 tracking-tight">
              {data.nomi}
            </h1>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <HolatBadge holat={data.holat} label={data.holat_display} />

            {can("canUpdate") && (
              <button
                onClick={handleEditOpen}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 cursor-pointer hover:text-slate-800 text-xs font-medium rounded-xl shadow-sm transition-all duration-150"
              >
                <EditOutlined className="text-[11px]" />
                Tahrirlash
              </button>
            )}

            {can("canDelete") && (
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="inline-flex items-center gap-1.5 px-3.5 cursor-pointer py-2 bg-white border border-rose-200 hover:border-rose-300 text-rose-500 hover:text-rose-600 text-xs font-medium rounded-xl shadow-sm transition-all duration-150 disabled:opacity-50"
              >
                <DeleteOutlined className="text-[11px]" />
                O'chirish
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        {/* Details grid */}
        <SectionDivider title="Asosiy ma'lumotlar" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6">
          <DetailRow label="Kategoriya">{data.kategoriya_nomi}</DetailRow>
          <DetailRow label="Boshqarma">{data.boshqarma_nomi}</DetailRow>
          <DetailRow label="Obyekt">{data.obyekt_nomi}</DetailRow>
          <DetailRow label="Yuklovchi">{data.yuklovchi_fio}</DetailRow>
          <DetailRow label="Muddat">
            <span className={data.is_kechikkan ? "text-rose-500" : ""}>
              {dayjs(data.muddat).format("DD MMM YYYY")}
              {data.is_kechikkan && (
                <span className="ml-2 text-[10px] font-semibold bg-rose-50 text-rose-500 px-2 py-0.5 rounded-full">
                  Kechikkan
                </span>
              )}
            </span>
          </DetailRow>
          <DetailRow label="Versiya">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
              v{data.versiya}
            </span>
          </DetailRow>
        </div>

        <SectionDivider title="Operativ xulosa" />
        <div className="rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700">
            Hujjat holati bo'yicha tezkor xulosa
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-700">{reviewSummary}</p>
          {data.holat === "kutilmoqda" && user?.lavozim === "boshqarma_boshi" ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => handleTasdiqlash("tasdiqlandi")}
                disabled={actionLoading}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
              >
                Tasdiqlash
              </button>
              <button
                onClick={() => handleTasdiqlash("rad_etildi")}
                disabled={actionLoading}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-500 disabled:opacity-50"
              >
                Rad etish
              </button>
            </div>
          ) : null}
        </div>

        {/* File section */}
        <SectionDivider title="Fayl" />
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <FileTextOutlined className="text-slate-400" />
            </div>
            <div>
              <button
                onClick={handFileOpen}
                className="text-sm font-medium text-slate-700 cursor-pointer hover:underline"
              >
                {data.fayl_turi || "Fayl"}
              </button>
              <p className="text-xs text-slate-400">{data.fayl_hajmi} KB</p>
            </div>
          </div>
          {data.fayl && (
            <button
              onClick={async () => {
                try {
                  const url = data.fayl!.replace(/^http:/, "https:");
                  const response = await api.get(url, {
                    responseType: "blob",
                  });
                  const blob = response.data as Blob;
                  const blobUrl = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = blobUrl;
                  a.download = `${data.nomi}.${data.fayl_turi?.toLowerCase() || "file"}`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(blobUrl);
                } catch {
                  message.error("Yuklab olishda xatolik yuz berdi");
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 text-xs font-medium rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <DownloadOutlined className="text-[11px]" />
              Yuklab olish
            </button>
          )}
        </div>

        {/* Izoh */}
        {data.izoh && (
          <>
            <SectionDivider title="Izoh" />
            <p className="text-sm text-slate-600 leading-relaxed">
              {data.izoh}
            </p>
          </>
        )}

        {/* Rad sababi */}
        {data.rad_sababi && (
          <>
            <SectionDivider title="Rad sababi" />
            <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
              <p className="text-sm text-rose-600 leading-relaxed">
                {data.rad_sababi}
              </p>
            </div>
          </>
        )}

        <SectionDivider title="Versiyalar tarixi" />
        {tarixLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spin size="small" />
          </div>
        ) : tarix.length ? (
          <div className="space-y-3">
            {tarix.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    v{item.versiya} • {item.yuklovchi_fio}
                  </p>
                  <p className="mt-1 text-xs leading-6 text-slate-500">
                    {item.izoh || "Izoh kiritilmagan"}
                  </p>
                </div>
                <span className="text-xs text-slate-400">
                  {dayjs(item.created_at).format("DD.MM.YYYY HH:mm")}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
            Hujjat versiyalari tarixi hali mavjud emas.
          </div>
        )}

        {/* Footer timestamp */}
        <div className="mt-8 pt-5 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-400">
          <ClockCircleOutlined className="text-[11px]" />
          Yuklangan: {dayjs(data.yuklangan_vaqt).format("DD MMM YYYY, HH:mm")}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-1">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
              <EditOutlined className="text-slate-500 text-sm" />
            </div>
            <span className="text-base font-semibold text-slate-800">
              Hujjatni tahrirlash
            </span>
          </div>
        }
        open={editOpen}
        onOk={handleEditSubmit}
        onCancel={() => setEditOpen(false)}
        okText="Saqlash"
        cancelText="Bekor qilish"
        confirmLoading={editLoading}
        okButtonProps={{
          className: "!bg-slate-800 !border-slate-800 hover:!bg-slate-700",
        }}
        width={560}
      >
        <Form form={form} layout="vertical" className="pt-2">
          <Form.Item
            name="nomi"
            label={
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Nomi
              </span>
            }
            rules={[{ required: true, message: "Nomini kiriting" }]}
          >
            <Input className="rounded-lg" placeholder="Hujjat nomi" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="kategoriya"
              label={
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Kategoriya
                </span>
              }
              rules={[{ required: true, message: "Kategoriyani kiriting" }]}
            >
              <Select
                showSearch
                loading={false}
                placeholder="Kategoriyani tanlang"
                optionFilterProp="label"
                className="rounded-lg"
                options={kategoriyalar.map((k) => ({
                  value: k.id,
                  label: k.nomi,
                }))}
              />
            </Form.Item>

            <Form.Item
              name="boshqarma"
              label={
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Boshqarma
                </span>
              }
              rules={[{ required: true, message: "Boshqarmani kiriting" }]}
            >
              <Select
                showSearch
                loading={false}
                placeholder="Boshqarmani tanlang"
                optionFilterProp="label"
                className="rounded-lg"
                onChange={(value) => {
                  form.setFieldValue("kategoriya", undefined);
                  getKategoriyalar(value);
                }}
                options={boshqarmalar.map((b) => ({
                  value: b.id,
                  label: b.nomi,
                }))}
              />
            </Form.Item>
          </div>

          <Form.Item
            name="obyekt"
            label={
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Obyekt
              </span>
            }
            rules={[{ required: true, message: "Obyektni tanlang" }]}
          >
            <Select
              showSearch
              loading={obyektlarLoading}
              placeholder="Obyekt tanlang"
              optionFilterProp="label"
              className="rounded-lg"
              options={obyektlar.map((o) => ({ value: o.id, label: o.nomi }))}
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="holat"
              label={
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Holat
                </span>
              }
              rules={[{ required: true, message: "Holatni tanlang" }]}
            >
              <Select
                className="rounded-lg"
                options={[
                  { value: "kutilmoqda", label: "Kutilmoqda" },
                  { value: "tasdiqlandi", label: "Tasdiqlandi" },
                  { value: "rad_etildi", label: "Rad etildi" },
                  { value: "arxiv", label: "Arxiv" },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="muddat"
              label={
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Muddat
                </span>
              }
              rules={[{ required: true, message: "Muddatni kiriting" }]}
            >
              <input
                type="date"
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-slate-500"
              />
            </Form.Item>
          </div>

          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) => prev.holat !== curr.holat}
          >
            {({ getFieldValue }) =>
              getFieldValue("holat") === "rad_etildi" ? (
                <Form.Item
                  name="rad_sababi"
                  label={
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Rad sababi
                    </span>
                  }
                  rules={[{ required: true, message: "Rad sababini kiriting" }]}
                >
                  <Input className="rounded-lg" placeholder="Rad sababi" />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item
            name="izoh"
            label={
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Izoh
              </span>
            }
          >
            <Input.TextArea
              rows={3}
              className="rounded-lg"
              placeholder="Izoh (ixtiyoriy)"
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Fayl
              </span>
            }
          >
            <Upload
              fileList={fileList}
              beforeUpload={() => false}
              maxCount={1}
              onChange={({ fileList: newList }) => setFileList(newList)}
              onRemove={() => setFileList([])}
            >
              <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 text-xs font-medium rounded-lg transition-all">
                <UploadOutlined />
                Fayl tanlash
              </button>
            </Upload>
            {data.fayl && fileList.length === 0 && (
              <p className="text-xs text-slate-400 mt-1.5">
                Joriy fayl: {data.fayl_turi} ({data.fayl_hajmi} KB) — yangi fayl
                tanlanmasa o'zgarmaydi
              </p>
            )}
          </Form.Item>
        </Form>
      </Modal>
      {previewOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileTextOutlined className="text-slate-400 text-sm" />
                <span className="text-sm font-medium text-slate-700">
                  {data.fayl_turi || "Fayl"}
                </span>
                <span className="text-xs text-slate-400">
                  ({data.fayl_hajmi} KB)
                </span>
              </div>
              <button
                onClick={() => setPreviewOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all cursor-pointer text-sm font-medium"
              >
                ✕
              </button>
            </div>

            {/* Image */}
            <div className="bg-slate-50 flex items-center justify-center p-4 min-h-60 max-h-[70vh] overflow-auto">
              {data?.fayl ? (
                <img
                  className="max-w-full max-h-full object-contain rounded-lg"
                  src={data.fayl?.replace("http://", "https://")}
                  alt={data.nomi}
                />
              ) : (
                <p className="text-slate-400 text-sm">Fayl mavjud emas</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HujjatSinglePage;
