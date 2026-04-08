import { useEffect, useState } from "react";
import { Button, Form, Input, Modal, Popconfirm, Select, Spin, Switch, message } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined, SafetyOutlined } from "@ant-design/icons";
import api from "@/services/api/axios";
import { API_ENDPOINTS } from "@/services/api/endpoints";

interface Lavozim {
  id: number;
  kodi: string;
  nomi: string;
  tartib: number;
  is_active: boolean;
  is_system?: boolean;
}

const LavozimlarPage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [items, setItems] = useState<Lavozim[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Lavozim | null>(null);
  const [form] = Form.useForm();

  const fetchLavozimlar = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ results?: Lavozim[] } | Lavozim[]>(
        API_ENDPOINTS.LAVOZIMLAR.LIST,
        { params: { all: true } },
      );
      setItems(Array.isArray(res.data) ? res.data : (res.data.results ?? []));
    } catch (error) {
      console.error(error);
      messageApi.error("Lavozimlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLavozimlar();
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ tartib: 100, is_active: true });
    setModalOpen(true);
  };

  const openEdit = (item: Lavozim) => {
    setEditing(item);
    form.setFieldsValue(item);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editing) {
        await api.put(API_ENDPOINTS.LAVOZIMLAR.DETAIL(editing.id), values);
        messageApi.success("Lavozim yangilandi");
      } else {
        await api.post(API_ENDPOINTS.LAVOZIMLAR.LIST, values);
        messageApi.success("Lavozim yaratildi");
      }
      setModalOpen(false);
      form.resetFields();
      setEditing(null);
      fetchLavozimlar();
    } catch (error) {
      console.error(error);
      messageApi.error("Lavozimni saqlashda xatolik");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: Lavozim) => {
    try {
      setSaving(true);
      await api.delete(API_ENDPOINTS.LAVOZIMLAR.DETAIL(item.id));
      messageApi.success("Lavozim o'chirildi");
      fetchLavozimlar();
    } catch (error) {
      console.error(error);
      messageApi.error("Lavozimni o'chirishda xatolik");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8 rounded-xl">
      {contextHolder}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.2em] mb-1">
            Sozlamalar
          </p>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
            Lavozimlar
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Tizimdagi lavozimlarni admin panel darajasida boshqaring.
          </p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Lavozim qo'shish
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Spin size="large" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {["Nomi", "Kod", "Tartib", "Holati", "Amallar"].map((col) => (
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
              {items.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-4 py-3.5 text-sm font-semibold text-slate-700">
                    {item.nomi}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-slate-500 font-mono">
                    {item.kodi}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-slate-500">
                    {item.tartib}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        item.is_active
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <SafetyOutlined className="text-[11px]" />
                      {item.is_active ? "Faol" : "Nofaol"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => openEdit(item)}
                      />
                      <Popconfirm
                        title="Lavozimni o'chirasizmi?"
                        okText="O'chirish"
                        cancelText="Bekor qilish"
                        onConfirm={() => handleDelete(item)}
                        disabled={Boolean(item.is_system)}
                      >
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          disabled={Boolean(item.is_system)}
                        />
                      </Popconfirm>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        title={editing ? "Lavozimni tahrirlash" : "Lavozim yaratish"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        okText="Saqlash"
        cancelText="Bekor qilish"
        confirmLoading={saving}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="nomi"
            label="Nomi"
            rules={[{ required: true, message: "Lavozim nomini kiriting" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="kodi"
            label="Kod"
            rules={[
              { required: true, message: "Kod kiriting" },
              {
                pattern: /^[a-z0-9_]+$/,
                message: "Faqat kichik harf, raqam va _ ishlating",
              },
            ]}
          >
            <Input
              placeholder="masalan: loyiha_nazoratchi"
              disabled={Boolean(editing?.is_system)}
            />
          </Form.Item>
          <Form.Item name="tartib" label="Tartib">
            <Select
              options={Array.from({ length: 20 }, (_, index) => ({
                value: (index + 1) * 10,
                label: String((index + 1) * 10),
              }))}
            />
          </Form.Item>
          <Form.Item name="is_active" label="Faol" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LavozimlarPage;
