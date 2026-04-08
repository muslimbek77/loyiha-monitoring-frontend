import { useEffect, useState, useRef } from "react";
import {
  Avatar,
  Badge,
  Spin,
  Empty,
  Tooltip,
  Tag,
  Button,
  Input,
  Modal,
  Select,
  message,
  Popconfirm,
} from "antd";
import {
  ArrowLeftOutlined,
  BellOutlined,
  BellFilled,
  TeamOutlined,
  UserOutlined,
  SendOutlined,
  UserAddOutlined,
  MessageOutlined,
  DeleteOutlined,
  EditOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import api from "@/services/api/axios";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { buildAssetUrl } from "@/lib/media";
import { getLavozimColor, getLavozimLabel } from "@/lib/lavozim";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Ishtirokchi {
  id: number;
  foydalanuvchi: number;
  fio: string;
  avatar: string | null;
  lavozim: string;
  lavozim_kodi?: string;
  oqilmagan_soni: number;
  bildirishnoma: boolean;
}

interface XonaDetail {
  id: number;
  nomi: string;
  turi: "obyekt" | "guruh" | "yakka";
  turi_display: string;
  obyekt: number | null;
  rasm: string | null;
  ishtirokchilar: Ishtirokchi[];
  can_manage_settings?: boolean;
  can_manage_participants?: boolean;
  current_bildirishnoma?: boolean;
}

interface Xabar {
  id: number;
  yuboruvchi: number;
  yuboruvchi_fio: string;
  yuboruvchi_avatar: string | null;
  matn: string;
  vaqt: string;
  o_qilgan: boolean;
}

interface User {
  id: number;
  fio?: string;
  username?: string;
  email?: string;
}

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

const getInitials = (fio: string) =>
  fio
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const formatTime = (vaqt: string) =>
  new Date(vaqt).toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  });

const getUserLabel = (u: User) => u.fio ?? u.username ?? `Foydalanuvchi ${u.id}`;

// ─── IshtirokchiCard ──────────────────────────────────────────────────────────

const IshtirokchiCard = ({
  ishtirokchi,
  canManage,
  onRemove,
}: {
  ishtirokchi: Ishtirokchi;
  canManage: boolean;
  onRemove: (userId: number) => void;
}) => (
  <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
    <div className="relative flex-shrink-0">
      <Avatar
        size={44}
        src={buildAssetUrl(ishtirokchi.avatar)}
        style={{ backgroundColor: getAvatarColor(ishtirokchi.fio) }}
        className="font-semibold text-sm"
      >
        {!ishtirokchi.avatar && getInitials(ishtirokchi.fio)}
      </Avatar>
      {ishtirokchi.oqilmagan_soni > 0 && (
        <Badge
          count={ishtirokchi.oqilmagan_soni}
          style={{
            position: "absolute",
            top: -4,
            right: -4,
            backgroundColor: "#1677ff",
            fontSize: "10px",
            minWidth: "16px",
            height: "16px",
            lineHeight: "16px",
            padding: "0 4px",
          }}
        />
      )}
    </div>

    <div className="flex-1 min-w-0">
      <span className="text-sm font-semibold text-gray-800 truncate block mb-1">
        {ishtirokchi.fio}
      </span>
      <Tag
        color={getLavozimColor(ishtirokchi.lavozim_kodi ?? ishtirokchi.lavozim)}
        className="text-[11px] px-1.5 py-0 leading-4 m-0"
      >
        {getLavozimLabel(ishtirokchi.lavozim_kodi ?? ishtirokchi.lavozim)}
      </Tag>
    </div>

    <div className="flex items-center gap-2 flex-shrink-0">
      <Tooltip
        title={
          ishtirokchi.bildirishnoma
            ? "Bildirishnoma yoqilgan"
            : "Bildirishnoma o'chirilgan"
        }
      >
        {ishtirokchi.bildirishnoma ? (
          <BellFilled className="text-blue-500 text-base" />
        ) : (
          <BellOutlined className="text-gray-300 text-base" />
        )}
      </Tooltip>
      {ishtirokchi.oqilmagan_soni > 0 && (
        <span className="text-xs text-blue-500 font-semibold bg-blue-50 px-1.5 py-0.5 rounded-full">
          {ishtirokchi.oqilmagan_soni} yangi
        </span>
      )}
      {canManage && (
        <Popconfirm
          title="Ishtirokchini guruhdan o'chirasizmi?"
          okText="O'chirish"
          cancelText="Bekor qilish"
          onConfirm={() => onRemove(ishtirokchi.foydalanuvchi)}
        >
          <Button
            type="text"
            size="small"
            icon={<DeleteOutlined />}
            className="text-red-500"
          />
        </Popconfirm>
      )}
    </div>
  </div>
);

