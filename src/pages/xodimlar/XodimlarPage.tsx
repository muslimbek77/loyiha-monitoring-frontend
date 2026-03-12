import { useEffect, useState, useCallback } from "react";
import { Spin, Select } from "antd";
import {
  UserAddOutlined,
  UserOutlined,
  TeamOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "@/services/api/axios";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import AddUserModal from "./AddUserModal";

interface User {
  id: number;
  fio: string;
  lavozim: string;
  boshqarma_nomi: string;
  is_active: boolean;
  avatar?: string;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

const LAVOZIM_OPTIONS = [
  { value: "", label: "Barcha lavozimlar" },
  { value: "rais", label: "Boshqaruv Raisi" },
  { value: "rais_orinbosari", label: "Rais O'rinbosari" },
  { value: "boshqarma_boshi", label: "Boshqarma Boshlig'i" },
  { value: "pto", label: "PTO xodimi" },
  { value: "iqtisod", label: "Iqtisodchi" },
  { value: "buxgalter", label: "Buxgalter" },
  { value: "kadr", label: "Kadrlar xodimi" },
  { value: "uchastka_rahbari", label: "Uchastka rahbari" },
  { value: "xodim", label: "Oddiy xodim" },
];

const PAGE_SIZE = 10;

const XodimlarPage = () => {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [lavozim, setLavozim] = useState("");
  const navigate = useNavigate();

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Debounce: reset to page 1 when search changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page };
      if (search) params.search = search;
      if (lavozim) params.lavozim = lavozim;

      const res = await api.get<PaginatedResponse>(API_ENDPOINTS.USERS.LIST, {
        params,
      });
      setData(res.data.results);
      setTotalCount(res.data.count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, lavozim]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleLavozimChange = (val: string) => {
    setPage(1);
    setLavozim(val);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8 rounded-xl">
      {/* Page header */}
      <div className="mb-6">
        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.2em] mb-1">
          Tashkilot xodimlari
        </p>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
            Xodimlar ro'yxati
          </h1>
          <div className="flex items-center gap-3">
            {totalCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
                <TeamOutlined className="text-[11px]" />
                {totalCount} ta xodim
              </span>
            )}
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-xl transition-colors duration-150 cursor-pointer"
            >
              <UserAddOutlined className="text-xs" />
              Xodim qo'shish
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Xodim qidirish..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent transition"
          />
        </div>

        <Select
          value={lavozim ?? ""}
          onChange={(value) => handleLavozimChange(value ?? "")}
          options={LAVOZIM_OPTIONS}
          className="min-w-[220px] py-1.5! rounded-xl!"
          size="middle"
        />

        {(search || lavozim) && (
          <button
            onClick={() => {
              setSearch("");
              setLavozim("");
              setPage(1);
            }}
            className="px-3 py-2 text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Tozalash ✕
          </button>
        )}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
              <TeamOutlined className="text-slate-300 text-xl" />
            </div>
            <p className="text-sm text-slate-400 font-medium">
              {search || lavozim
                ? "Qidiruv natijasi topilmadi"
                : "Hozircha xodimlar mavjud emas"}
            </p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["F.I.O", "Lavozim", "Boshqarma", "Holati"].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => navigate(`/users/${user.id}`)}
                    className="border-b border-slate-100 last:border-b-0 cursor-pointer hover:bg-slate-50 transition-colors duration-100"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                          {user.avatar ? (
                            <img
                              src={
                                user.avatar?.startsWith("http://")
                                  ? user.avatar.replace("http://", "https://")
                                  : user.avatar
                              }
                              alt={user.fio}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <UserOutlined className="text-slate-400 text-xs" />
                          )}
                        </div>
                        <span className="text-sm font-semibold text-slate-700">
                          {user.fio}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 capitalize">
                        {user.lavozim.replace("_", " ")}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="text-sm text-slate-600">
                        {user.boshqarma_nomi}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      {user.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Aktiv
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          Nofaol
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination footer */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
                <span className="text-xs text-slate-400">
                  Jami{" "}
                  <span className="font-semibold text-slate-600">
                    {totalCount}
                  </span>{" "}
                  ta xodim · {page}-sahifa
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs"
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 || p === totalPages || Math.abs(p - page) <= 1,
                    )
                    .reduce<(number | "...")[]>((acc, p, i, arr) => {
                      if (i > 0 && p - (arr[i - 1] as number) > 1)
                        acc.push("...");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === "..." ? (
                        <span
                          key={`ellipsis-${i}`}
                          className="w-7 h-7 flex items-center justify-center text-slate-400 text-xs"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p as number)}
                          className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                            p === page
                              ? "bg-slate-800 text-white"
                              : "border border-slate-200 text-slate-500 hover:bg-slate-50"
                          }`}
                        >
                          {p}
                        </button>
                      ),
                    )}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <AddUserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setPage(1);
          fetchUsers();
        }}
      />
    </div>
  );
};

export default XodimlarPage;
