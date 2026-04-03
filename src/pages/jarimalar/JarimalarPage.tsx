import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Tag,
  message,
  Card,
  Statistic,
  Badge,
  Empty,
  Spin,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  BarChartOutlined,
  TeamOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import api from "@/services/api/axios";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import { formatDate } from "@/shared/components/const/CustomUI";
import Can from "@/shared/components/guards/Can";

interface Jarima {
  id: number;
  boshqarma_nomi: string;
  sabab: string;
  sabab_display: string;
  ball: number;
  avtomatik: boolean;
  created_at: string;
}

interface BoshqarmaStatistika {
  id: number;
  nomi: string;
  qisqa_nomi: string;
  reyting: number;
  jarimalar_soni: number;
  jami_minus: number;
}

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Jarima[];
}

const sabab_options = [
  { value: "kechikish", label: "Hujjat kechikishi" },
  { value: "sifatsiz_ijro", label: "Sifatsiz ijro (rad etildi)" },
  { value: "topshiriq_bajarilmadi", label: "Topshiriq bajarilmadi" },
  { value: "talab_bajarilmadi", label: "Talabnoma bajarilmadi" },
  { value: "boshqa", label: "Boshqa sabab" },
];

const sabab_colors: Record<string, string> = {
  kechikish: "orange",
  sifatsiz_ijro: "red",
  topshiriq_bajarilmadi: "volcano",
  talab_bajarilmadi: "magenta",
  boshqa: "default",
};