// ─── XabarItem ────────────────────────────────────────────────────────────────

const XabarItem = ({ xabar }: { xabar: Xabar }) => (
  <div className="flex items-start gap-2 px-4 py-2 hover:bg-gray-50 transition-colors">
    <Avatar
      size={32}
      src={buildAssetUrl(xabar.yuboruvchi_avatar)}
      style={{
        backgroundColor: getAvatarColor(xabar.yuboruvchi_fio),
        flexShrink: 0,
      }}
      className="text-xs font-semibold mt-0.5"
    >
      {!xabar.yuboruvchi_avatar && getInitials(xabar.yuboruvchi_fio)}
    </Avatar>
    <div className="flex-1 min-w-0">
      <div className="flex items-baseline gap-2 mb-0.5">
        <span className="text-xs font-semibold text-gray-700">
          {xabar.yuboruvchi_fio}
        </span>
        <span className="text-[10px] text-gray-400">
          {formatTime(xabar.vaqt)}
        </span>
        {!xabar.o_qilgan && (
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block flex-shrink-0" />
        )}
      </div>
      <p className="text-sm text-gray-600 m-0 break-words">{xabar.matn}</p>
    </div>
  </div>
);

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type TabKey = "xabarlar" | "ishtirokchilar";

// ─── Main Component ───────────────────────────────────────────────────────────

const ChatXonaSinglePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const [data, setData] = useState<XonaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("xabarlar");

  // ── Messages state
  const [xabarlar, setXabarlar] = useState<Xabar[]>([]);
  const [xabarlarLoading, setXabarlarLoading] = useState(false);
  const [yangiXabar, setYangiXabar] = useState("");
  const [sending, setSending] = useState(false);

  // ── Add participant modal
  const [addModal, setAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // ── Add participant: dropdown data
  const [users, setUsers] = useState<User[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);

  // ── Leave room
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  // ── Fetch room detail
  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<XonaDetail>(API_ENDPOINTS.CHAT_XONALAR.DETAIL(id));
        setData(res.data);
        setRenameValue(res.data.nomi);
      } catch (err: any) {
        setError(
          err?.response?.data?.detail ?? err.message ?? "Xatolik yuz berdi",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // ── Fetch messages when tab switches to xabarlar
  useEffect(() => {
    if (activeTab === "xabarlar" && id) fetchXabarlar();
  }, [activeTab, id]);

  // ── Fetch users when modal opens
  useEffect(() => {
    if (!addModal) return;

    const fetchUsers = async () => {
      setFetchingUsers(true);
      try {
        const res = await api.get(API_ENDPOINTS.USERS.LIST);
        const d = res.data;
        setUsers(Array.isArray(d) ? d : (d.results ?? []));
      } catch {
        messageApi.error("Foydalanuvchilarni yuklashda xatolik");
      } finally {
        setFetchingUsers(false);
      }
    };

    fetchUsers();
  }, [addModal]);

  // ── Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [xabarlar]);

  // ─── API: GET messages ───────────────────────────────────────────────────────

  const fetchXabarlar = async () => {
    if (!id) return;
    setXabarlarLoading(true);
    try {
      const res = await api.get<{ results: Xabar[] }>(
        API_ENDPOINTS.CHAT_XONALAR.XABARLAR(id),
      );
      setXabarlar(res.data?.results ?? []);
      const detailRes = await api.get<XonaDetail>(
        API_ENDPOINTS.CHAT_XONALAR.DETAIL(id),
      );
      setData(detailRes.data);
    } catch (err: any) {
      messageApi.error(
        err?.response?.data?.detail ?? "Xabarlarni yuklashda xatolik",
      );
    } finally {
      setXabarlarLoading(false);
    }
  };

  // ─── API: POST send message ──────────────────────────────────────────────────

  const handleSendXabar = async () => {
    if (!yangiXabar.trim() || !id) return;
    setSending(true);
    try {
      const res = await api.post<Xabar>(
        API_ENDPOINTS.CHAT_XONALAR.XABAR_YUBORISH(id),
        {
          matn: yangiXabar.trim(),
        },
      );
      setXabarlar((prev) => [...(Array.isArray(prev) ? prev : []), res.data]);
      setYangiXabar("");
      const detailRes = await api.get<XonaDetail>(
        API_ENDPOINTS.CHAT_XONALAR.DETAIL(id),
      );
      setData(detailRes.data);
    } catch (err: any) {
      messageApi.error(
        err?.response?.data?.detail ?? "Xabar yuborishda xatolik",
      );
    } finally {
      setSending(false);
    }
  };

  // ─── API: POST add participant ───────────────────────────────────────────────

  const handleAddIshtirokchi = async () => {
    if (!id || !selectedUserId) return;
    setAddLoading(true);
    try {
      await api.post(API_ENDPOINTS.CHAT_XONALAR.ISHTIROKCHI_QOSHISH(id), {
        foydalanuvchi_id: selectedUserId,
      });
      messageApi.success("Ishtirokchi muvaffaqiyatli qo'shildi");
      closeAddModal();
      const res = await api.get<XonaDetail>(API_ENDPOINTS.CHAT_XONALAR.DETAIL(id));
      setData(res.data);
    } catch (err: any) {
      messageApi.error(
        err?.response?.data?.detail ?? "Ishtirokchi qo'shishda xatolik",
      );
    } finally {
      setAddLoading(false);
    }
  };

  const handleRemoveIshtirokchi = async (userId: number) => {
    if (!id) return;
    try {
      await api.post(API_ENDPOINTS.CHAT_XONALAR.ISHTIROKCHI_OCHIRISH(id), {
        foydalanuvchi_id: userId,
      });
      messageApi.success("Ishtirokchi guruhdan o'chirildi");
      const res = await api.get<XonaDetail>(API_ENDPOINTS.CHAT_XONALAR.DETAIL(id));
      setData(res.data);
    } catch (err: any) {
      messageApi.error(
        err?.response?.data?.detail ?? "Ishtirokchini o'chirishda xatolik",
      );
    }
  };

  const handleToggleNotification = async () => {
    if (!id || !data) return;
    setSettingsLoading(true);
    try {
      const res = await api.patch(API_ENDPOINTS.CHAT_XONALAR.SOZLAMALAR(id), {
        bildirishnoma: !(data.current_bildirishnoma ?? true),
      });
      setData((prev) =>
        prev
          ? { ...prev, current_bildirishnoma: res.data.bildirishnoma }
          : prev,
      );
      messageApi.success("Bildirishnoma sozlamasi saqlandi");
    } catch (err: any) {
      messageApi.error(
        err?.response?.data?.detail ?? "Sozlamani saqlashda xatolik",
      );
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleRenameRoom = async () => {
    if (!id || !renameValue.trim()) return;
    setSettingsLoading(true);
    try {
      await api.patch(API_ENDPOINTS.CHAT_XONALAR.SOZLAMALAR(id), {
        nomi: renameValue.trim(),
      });
      const res = await api.get<XonaDetail>(API_ENDPOINTS.CHAT_XONALAR.DETAIL(id));
      setData(res.data);
      setRenameModalOpen(false);
      messageApi.success("Chat xona nomi yangilandi");
    } catch (err: any) {
      messageApi.error(
        err?.response?.data?.detail ?? "Nomni saqlashda xatolik",
      );
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!id) return;
    setSettingsLoading(true);
    try {
      await api.delete(API_ENDPOINTS.CHAT_XONALAR.DETAIL(id));
      messageApi.success("Chat xona o'chirildi");
      navigate("/chats");
    } catch (err: any) {
      messageApi.error(
        err?.response?.data?.detail ?? "Chat xonani o'chirishda xatolik",
      );
    } finally {
      setSettingsLoading(false);
    }
  };

  // ─── API: POST leave room ────────────────────────────────────────────────────

  const handleChiqish = async () => {
    if (!id) return;
    setLeaveLoading(true);
    try {
      await api.post(API_ENDPOINTS.CHAT_XONALAR.CHIQISH(id!));
      messageApi.success("Xonadan muvaffaqiyatli chiqdingiz");
      navigate(-1);
    } catch (err: any) {
      messageApi.error(
        err?.response?.data?.detail ?? "Chiqishda xatolik yuz berdi",
      );
    } finally {
      setLeaveLoading(false);
    }
  };

  // ─── Modal helpers ───────────────────────────────────────────────────────────

  const closeAddModal = () => {
    setAddModal(false);
    setSelectedUserId(null);
  };

  // ─── Computed ────────────────────────────────────────────────────────────────

  const totalUnread =
    data?.ishtirokchilar.find((i) => i.foydalanuvchi === user?.id)
      ?.oqilmagan_soni ?? 0;
  const notifOn =
    data?.ishtirokchilar.filter((i) => i.bildirishnoma).length ?? 0;
  const canManageParticipants = Boolean(data?.can_manage_participants);
  const canManageSettings = Boolean(data?.can_manage_settings);
  const availableUsers = users.filter(
    (candidate) =>
      !data?.ishtirokchilar.some(
        (ishtirokchi) => ishtirokchi.foydalanuvchi === candidate.id,
      ),
  );

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-white" style={{ minHeight: 400 }}>
      {contextHolder}

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="flex-shrink-0 -ml-1"
            size="small"
          />

          <div className="relative flex-shrink-0">
            <Avatar
              size={42}
              src={buildAssetUrl(data?.rasm)}
              style={{
                backgroundColor: data ? getAvatarColor(data.nomi) : "#ccc",
              }}
              className="font-bold"
            >
              {data && !data.rasm && getInitials(data.nomi)}
            </Avatar>
            {data?.turi === "obyekt" && (
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-orange-400 border-2 border-white flex items-center justify-center">
                <span className="text-white text-[8px]">O</span>
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {data ? (
              <>
                <h2 className="font-bold text-gray-800 text-sm m-0 truncate">
                  {data.nomi}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <Tag
                    color="blue"
                    className="text-[10px] px-1.5 py-0 leading-4 m-0"
                  >
                    {data.turi_display}
                  </Tag>
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <TeamOutlined />
                    {data.ishtirokchilar.length} ishtirokchi
                  </span>
                </div>
              </>
            ) : (
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            )}
          </div>

          {data && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Tooltip
                title={
                  data.current_bildirishnoma
                    ? "Bildirishnomani o'chirish"
                    : "Bildirishnomani yoqish"
                }
              >
                <Button
                  type="text"
                  icon={
                    data.current_bildirishnoma ? <BellFilled /> : <BellOutlined />
                  }
                  size="small"
                  onClick={handleToggleNotification}
                  loading={settingsLoading}
                />
              </Tooltip>
              {canManageSettings && (
                <Tooltip title="Xona nomini o'zgartirish">
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    size="small"
                    onClick={() => setRenameModalOpen(true)}
                  />
                </Tooltip>
              )}
              <Tooltip title="Ishtirokchi qo'shish">
                <Button
                  type="text"
                  icon={<UserAddOutlined />}
                  size="small"
                  className="text-blue-500"
                  onClick={() => setAddModal(true)}
                  disabled={!canManageParticipants}
                />
              </Tooltip>
              {canManageSettings && (
                <Popconfirm
                  title="Chat xonani o'chirasizmi?"
                  okText="O'chirish"
                  cancelText="Bekor qilish"
                  onConfirm={handleDeleteRoom}
                >
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                    loading={settingsLoading}
                  />
                </Popconfirm>
              )}
            </div>
          )}
        </div>

        {data && (
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <UserOutlined className="text-blue-400" />
              <span>{data.ishtirokchilar.length} ta a'zo</span>
            </div>
            {totalUnread > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                <span>{totalUnread} o'qilmagan xabar</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <SettingOutlined className="text-green-400" />
              <span>{notifOn} bildirishnoma yoq.</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <div className="flex border-b border-gray-200 bg-white">
        <button
          onClick={() => setActiveTab("xabarlar")}
          className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
            activeTab === "xabarlar"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          <MessageOutlined />
          Xabarlar
          {totalUnread > 0 && (
            <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0 rounded-full leading-4">
              {totalUnread}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("ishtirokchilar")}
          className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
            activeTab === "ishtirokchilar"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          <TeamOutlined />
          Ishtirokchilar
          {data && (
            <span className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0 rounded-full leading-4">
              {data.ishtirokchilar.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center h-32 flex-1">
          <Spin tip="Yuklanmoqda..." />
        </div>
      ) : error ? (
        <div className="p-4 flex-1">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
            ⚠️ {error}
          </div>
        </div>
      ) : (
        <>
          {/* ── Messages Tab ─────────────────────────────────────────── */}
          {activeTab === "xabarlar" && (
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto py-2">
                {xabarlarLoading ? (
                  <div className="flex items-center justify-center h-24">
                    <Spin size="small" tip="Xabarlar yuklanmoqda..." />
                  </div>
                ) : xabarlar.length === 0 ? (
                  <div className="flex items-center justify-center h-24">
                    <Empty
                      description={
                        <span className="text-gray-400 text-sm">
                          Xabarlar yo'q
                        </span>
                      }
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  </div>
                ) : (
                  <>
                    {xabarlar.map((xabar) => (
                      <XabarItem key={xabar.id} xabar={xabar} />
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              <div className="px-3 py-2.5 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2">
                  <Input
                    value={yangiXabar}
                    onChange={(e) => setYangiXabar(e.target.value)}
                    onPressEnter={handleSendXabar}
                    placeholder="Xabar yozing..."
                    className="rounded-full text-sm"
                    disabled={sending}
                    maxLength={2000}
                  />
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<SendOutlined />}
                    onClick={handleSendXabar}
                    loading={sending}
                    disabled={!yangiXabar.trim()}
                    size="middle"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Participants Tab ──────────────────────────────────────── */}
          {activeTab === "ishtirokchilar" && (
            <div className="flex-1 overflow-y-auto">
              {!data || data.ishtirokchilar.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <Empty
                    description={
                      <span className="text-gray-400 text-sm">
                        Ishtirokchi yo'q
                      </span>
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </div>
              ) : (
                <div>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Ishtirokchilar
                    </span>
                    <Button
                      type="link"
                      size="small"
                      icon={<UserAddOutlined />}
                      className="text-xs p-0 h-auto"
                      onClick={() => setAddModal(true)}
                      disabled={!canManageParticipants}
                    >
                      Qo'shish
                    </Button>
                  </div>
                  {data.ishtirokchilar.map((ishtirokchi) => (
                    <IshtirokchiCard
                      key={ishtirokchi.id}
                      ishtirokchi={ishtirokchi}
                      canManage={
                        canManageParticipants && ishtirokchi.foydalanuvchi !== user?.id
                      }
                      onRemove={handleRemoveIshtirokchi}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Add Participant Modal ─────────────────────────────────────────── */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <UserAddOutlined className="text-blue-500" />
            <span>Ishtirokchi qo'shish</span>
          </div>
        }
        open={addModal}
        onCancel={closeAddModal}
        onOk={handleAddIshtirokchi}
        okText="Qo'shish"
        cancelText="Bekor qilish"
        confirmLoading={addLoading}
        okButtonProps={{ disabled: !selectedUserId }}
        destroyOnClose
        width={420}
      >
        <div className="space-y-3 pt-2">
          <p className="text-sm text-gray-500">
            Guruh ichidan faqat foydalanuvchini tanlab qo'shing.
          </p>
          <Select
            showSearch
            optionFilterProp="label"
            value={selectedUserId ?? undefined}
            onChange={setSelectedUserId}
            placeholder="Foydalanuvchini tanlang"
            loading={fetchingUsers}
            options={availableUsers.map((u) => ({
              value: u.id,
              label: getUserLabel(u),
            }))}
          />
          {availableUsers.length === 0 && (
            <p className="m-0 text-xs text-gray-400">
              Qo'shish uchun yangi foydalanuvchi qolmagan.
            </p>
          )}
        </div>
      </Modal>

      <Modal
        title="Chat xona nomini o'zgartirish"
        open={renameModalOpen}
        onCancel={() => setRenameModalOpen(false)}
        onOk={handleRenameRoom}
        okText="Saqlash"
        cancelText="Bekor qilish"
        confirmLoading={settingsLoading}
      >
        <Input
          value={renameValue}
          onChange={(event) => setRenameValue(event.target.value)}
          placeholder="Chat xona nomi"
          maxLength={255}
        />
      </Modal>
    </div>
  );
};

export default ChatXonaSinglePage;
