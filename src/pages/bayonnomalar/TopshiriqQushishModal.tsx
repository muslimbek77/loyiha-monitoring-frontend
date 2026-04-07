import api from "@/services/api/axios";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  message,
} from "antd";
import {
  PlusOutlined,
  CloseOutlined,
  SaveOutlined,
  LoadingOutlined,
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  BankOutlined,
  NumberOutlined,
  MessageOutlined,
  LinkOutlined,
  PaperClipOutlined,
  CheckSquareOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;

// ─── Types ────────────────────────────────────────────────────────────────────

interface TopshiriqQoshishPayload {
  mazmun: string;
  muddat: string;
  ijrochi_boshqarma?: number | null;
  ijrochi_xodim?: number[] | null;
  band_raqami?: string | null;
  izoh?: string;
  natija?: string;
}

interface TopshiriqQoshishModalProps {
  open: boolean;
  bayonnomaId: number;
  bayonnomaRaqami: string;
  onClose: () => void;
  onSuccess: () => void;
}

// ─── Field Label Helper ───────────────────────────────────────────────────────

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
    <span className="text-emerald-500">{icon}</span>
    {label}
    {required && <span className="text-red-400 ml-0.5">*</span>}
  </span>
);

// ─── Step indicator ───────────────────────────────────────────────────────────

