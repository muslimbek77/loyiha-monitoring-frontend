import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Spin,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message,
  Popconfirm,
  Upload,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  ClockCircleOutlined,
  PhoneOutlined,
  SendOutlined,
} from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import dayjs from "dayjs";
import api from "@/services/api/axios";
import { LAVOZIM_OPTIONS } from "@/shared/components/const/constValues";

interface User {
  id: number;
  username: string;
  fio: string;
  boshqarma: number;
  boshqarma_nomi: string;
  lavozim: string;
  lavozim_display: string;
  telegram_id: string | null;
  telefon: string | null;
  avatar: string | null;
  is_active: boolean;
  date_joined: string;
  last_login: string | null;
}

interface Boshqarma {
  id: number;
  nomi: string;
}

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

const FormLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
    {children}
  </span>
);

const XodimlarSinglePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [boshqarmalar, setBoshqarmalar] = useState<Boshqarma[]>([]);
  const [avatarFileList, setAvatarFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUser();
    fetchBoshqarmalar();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await api.get(`auth/users/${id}`);
      setUser(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBoshqarmalar = async () => {
    try {
      const res = await api.get("core/boshqarmalar/");
      setBoshqarmalar(res.data.results);
    } catch (error) {
      console.error(error);
    }
  };

  const openEditModal = () => {
    if (!user) return;
    form.setFieldsValue({
      username: user.username,
      fio: user.fio,
      boshqarma: user.boshqarma,
      lavozim: user.lavozim,
      telegram_id: user.telegram_id ?? "",
      telefon: user.telefon ?? "",
      is_active: user.is_active,
    });
    setAvatarFileList(
      user.avatar
        ? [{ uid: "-1", name: "avatar", status: "done", url: user.avatar }]
        : [],
    );
    setEditModalOpen(true);
  };

  const handleEdit = async () => {
    try {
      const values = await form.validateFields();
      setEditLoading(true);
      const formData = new FormData();
      formData.append("username", values.username);
      formData.append("fio", values.fio);
      formData.append("boshqarma", values.boshqarma);
      formData.append("lavozim", values.lavozim);
      formData.append("telegram_id", values.telegram_id ?? "");
      formData.append("telefon", values.telefon ?? "");
      formData.append("is_active", String(values.is_active));
      const newFile = avatarFileList.find((f) => f.originFileObj);
      if (newFile?.originFileObj) {
        formData.append("avatar", newFile.originFileObj);
      }
      const res = await api.put(`auth/users/${id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(res.data);
      setEditModalOpen(false);
      message.success("Muvaffaqiyatli yangilandi");
    } catch (error) {
      console.error(error);
      message.error("Yangilashda xatolik yuz berdi");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await api.delete(`auth/users/${id}/`);
      message.success("Xodim o'chirildi");
      navigate(-1);
    } catch (error) {
      console.error(error);
      message.error("O'chirishda xatolik yuz berdi");
    } finally {
      setDeleteLoading(false);
    }
  };

  const uploadProps: UploadProps = {
    beforeUpload: () => false,
    fileList: avatarFileList,
    maxCount: 1,
    accept: "image/*",
    listType: "picture",
    onChange: ({ fileList }) => setAvatarFileList(fileList),
    onRemove: () => setAvatarFileList([]),
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8 rounded-xl">
      <div className="max-w-3xl mx-auto">
        {/* Back + breadcrumb */}
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors mb-3 cursor-pointer"
          >
            <ArrowLeftOutlined className="text-[10px]" />
            Xodimlar
          </button>

          <div className="flex items-center justify-between">
            <div>
              {/* <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.2em] mb-1">
                Xodim #{user.id}
              </p> */}
              <h1 className="text-2xl font-semibold text-slate-800 tracking-tight pl-1">
                {user.fio}
              </h1>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={openEditModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 text-xs font-medium rounded-xl shadow-sm transition-all duration-150 cursor-pointer"
              >
                <EditOutlined className="text-[11px]" />
                Tahrirlash
              </button>

              <Popconfirm
                title="Xodimni o'chirish"
                description="Haqiqatan ham bu xodimni o'chirmoqchimisiz?"
                onConfirm={handleDelete}
                okText="Ha, o'chiring"
                cancelText="Bekor qilish"
                okButtonProps={{ danger: true, loading: deleteLoading }}
              >
                <button
                  disabled={deleteLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-rose-200 hover:border-rose-300 text-rose-500 hover:text-rose-600 text-xs font-medium rounded-xl shadow-sm transition-all duration-150 disabled:opacity-50 cursor-pointer"
                >
                  <DeleteOutlined className="text-[11px]" />
                  O'chirish
                </button>
              </Popconfirm>
            </div>
          </div>
        </div>

        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          {/* Avatar + name */}
          <div className="flex items-center gap-5 mb-2">
            <div className="relative flex-shrink-0">
              {user.avatar ? (
                <img
                  src={
                    user.avatar?.startsWith("http://")
                      ? user.avatar.replace("http://", "https://")
                      : user.avatar
                  }
                  alt={user.fio}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                  <UserOutlined className="text-slate-400 text-2xl" />
                </div>
              )}
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${user.is_active ? "bg-emerald-400" : "bg-slate-300"}`}
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                {user.fio}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">
                  {user.lavozim_display}
                </span>
                {user.is_active ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />{" "}
                    Aktiv
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />{" "}
                    Nofaol
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Details */}
          <SectionDivider title="Ma'lumotlar" />
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            <DetailRow label="Username">
              <span className="font-mono text-slate-600">@{user.username}</span>
            </DetailRow>
            <DetailRow label="Boshqarma">{user.boshqarma_nomi}</DetailRow>
            <DetailRow label="Telefon">
              {user.telefon ? (
                <a
                  href={`tel:${user.telefon}`}
                  className="inline-flex items-center gap-1.5 text-blue-600 hover:underline"
                >
                  <PhoneOutlined className="text-[11px]" />
                  {user.telefon}
                </a>
              ) : (
                <span className="text-slate-400">—</span>
              )}
            </DetailRow>
            <DetailRow label="Telegram ID">
              {user.telegram_id ? (
                <span className="inline-flex items-center gap-1.5 text-slate-700">
                  <SendOutlined className="text-[11px] text-slate-400" />
                  {user.telegram_id}
                </span>
              ) : (
                <span className="text-slate-400">—</span>
              )}
            </DetailRow>
            <DetailRow label="Ro'yxatdan o'tgan">
              {dayjs(user.date_joined).format("DD MMM YYYY, HH:mm")}
            </DetailRow>
            <DetailRow label="Oxirgi kirish">
              {user.last_login ? (
                <span className="inline-flex items-center gap-1.5">
                  <ClockCircleOutlined className="text-[11px] text-slate-400" />
                  {dayjs(user.last_login).format("DD MMM YYYY, HH:mm")}
                </span>
              ) : (
                <span className="text-slate-400">Kirmagan</span>
              )}
            </DetailRow>
          </div>
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
              Xodimni tahrirlash
            </span>
          </div>
        }
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={handleEdit}
        okText="Saqlash"
        cancelText="Bekor qilish"
        confirmLoading={editLoading}
        okButtonProps={{
          className: "!bg-slate-800 !border-slate-800 hover:!bg-slate-700",
        }}
        width={520}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="pt-2">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label={<FormLabel>Username</FormLabel>}
              name="username"
              rules={[
                { required: true, message: "Username kiritish majburiy" },
              ]}
            >
              <Input className="rounded-lg" placeholder="username" />
            </Form.Item>

            <Form.Item
              label={<FormLabel>F.I.O</FormLabel>}
              name="fio"
              rules={[{ required: true, message: "FIO kiritish majburiy" }]}
            >
              <Input className="rounded-lg" placeholder="To'liq ism" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label={<FormLabel>Boshqarma</FormLabel>}
              name="boshqarma"
              rules={[
                { required: true, message: "Boshqarma tanlash majburiy" },
              ]}
            >
              <Select
                className="rounded-lg"
                placeholder="Tanlang"
                options={boshqarmalar.map((b) => ({
                  label: b.nomi,
                  value: b.id,
                }))}
              />
            </Form.Item>

            <Form.Item
              label={<FormLabel>Lavozim</FormLabel>}
              name="lavozim"
              rules={[{ required: true, message: "Lavozim tanlash majburiy" }]}
            >
              <Select
                className="rounded-lg"
                placeholder="Tanlang"
                options={LAVOZIM_OPTIONS}
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label={<FormLabel>Telefon</FormLabel>} name="telefon">
              <Input className="rounded-lg" placeholder="+998901234567" />
            </Form.Item>

            <Form.Item
              label={<FormLabel>Telegram ID</FormLabel>}
              name="telegram_id"
            >
              <Input className="rounded-lg" placeholder="@username yoki ID" />
            </Form.Item>
          </div>

          <Form.Item label={<FormLabel>Avatar</FormLabel>}>
            <Upload {...uploadProps}>
              {avatarFileList.length === 0 && (
                <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 text-xs font-medium rounded-lg transition-all">
                  <UploadOutlined />
                  Rasm yuklash
                </button>
              )}
            </Upload>
          </Form.Item>

          <Form.Item
            label={<FormLabel>Holat</FormLabel>}
            name="is_active"
            valuePropName="checked"
          >
            <Switch checkedChildren="Faol" unCheckedChildren="Nofaol" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default XodimlarSinglePage;
