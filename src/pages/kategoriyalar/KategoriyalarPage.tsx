"use client";

import api from "@/services/api/axios";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import { useState, useEffect } from "react";
import {
  Button,
  Input,
  Select,
  Form,
  Modal as AntModal,
  Spin,
  Alert,
  Tag,
  Typography,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  FolderOpenFilled,
  FolderFilled,
  FileTextOutlined,
  ReloadOutlined,
  RightOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const { Text, Title } = Typography;
const { TextArea } = Input;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Kategoriya {
  id: number;
  nomi: string;
  boshqarma: number;
  boshqarma_nomi: string;
  obyekt: number;
  obyekt_nomi: string;
  parent: number | null;
  tartib: number;
  tavsif: string;
  full_path: string;
  children: Kategoriya[];
  hujjatlar_soni: number;
}

interface Boshqarma {
  id: number;
  nomi: string;
}

interface Obyekt {
  id: number;
  nomi: string;
}

interface HujjatListItem {
  id: number;
  nomi: string;
  obyekt_nomi: string;
  boshqarma_nomi: string;
  holat_display: string;
  fayl_turi: string;
}

// ─── Tree Row ─────────────────────────────────────────────────────────────────

function KategoriyaRow({
  item,
  depth = 0,
  onSelect,
  selectedId,
}: {
  item: Kategoriya;
  depth?: number;
  onSelect: (k: Kategoriya) => void;
  selectedId: number | null;
}) {
  const [open, setOpen] = useState(depth === 0);
  const hasChildren = item.children?.length > 0;
  const isSelected = selectedId === item.id;

  return (
    <div>
      <div
        onClick={() => {
          onSelect(item);
          if (hasChildren) setOpen((o) => !o);
        }}
        className={`
          flex items-center gap-2 cursor-pointer rounded-lg mx-2 my-0.5
          transition-colors duration-100 select-none
          ${
            isSelected
              ? "bg-indigo-50 border-l-[3px] border-indigo-500"
              : "border-l-[3px] border-transparent hover:bg-slate-50"
          }
        `}
        style={{
          paddingLeft: `${14 + depth * 20}px`,
          paddingTop: 8,
          paddingRight: 12,
          paddingBottom: 8,
        }}
      >
        {/* Chevron */}
        <span className="w-3 flex items-center flex-shrink-0">
          {hasChildren && (
            <RightOutlined
              className="text-slate-400 text-[10px] transition-transform duration-200"
              style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
            />
          )}
        </span>

        {/* Folder icon */}
        {open && hasChildren ? (
          <FolderOpenFilled className="text-amber-400 text-base flex-shrink-0" />
        ) : (
          <FolderFilled className="text-slate-300 text-base flex-shrink-0" />
        )}

        {/* Label */}
        <span
          className={`flex-1 text-[13px] truncate ${
            isSelected
              ? "text-indigo-700 font-semibold"
              : depth === 0
                ? "text-slate-800 font-semibold"
                : "text-slate-500 font-normal"
          }`}
        >
          {item.nomi}
        </span>

        {/* Doc count badge */}
        <span className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
          <FileTextOutlined className="text-[10px]" />
          {item.hujjatlar_soni}
        </span>
      </div>

      {hasChildren && open && (
        <div
          className="border-l border-dashed border-slate-200"
          style={{ marginLeft: `${14 + depth * 20 + 18}px` }}
        >
          {item.children.map((child) => (
            <KategoriyaRow
              key={child.id}
              item={child}
              depth={depth + 1}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Add Modal ────────────────────────────────────────────────────────────────

function AddModal({
  open,
  onClose,
  onSaved,
  boshqarmalar,
  obyektlar,
  kategoriyalar,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  boshqarmalar: Boshqarma[];
  obyektlar: Obyekt[];
  kategoriyalar: Kategoriya[];
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const filteredBoshqarmalar =
    user?.boshqarma && user.lavozim !== "rais"
      ? boshqarmalar.filter((b) => b.id === user.boshqarma)
      : boshqarmalar;

  // Flatten categories for parent select
  const flatCats: Kategoriya[] = [];
  const flatten = (arr: Kategoriya[]) =>
    arr.forEach((k) => {
      flatCats.push(k);
      flatten(k.children || []);
    });
  flatten(kategoriyalar);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      setError("");

      const payload: Record<string, string | number | undefined> = {
        nomi: values.nomi.trim(),
        boshqarma: Number(values.boshqarma),
        obyekt: Number(values.obyekt),
        tartib: Number(values.tartib) || 1,
        tavsif: values.tavsif || "",
      };
      if (values.parent) payload.parent = Number(values.parent);

      await api.post(API_ENDPOINTS.KATEGORIYALAR.LIST, payload);

      form.resetFields();
      onSaved();
      onClose();
    } catch (e: any) {
      // If it's an axios-style error with response data, show it
      const errData = e?.response?.data;
      if (errData) {
        const msg = Object.entries(errData)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join(" | ");
        setError(msg);
      }
      // Otherwise it was a form validation error — do nothing
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setError("");
    onClose();
  };

  return (
    <AntModal
      open={open}
      onCancel={handleCancel}
      onOk={handleSubmit}
      okText="Saqlash"
      cancelText="Bekor qilish"
      confirmLoading={loading}
      title={
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <PlusOutlined className="text-indigo-500" />
          </span>
          <span className="text-[15px] font-bold text-slate-800">
            Yangi kategoriya
          </span>
        </div>
      }
      okButtonProps={{ className: "bg-indigo-500 hover:!bg-indigo-600" }}
      destroyOnClose
    >
      {error && (
        <Alert type="error" message={error} className="mb-4" showIcon />
      )}

      <Form
        form={form}
        layout="vertical"
        className="mt-4"
        initialValues={{ tartib: 1 }}
      >
        <Form.Item
          label={
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Nomi
            </span>
          }
          name="nomi"
          rules={[{ required: true, message: "Nomi majburiy" }]}
        >
          <Input placeholder="Kategoriya nomi" />
        </Form.Item>

        <Form.Item
          label={
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Boshqarma
            </span>
          }
          name="boshqarma"
          rules={[{ required: true, message: "Boshqarma tanlang" }]}
        >
          <Select
            placeholder="— tanlang —"
            showSearch
            optionFilterProp="label"
            options={filteredBoshqarmalar.map((b) => ({
              value: b.id,
              label: b.nomi,
            }))}
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Obyekt
            </span>
          }
          name="obyekt"
          rules={[{ required: true, message: "Obyekt tanlang" }]}
        >
          <Select
            placeholder="— tanlang —"
            showSearch
            optionFilterProp="label"
            options={obyektlar.map((o) => ({ value: o.id, label: o.nomi }))}
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Parent kategoriya
            </span>
          }
          name="parent"
        >
          <Select
            placeholder="— yo'q (asosiy kategoriya) —"
            allowClear
            showSearch
            optionFilterProp="label"
            options={flatCats.map((k) => ({
              value: k.id,
              label: k.full_path || k.nomi,
            }))}
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Tartib raqami
            </span>
          }
          name="tartib"
        >
          <Input type="number" />
        </Form.Item>

        <Form.Item
          label={
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Tavsif
            </span>
          }
          name="tavsif"
        >
          <TextArea rows={3} placeholder="Ixtiyoriy tavsif" />
        </Form.Item>
      </Form>
    </AntModal>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({
  kategoriyaId,
  onClose,
  onSaved,
  boshqarmalar,
  obyektlar,
  kategoriyalar,
}: {
  kategoriyaId: number | null;
  onClose: () => void;
  onSaved: () => void;
  boshqarmalar: Boshqarma[];
  obyektlar: Obyekt[];
  kategoriyalar: Kategoriya[];
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState("");

  // Flatten categories for parent select (exclude self)
  const flatCats: Kategoriya[] = [];
  const flatten = (arr: Kategoriya[]) =>
    arr.forEach((k) => {
      if (k.id !== kategoriyaId) {
        flatCats.push(k);
        flatten(k.children || []);
      }
    });
  flatten(kategoriyalar);

  // Fetch detail on open
  useEffect(() => {
    if (!kategoriyaId) return;
    setFetchLoading(true);
    api
      .get(`hujjatlar/kategoriyalar/${kategoriyaId}/`)
      .then(({ data }: { data: Kategoriya }) => {
        form.setFieldsValue({
          nomi: data.nomi,
          boshqarma: data.boshqarma,
          obyekt: data.obyekt,
          parent: data.parent ?? undefined,
          tartib: data.tartib,
          tavsif: data.tavsif,
        });
      })
      .catch(() => setError("Ma'lumotlarni yuklashda xato"))
      .finally(() => setFetchLoading(false));
  }, [kategoriyaId]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      setError("");

      const payload: Record<string, string | number | null | undefined> = {
        nomi: values.nomi.trim(),
        boshqarma: Number(values.boshqarma),
        obyekt: Number(values.obyekt),
        tartib: Number(values.tartib) || 1,
        tavsif: values.tavsif || "",
        parent: values.parent ? Number(values.parent) : null,
      };

      await api.patch(API_ENDPOINTS.KATEGORIYALAR.DETAIL(kategoriyaId), payload);

      onSaved();
      onClose();
    } catch (e: any) {
      const errData = e?.response?.data;
      if (errData) {
        const msg = Object.entries(errData)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join(" | ");
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setError("");
    onClose();
  };

  return (
    <AntModal
      open={!!kategoriyaId}
      onCancel={handleCancel}
      onOk={handleSubmit}
      okText="Saqlash"
      cancelText="Bekor qilish"
      confirmLoading={loading}
      title={
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <EditOutlined className="text-amber-500" />
          </span>
          <span className="text-[15px] font-bold text-slate-800">
            Kategoriyani tahrirlash
          </span>
        </div>
      }
      okButtonProps={{ className: "bg-indigo-500 hover:!bg-indigo-600" }}
      destroyOnClose
    >
      {fetchLoading ? (
        <div className="flex justify-center py-10">
          <Spin />
        </div>
      ) : (
        <>
          {error && (
            <Alert type="error" message={error} className="mb-4" showIcon />
          )}
          <Form form={form} layout="vertical" className="mt-4">
            <Form.Item
              label={
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Nomi
                </span>
              }
              name="nomi"
              rules={[{ required: true, message: "Nomi majburiy" }]}
            >
              <Input placeholder="Kategoriya nomi" />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Boshqarma
                </span>
              }
              name="boshqarma"
              rules={[{ required: true, message: "Boshqarma tanlang" }]}
            >
              <Select
                placeholder="— tanlang —"
                showSearch
                optionFilterProp="label"
                options={boshqarmalar.map((b) => ({
                  value: b.id,
                  label: b.nomi,
                }))}
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Obyekt
                </span>
              }
              name="obyekt"
              rules={[{ required: true, message: "Obyekt tanlang" }]}
            >
              <Select
                placeholder="— tanlang —"
                showSearch
                optionFilterProp="label"
                options={obyektlar.map((o) => ({ value: o.id, label: o.nomi }))}
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Parent kategoriya
                </span>
              }
              name="parent"
            >
              <Select
                placeholder="— yo'q (asosiy kategoriya) —"
                allowClear
                showSearch
                optionFilterProp="label"
                options={flatCats.map((k) => ({
                  value: k.id,
                  label: k.full_path || k.nomi,
                }))}
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Tartib raqami
                </span>
              }
              name="tartib"
            >
              <Input type="number" />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Tavsif
                </span>
              }
              name="tavsif"
            >
              <TextArea rows={3} placeholder="Ixtiyoriy tavsif" />
            </Form.Item>
          </Form>
        </>
      )}
    </AntModal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const KategoriyalarPage = () => {
  const navigate = useNavigate();
  const [kategoriyalar, setKategoriyalar] = useState<Kategoriya[]>([]);
  const [boshqarmalar, setBoshqarmalar] = useState<Boshqarma[]>([]);
  const [obyektlar, setObyektlar] = useState<Obyekt[]>([]);
  const [selected, setSelected] = useState<Kategoriya | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<Kategoriya | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [relatedDocs, setRelatedDocs] = useState<HujjatListItem[]>([]);
  const [relatedDocsLoading, setRelatedDocsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const fetchKategoriyalar = async () => {
    try {
      const { data } = await api.get(API_ENDPOINTS.KATEGORIYALAR.BOSHQARMA);
      setKategoriyalar(Array.isArray(data) ? data : (data.results ?? []));
      setFetchError("");
    } catch (e) {
      setFetchError("Kategoriyalarni yuklashda xato: " + e);
    }
  };

  const fetchBoshqarmalar = async () => {
    try {
      const { data } = await api.get(API_ENDPOINTS.BOSHQARMA.LIST);
      setBoshqarmalar(Array.isArray(data) ? data : (data.results ?? []));
    } catch {
      /* silent */
    }
  };

  const fetchObyektlar = async () => {
    try {
      const { data } = await api.get(API_ENDPOINTS.OBYEKTLAR.LIST);
      setObyektlar(Array.isArray(data) ? data : (data.results ?? []));
    } catch {
      /* silent */
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchKategoriyalar(),
      fetchBoshqarmalar(),
      fetchObyektlar(),
    ]).finally(() => setLoading(false));
  }, []);

  // Fetch full detail whenever a category is selected
  useEffect(() => {
    if (!selected) {
      setSelectedDetail(null);
      return;
    }
    setDetailLoading(true);
    api
      .get(API_ENDPOINTS.KATEGORIYALAR.DETAIL(selected.id))
      .then(({ data }: { data: Kategoriya }) => setSelectedDetail(data))
      .catch(() => setSelectedDetail(selected)) // fallback to tree data
      .finally(() => setDetailLoading(false));
  }, [selected?.id]);

  useEffect(() => {
    if (!selected) {
      setRelatedDocs([]);
      return;
    }

    setRelatedDocsLoading(true);
    api
      .get(API_ENDPOINTS.HUJJATLAR.KATEGORIYA_HUJJATLARI, {
        params: {
          kategoriya: selected.id,
          ...(selected.boshqarma ? { boshqarma: selected.boshqarma } : {}),
        },
      })
      .then(({ data }) => {
        setRelatedDocs(Array.isArray(data) ? data : (data.results ?? []));
      })
      .catch(() => setRelatedDocs([]))
      .finally(() => setRelatedDocsLoading(false));
  }, [selected?.id]);

  const filtered = search.trim()
    ? kategoriyalar.filter(
        (k) =>
          k.nomi?.toLowerCase().includes(search.toLowerCase()) ||
          k.boshqarma_nomi?.toLowerCase().includes(search.toLowerCase()),
      )
    : kategoriyalar;

  // Flatten for stats
  const flatAll: Kategoriya[] = [];
  const flattenAll = (arr: Kategoriya[]) =>
    arr.forEach((k) => {
      flatAll.push(k);
      flattenAll(k.children || []);
    });
  flattenAll(kategoriyalar);
  const totalDocs = flatAll.reduce((s, k) => s + (k.hujjatlar_soni || 0), 0);

  const statCards = selectedDetail
    ? [
        {
          label: "Boshqarma",
          value: selectedDetail.boshqarma_nomi
            ? selectedDetail.boshqarma_nomi
            : "kiritilmagan",
          color: "#4f46e5",
          bg: "#eef2ff",
        },
        {
          label: "Obyekt",
          value: selectedDetail.obyekt_nomi
            ? selectedDetail.obyekt_nomi
            : "kiritilmagan",
          color: "#0284c7",
          bg: "#f0f9ff",
        },
        {
          label: "Hujjatlar",
          value: selectedDetail.hujjatlar_soni
            ? selectedDetail.hujjatlar_soni
            : "yo'q",
          color: "#059669",
          bg: "#f0fdf4",
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      {/* ── Top bar ── */}
      <div className="bg-white border-b border-slate-200 px-7 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-400 flex items-center justify-center shadow-md shadow-indigo-200">
            <FolderOpenFilled className="text-white text-base" />
          </div>
          <div>
            <Title level={5} className="!mb-0 !text-slate-800">
              Hujjat Kategoriyalari
            </Title>
            <Text className="text-xs text-slate-400">
              {flatAll.length} kategoriya · {totalDocs} hujjat
            </Text>
          </div>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setShowModal(true)}
          className="bg-indigo-500 hover:bg-indigo-600! border-none shadow-md shadow-indigo-200 font-semibold rounded-lg!"
        >
          Yangi kategoriya
        </Button>
      </div>

      <div className="flex" style={{ height: "calc(100vh - 65px)" }}>
        {/* ── Sidebar ── */}
        <div className="w-72 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-3 pb-2">
            <Input
              prefix={<FileTextOutlined className="text-slate-400" />}
              placeholder="Kategoriya qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              className="text-sm rounded-lg!"
            />
          </div>

          <div className="flex-1 overflow-y-auto pb-3">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Spin size="default" />
              </div>
            ) : fetchError ? (
              <div className="p-4 text-center">
                <Text className="text-red-500 text-xs block mb-2">
                  {fetchError}
                </Text>
                <Button
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    setLoading(true);
                    fetchKategoriyalar().finally(() => setLoading(false));
                  }}
                  className="text-indigo-500 border-indigo-200 py-1.5! h-full! rounded-lg!"
                >
                  Qayta yuklash
                </Button>
              </div>
            ) : filtered.length === 0 ? (
              <Text className="block text-center text-slate-400 text-sm p-5">
                {search ? "Hech narsa topilmadi" : "Kategoriyalar mavjud emas"}
              </Text>
            ) : (
              filtered.map((item) => (
                <KategoriyaRow
                  key={item.id}
                  item={item}
                  onSelect={setSelected}
                  selectedId={selected?.id ?? null}
                />
              ))
            )}
          </div>
        </div>

        {/* ── Detail panel ── */}
        <div className="flex-1 overflow-y-auto p-6">
          {selected ? (
            detailLoading ? (
              <div className="flex justify-center items-center h-full">
                <Spin size="large" />
              </div>
            ) : selectedDetail ? (
              <div className="animate-[fadeIn_0.2s_ease]">
                {/* Header card */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
                      <FolderOpenFilled className="text-amber-400 text-xl" />
                    </div>
                    <div>
                      <Title level={4} className="!mb-1 !text-slate-800">
                        {selectedDetail.nomi}
                      </Title>
                      <code className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        {selectedDetail.full_path}
                      </code>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      icon={<EditOutlined />}
                      size="middle"
                      onClick={() => setEditId(selectedDetail.id)}
                      className="border-slate-200 text-slate-500 hover:!text-indigo-500 hover:!border-indigo-300 rounded-xl!"
                    >
                      Tahrirlash
                    </Button>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {statCards.map(({ label, value, color, bg }) => (
                    <div
                      key={label}
                      className="bg-white rounded-xl p-4 border border-slate-200"
                    >
                      <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                        {label}
                      </Text>
                      <span
                        className="inline-block text-sm font-bold px-2.5 py-1 rounded-lg"
                        style={{ color, backgroundColor: bg }}
                      >
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Tavsif */}
                {selectedDetail.tavsif && (
                  <div className="bg-white rounded-xl p-4 border border-slate-200 mb-4">
                    <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                      Tavsif
                    </Text>
                    <Text className="text-sm text-slate-500 leading-relaxed">
                      {selectedDetail.tavsif}
                    </Text>
                  </div>
                )}

                <div className="bg-white rounded-xl p-4 border border-slate-200 mb-4">
                  <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">
                    Shu kategoriya bo'yicha hujjatlar
                  </Text>
                  {relatedDocsLoading ? (
                    <div className="flex justify-center py-8">
                      <Spin size="small" />
                    </div>
                  ) : relatedDocs.length === 0 ? (
                    <Text className="text-sm text-slate-400">
                      Hujjatlar topilmadi.
                    </Text>
                  ) : (
                    <div className="space-y-2">
                      {relatedDocs.slice(0, 6).map((doc) => (
                        <button
                          key={doc.id}
                          onClick={() => navigate(`/hujjatlar/${doc.id}`)}
                          className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3 text-left transition-all hover:border-indigo-300 hover:bg-slate-50"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-700">
                              {doc.nomi}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              {doc.obyekt_nomi} • {doc.boshqarma_nomi} • {doc.fayl_turi}
                            </p>
                          </div>
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                            {doc.holat_display}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Children */}
                {(selectedDetail.children?.length ?? 0) > 0 && (
                  <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">
                      Bolalar kategoriyalar ({selectedDetail.children.length})
                    </Text>
                    <div className="flex flex-col gap-2">
                      {selectedDetail.children.map((child) => (
                        <div
                          key={child.id}
                          onClick={() => setSelected(child)}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-slate-200 cursor-pointer hover:border-indigo-300 hover:bg-slate-50 transition-all"
                        >
                          <FolderFilled className="text-slate-300 flex-shrink-0" />
                          <span className="flex-1 text-[13px] text-slate-600 font-medium truncate">
                            {child.nomi}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-slate-400">
                            <FileTextOutlined className="text-[10px]" />
                            {child.hujjatlar_soni}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-300">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                <FolderFilled className="text-3xl text-slate-300" />
              </div>
              <Text className="text-sm font-semibold text-slate-400">
                Kategoriya tanlanmagan
              </Text>
              <Text className="text-xs text-slate-300">
                Chap paneldan bir kategoriyani bosing
              </Text>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal ── */}
      <AddModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSaved={fetchKategoriyalar}
        boshqarmalar={boshqarmalar}
        obyektlar={obyektlar}
        kategoriyalar={kategoriyalar}
      />

      <EditModal
        kategoriyaId={editId}
        onClose={() => setEditId(null)}
        onSaved={() => {
          fetchKategoriyalar();
          setSelectedDetail(null);
        }}
        boshqarmalar={boshqarmalar}
        obyektlar={obyektlar}
        kategoriyalar={kategoriyalar}
      />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
};

export default KategoriyalarPage;
