import { useEffect, useState } from "react";
import {
  Badge,
  Avatar,
  Spin,
  Empty,
  Input,
  Modal,
  Form,
  Select,
  Button,
  message,
} from "antd";
import {
  SearchOutlined,
  MessageOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import api from "@/services/api/axios";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import { useNavigate } from "react-router-dom";
import Can from "@/shared/components/guards/Can";

interface OxirgiXabar {
  matn: string;
  yuboruvchi: string;
  vaqt: string;
}

interface Xona {
  id: number;
  nomi: string;
  turi: "obyekt" | "guruh" | "shaxsiy";
  rasm: string | null;
  oxirgi_xabar: OxirgiXabar | null;
  oqilmagan_soni: number;
  ishtirokchilar_soni: number;
  updated_at: string;
}

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Xona[];
}

interface Obyekt {
  id: number;
  nomi: string;
}

interface User {
  id: number;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  fio: string;
}

const formatTime = (isoString: string) => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString("uz-UZ", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (diffDays === 1) {
    return "Kecha";
  } else if (diffDays < 7) {
    return date.toLocaleDateString("uz-UZ", { weekday: "short" });
  } else {
    return date.toLocaleDateString("uz-UZ", {
      day: "2-digit",
      month: "2-digit",
    });
  }
};

const getAvatarColor = (name: string) => {
  const colors = [
    "#1677ff",
    "#52c41a",
    "#fa8c16",
    "#eb2f96",
    "#722ed1",
    "#13c2c2",
    "#f5222d",
  ];
  return colors[name.charCodeAt(0) % colors.length];
};

const getUserLabel = (user: User): string => {
  if (user.fio) return user.fio;
  const parts = [user.first_name, user.last_name].filter(Boolean);
  if (parts.length > 0) return parts.join(" ");
  return user.username ?? `User #${user.id}`;
};