const StepDot = ({
  step,
  active,
  done,
  label,
}: {
  step: number;
  active: boolean;
  done: boolean;
  label: string;
}) => (
  <div className="flex flex-col items-center gap-1">
    <div
      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
        done
          ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
          : active
            ? "bg-white text-emerald-600 ring-2 ring-emerald-400 shadow"
            : "bg-white/30 text-white/60"
      }`}
    >
      {done ? "✓" : step}
    </div>
    <span
      className={`text-[10px] font-semibold uppercase tracking-wide ${active ? "text-white" : done ? "text-emerald-200" : "text-white/40"}`}
    >
      {label}
    </span>
  </div>
);

const StepLine = ({ done }: { done: boolean }) => (
  <div className="flex-1 mx-1 mt-3.5">
    <div
      className={`h-0.5 rounded-full transition-all duration-500 ${done ? "bg-emerald-400" : "bg-white/20"}`}
    />
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const TopshiriqQoshishModal = ({
  open,
  bayonnomaId,
  bayonnomaRaqami,
  onClose,
  onSuccess,
}: TopshiriqQoshishModalProps) => {
  const [form] = Form.useForm();
  const currentUser = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0); // 0 = asosiy, 1 = ijrochi, 2 = qo'shimcha

  // Add these state variables inside TopshiriqQoshishModal:
  const [boshqarmalar, setBoshqarmalar] = useState<
    { id: number; nomi: string }[]
  >([]);
  const [xodimlar, setXodimlar] = useState<
    { id: number; fio: string; username: string }[]
  >([]);
  const [boshqarmaLoading, setBoshqarmaLoading] = useState(false);
  const [xodimLoading, setXodimLoading] = useState(false);
  const isBoshqarmaRahbar =
    currentUser?.lavozim === "boshqarma_boshi" ||
    currentUser?.lavozim === "boshqarma_boshligi" ||
    currentUser?.lavozim === "boshqarma_boshligi_orinbosari";
  const ownBoshqarmaId = currentUser?.boshqarma
    ? Number(currentUser.boshqarma)
    : null;

  // Add this useEffect inside the component:
  useEffect(() => {
    if (open) {
      if (isBoshqarmaRahbar && ownBoshqarmaId) {
        form.setFieldValue("ijrochi_boshqarma", ownBoshqarmaId);
      }

      // Fetch boshqarmalar
      setBoshqarmaLoading(true);
      api
        .get(API_ENDPOINTS.BOSHQARMA.LIST)
        .then((res) => {
          const items = res.data?.results ?? res.data ?? [];
          setBoshqarmalar(
            isBoshqarmaRahbar && ownBoshqarmaId
              ? items.filter((item: { id: number }) => item.id === ownBoshqarmaId)
              : items,
          );
        })
        .catch(() => message.error("Boshqarmalar yuklanmadi"))
        .finally(() => setBoshqarmaLoading(false));

      // Fetch xodimlar
      setXodimLoading(true);
      api
        .get(
          isBoshqarmaRahbar
            ? API_ENDPOINTS.USERS.BOSHQARMA_XODIMLARI
            : API_ENDPOINTS.USERS.LIST_ALL,
        )
        .then((res) => setXodimlar(res.data?.results ?? res.data))
        .catch(() => message.error("Xodimlar yuklanmadi"))
        .finally(() => setXodimLoading(false));
    }
  }, [form, isBoshqarmaRahbar, open, ownBoshqarmaId]);

  const handleCancel = () => {
    form.resetFields();
    setStep(0);
    onClose();
  };

  // Validate only the fields relevant to current step before proceeding
  const stepFields: string[][] = [
    ["mazmun", "muddat"],
    ["ijrochi_boshqarma", "ijrochi_xodim", "band_raqami"],
    ["izoh", "natija"],
  ];

  const handleNext = async () => {
    try {
      await form.validateFields(stepFields[step]);
      setStep((s) => s + 1);
    } catch {
      /* validation errors shown inline */
    }
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      setLoading(true);

      const values = form.getFieldsValue();
      const payload: TopshiriqQoshishPayload = {
        mazmun: values.mazmun,
        muddat: values.muddat || "",
        ijrochi_boshqarma: values.ijrochi_boshqarma ?? null,
        ijrochi_xodim: values.ijrochi_xodim?.length
          ? values.ijrochi_xodim
          : null,
        band_raqami: values.band_raqami ?? null,
        izoh: values.izoh ?? "",
        natija: values.natija ?? "",
      };

      await api.post(
        `${API_ENDPOINTS.BAYONNOMALAR.DETAIL(bayonnomaId)}topshiriq_qoshish/`,
        payload,
      );

      message.success("Topshiriq muvaffaqiyatli qo'shildi!");
      onSuccess();
      handleCancel();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error("Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  const steps = ["Asosiy", "Ijrochi", "Qo'shimcha"];

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={580}
      centered
      destroyOnClose
      closable={false}
      styles={{
        content: {
          padding: 0,
          borderRadius: 20,
          overflow: "hidden",
          boxShadow:
            "0 30px 60px -10px rgba(0,0,0,0.2), 0 0 0 1px rgba(16,185,129,0.15)",
        },
        mask: {
          backdropFilter: "blur(6px)",
          background: "rgba(2,44,34,0.35)",
        },
      }}
    >
      {/* ── Header ── */}
      <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 px-6 pt-5 pb-7 overflow-hidden rounded-xl">
        {/* Decorative shapes */}
        <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-2 left-1/3 h-20 w-48 rounded-full bg-teal-300/20 blur-2xl" />
        <div className="absolute top-3 left-1/2 h-10 w-10 rounded-full bg-white/5 blur-md" />

        <div className="relative">
          {/* Title row */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 backdrop-blur-sm shadow-inner ring-1 ring-white/80">
                <CheckSquareOutlined className="text-white text-base" />
              </div>
              <div>
                <p className="text-white font-bold text-base leading-tight">
                  Yangi topshiriq qo'shish
                </p>
                <p className="text-emerald-200 text-xs font-mono mt-0.5">
                  Bayonnoma nomi:
                  <span className="font-bold">{bayonnomaRaqami}</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 hover:bg-white/25 transition-colors cursor-pointer"
            >
              <CloseOutlined className="text-white text-sm" />
            </button>
          </div>

          {/* Step indicators */}
          <div className="flex items-start">
            {steps.map((label, i) => (
              <>
                <StepDot
                  key={i}
                  step={i + 1}
                  active={step === i}
                  done={step > i}
                  label={label}
                />
                {i < steps.length - 1 && (
                  <StepLine key={`line-${i}`} done={step > i} />
                )}
              </>
            ))}
          </div>
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
          {/* ── Step 0: Asosiy ma'lumotlar ── */}
          <div className={step === 0 ? "block" : "hidden"}>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-4 flex items-center gap-2">
              <span className="inline-block h-px flex-1 bg-emerald-100" />
              Asosiy ma'lumotlar
              <span className="inline-block h-px flex-1 bg-emerald-100" />
            </p>

            <Form.Item
              name="mazmun"
              label={
                <FieldLabel
                  icon={<FileTextOutlined />}
                  label="Topshiriq mazmuni"
                  required
                />
              }
              rules={[{ required: true, message: "Mazmunni kiriting" }]}
              className="mb-4!"
            >
              <TextArea
                rows={4}
                placeholder="Topshiriq mazmunini batafsil yozing..."
                className="rounded-xl! border-slate-200! hover:border-emerald-300! focus:border-emerald-500! resize-none! text-sm!"
              />
            </Form.Item>

            <Form.Item
              name="muddat"
              label={
                <FieldLabel
                  icon={<CalendarOutlined />}
                  label="Muddat (bajarish sanasi)"
                  required
                />
              }
              rules={[{ required: true, message: "Muddatni tanlang" }]}
              className="mb-0!"
            >
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-700 outline-none transition hover:border-emerald-300 focus:border-emerald-500"
              />
            </Form.Item>
          </div>

          {/* ── Step 1: Ijrochi ── */}
          <div className={step === 1 ? "block" : "hidden"}>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-4 flex items-center gap-2">
              <span className="inline-block h-px flex-1 bg-emerald-100" />
              Ijrochi ma'lumotlari
              <span className="inline-block h-px flex-1 bg-emerald-100" />
            </p>

            <Form.Item
              name="band_raqami"
              label={
                <FieldLabel
                  icon={<NumberOutlined />}
                  label="Band raqami"
                  required
                />
              }
              className="mb-4!"
              rules={[{ required: true, message: "Band raqamini kiriting!" }]}
            >
              <Input
                style={{ width: 250 }}
                placeholder="Masalan: 1 yoki 1.2"
                className="rounded-xl! border-slate-200! hover:border-emerald-300! h-10!"
              />
            </Form.Item>

            <Form.Item
              name="ijrochi_boshqarma"
              label={
                <FieldLabel
                  icon={<BankOutlined />}
                  label="Ijrochi boshqarma"
                  required
                />
              }
              className="mb-4!"
              rules={[
                { required: true, message: "Ijrochi boshqarmani kiriting!" },
              ]}
            >
              <Select
                showSearch
                allowClear
                disabled={isBoshqarmaRahbar && !!ownBoshqarmaId}
                loading={boshqarmaLoading}
                placeholder="Boshqarmani tanlang..."
                filterOption={(input, option) =>
                  String(option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={boshqarmalar.map((b) => ({
                  value: b.id,
                  label: b.nomi,
                }))}
                className="rounded-xl! border-slate-200! hover:border-emerald-300! h-10! w-full!"
                style={{ height: 40 }}
              />
            </Form.Item>

            <Form.Item
              name="ijrochi_xodim"
              label={
                <FieldLabel
                  icon={<UserOutlined />}
                  label="Ijrochi xodim"
                  required
                />
              }
              className="mb-0!"
              rules={[{ required: true, message: "Ijrochi xodimni kiriting!" }]}
            >
              <Select
                mode="multiple"
                showSearch
                allowClear
                loading={xodimLoading}
                placeholder="Xodimni tanlang..."
                filterOption={(input, option) =>
                  String(option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={xodimlar.map((x) => ({
                  value: x.id,
                  label: x.fio,
                }))}
                className="rounded-xl! border-slate-200! py-1.5! hover:border-emerald-300!‰ w-full!"
              />
            </Form.Item>
          </div>

          {/* ── Step 2: Qo'shimcha ── */}
          <div className={step === 2 ? "block" : "hidden"}>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-4 flex items-center gap-2">
              <span className="inline-block h-px flex-1 bg-emerald-100" />
              Qo'shimcha ma'lumotlar
              <span className="inline-block h-px flex-1 bg-emerald-100" />
            </p>

            <Form.Item
              name="izoh"
              label={<FieldLabel icon={<MessageOutlined />} label="Izoh" />}
              className="mb-4!"
            >
              <TextArea
                rows={3}
                placeholder="Qo'shimcha izoh yoki eslatma..."
                className="rounded-xl! border-slate-200! hover:border-emerald-300! focus:border-emerald-500! resize-none! text-sm!"
              />
            </Form.Item>

            <Form.Item
              name="natija"
              label={
                <FieldLabel
                  icon={<CheckSquareOutlined />}
                  label="Kutilayotgan natija"
                />
              }
              className="mb-0!"
            >
              <TextArea
                rows={3}
                placeholder="Bu topshiriqdan kutilayotgan natija..."
                className="rounded-xl! border-slate-200! hover:border-emerald-300! focus:border-emerald-500! resize-none! text-sm!"
              />
            </Form.Item>
          </div>

          <div className="mb-4 mt-6 h-px bg-slate-100" />

          {/* ── Footer Actions ── */}
          <div className="flex items-center justify-between gap-3">
            {/* Back / Cancel */}
            {step === 0 ? (
              <Button
                onClick={handleCancel}
                className="rounded-xl! border-slate-200! text-slate-500! h-10! px-5! font-medium!"
                icon={<CloseOutlined />}
              >
                Bekor qilish
              </Button>
            ) : (
              <Button
                onClick={() => setStep((s) => s - 1)}
                disabled={loading}
                className="rounded-xl! border-slate-200! text-slate-500! h-10! px-5! font-medium!"
              >
                ← Orqaga
              </Button>
            )}

            {/* Progress dots */}
            <div className="flex items-center gap-1.5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    i === step
                      ? "w-5 h-2 bg-emerald-500"
                      : i < step
                        ? "w-2 h-2 bg-emerald-400"
                        : "w-2 h-2 bg-slate-200"
                  }`}
                />
              ))}
            </div>

            {/* Next / Submit */}
            {step < steps.length - 1 ? (
              <Button
                type="primary"
                onClick={handleNext}
                className="rounded-xl! h-10! px-6! font-semibold! bg-emerald-600! hover:bg-emerald-700! border-none! shadow-md! shadow-emerald-200!"
              >
                Keyingisi →
              </Button>
            ) : (
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={loading}
                icon={loading ? <LoadingOutlined /> : <SaveOutlined />}
                className="rounded-xl! h-10! px-6! font-semibold! bg-emerald-600! hover:bg-emerald-700! border-none! shadow-md! shadow-emerald-200!"
              >
                {loading ? "Saqlanmoqda..." : "Qo'shish"}
              </Button>
            )}
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default TopshiriqQoshishModal;
