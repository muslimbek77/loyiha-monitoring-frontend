import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spin, Input, Select } from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import api from "@/services/api/axios";
import { API_ENDPOINTS } from "@/services/api/endpoints";

const { Search } = Input;
const { Option } = Select;
const PAGE_SIZE = 10;

const statusConfig = {
  kechikkan: { icon: <ExclamationCircleOutlined />, antColor: "red" },
  jarayonda: { icon: <ClockCircleOutlined />, antColor: "blue" },
  bajarildi: { icon: <CheckCircleOutlined />, antColor: "green" },
};

const TopshiriqlarPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filterHolat, setFilterHolat] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const getAllTopshiriqlar = async (page = 1) => {
    try {
      setLoading(true);
      const res = await api.get(API_ENDPOINTS.TOPSHIRIQLAR.LIST, {
        params: { page },
      });
      setData(res.data.results);
      setTotal(res.data.count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllTopshiriqlar(currentPage);
  }, [currentPage]);

  const filtered = data.filter((row) => {
    const matchSearch =
      row.bayonnoma_raqami.toLowerCase().includes(searchText.toLowerCase()) ||
      row.mazmun.toLowerCase().includes(searchText.toLowerCase()) ||
      row.ijrochi_boshqarma_qisqa_nomi
        .toLowerCase()
        .includes(searchText.toLowerCase());
    const matchHolat = filterHolat === "all" || row.holat === filterHolat;
    return matchSearch && matchHolat;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, filterHolat]);

  const stats = {
    kechikkan: data.filter((d) => d.holat === "kechikkan").length,
    jarayonda: data.filter((d) => d.holat === "jarayonda").length,
    bajarildi: data.filter((d) => d.holat === "bajarildi").length,
  };

  const statCards = [
    {
      label: "Jami",
      value: total,
      colorClass: "text-slate-800",
      bgClass: "bg-gradient-to-br from-slate-50 to-slate-100",
      borderClass: "border-slate-200",
      accentClass: "text-slate-500",
      dotClass: "bg-slate-400",
    },
    {
      label: "Kechikkan",
      value: stats.kechikkan,
      colorClass: "text-rose-700",
      bgClass: "bg-gradient-to-br from-rose-50 to-rose-100",
      borderClass: "border-rose-200",
      accentClass: "text-rose-500",
      dotClass: "bg-rose-400",
    },
    {
      label: "Jarayonda",
      value: stats.jarayonda,
      colorClass: "text-blue-700",
      bgClass: "bg-gradient-to-br from-blue-50 to-blue-100",
      borderClass: "border-blue-200",
      accentClass: "text-blue-500",
      dotClass: "bg-blue-400",
    },
    {
      label: "Bajarildi",
      value: stats.bajarildi,
      colorClass: "text-green-700",
      bgClass: "bg-gradient-to-br from-green-50 to-green-100",
      borderClass: "border-green-200",
      accentClass: "text-green-500",
      dotClass: "bg-green-400",
    },
  ];

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-sky-50 rounded-2xl font-sans">
      {/* Header */}
      <div className="bg-white/85 backdrop-blur-xl border-b border-slate-200/80 rounded-t-2xl shadow-sm shadow-indigo-100/50">
        <div className="w-full px-7 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-[13px] bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-400/40">
              <FileTextOutlined className="text-white text-xl" />
            </div>
            <div>
              <h1 className="m-0 text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Topshiriqlar
              </h1>
              <p className="m-0 text-xs text-slate-400 font-medium tracking-wide">
                Bayonnomalar bo'yicha topshiriqlar ro'yxati
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-7 py-6 flex flex-col gap-5">
        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-3.5">
          {statCards.map((s) => (
            <div
              key={s.label}
              className={`relative overflow-hidden ${s.bgClass} border ${s.borderClass} rounded-2xl p-4 shadow-sm`}
            >
              {/* Decorative circle */}
              <div
                className={`absolute -top-3.5 -right-3.5 w-14 h-14 rounded-full ${s.dotClass} opacity-15`}
              />
              <p
                className={`m-0 mb-1 text-[11px] font-bold uppercase tracking-widest ${s.accentClass}`}
              >
                {s.label}
              </p>
              <p
                className={`m-0 text-[32px] font-extrabold leading-tight tracking-tighter ${s.colorClass}`}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2.5 flex-wrap items-center">
          <Search
            placeholder="Bayonnoma raqami, mazmun yoki boshqarma..."
            allowClear
            prefix={<SearchOutlined className="text-slate-400" />}
            onChange={(e) => setSearchText(e.target.value)}
            className="flex-1 max-w-[480px] rounded-xl"
            styles={{ input: { fontWeight: 500, fontSize: 13 } }}
          />
          <Select
            value={filterHolat}
            onChange={setFilterHolat}
            className="min-w-[170px]"
            suffixIcon={<FilterOutlined className="text-slate-500" />}
            styles={{ popup: { borderRadius: 12 } }}
          >
            <Option value="all">Barcha holatlar</Option>
            <Option value="kechikkan">Kechikkan</Option>
            <Option value="jarayonda">Jarayonda</Option>
            <Option value="bajarildi">Bajarildi</Option>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white/92 backdrop-blur-lg rounded-2xl border border-slate-200 shadow-md shadow-indigo-100/50 overflow-hidden">
          <Spin spinning={loading} tip="Yuklanmoqda...">
            {filtered.length === 0 ? (
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
                      <tr className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100 text-left text-[11px] font-bold uppercase tracking-[0.07em] text-slate-500">
                        <th className="px-4 py-3">Bayonnoma №</th>
                        <th className="px-4 py-3">Boshqarma</th>
                        <th className="px-4 py-3">Band №</th>
                        <th className="px-4 py-3">Mazmun</th>
                        <th className="px-4 py-3">Muddat</th>
                        <th className="px-4 py-3">Holat</th>
                        <th className="px-4 py-3">Qolgan kunlar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((row) => {
                        const cfg = statusConfig[row.holat] || statusConfig.jarayonda;
                        const styleMap = {
                          kechikkan:
                            "bg-gradient-to-br from-rose-50 to-rose-100 text-rose-700 border-rose-200",
                          jarayonda:
                            "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 border-blue-200",
                          bajarildi:
                            "bg-gradient-to-br from-green-50 to-green-100 text-green-700 border-green-200",
                        };
                        return (
                          <tr
                            key={row.id}
                            onClick={() => navigate(`/topshiriqlar/${row.id}`)}
                            className={`cursor-pointer border-b border-slate-100 transition hover:bg-violet-50 ${
                              row.is_kechikkan ? "bg-rose-50/50" : ""
                            }`}
                          >
                            <td className="px-4 py-3">
                              <span className="rounded-md border border-slate-300 bg-gradient-to-br from-slate-100 to-slate-200 px-2.5 py-1 font-mono text-xs font-semibold tracking-wide text-slate-800">
                                {row.bayonnoma_raqami}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-500 text-sm font-bold tracking-wide text-white shadow-md shadow-indigo-300/50">
                                {row.ijrochi_boshqarma_qisqa_nomi}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-mono text-sm font-semibold text-slate-400">
                                #{row.band_raqami}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm leading-relaxed text-slate-700">
                                {row.mazmun}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-600">
                                <ClockCircleOutlined className="text-xs text-slate-400" />
                                {row.muddat}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex whitespace-nowrap rounded-full border px-3 py-0.5 text-xs font-semibold ${styleMap[row.holat] || styleMap.jarayonda}`}
                              >
                                <span className="mr-1.5">{cfg.icon}</span>
                                {row.holat_display}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {row.bajarildi ? (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
                                  <CheckCircleOutlined />
                                  Tugallandi
                                </span>
                              ) : row.qolgan_kunlar < 0 ? (
                                <span
                                  title={`${Math.abs(row.qolgan_kunlar)} kun kechikdi`}
                                  className="inline-block cursor-help rounded-lg border border-rose-200 bg-gradient-to-br from-rose-50 to-rose-100 px-2.5 py-0.5 text-sm font-bold text-red-600"
                                >
                                  {row.qolgan_kunlar} kun
                                </span>
                              ) : (
                                <span className="inline-block rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 px-2.5 py-0.5 text-sm font-bold text-blue-600">
                                  +{row.qolgan_kunlar} kun
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
                    {Math.min((currentPage - 1) * PAGE_SIZE + 1, total)}–
                    {Math.min(currentPage * PAGE_SIZE, total)} /{" "}
                    <strong className="text-slate-600">{total}</strong> ta
                    topshiriq
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
