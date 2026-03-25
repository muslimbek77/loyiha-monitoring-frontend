import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Tooltip, Spin, Input, Select } from "antd";
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

  const columns = [
    {
      title: "Bayonnoma №",
      dataIndex: "bayonnoma_raqami",
      key: "bayonnoma_raqami",
      width: 150,
      render: (val) => (
        <span className="font-mono text-xs font-semibold text-slate-800 bg-gradient-to-br from-slate-100 to-slate-200 px-2.5 py-1 rounded-md border border-slate-300 tracking-wide">
          {val}
        </span>
      ),
    },
    {
      title: "Boshqarma",
      dataIndex: "ijrochi_boshqarma_qisqa_nomi",
      key: "ijrochi_boshqarma_qisqa_nomi",
      width: 120,
      render: (val) => (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-300/50 tracking-wide">
          {val}
        </div>
      ),
    },
    {
      title: "Band №",
      dataIndex: "band_raqami",
      key: "band_raqami",
      width: 90,
      align: "center",
      render: (val) => (
        <span className="text-slate-400 font-semibold text-sm font-mono">
          #{val}
        </span>
      ),
    },
    {
      title: "Mazmun",
      dataIndex: "mazmun",
      key: "mazmun",
      render: (val) => (
        <span className="text-slate-700 text-sm leading-relaxed font-normal">
          {val}
        </span>
      ),
    },
    {
      title: "Muddat",
      dataIndex: "muddat",
      key: "muddat",
      width: 140,
      render: (val) => (
        <span className="flex items-center gap-1.5 text-slate-600 text-sm font-semibold">
          <ClockCircleOutlined className="text-slate-400 text-xs" />
          {val}
        </span>
      ),
    },
    {
      title: "Holat",
      dataIndex: "holat",
      key: "holat",
      width: 140,
      render: (val, row) => {
        const cfg = statusConfig[val] || statusConfig.jarayonda;
        const styleMap = {
          kechikkan:
            "bg-gradient-to-br from-rose-50 to-rose-100 text-rose-700 border-rose-200",
          jarayonda:
            "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 border-blue-200",
          bajarildi:
            "bg-gradient-to-br from-green-50 to-green-100 text-green-700 border-green-200",
        };
        return (
          <span
            className={`inline-flex items-center gap-1.5 border rounded-full px-3 py-0.5 text-xs font-semibold whitespace-nowrap ${styleMap[val] || styleMap.jarayonda}`}
          >
            {cfg.icon}
            {row.holat_display}
          </span>
        );
      },
    },
    {
      title: "Qolgan kunlar",
      dataIndex: "qolgan_kunlar",
      key: "qolgan_kunlar",
      width: 140,
      align: "center",
      render: (val, row) => {
        if (row.bajarildi)
          return (
            <span className="inline-flex items-center gap-1 text-green-600 font-semibold text-xs">
              <CheckCircleOutlined />
              Tugallandi
            </span>
          );
        if (val < 0)
          return (
            <Tooltip title={`${Math.abs(val)} kun kechikdi`}>
              <span className="inline-block text-red-600 font-bold text-sm bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200 px-2.5 py-0.5 rounded-lg cursor-help">
                {val} kun
              </span>
            </Tooltip>
          );
        return (
          <span className="inline-block text-blue-600 font-bold text-sm bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 px-2.5 py-0.5 rounded-lg">
            +{val} kun
          </span>
        );
      },
    },
  ];

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
          <style>{`
            .tsh-table .ant-table-thead > tr > th {
              background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%) !important;
              color: #64748b !important;
              font-size: 11px !important;
              font-weight: 700 !important;
              text-transform: uppercase !important;
              letter-spacing: 0.07em !important;
              border-bottom: 1px solid #e2e8f0 !important;
              padding: 13px 16px !important;
            }
            .tsh-table .ant-table-tbody > tr > td {
              padding: 13px 16px !important;
              border-bottom: 1px solid #f1f5f9 !important;
              transition: background 0.15s ease !important;
            }
            .tsh-table .ant-table-tbody > tr:hover > td {
              background: #f5f3ff !important;
            }
            .tsh-table .ant-table-tbody > tr:last-child > td {
              border-bottom: none !important;
            }
            .tsh-table .ant-pagination {
              padding: 14px 20px !important;
              margin: 0 !important;
              background: #fafafa;
              border-top: 1px solid #f1f5f9;
            }
            .tsh-table .ant-pagination-item-active {
              background: linear-gradient(135deg, #4f46e5, #6366f1) !important;
              border-color: transparent !important;
              border-radius: 8px !important;
            }
            .tsh-table .ant-pagination-item-active a {
              color: #fff !important;
              font-weight: 700 !important;
            }
            .tsh-table .ant-pagination-item {
              border-radius: 8px !important;
              font-weight: 600 !important;
            }
            .tsh-table .ant-table-row-kechikkan {
              background: rgba(254,242,242,0.5) !important;
            }
          `}</style>
          <Spin spinning={loading} tip="Yuklanmoqda...">
            <Table
              className="tsh-table"
              dataSource={data}
              columns={columns}
              rowKey="id"
              size="middle"
              pagination={{
                current: currentPage,
                onChange: (page) => setCurrentPage(page),
                pageSize: 10,
                total: total,
                showTotal: (total, range) => (
                  <span className="text-slate-400 text-xs font-medium">
                    {range[0]}–{range[1]} /{" "}
                    <strong className="text-slate-600">{total}</strong> ta
                    topshiriq
                  </span>
                ),
                showSizeChanger: false,
              }}
              rowClassName={(record) =>
                record.is_kechikkan ? "ant-table-row-kechikkan" : ""
              }
              scroll={{ x: 860 }}
              onRow={(record) => ({
                onClick: () => navigate(`/topshiriqlar/${record.id}`),
                style: { cursor: "pointer" },
              })}
              locale={{
                emptyText: (
                  <div className="py-16 text-center text-slate-300">
                    <FileTextOutlined className="text-4xl mb-3 opacity-35" />
                    <p className="m-0 text-sm font-medium text-slate-400">
                      Topshiriqlar topilmadi
                    </p>
                  </div>
                ),
              }}
            />
          </Spin>
        </div>
      </div>
    </div>
  );
};

export default TopshiriqlarPage;
