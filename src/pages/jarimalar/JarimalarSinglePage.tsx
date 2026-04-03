import {
  Card,
  Descriptions,
  Tag,
  Typography,
  Spin,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/services/api/axios";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import { formatDate } from "@/shared/components/const/CustomUI";
import { Delete } from "lucide-react";

const { Title } = Typography;

interface Jarima {
  id: number;
  boshqarma: number;
  boshqarma_nomi: string;
  hujjat: number | null;
  hujjat_nomi: string | null;
  topshiriq: number | null;
  topshiriq_mazmun: string | null;
  talab: number | null;
  sabab: string;
  sabab_display: string;
  ball: number;
  izoh: string;
  beruvchi: string | null;
  avtomatik: boolean;
  created_at: string;
}

interface PatchPayload {
  boshqarma?: number;
  hujjat?: number | null;
  topshiriq?: number | null;
  talab?: number | null;
  sabab?: string;
  ball?: number;
  izoh?: string;
  beruvchi?: number | null;
  avtomatik?: boolean;
}

const SABAB_OPTIONS = [
  { value: "kechikish", label: "Hujjat kechikishi" },
  { value: "sifatsiz_ijro", label: "Sifatsiz ijro (rad etildi)" },
  { value: "topshiriq_bajarilmadi", label: "Topshiriq bajarilmadi" },
  { value: "talab_bajarilmadi", label: "Talabnoma bajarilmadi" },
  { value: "boshqa", label: "Boshqa sabab" },
];

const JarimalarSinglePage = () => {
  const { id } = useParams();
  const [data, setData] = useState<Jarima | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<PatchPayload>();

  const navigate = useNavigate();

  const fetchJarima = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.JARIMALAR.DETAIL(id!));
      setData(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJarima();
  }, [id]);

  const openEdit = () => {
    if (!data) return;
    form.setFieldsValue({
      boshqarma: data.boshqarma,
      hujjat: data.hujjat ?? undefined,
      topshiriq: data.topshiriq ?? undefined,
      talab: data.talab ?? undefined,
      sabab: data.sabab,
      ball: data.ball,
      izoh: data.izoh,
      beruvchi: data.beruvchi ? Number(data.beruvchi) : undefined,
      avtomatik: data.avtomatik,
    });
    setEditOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      // Build payload — omit undefined values
      const payload: PatchPayload = Object.fromEntries(
        Object.entries(values).filter(([, v]) => v !== undefined),
      ) as PatchPayload;

      await api.patch(`${API_ENDPOINTS.JARIMALAR.LIST}${id}/`, payload);
      message.success("Jarima muvaffaqiyatli yangilandi");
      setEditOpen(false);
      await fetchJarima();
    } catch (err: any) {
      if (err?.errorFields) return; // form validation error
      message.error("Xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`${API_ENDPOINTS.JARIMALAR.LIST}${id}/`);
      message.success("Jarima muvaffaqiyatli o'chirildi");
      navigate("/jarimalar");
    } catch (error) {
      message.error("Xatolik yuz berdi. Qayta urinib ko'ring.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center text-red-500">Ma'lumot topilmadi</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Button
        icon={<ArrowLeftOutlined className="w-3 h-2" />}
        onClick={() => navigate(-1)}
        className="mb-5 border-white/30 text-white py-1.5! rounded-xl! hover:bg-white/20 hover:text-white hover:border-white/50 bg-white/10"
      >
        Orqaga
      </Button>
      <div className="flex items-center justify-between">
        <Title level={3} className="mb-0!">
          Jarima #{data.id}
        </Title>
        <div className="flex items-center gap-2">
          <Button type="primary" icon={<EditOutlined />} onClick={openEdit}>
            Tahrirlash
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={handleDelete}
          >
            O'chirish
          </Button>
        </div>
      </div>

      {/* Basic Info */}
      <Card className="shadow-sm mb-10!">
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Boshqarma">
            {data.boshqarma_nomi}
          </Descriptions.Item>

          <Descriptions.Item label="Sabab">
            <Tag color="red">{data.sabab_display}</Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Ball">
            <Tag color="orange">{data.ball}</Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Avtomatik">
            {data.avtomatik ? (
              <Tag color="blue">Avtomatik</Tag>
            ) : (
              <Tag color="green">Qo'lda</Tag>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Izoh">{data.izoh || "-"}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Related */}
      <Card title="Bog'liq ma'lumotlar" className="shadow-sm mb-10!">
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Hujjat">
            {data.hujjat_nomi || "-"}
          </Descriptions.Item>

          <Descriptions.Item label="Topshiriq">
            {data.topshiriq_mazmun || "-"}
          </Descriptions.Item>

          <Descriptions.Item label="Talab">
            {data.talab || "-"}
          </Descriptions.Item>

          <Descriptions.Item label="Beruvchi">
            {data.beruvchi || "-"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Metadata */}
      <Card title="Yaratilgan sana" className="shadow-sm">
        <div className="text-gray-600">
          {formatDate(data.created_at) || (
            <span className="text-gray-400 text-xs">-</span>
          )}
        </div>
      </Card>

      {/* Edit Modal */}
      <Modal
        title={`Jarimani tahrirlash #${data.id}`}
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        onOk={handleSave}
        okText="Saqlash"
        cancelText="Bekor qilish"
        confirmLoading={saving}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            label="Boshqarma"
            name="boshqarma"
            rules={[{ required: true, message: "Boshqarma kiritilishi shart" }]}
          >
            <InputNumber className="w-full" placeholder="Boshqarma ID" />
          </Form.Item>

          <Form.Item label="Hujjat" name="hujjat">
            <InputNumber className="w-full" placeholder="Hujjat ID" />
          </Form.Item>

          <Form.Item label="Topshiriq" name="topshiriq">
            <InputNumber className="w-full" placeholder="Topshiriq ID" />
          </Form.Item>

          <Form.Item label="Talab" name="talab">
            <InputNumber className="w-full" placeholder="Talab ID" />
          </Form.Item>

          <Form.Item
            label="Sabab"
            name="sabab"
            rules={[{ required: true, message: "Sabab tanlanishi shart" }]}
          >
            <Select options={SABAB_OPTIONS} placeholder="Sabab tanlang" />
          </Form.Item>

          <Form.Item
            label="Ball"
            name="ball"
            rules={[{ required: true, message: "Ball kiritilishi shart" }]}
          >
            <InputNumber className="w-full" placeholder="Ball" min={0} />
          </Form.Item>

          <Form.Item label="Izoh" name="izoh">
            <Input.TextArea rows={3} placeholder="Izoh kiriting" />
          </Form.Item>

          <Form.Item label="Beruvchi" name="beruvchi">
            <InputNumber className="w-full" placeholder="Beruvchi ID" />
          </Form.Item>

          <Form.Item label="Avtomatik" name="avtomatik" valuePropName="checked">
            <Switch checkedChildren="Avtomatik" unCheckedChildren="Qo'lda" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default JarimalarSinglePage;
