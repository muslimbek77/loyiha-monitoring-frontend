import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spin, Select } from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import api from "@/services/api/axios";
import { API_ENDPOINTS } from "@/services/api/endpoints";

type TopshiriqRow = {
  id: number;
  bayonnoma_raqami: string;
  ijrochi_boshqarma_nomi: string;
  ijrochi_xodim_fio?: string | null;
  band_raqami: string | number;
  mazmun: string;
  muddat: string;
  holat: string;
  holat_display: string;
  holat_ui?: string;
  holat_ui_display?: string;
  bajarildi: boolean;
  is_kechikkan: boolean;
  qolgan_kunlar: number;
};

const PAGE_SIZE = 10;

const statusConfig = {
  kechikkan: { icon: <ExclamationCircleOutlined />, badge: "text-rose-700 border-rose-200 bg-rose-50" },
  jarayonda: { icon: <ClockCircleOutlined />, badge: "text-blue-700 border-blue-200 bg-blue-50" },
  tasdiqlashda: { icon: <ClockCircleOutlined />, badge: "text-amber-700 border-amber-200 bg-amber-50" },
  bajarildi: { icon: <CheckCircleOutlined />, badge: "text-green-700 border-green-200 bg-green-50" },
};

const getHolat = (row: TopshiriqRow) => row.holat_ui ?? row.holat;
const getHolatLabel = (row: TopshiriqRow) =>
  row.holat_ui_display ?? row.holat_display;
const getBandLabel = (value: string | number) =>
  String(value).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
const getMasulLabel = (row: TopshiriqRow) =>
  row.ijrochi_xodim_fio?.trim() || row.ijrochi_boshqarma_nomi;
const getQolganKunLabel = (row: TopshiriqRow) => {
  if (row.bajarildi) return "Bajarilgan";
  return `${Math.abs(row.qolgan_kunlar)} kun`;
};

const TopshiriqlarPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<TopshiriqRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterBayonnoma, setFilterBayonnoma] = useState<string>();
  const [filterBoshqarma, setFilterBoshqarma] = useState<string>();
  const [filterHolat, setFilterHolat] = useState<string>();

  useEffect(() => {
    const fetchTopshiriqlar = async () => {
      try {
        setLoading(true);
        const res = await api.get(API_ENDPOINTS.TOPSHIRIQLAR.LIST, {
          params: { all: true },
        });
        const results = Array.isArray(res.data) ? res.data : (res.data.results ?? []);
        setData(results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopshiriqlar();
  }, []);

  const filtered = useMemo(
    () =>
      data.filter((row) => {
        const matchBayonnoma =
          !filterBayonnoma || row.bayonnoma_raqami === filterBayonnoma;
        const matchBoshqarma =
          !filterBoshqarma || row.ijrochi_boshqarma_nomi === filterBoshqarma;
        const matchHolat = !filterHolat || getHolat(row) === filterHolat;
        return matchBayonnoma && matchBoshqarma && matchHolat;
      }),
    [data, filterBayonnoma, filterBoshqarma, filterHolat],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filterBayonnoma, filterBoshqarma, filterHolat]);

  const stats = useMemo(
    () => ({
      jami: data.length,
      jarayonda: data.filter((item) => getHolat(item) === "jarayonda").length,
      tasdiqlashda: data.filter((item) => getHolat(item) === "tasdiqlashda").length,
      bajarildi: data.filter((item) => getHolat(item) === "bajarildi").length,
      kechikkan: data.filter((item) => getHolat(item) === "kechikkan").length,
    }),
    [data],
  );

  const statCards = [
    {
      label: "Jami topshiriqlar",
      value: stats.jami,
      classes: "text-slate-800 border-slate-200 bg-slate-50",
    },
    {
      label: "Jarayonda",
      value: stats.jarayonda,
      classes: "text-blue-700 border-blue-200 bg-blue-50",
    },
    {
      label: "Tasdiqlashda",
      value: stats.tasdiqlashda,
      classes: "text-amber-700 border-amber-200 bg-amber-50",
    },
    {
      label: "Bajarilgan",
      value: stats.bajarildi,
      classes: "text-green-700 border-green-200 bg-green-50",
    },
    {
      label: "Kechikkan",
      value: stats.kechikkan,
      classes: "text-rose-700 border-rose-200 bg-rose-50",
    },
  ];

  const uniqueBayonnomalar = Array.from(new Set(data.map((item) => item.bayonnoma_raqami)));
  const uniqueBoshqarmalar = Array.from(
    new Set(data.map((item) => item.ijrochi_boshqarma_nomi)),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <div className="min-h-screen rounded-2xl bg-gradient-to-br from-slate-50 via-indigo-50 to-sky-50">
      <div className="rounded-t-2xl border-b border-slate-200/80 bg-white/85 shadow-sm shadow-indigo-100/50 backdrop-blur-xl">
        <div className="flex items-center justify-between px-7 py-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-400/40">
              <FileTextOutlined className="text-xl text-white" />
            </div>
            <div>
              <h1 className="m-0 text-xl font-extrabold leading-tight tracking-tight text-slate-900">
                Topshiriqlar
              </h1>
              <p className="m-0 text-xs font-medium tracking-wide text-slate-400">
                Bayonnomalar bo&apos;yicha topshiriqlar statistikasi
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex flex-col gap-5 px-7 py-6">
        <div className="grid grid-cols-5 gap-3.5">
          {statCards.map((card) => (
            <div
              key={card.label}
              className={`rounded-2xl border p-4 shadow-sm ${card.classes}`}
            >
              <p className="mb-1 text-[11px] font-bold uppercase tracking-widest opacity-75">
                {card.label}
              </p>
              <p className="m-0 text-[32px] font-extrabold leading-tight tracking-tighter">
                {card.value}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Select
            value={filterBayonnoma}
            onChange={setFilterBayonnoma}
            allowClear
            placeholder="Bayonnoma raqami"
            className="min-w-[220px]"
            options={uniqueBayonnomalar.map((value) => ({ value, label: value }))}
          />
          <Select
            value={filterBoshqarma}
            onChange={setFilterBoshqarma}
            allowClear
            placeholder="Mas'ul boshqarma"
            className="min-w-[240px]"
            options={uniqueBoshqarmalar.map((value) => ({ value, label: value }))}
          />
          <Select
            value={filterHolat}
            onChange={setFilterHolat}
            allowClear
            placeholder="Topshiriq holati"
            suffixIcon={<FilterOutlined className="text-slate-500" />}
            className="min-w-[200px]"
            options={[
              { value: "jarayonda", label: "Jarayonda" },
              { value: "tasdiqlashda", label: "Tasdiqlashda" },
              { value: "bajarildi", label: "Bajarilgan" },
              { value: "kechikkan", label: "Kechikkan" },
            ]}
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/92 shadow-md shadow-indigo-100/50 backdrop-blur-lg">
          <Spin spinning={loading} tip="Yuklanmoqda...">
            {paginated.length === 0 ? (
              <div className="py-16 text-center text-slate-300">
                <FileTextOutlined className="mb-3 text-4xl opacity-35" />
                <p className="m-0 text-sm font-medium text-slate-400">
                  Topshiriqlar topilmadi
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gradient-to-b from-slate-50 to-slate-100 text-left text-[11px] font-bold uppercase tracking-[0.07em] text-slate-500">
                        <th className="px-4 py-3">Bayonnoma raqami</th>
                        <th className="px-4 py-3">Mas&apos;ul shaxs</th>
                        <th className="px-4 py-3">Band raqami</th>
                        <th className="px-4 py-3">Qisqacha mazmuni</th>
                        <th className="px-4 py-3">Muddat</th>
                        <th className="px-4 py-3">Holati</th>
                        <th className="px-4 py-3">Qolgan kunlar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((row) => {
                        const holat = getHolat(row);
                        const config = statusConfig[holat] ?? statusConfig.jarayonda;

                        return (
                          <tr
                            key={row.id}
                            onClick={() => navigate(`/topshiriqlar/${row.id}`)}
                            className={`cursor-pointer border-b border-slate-100 transition hover:bg-violet-50 ${
                              holat === "kechikkan" ? "bg-rose-50/50" : ""
                            }`}
                          >
                            <td className="px-4 py-3">
                              <span className="rounded-md border border-slate-300 bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-800">
                                {row.bayonnoma_raqami}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-slate-700">
                              {getMasulLabel(row)}
                            </td>
                            <td className="px-4 py-3 font-mono text-sm font-semibold text-slate-500">
                              {getBandLabel(row.band_raqami)}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className="block max-w-[420px] overflow-hidden text-sm leading-6 text-slate-700"
                                style={{
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                }}
                              >
                                {row.mazmun}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-slate-600">
                              <span className="flex items-center gap-1.5">
                                <ClockCircleOutlined className="text-xs text-slate-400" />
                                {row.muddat}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-0.5 text-xs font-semibold ${config.badge}`}
                              >
                                {config.icon}
                                {getHolatLabel(row)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {row.bajarildi ? (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
                                  <CheckCircleOutlined />
                                  {getQolganKunLabel(row)}
                                </span>
                              ) : row.qolgan_kunlar < 0 ? (
                                <span className="inline-block rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-sm font-bold text-red-600">
                                  {getQolganKunLabel(row)}
                                </span>
                              ) : (
                                <span className="inline-block rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-sm font-bold text-blue-600">
                                  {getQolganKunLabel(row)}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3">
                  <span className="text-xs font-medium text-slate-400">
                    {Math.min((currentPage - 1) * PAGE_SIZE + 1, filtered.length)}–
                    {Math.min(currentPage * PAGE_SIZE, filtered.length)} /{" "}
                    <strong className="text-slate-600">{filtered.length}</strong> ta topshiriq
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((page) => Math.max(1, page - 1))
                      }
                      disabled={currentPage === 1}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Oldingi
                    </button>
                    <span className="text-sm text-slate-500">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((page) => Math.min(totalPages, page + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Keyingi
                    </button>
                  </div>
                </div>
              </>
            )}
          </Spin>
        </div>
      </div>
    </div>
  );
};

export default TopshiriqlarPage;