const XonaCard = ({
  xona,
  isActive,
  onClick,
}: {
  xona: Xona;
  isActive: boolean;
  onClick: () => void;
}) => {
  const initials = xona.nomi
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-150 border-b border-gray-100
        ${isActive ? "bg-blue-50 border-l-4 border-l-blue-500" : "hover:bg-gray-50 border-l-4 border-l-transparent"}
      `}
    >
      <div className="relative flex-shrink-0">
        <Avatar
          size={48}
          src={xona.rasm}
          style={{ backgroundColor: getAvatarColor(xona.nomi) }}
          className="font-semibold text-sm"
        >
          {!xona.rasm && initials}
        </Avatar>
        {xona.turi === "obyekt" && (
          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-orange-400 border-2 border-white flex items-center justify-center">
            <span className="text-white text-[8px]">O</span>
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span
            className={`font-semibold truncate text-sm ${isActive ? "text-blue-700" : "text-gray-800"}`}
          >
            {xona.nomi}
          </span>
          {xona.oxirgi_xabar && (
            <span className="text-xs text-gray-400 flex-shrink-0 ml-2 flex items-center gap-1">
              <ClockCircleOutlined className="text-[10px]" />
              {formatTime(xona.updated_at)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {xona.oxirgi_xabar ? (
              <p className="text-xs text-gray-500 truncate">
                <span className="text-gray-600 font-medium">
                  {xona.oxirgi_xabar.yuboruvchi.split(" ")[0]}:{" "}
                </span>
                {xona.oxirgi_xabar.matn}
              </p>
            ) : (
              <p className="text-xs text-gray-400 italic">Xabar yo'q</p>
            )}
          </div>

          <div className="flex items-center gap-2 ml-2 flex-shrink-0">
            {xona.ishtirokchilar_soni > 0 && (
              <span className="flex items-center gap-0.5 text-[11px] text-gray-400">
                <TeamOutlined />
                {xona.ishtirokchilar_soni}
              </span>
            )}
            {xona.oqilmagan_soni > 0 && (
              <Badge
                count={xona.oqilmagan_soni}
                style={{
                  backgroundColor: "#1677ff",
                  fontSize: "11px",
                  minWidth: "18px",
                  height: "18px",
                  lineHeight: "18px",
                  padding: "0 5px",
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatXonalarPage = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // ── New xona modal state
  const [createModal, setCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  // ── Dropdown data
  const [obyektlar, setObyektlar] = useState<Obyekt[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [obyektlarLoading, setObyektlarLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);

  const xonaTuri = Form.useWatch("turi", createForm);

  useEffect(() => {
    fetchXonalar();
  }, []);

  // Fetch obyektlar and users when modal opens
  useEffect(() => {
    if (createModal) {
      fetchObyektlar();
      fetchUsers();
    }
  }, [createModal]);

  const fetchXonalar = async () => {
    try {
      const res = await api.get<ApiResponse>(API_ENDPOINTS.CHAT_XONALAR.LIST);
      setData(res.data);
      if (res.data.results.length > 0) setActiveId(res.data.results[0].id);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ?? err.message ?? "Xatolik yuz berdi",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchObyektlar = async () => {
    setObyektlarLoading(true);
    try {
      const res = await api.get<{ results: Obyekt[] } | Obyekt[]>(
        API_ENDPOINTS.OBYEKTLAR.LIST,
      );
      // Handle both paginated and plain array responses
      const list = Array.isArray(res.data) ? res.data : res.data.results;
      setObyektlar(list);
    } catch {
      // silently fail — field will remain empty
    } finally {
      setObyektlarLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await api.get<{ results: User[] } | User[]>(
        API_ENDPOINTS.USERS.LIST,
      );
      const list = Array.isArray(res.data) ? res.data : res.data.results;
      setUsers(list);
    } catch {
      // silently fail
    } finally {
      setUsersLoading(false);
    }
  };

  // ─── API: POST /chat/xonalar/ ──────────────────────────────────────────────
  const handleCreateXona = async (values: {
    nomi: string;
    turi: "yakka" | "guruh" | "obyekt";
    obyekt?: number;
    ishtirokchi_idlar?: number[];
  }) => {
    setCreateLoading(true);
    try {
      const res = await api.post<Xona>(API_ENDPOINTS.CHAT_XONALAR.LIST, {
        nomi: values.nomi,
        turi: values.turi,
        obyekt: values.obyekt ?? null,
        ishtirokchi_idlar: values.ishtirokchi_idlar ?? [],
      });
      messageApi.success("Xona muvaffaqiyatli yaratildi");
      setCreateModal(false);
      createForm.resetFields();
      setData((prev) =>
        prev
          ? {
              ...prev,
              count: prev.count + 1,
              results: [res.data, ...prev.results],
            }
          : prev,
      );
    } catch (err: any) {
      messageApi.error(
        err?.response?.data?.detail ?? "Xona yaratishda xatolik",
      );
    } finally {
      setCreateLoading(false);
    }
  };

  const handleModalClose = () => {
    setCreateModal(false);
    createForm.resetFields();
  };

  const filtered = data?.results.filter((x) =>
    x.nomi.toLowerCase().includes(search.toLowerCase()),
  );

  const totalUnread =
    data?.results.reduce((sum, x) => sum + x.oqilmagan_soni, 0) ?? 0;

  return (
    <div
      className="flex flex-col h-full bg-gray-5 px-6 py-8 rounded-xl"
      style={{ minHeight: 400 }}
    >
      {contextHolder}

      {/* Header */}
      <div className="pb-5 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageOutlined className="text-blue-500 text-lg" />
            <h2 className="font-bold text-gray-800 text-base m-0">
              Chat xonalar
            </h2>
            {data && (
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {data.count}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {totalUnread > 0 && (
              <Badge
                count={totalUnread}
                style={{ backgroundColor: "#f5222d" }}
                title={`${totalUnread} ta o'qilmagan xabar`}
              />
            )}
            <Can action="canCreate">
              <Button
                type="primary"
                size="middle"
                icon={<PlusOutlined />}
                onClick={() => setCreateModal(true)}
                className="rounded-lg"
              >
                Yangi xona
              </Button>
            </Can>
          </div>
        </div>

        <Input
          prefix={<SearchOutlined className="text-gray-400" />}
          placeholder="Xona qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg"
          size="middle"
          allowClear
        />
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center h-32">
            <Spin tip="Yuklanmoqda..." />
          </div>
        )}

        {error && (
          <div className="p-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
              Chat xonalarini olishda xatolik yuz berdi
            </div>
          </div>
        )}

        {!loading && !error && filtered?.length === 0 && (
          <div className="flex items-center justify-center h-120">
            <Empty
              description={
                <span className="text-gray-400 text-sm">Xona topilmadi</span>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}

        {!loading &&
          !error &&
          filtered?.map((xona) => (
            <XonaCard
              key={xona.id}
              xona={xona}
              isActive={activeId === xona.id}
              onClick={() => {
                setActiveId(xona.id);
                navigate("/chats/" + xona.id);
              }}
            />
          ))}
      </div>

      {/* Footer */}
      {data?.next && (
        <div className="px-4 py-2 border-t border-gray-100 text-center">
          <button className="text-xs text-blue-500 hover:text-blue-700 transition-colors">
            Ko'proq yuklash...
          </button>
        </div>
      )}

      {/* ── Create Xona Modal ─────────────────────────────────────────────── */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <PlusOutlined className="text-blue-500" />
            <span>Yangi xona yaratish</span>
          </div>
        }
        open={createModal}
        onCancel={handleModalClose}
        footer={null}
        destroyOnClose
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateXona}
          requiredMark={false}
          className="mt-4"
        >
          <Form.Item
            name="nomi"
            label="Xona nomi"
            rules={[{ required: true, message: "Xona nomini kiriting" }]}
          >
            <Input placeholder="Masalan: Loyiha guruhi" />
          </Form.Item>

          <Form.Item
            name="turi"
            label="Xona turi"
            rules={[{ required: true, message: "Xona turini tanlang" }]}
          >
            <Select placeholder="Turini tanlang">
              <Select.Option value="yakka">Yakka</Select.Option>
              <Select.Option value="guruh">Guruh</Select.Option>
              <Select.Option value="obyekt">Obyekt</Select.Option>
            </Select>
          </Form.Item>

          {/* Obyekt field — only shown when turi === "obyekt" */}
          {xonaTuri === "obyekt" && (
            <Form.Item
              name="obyekt"
              label="Obyekt"
              rules={[{ required: true, message: "Obyektni tanlang" }]}
            >
              <Select
                placeholder="Obyektni tanlang"
                loading={obyektlarLoading}
                showSearch
                optionFilterProp="label"
                options={obyektlar.map((o) => ({
                  value: o.id,
                  label: o.nomi,
                }))}
              />
            </Form.Item>
          )}

          <Form.Item name="ishtirokchi_idlar" label="Ishtirokchilar">
            <Select
              mode="multiple"
              placeholder="Foydalanuvchilarni tanlang"
              loading={usersLoading}
              showSearch
              optionFilterProp="label"
              options={users.map((u) => ({
                value: u.id,
                label: u.fio,
              }))}
              allowClear
            />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-2">
            <Button onClick={handleModalClose}>Bekor qilish</Button>
            <Button type="primary" htmlType="submit" loading={createLoading}>
              Yaratish
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ChatXonalarPage;
