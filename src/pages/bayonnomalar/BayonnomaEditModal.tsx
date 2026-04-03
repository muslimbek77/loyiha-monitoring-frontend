import api from "@/services/api/axios";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Upload,
  Button,
  message,
  Spin,
} from "antd";
import {
  EditOutlined,
  CalendarOutlined,
  FileTextOutlined,
  TeamOutlined,
  MessageOutlined,
  UploadOutlined,
  SaveOutlined,
  CloseOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
const { TextArea } = Input;

// ─── Types ────────────────────────────────────────────────────────────────────

interface BayonnomaEditPayload {
  raqami: string;
  sana: string;
  mavzu: string;
  fayl?: string;
  ishtirokchilar?: string;
  izoh?: string;
}

interface BayonnomaEditData {
  id: number;
  raqami: string;
  sana: string;
  mavzu: string;
  fayl?: string;
  ishtirokchilar?: string;
  izoh?: string;
}

interface BayonnomaEditModalProps {
  open: boolean;
  bayonnoma: BayonnomaEditData | null;
  onClose: () => void;
  onSuccess: (updated: BayonnomaEditData) => void;
}

// ─── Field wrapper component ──────────────────────────────────────────────────

const FieldLabel = ({
  icon,
  label,
  required,
}: {
  icon: React.ReactNode;
  label: string;
  required?: boolean;
}) => (
  <span className="flex items-center gap-1.5 text-slate-600 font-medium text-sm">
    <span className="text-indigo-400">{icon}</span>
    {label}
    {required && <span className="text-red-400 ml-0.5">*</span>}
  </span>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const BayonnomaEditModal = ({
  open,
  bayonnoma,
  onClose,
  onSuccess,
}: BayonnomaEditModalProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // Populate form when bayonnoma changes
  useEffect(() => {
    if (bayonnoma && open) {
      form.setFieldsValue({
        raqami: bayonnoma.raqami,
        sana: bayonnoma.sana || "",
        mavzu: bayonnoma.mavzu,
        ishtirokchilar: bayonnoma.ishtirokchilar ?? "",
        izoh: bayonnoma.izoh ?? "",
      });
      setFile(null);
    }
  }, [bayonnoma, open, form]);

  const handleCancel = () => {
    form.resetFields();
    setFile(null);
    onClose();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const formData = new FormData();
      formData.append("raqami", values.raqami);
      formData.append("sana", values.sana || "");
      formData.append("mavzu", values.mavzu);
      formData.append("ishtirokchilar", values.ishtirokchilar ?? "");
      formData.append("izoh", values.izoh ?? "");
      if (file) {
        formData.append("fayl", file);
      }

      const res = await api.put<BayonnomaEditData>(
        API_ENDPOINTS.BAYONNOMALAR.DETAIL(bayonnoma!.id),
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      message.success("Bayonnoma muvaffaqiyatli yangilandi");
      onSuccess(res.data);
      handleCancel();
    } catch (err: any) {
      if (err?.errorFields) return; // Ant Design validation error, no toast needed
      message.error("Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={600}
      centered
      destroyOnClose
      closable={false}
      styles={{
        content: {
          padding: 0,
          borderRadius: 20,
          overflow: "hidden",
          boxShadow:
            "0 25px 50px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(148,163,184,0.15)",
        },
        mask: { backdropFilter: "blur(4px)", background: "rgba(15,23,42,0.4)" },
      }}
    >
      {/* ── Modal Header ── */}
      <div className="relative bg-gradient-to-br from-slate-600 via-slate-500 to-slate-500 px-6 py-5 overflow-hidden rounded-xl">
        {/* decorative blobs */}
        <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
        <div className="absolute bottom-0 left-1/2 h-16 w-32 rounded-full bg-indigo-300/20 blur-2xl" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 backdrop-blur-sm shadow-inner">
              <EditOutlined className="text-white text-base" />
            </div>
            <div>
              <p className="text-white font-bold text-base leading-tight">
                Bayonnomani tahrirlash
              </p>
              {bayonnoma && (
                <p className="text-indigo-200 text-xs font-mono mt-0.5">
                  #{bayonnoma.raqami}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/75 hover:bg-white/95 transition-colors"
          >
            <CloseOutlined color="" className="text-white text-sm" />
          </button>
        </div>
      </div>

      {/* ── Form Body ── */}
      <div className="bg-white px-6 py-6">
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          disabled={loading}
        >
          {/* Raqami + Sana row */}
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="raqami"
              label={
                <FieldLabel
                  icon={<FileTextOutlined />}
                  label="Bayonnoma raqami"
                  required
                />
              }
              rules={[{ required: true, message: "Raqamni kiriting" }]}
              className="mb-4!"
            >
              <Input
                placeholder="Masalan: 01-25"
                className="rounded-xl! border-slate-200! hover:border-indigo-300! focus:border-indigo-500! h-10!"
              />
            </Form.Item>

            <Form.Item
              name="sana"
              label={
                <FieldLabel icon={<CalendarOutlined />} label="Sana" required />
              }
              rules={[{ required: true, message: "Sanani tanlang" }]}
              className="mb-4!"
            >
              <input
                type="date"
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-700 outline-none transition hover:border-indigo-300 focus:border-indigo-500"
              />
            </Form.Item>
          </div>

          {/* Mavzu */}
          <Form.Item
            name="mavzu"
            label={
              <FieldLabel icon={<FileTextOutlined />} label="Mavzu" required />
            }
            rules={[{ required: true, message: "Mavzuni kiriting" }]}
            className="mb-4!"
          >
            <Input
              placeholder="Bayonnoma mavzusini kiriting"
              className="rounded-xl! border-slate-200! hover:border-indigo-300! focus:border-indigo-500! h-10!"
            />
          </Form.Item>

          {/* Ishtirokchilar */}
          <Form.Item
            name="ishtirokchilar"
            label={
              <FieldLabel icon={<TeamOutlined />} label="Ishtirokchilar" />
            }
            className="mb-4!"
          >
            <TextArea
              rows={3}
              placeholder="Ishtirokchilar ro'yxatini kiriting (har bir satrda bitta)..."
              className="rounded-xl! border-slate-200! hover:border-indigo-300! focus:border-indigo-500! resize-none!"
            />
          </Form.Item>

          {/* Izoh */}
          <Form.Item
            name="izoh"
            label={<FieldLabel icon={<MessageOutlined />} label="Izoh" />}
            className="mb-4!"
          >
            <TextArea
              rows={2}
              placeholder="Qo'shimcha izoh..."
              className="rounded-xl! border-slate-200! hover:border-indigo-300! focus:border-indigo-500! resize-none!"
            />
          </Form.Item>

          <Form.Item
            label={<FieldLabel icon={<UploadOutlined />} label="Fayl yuklash" />}
            className="mb-4!"
          >
            <Upload
              beforeUpload={(file) => {
                setFile(file);
                return false; // prevent auto upload
              }}
              maxCount={1}
              showUploadList={{ showRemoveIcon: true }}
              onRemove={() => setFile(null)}
            >
              <Button
                icon={<UploadOutlined />}
                className="rounded-xl! border-slate-200! h-10! font-medium!"
              >
                Fayl tanlash
              </Button>
            </Upload>
          </Form.Item>

          <div className="my-4 h-px bg-slate-100" />

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Button
              onClick={handleCancel}
              disabled={loading}
              className="rounded-xl! border-slate-200! text-slate-600! h-10! px-5! font-medium!"
            >
              Chiqish
            </Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={loading}
              icon={loading ? <LoadingOutlined /> : <SaveOutlined />}
              className="rounded-xl! h-10! px-6! font-semibold! bg-indigo-600! hover:bg-indigo-700! border-none! shadow-md! shadow-indigo-200!"
            >
              {loading ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default BayonnomaEditModal;

// ─── Usage example in BayonnomaSinglePage ─────────────────────────────────────
//
// import BayonnomaEditModal from "./BayonnomaEditModal";
//
// const [editOpen, setEditOpen] = useState(false);
//
// <button onClick={() => setEditOpen(true)}>
//   <EditOutlined /> Tahrirlash
// </button>
//
// <BayonnomaEditModal
//   open={editOpen}
//   bayonnoma={data}
//   onClose={() => setEditOpen(false)}
//   onSuccess={(updated) => setData((prev) => prev ? { ...prev, ...updated } : prev)}
// />
