import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Input,
  Skeleton,
  Tag,
  Timeline,
  Typography,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  DeleteOutlined,
  ExclamationCircleFilled,
  FileTextOutlined,
  MessageOutlined,
  PaperClipOutlined,
  SendOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/services/api/axios";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useNotificationStore } from "@/store/notificationStore";

const { Paragraph, Text, Title } = Typography;
const { TextArea } = Input;

interface Izoh {
  id: number;
  muallif_fio: string;
  matn: string;
  fayl: string | null;
  created_at: string;
}

interface TalabDetail {
  id: number;
  sorovchi: number;
  sorovchi_fio: string;
  sorovchi_boshqarma_nomi: string;
  ijrochi_boshqarma_nomi: string;
  ijrochi_fio: string | null;
  kategoriya_nomi: string | null;
  mavzu: string;
  mazmun: string;
  status: string;
  status_display: string;
  muddat: string | null;
  is_kechikkan: boolean;
  javob: string | null;
  fayl: string | null;
  javob_yuborilgan_vaqt: string | null;
  yopildi_sana: string | null;
  is_closed: boolean;
  can_comment: boolean;
  can_accept: boolean;
  can_respond: boolean;
  can_close: boolean;
  izohlar: Izoh[];
  created_at: string;
  updated_at: string;
}

