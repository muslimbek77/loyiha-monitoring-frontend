import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Empty,
  Form,
  Input,
  Modal,
  Select,
  Spin,
  Tag,
  Upload,
  message,
} from "antd";
import type { UploadFile } from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  FileOutlined,
  FolderOpenOutlined,
  PlusOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import api from "@/services/api/axios";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import { buildAssetUrl } from "@/lib/media";
import { getLavozimLabel } from "@/lib/lavozim";

interface XodimType {
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
  holat: string;
  holat_display: string;
  yuklangan_vaqt: string;
  fayl_turi: string;
}

interface KategoriyaType {
  id: number;
  nomi: string;
  full_path: string;
  parent: number | null;
  obyekt: number | null;
  obyekt_nomi: string;
  hujjatlar_soni: number;
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

interface BoshqarmaType {
  id: number;
  nomi: string;
  qisqa_nomi: string;
}

interface OverviewResponse {
  boshqarma: BoshqarmaType;
  statistika: StatistikaType;
  xodimlar: XodimType[];
  hujjatlar: HujjatType[];
  kategoriyalar: KategoriyaType[];
}

type TabKey = "xodimlar" | "hujjatlar";

const EmptyState = ({ text }: { text: string }) => (
  <div className="bg-white rounded-2xl border border-slate-200 py-16">
    <Empty description={text} />
  </div>
);

const statCards = [
  { key: "xodimlar_soni", label: "Xodimlar", icon: <TeamOutlined /> },
  { key: "hujjatlar_soni", label: "Hujjatlar", icon: <FileOutlined /> },
  { key: "kategoriyalar_soni", label: "Papkalar", icon: <FolderOpenOutlined /> },
  { key: "obyektlar_soni", label: "Obyektlar", icon: <FolderOpenOutlined /> },
  { key: "ochiq_talablar_soni", label: "Ochiq talablar", icon: <FileOutlined /> },
];

const BoshqarmaSinglePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [activeTab, setActiveTab] = useState<TabKey>("xodimlar");
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<OverviewResponse | null>(null);
  const [selectedKategoriyaId, setSelectedKategoriyaId] = useState<number | null>(
    null,
  );
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<KategoriyaType | null>(null);
  const [saving, setSaving] = useState(false);
  const [editForm] = Form.useForm();
  const [categoryForm] = Form.useForm();
  const [documentForm] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const fetchOverview = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.get<OverviewResponse>(API_ENDPOINTS.BOSHQARMA.OVERVIEW(id));
      setDetail(res.data);
      setSelectedKategoriyaId((prev) =>
        prev ?? res.data.kategoriyalar[0]?.id ?? null,
      );
      editForm.setFieldsValue({
        nomi: res.data.boshqarma.nomi,
        qisqa_nomi: res.data.boshqarma.qisqa_nomi,
      });
    } catch (error) {
      console.error(error);
      messageApi.error("Boshqarma ma'lumotlarini yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [id]);

  const kategoriyaTree = useMemo(() => {
    const all = detail?.kategoriyalar ?? [];
    const map = new Map<number, KategoriyaType & { children: KategoriyaType[] }>();
    all.forEach((item) => map.set(item.id, { ...item, children: [] }));
    const roots: (KategoriyaType & { children: KategoriyaType[] })[] = [];
    map.forEach((item) => {
      if (item.parent && map.has(item.parent)) {
        map.get(item.parent)?.children.push(item);
      } else {
        roots.push(item);
      }
    });
    return roots;
  }, [detail]);

  const selectedKategoriya = detail?.kategoriyalar.find(
    (item) => item.id === selectedKategoriyaId,
  );

  const categoryDocumentIds = useMemo(() => {
    if (!detail || !selectedKategoriyaId) return new Set<number>();
    const ids = new Set<number>([selectedKategoriyaId]);
    let updated = true;
    while (updated) {
      updated = false;
      detail.kategoriyalar.forEach((item) => {
        if (item.parent && ids.has(item.parent) && !ids.has(item.id)) {
          ids.add(item.id);
          updated = true;
        }
      });
    }
    return ids;
  }, [detail, selectedKategoriyaId]);

  const filteredDocuments = useMemo(() => {
    if (!detail) return [];
    if (!selectedKategoriyaId) return detail.hujjatlar;
    return detail.hujjatlar.filter(
      (item) => item.kategoriya && categoryDocumentIds.has(item.kategoriya),
    );
  }, [categoryDocumentIds, detail, selectedKategoriyaId]);

  const handleEditSubmit = async () => {
    if (!id) return;
    try {
      const values = await editForm.validateFields();
      setSaving(true);
      await api.put(API_ENDPOINTS.BOSHQARMA.DETAIL(id), values);
      messageApi.success("Boshqarma yangilandi");
      setEditModalOpen(false);
      fetchOverview();
    } catch (error) {
      console.error(error);
      messageApi.error("Boshqarmani saqlashda xatolik");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      setSaving(true);
      await api.delete(API_ENDPOINTS.BOSHQARMA.DETAIL(id));
      messageApi.success("Boshqarma o'chirildi");
      navigate("/boshqarma");
    } catch (error) {
      console.error(error);
      messageApi.error("Boshqarmani o'chirishda xatolik");
    } finally {
      setSaving(false);
    }
  };

  const openCreateCategoryModal = () => {
    setEditingCategory(null);
    categoryForm.resetFields();
    categoryForm.setFieldsValue({
      parent: selectedKategoriyaId ?? undefined,
    });
    setCategoryModalOpen(true);
  };

  const openEditCategoryModal = (category: KategoriyaType) => {
    setEditingCategory(category);
    categoryForm.setFieldsValue({
      nomi: category.nomi,
      parent: category.parent ?? undefined,
      tavsif: "",
    });
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!detail) return;
    try {
      const values = await categoryForm.validateFields();
      setSaving(true);
      const payload = {
        nomi: values.nomi,
        boshqarma: detail.boshqarma.id,
        parent: values.parent ?? null,
        tavsif: values.tavsif ?? "",
      };

      if (editingCategory) {
        await api.put(API_ENDPOINTS.KATEGORIYALAR.DETAIL(editingCategory.id), payload);
        messageApi.success("Papka yangilandi");
      } else {
        await api.post(API_ENDPOINTS.KATEGORIYALAR.LIST, payload);
        messageApi.success("Papka yaratildi");
      }

      setCategoryModalOpen(false);
      categoryForm.resetFields();
      setEditingCategory(null);
      fetchOverview();
    } catch (error) {
      console.error(error);
      messageApi.error(
        editingCategory ? "Papkani saqlashda xatolik" : "Papka yaratishda xatolik",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCreateDocument = async () => {
    if (!detail) return;
    try {
      const values = await documentForm.validateFields();
      const file = fileList[0]?.originFileObj;
      if (!file) {
        messageApi.error("Hujjat faylini tanlang");
        return;
      }

      setSaving(true);
      const formData = new FormData();
      formData.append("nomi", values.nomi);
      formData.append("boshqarma", String(detail.boshqarma.id));
      formData.append("kategoriya", String(values.kategoriya));
      formData.append("fayl", file);
      if (values.izoh) formData.append("izoh", values.izoh);
      if (values.korinish) formData.append("korinish", values.korinish);

      await api.post(API_ENDPOINTS.HUJJATLAR.LIST, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      messageApi.success("Hujjat yuklandi");
      setDocumentModalOpen(false);
      documentForm.resetFields();
      setFileList([]);
      fetchOverview();
    } catch (error) {
      console.error(error);
      messageApi.error("Hujjat yuklashda xatolik");
    } finally {
      setSaving(false);
    }
  };

  const renderCategoryNode = (
    category: KategoriyaType & { children: KategoriyaType[] },
    depth = 0,
  ): React.ReactNode => (
    <div key={category.id}>
      <button
        type="button"
        onClick={() => setSelectedKategoriyaId(category.id)}
        className={`w-full text-left flex items-center justify-between rounded-xl px-3 py-2 transition ${
          selectedKategoriyaId === category.id
            ? "bg-blue-50 text-blue-700"
            : "hover:bg-slate-50 text-slate-700"
        }`}
        style={{ paddingLeft: 12 + depth * 18 }}
      >
        <span className="flex items-center gap-2 min-w-0">
          <FolderOpenOutlined />
          <span className="truncate">{category.nomi}</span>
        </span>
        <span className="text-xs text-slate-400">{category.hujjatlar_soni}</span>
      </button>
      {category.children.map((child) => renderCategoryNode(child, depth + 1))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  if (!detail) return null;

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8 rounded-xl">
      {contextHolder}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors mb-3 cursor-pointer"
          >
            <ArrowLeftOutlined className="text-[10px]" />
            Boshqarmalar
          </button>
          <h1 className="text-2xl font-semibold text-slate-800">
            {detail.boshqarma.nomi}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {detail.boshqarma.qisqa_nomi} bo'yicha xodimlar, papkalar va hujjatlar
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button icon={<EditOutlined />} onClick={() => setEditModalOpen(true)}>
            Tahrirlash
          </Button>
          <Button danger icon={<DeleteOutlined />} loading={saving} onClick={handleDelete}>
            O'chirish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3 mb-6">
        {statCards.map((card) => (
          <div
            key={card.key}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm px-4 py-4"
          >
            <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-wide">
              {card.icon}
              {card.label}
            </div>
            <p className="mt-3 text-2xl font-semibold text-slate-800">
              {detail.statistika[card.key as keyof StatistikaType]}
            </p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 mb-5 bg-white border border-slate-200 rounded-xl p-1 w-fit shadow-sm">
        {[
          { key: "xodimlar", label: "Xodimlar", icon: <TeamOutlined /> },
          { key: "hujjatlar", label: "Hujjatlar", icon: <FileOutlined /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabKey)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.key
                ? "bg-slate-800 text-white"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "xodimlar" ? (
        detail.xodimlar.length === 0 ? (
          <EmptyState text="Bu boshqarmada xodimlar topilmadi" />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["F.I.O", "Lavozim", "Holati"].map((col) => (
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
                {detail.xodimlar.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => navigate(`/users/${user.id}`)}
                    className="border-b border-slate-100 last:border-b-0 cursor-pointer hover:bg-slate-50"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                          {user.avatar ? (
                            <img
                              src={buildAssetUrl(user.avatar)}
                              alt={user.fio}
                              className="w-full h-full object-cover"
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
                      <Tag color="blue">{getLavozimLabel(user.lavozim)}</Tag>
                    </td>
                    <td className="px-4 py-3.5">
                      <Tag color={user.is_active ? "green" : "default"}>
                        {user.is_active ? "Aktiv" : "Nofaol"}
                      </Tag>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="grid grid-cols-[320px,1fr] gap-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-700">Papkalar</h3>
              <Button
                type="text"
                icon={<PlusOutlined />}
                onClick={openCreateCategoryModal}
              />
            </div>
            <div className="space-y-1">
              {kategoriyaTree.length > 0 ? (
                kategoriyaTree.map((item) => renderCategoryNode(item))
              ) : (
                <Empty description="Kategoriya topilmadi" />
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  {selectedKategoriya?.nomi ?? "Barcha hujjatlar"}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {selectedKategoriya?.full_path ??
                    "Boshqarma hujjatlari kategoriya va papkalar bo'yicha ko'rsatiladi."}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedKategoriya && (
                  <Button icon={<EditOutlined />} onClick={() => openEditCategoryModal(selectedKategoriya)}>
                    Papkani tahrirlash
                  </Button>
                )}
                <Button
                  type="primary"
                  icon={<UploadOutlined />}
                  onClick={() => setDocumentModalOpen(true)}
                >
                  Hujjat yuklash
                </Button>
              </div>
            </div>

            {filteredDocuments.length === 0 ? (
              <EmptyState text="Tanlangan papkada hujjat topilmadi" />
            ) : (
              <div className="space-y-3">
                {filteredDocuments.map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => navigate(`/hujjatlar/${doc.id}`)}
                    className="w-full text-left rounded-2xl border border-slate-200 px-4 py-4 hover:border-slate-300 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {doc.nomi}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 truncate">
                          {doc.kategoriya_full_path ?? doc.kategoriya_nomi}
                          {doc.obyekt_nomi ? ` • ${doc.obyekt_nomi}` : ""}
                        </p>
                      </div>
                      <Tag color={doc.holat === "tasdiqlandi" ? "green" : "gold"}>
                        {doc.holat_display}
                      </Tag>
                    </div>
                    <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                      <span>{doc.fayl_turi || "Fayl"}</span>
                      <span>
                        {new Date(doc.yuklangan_vaqt).toLocaleDateString("uz-UZ")}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <Modal
        title="Boshqarmani tahrirlash"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={handleEditSubmit}
        okText="Saqlash"
        cancelText="Bekor qilish"
        confirmLoading={saving}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="nomi"
            label="Nomi"
            rules={[{ required: true, message: "Nomini kiriting" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="qisqa_nomi"
            label="Qisqa nomi"
            rules={[{ required: true, message: "Qisqa nomini kiriting" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingCategory ? "Papkani tahrirlash" : "Papka yaratish"}
        open={categoryModalOpen}
        onCancel={() => {
          setCategoryModalOpen(false);
          setEditingCategory(null);
          categoryForm.resetFields();
        }}
        onOk={handleSaveCategory}
        okText={editingCategory ? "Saqlash" : "Yaratish"}
        cancelText="Bekor qilish"
        confirmLoading={saving}
      >
        <Form form={categoryForm} layout="vertical">
          <Form.Item
            name="nomi"
            label="Kategoriya nomi"
            rules={[{ required: true, message: "Kategoriya nomini kiriting" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="parent" label="Ota papka">
            <Select
              allowClear
              options={detail.kategoriyalar.map((item) => ({
                value: item.id,
                label: item.full_path,
              }))}
            />
          </Form.Item>
          <Form.Item name="tavsif" label="Izoh">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Hujjat yuklash"
        open={documentModalOpen}
        onCancel={() => {
          setDocumentModalOpen(false);
          setFileList([]);
        }}
        onOk={handleCreateDocument}
        okText="Yuklash"
        cancelText="Bekor qilish"
        confirmLoading={saving}
      >
        <Form
          form={documentForm}
          layout="vertical"
          initialValues={{
            kategoriya: selectedKategoriyaId ?? undefined,
            korinish: "rahbariyat_va_boshqarma",
          }}
        >
          <Form.Item
            name="nomi"
            label="Hujjat nomi"
            rules={[{ required: true, message: "Hujjat nomini kiriting" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="kategoriya"
            label="Kategoriya"
            rules={[{ required: true, message: "Kategoriyani tanlang" }]}
          >
            <Select
              options={detail.kategoriyalar.map((item) => ({
                value: item.id,
                label: item.full_path,
              }))}
            />
          </Form.Item>
          <Form.Item name="korinish" label="Ko'rinish">
            <Select
              options={[
                {
                  value: "rahbariyat_va_boshqarma",
                  label: "Rahbariyat va o'z boshqarmasi",
                },
                { value: "hammaga", label: "Hamma ko'rsin" },
              ]}
            />
          </Form.Item>
          <Form.Item name="izoh" label="Izoh">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="Fayl">
            <Upload
              beforeUpload={() => false}
              fileList={fileList}
              maxCount={1}
              onChange={({ fileList: next }) => setFileList(next)}
            >
              <Button icon={<UploadOutlined />}>Fayl tanlash</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BoshqarmaSinglePage;