const JarimalarPage = () => {
  const navigate = useNavigate();
  const [jarimalar, setJarimalar] = useState<Jarima[]>([]);
  const [statistika, setStatistika] = useState<BoshqarmaStatistika[]>([]);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Jarima | null>(null);
  const [form] = Form.useForm();
  const [boshqarmalar, setBoshqarmalar] = useState<
    { id: number; nomi: string }[]
  >([]);

  const fetchJarimalar = async (p = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`${API_ENDPOINTS.JARIMALAR.LIST}?page=${p}`);
      const data: ApiResponse = res.data; // ✅ axios uses .data
      setJarimalar(data.results);
      setTotal(data.count);
    } catch {
      message.error("Ma'lumotlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistika = async () => {
    setStatsLoading(true);
    try {
      const res = await api.get(API_ENDPOINTS.JARIMALAR.STATISTIKA);
      const data: BoshqarmaStatistika[] = res.data; // ✅ axios uses .data
      setStatistika(data);
    } catch (error) {
      message.error("Statistikani yuklashda xatolik");
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchBoshqarmalar = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.BOSHQARMA.LIST);
      const data = res.data;
      setBoshqarmalar(data.results || []);
    } catch {
      message.error("Boshqarmalarni yuklashda xatolik");
    }
  };

  useEffect(() => {
    fetchJarimalar();
    fetchStatistika();
    fetchBoshqarmalar();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bu jarimani o'chirishni tasdiqlaysizmi?")) {
      return;
    }
    try {
      await api.delete(API_ENDPOINTS.JARIMALAR.DETAIL(id));
      message.success("Jarima o'chirildi");
      fetchJarimalar(page);
      fetchStatistika();
    } catch (error) {
      message.error("O'chirishda xatolik");
    }
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      const url = editItem
        ? API_ENDPOINTS.JARIMALAR.DETAIL(editItem.id)
        : API_ENDPOINTS.JARIMALAR.LIST;
      if (editItem) {
        await api.put(url, values);
      } else {
        await api.post(url, values);
      }

      message.success(editItem ? "Jarima yangilandi" : "Jarima qo'shildi");
      setModalOpen(false);
      form.resetFields();
      setEditItem(null);
      fetchJarimalar(page);
      fetchStatistika();
    } catch (error) {
      message.error("Saqlashda xatolik");
    }
  };

  const openEdit = (record: Jarima) => {
    setEditItem(record);
    form.setFieldsValue({ ...record });
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditItem(null);
    form.resetFields();
    setModalOpen(true);
  };

  const totalMinus = statistika.reduce((sum, s) => sum + s.jami_minus, 0);
  const totalJarimalar = statistika.reduce(
    (sum, s) => sum + s.jarimalar_soni,
    0,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <WarningOutlined className="text-red-500 text-lg" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 leading-none">
                Jarimalar
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Boshqarmalar jarima boshqaruvi
              </p>
            </div>
          </div>
          <Can action="canCreate">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreate}
              className="bg-slate-800 border-slate-800 hover:bg-slate-700 rounded-xl!"
            >
              Jarima qo'shish
            </Button>
          </Can>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card
          className="border border-slate-100 shadow-sm rounded-2xl"
          bodyStyle={{ padding: "16px 20px" }}
        >
          <Statistic
            title={
              <span className="text-xs text-slate-400 font-medium">
                Jami jarimalar
              </span>
            }
            value={total}
            prefix={<BarChartOutlined className="text-slate-400 mr-1" />}
            valueStyle={{ fontSize: 22, fontWeight: 700, color: "#1e293b" }}
          />
        </Card>
        <Card
          className="border border-slate-100 shadow-sm rounded-2xl"
          bodyStyle={{ padding: "16px 20px" }}
        >
          <Statistic
            title={
              <span className="text-xs text-slate-400 font-medium">
                Boshqarmalar
              </span>
            }
            value={statistika.length}
            prefix={<TeamOutlined className="text-slate-400 mr-1" />}
            valueStyle={{ fontSize: 22, fontWeight: 700, color: "#1e293b" }}
          />
        </Card>
        <Card
          className="border border-red-50 shadow-sm rounded-2xl bg-red-50/40"
          bodyStyle={{ padding: "16px 20px" }}
        >
          <Statistic
            title={
              <span className="text-xs text-red-400 font-medium">
                Jami minus ball
              </span>
            }
            value={totalMinus}
            precision={1}
            prefix={<span className="text-red-400 font-bold mr-0.5">−</span>}
            valueStyle={{ fontSize: 22, fontWeight: 700, color: "#ef4444" }}
          />
        </Card>
        <Card
          className="border border-slate-100 shadow-sm rounded-2xl"
          bodyStyle={{ padding: "16px 20px" }}
        >
          <Statistic
            title={
              <span className="text-xs text-slate-400 font-medium">
                Bu oyda jarimalar
              </span>
            }
            value={totalJarimalar}
            valueStyle={{ fontSize: 22, fontWeight: 700, color: "#1e293b" }}
          />
        </Card>
      </div>

      {/* Boshqarma Statistika */}
      <Card
        className="border border-slate-100 shadow-sm rounded-2xl mb-6!"
        title={
          <span className="text-sm font-semibold text-slate-700">
            Boshqarmalar reytingi
          </span>
        }
        bodyStyle={{ padding: "16px 20px" }}
      >
        <Spin spinning={statsLoading}>
          {statistika.length === 0 ? (
            <Empty description="Ma'lumot yo'q" />
          ) : (
            <div className="flex flex-wrap gap-3">
              {statistika
                .slice()
                .sort((a, b) => b.reyting - a.reyting)
                .map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl px-4 py-2.5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                      <span className="text-xs font-bold text-slate-600">
                        {s.qisqa_nomi}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-700 leading-none mb-0.5">
                        {s.nomi}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-emerald-600 font-semibold">
                          {s.reyting}%
                        </span>
                        {s.jarimalar_soni > 0 && (
                          <>
                            <span className="h-3 w-px bg-slate-200" />
                            <span className="text-xs text-red-400">
                              {s.jarimalar_soni} jarima
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </Spin>
      </Card>

      {/* Table */}
      <Card
        className="border border-slate-100 shadow-sm rounded-2xl"
        bodyStyle={{ padding: 0 }}
      >
        {loading ? (
          <div className="py-20">
            <Spin />
          </div>
        ) : jarimalar.length === 0 ? (
          <Empty description="Jarimalar yo'q" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Boshqarma</th>
                    <th className="px-4 py-3">Sabab</th>
                    <th className="px-4 py-3">Ball</th>
                    <th className="px-4 py-3">Turi</th>
                    <th className="px-4 py-3">Sana</th>
                    <th className="px-4 py-3 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {jarimalar.map((record) => (
                    <tr
                      key={record.id}
                      onClick={() => navigate(`/jarimalar/${record.id}`)}
                      className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50/60"
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-gray-400">
                          {record.id}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-700">
                          {record.boshqarma_nomi}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Tag color={sabab_colors[record.sabab] ?? "default"}>
                          {record.sabab_display}
                        </Tag>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-red-500">
                          −{record.ball}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {record.avtomatik ? (
                          <Badge
                            className="flex! items-center!"
                            status="processing"
                            text="Avtomatik"
                          />
                        ) : (
                          <Badge status="default" text="Qo'lda" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {formatDate(record.created_at) || (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td
                        className="px-4 py-3 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex justify-end gap-2">
                          <Button
                            size="small"
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => openEdit(record)}
                            className="text-blue-500 hover:text-blue-700"
                          />
                          <Button
                            size="small"
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(record.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
              <span className="text-xs text-slate-400">Jami: {total} ta</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const next = Math.max(1, page - 1);
                    setPage(next);
                    fetchJarimalar(next);
                  }}
                  disabled={page === 1}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Oldingi
                </button>
                <span className="text-sm text-slate-500">
                  {page} / {Math.max(1, Math.ceil(total / 10))}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const next = Math.min(Math.max(1, Math.ceil(total / 10)), page + 1);
                    setPage(next);
                    fetchJarimalar(next);
                  }}
                  disabled={page >= Math.max(1, Math.ceil(total / 10))}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Keyingi
                </button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Modal */}
      <Modal
        open={modalOpen}
        title={
          <span className="text-base font-semibold text-slate-800">
            {editItem ? "Jarimani tahrirlash" : "Yangi jarima qo'shish"}
          </span>
        }
        onCancel={() => {
          setModalOpen(false);
          setEditItem(null);
          form.resetFields();
        }}
        footer={null}
        width={480}
        className="rounded-2xl"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            name="boshqarma"
            label={
              <span className="text-xs font-semibold text-slate-600">
                Boshqarma
              </span>
            }
            rules={[{ required: true, message: "Boshqarmani tanlang" }]}
          >
            <Select
              placeholder="Boshqarmani tanlang"
              options={boshqarmalar.map((b) => ({
                value: b.id,
                label: b.nomi,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="sabab"
            label={
              <span className="text-xs font-semibold text-slate-600">
                Sabab
              </span>
            }
            rules={[{ required: true, message: "Sababni tanlang" }]}
          >
            <Select options={sabab_options} placeholder="Sababni tanlang" />
          </Form.Item>

          <Form.Item
            name="ball"
            label={
              <span className="text-xs font-semibold text-slate-600">
                Ball (minus)
              </span>
            }
            rules={[{ required: true, message: "Ballni kiriting" }]}
          >
            <InputNumber
              className="w-full"
              min={0}
              step={0.5}
              placeholder="0.5"
            />
          </Form.Item>

          <Form.Item
            name="izoh"
            label={
              <span className="text-xs font-semibold text-slate-600">Izoh</span>
            }
          >
            <Input.TextArea rows={3} placeholder="Izoh..." />
          </Form.Item>

          {editItem && (
            <>
              <Form.Item
                name="hujjat"
                label={
                  <span className="text-xs font-semibold text-slate-600">
                    Hujjat ID
                  </span>
                }
              >
                <InputNumber className="w-full" placeholder="Hujjat ID" />
              </Form.Item>
              <Form.Item
                name="topshiriq"
                label={
                  <span className="text-xs font-semibold text-slate-600">
                    Topshiriq ID
                  </span>
                }
              >
                <InputNumber className="w-full" placeholder="Topshiriq ID" />
              </Form.Item>
              <Form.Item
                name="beruvchi"
                label={
                  <span className="text-xs font-semibold text-slate-600">
                    Beruvchi ID
                  </span>
                }
              >
                <InputNumber className="w-full" placeholder="Beruvchi ID" />
              </Form.Item>
            </>
          )}

          <div className="flex justify-end gap-2 mt-2">
            <Button
              onClick={() => {
                setModalOpen(false);
                setEditItem(null);
                form.resetFields();
              }}
            >
              Bekor qilish
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-slate-800 border-slate-800 hover:bg-slate-700"
            >
              {editItem ? "Saqlash" : "Qo'shish"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default JarimalarPage;