const statusConfig: Record<string, { color: string; bg: string; border: string }> = {
  yangi: { color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
  qabul_qilindi: { color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  jarayonda: { color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  javob_yuborildi: { color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
  yopildi: { color: "#0f172a", bg: "#e2e8f0", border: "#cbd5e1" },
  rad_etildi: { color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
};

const fmtDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("uz-UZ", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

const fmtDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("uz-UZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

const initials = (fio?: string | null) =>
  fio
    ?.split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "U";

const TalablarSinglePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const refreshNotifications = useNotificationStore((state) => state.fetchSummary);

  const [data, setData] = useState<TalabDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [izohMatn, setIzohMatn] = useState("");
  const [izohFayl, setIzohFayl] = useState<File | null>(null);
  const [javobMatn, setJavobMatn] = useState("");
  const [javobFayl, setJavobFayl] = useState<File | null>(null);
  const izohFileRef = useRef<HTMLInputElement>(null);
  const javobFileRef = useRef<HTMLInputElement>(null);

  const fetchTalab = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.get<TalabDetail>(API_ENDPOINTS.TALABLAR.DETAIL(id));
      setData(res.data);
    } catch (error) {
      console.error("Failed to fetch talab", error);
      message.error("Talab ma'lumotini yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTalab();
  }, [id]);

  const runSimpleAction = async (type: "accept" | "close") => {
    if (!id) return;
    const endpoint =
      type === "accept"
        ? API_ENDPOINTS.TALABLAR.QABUL_QILISH(id)
        : API_ENDPOINTS.TALABLAR.YOPISH(id);
    const successText =
      type === "accept" ? "Talab qabul qilindi" : "Talab yopildi";

    try {
      setActionLoading(type);
      await api.post(endpoint);
      message.success(successText);
      await Promise.all([fetchTalab(), refreshNotifications()]);
    } catch (error) {
      console.error(error);
      message.error("Amalni bajarib bo'lmadi");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmitJavob = async () => {
    if (!id) return;
    if (!javobMatn.trim() && !javobFayl) {
      message.warning("Kamida javob matni yoki fayl kiriting");
      return;
    }

    try {
      setActionLoading("respond");
      const formData = new FormData();
      if (javobMatn.trim()) formData.append("javob", javobMatn.trim());
      if (javobFayl) formData.append("fayl", javobFayl);
      await api.post(API_ENDPOINTS.TALABLAR.JAVOB_YUBORISH(id), formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      message.success("Javob yuborildi");
      setJavobMatn("");
      setJavobFayl(null);
      if (javobFileRef.current) javobFileRef.current.value = "";
      await Promise.all([fetchTalab(), refreshNotifications()]);
    } catch (error) {
      console.error(error);
      message.error("Javob yuborilmadi");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmitIzoh = async () => {
    if (!id || !data) return;
    if (!data.can_comment) {
      message.warning("Yopilgan talabga izoh yuborib bo'lmaydi");
      return;
    }
    if (!izohMatn.trim()) {
      message.warning("Izoh matni kiritilishi shart");
      return;
    }

    try {
      setActionLoading("comment");
      const formData = new FormData();
      formData.append("matn", izohMatn.trim());
      if (izohFayl) formData.append("fayl", izohFayl);
      await api.post(API_ENDPOINTS.TALABLAR.IZOH_QOSHISH(id), formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      message.success("Izoh yuborildi");
      setIzohMatn("");
      setIzohFayl(null);
      if (izohFileRef.current) izohFileRef.current.value = "";
      await Promise.all([fetchTalab(), refreshNotifications()]);
    } catch (error) {
      console.error(error);
      message.error("Izoh yuborilmadi");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <Skeleton active paragraph={{ rows: 12 }} />
      </div>
    );
  }

  if (!data) return null;

  const status = statusConfig[data.status] ?? statusConfig.yangi;
  const canShowResponseForm = data.can_respond && !data.is_closed;
  const isRequester = user?.id === data.sorovchi;

  return (
    <div className="space-y-5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 p-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Orqaga
        </Button>
        <Tag
          style={{
            color: status.color,
            background: status.bg,
            borderColor: status.border,
            borderRadius: 999,
            padding: "4px 12px",
            fontWeight: 600,
          }}
        >
          {data.status_display}
        </Tag>
        {data.is_kechikkan && (
          <Tag color="error" icon={<ExclamationCircleFilled />}>
            Muddati o'tgan
          </Tag>
        )}
        {data.is_closed && <Tag color="default">Yopilgan</Tag>}
      </div>

      <Card className="shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
            <FileTextOutlined />
          </div>
          <div className="min-w-0 flex-1">
            <Title level={4} className="mb-1">
              {data.mavzu}
            </Title>
            <Text type="secondary">Yaratilgan vaqt: {fmtDateTime(data.created_at)}</Text>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Talab mazmuni
          </p>
          <Paragraph className="mb-0">{data.mazmun}</Paragraph>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {data.can_accept && (
            <Button
              type="primary"
              loading={actionLoading === "accept"}
              onClick={() => runSimpleAction("accept")}
            >
              Qabul qilish
            </Button>
          )}
          {canShowResponseForm && (
            <Button onClick={() => javobFileRef.current?.scrollIntoView({ behavior: "smooth" })}>
              Javob yuborish
            </Button>
          )}
          {data.can_close && (
            <Button
              loading={actionLoading === "close"}
              onClick={() => runSimpleAction("close")}
            >
              Talabni yopish
            </Button>
          )}
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <Card title="Ishtirokchilar" className="shadow-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  label: "So'rovchi",
                  fio: data.sorovchi_fio,
                  subtitle: data.sorovchi_boshqarma_nomi,
                },
                {
                  label: "Ijrochi",
                  fio: data.ijrochi_fio || "Hali biriktirilmagan",
                  subtitle: data.ijrochi_boshqarma_nomi,
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <Avatar size={42} className="bg-sky-500">
                    {initials(item.fio)}
                  </Avatar>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      {item.label}
                    </div>
                    <div className="text-sm font-semibold text-slate-700">{item.fio}</div>
                    <div className="text-xs text-slate-500">{item.subtitle}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {(data.javob || data.fayl) && (
            <Card title="Yuborilgan javob" className="shadow-sm">
              {data.javob && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <Paragraph className="mb-0 text-emerald-900">{data.javob}</Paragraph>
                </div>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <Text type="secondary">
                  Yuborilgan vaqt: {fmtDateTime(data.javob_yuborilgan_vaqt || data.updated_at)}
                </Text>
                {data.fayl && (
                  <a href={data.fayl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-blue-600">
                    <PaperClipOutlined />
                    Biriktirilgan fayl
                  </a>
                )}
              </div>
            </Card>
          )}

          {canShowResponseForm && (
            <Card title="Javob yuborish" className="shadow-sm">
              <div className="space-y-4">
                <TextArea
                  value={javobMatn}
                  onChange={(event) => setJavobMatn(event.target.value)}
                  placeholder="Talab bo'yicha javob matnini yozing..."
                  autoSize={{ minRows: 4, maxRows: 8 }}
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <input
                      ref={javobFileRef}
                      type="file"
                      className="hidden"
                      onChange={(event) => setJavobFayl(event.target.files?.[0] ?? null)}
                    />
                    {javobFayl ? (
                      <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs text-blue-700">
                        <PaperClipOutlined />
                        {javobFayl.name}
                        <button onClick={() => setJavobFayl(null)} type="button">
                          <DeleteOutlined />
                        </button>
                      </div>
                    ) : (
                      <Button onClick={() => javobFileRef.current?.click()}>Fayl biriktirish</Button>
                    )}
                  </div>
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    loading={actionLoading === "respond"}
                    onClick={handleSubmitJavob}
                  >
                    Javobni yuborish
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <Card title={`Izohlar (${data.izohlar.length})`} className="shadow-sm">
            {data.izohlar.length === 0 ? (
              <Alert type="info" showIcon message="Hozircha izohlar yo'q" />
            ) : (
              <Timeline
                items={data.izohlar.map((izoh) => ({
                  children: (
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-slate-700">{izoh.muallif_fio}</span>
                        <span className="text-xs text-slate-400">{fmtDateTime(izoh.created_at)}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{izoh.matn}</p>
                      {izoh.fayl && (
                        <a href={izoh.fayl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 text-xs text-blue-600">
                          <PaperClipOutlined />
                          Faylni ochish
                        </a>
                      )}
                    </div>
                  ),
                  dot: <MessageOutlined className="text-blue-500" />,
                }))}
              />
            )}

            <div className="mt-5 rounded-2xl border border-slate-100 bg-white p-4">
              {!data.can_comment && (
                <Alert
                  type="warning"
                  showIcon
                  className="mb-4"
                  message="Talab yopilgan. Endi izoh yoki yangi fayl yuborib bo'lmaydi."
                />
              )}
              <TextArea
                value={izohMatn}
                onChange={(event) => setIzohMatn(event.target.value)}
                placeholder="Izoh yozing..."
                autoSize={{ minRows: 3, maxRows: 6 }}
                disabled={!data.can_comment}
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <input
                    ref={izohFileRef}
                    type="file"
                    className="hidden"
                    disabled={!data.can_comment}
                    onChange={(event) => setIzohFayl(event.target.files?.[0] ?? null)}
                  />
                  {izohFayl ? (
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs text-blue-700">
                      <PaperClipOutlined />
                      {izohFayl.name}
                      <button onClick={() => setIzohFayl(null)} type="button">
                        <DeleteOutlined />
                      </button>
                    </div>
                  ) : (
                    <Button disabled={!data.can_comment} onClick={() => izohFileRef.current?.click()}>
                      Fayl biriktirish
                    </Button>
                  )}
                </div>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  loading={actionLoading === "comment"}
                  disabled={!data.can_comment}
                  onClick={handleSubmitIzoh}
                >
                  Izoh yuborish
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Talab tafsiloti" className="shadow-sm">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CalendarOutlined className="mt-1 text-slate-400" />
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Muddat</div>
                  <div className="text-sm font-medium text-slate-700">{fmtDate(data.muddat)}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <UserOutlined className="mt-1 text-slate-400" />
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Kategoriya</div>
                  <div className="text-sm font-medium text-slate-700">{data.kategoriya_nomi || "Belgilanmagan"}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ClockCircleOutlined className="mt-1 text-slate-400" />
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Oxirgi yangilanish</div>
                  <div className="text-sm font-medium text-slate-700">{fmtDateTime(data.updated_at)}</div>
                </div>
              </div>
              {data.yopildi_sana && (
                <div className="flex items-start gap-3">
                  <CheckCircleFilled className="mt-1 text-emerald-500" />
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Yopilgan vaqt</div>
                    <div className="text-sm font-medium text-slate-700">{fmtDateTime(data.yopildi_sana)}</div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {isRequester && data.can_close && (
            <Alert
              type="success"
              showIcon
              message="Ijrochi javob yuborgan"
              description="Tekshirib chiqqach talabni yopishingiz kerak."
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TalablarSinglePage;
