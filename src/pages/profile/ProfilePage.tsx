import { useState, type FormEvent, type ReactNode } from "react";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import { useAuthStore } from "@/store/authStore";
import api from "@/services/api/axios";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import { data } from "react-router-dom";

type ErrorResponse = {
  message?: string;
  detail?: string;
};

const ProfilePage = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const fetchUser = useAuthStore((state) => state.fetchUser);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fio: "",
    telefon: "",
    telegram_id: "",
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const getApiErrorMessage = (error: unknown) => {
    const axiosError = error as AxiosError<ErrorResponse>;
    return (
      axiosError.response?.data?.message ||
      axiosError.response?.data?.detail ||
      "Xatolik yuz berdi"
    );
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">
            Autentifikatsiya ma'lumotlari topilmadi
          </h3>
          <p className="text-center text-gray-600 mb-6">
            Iltimos, qaytadan tizimga kiring
          </p>
          <button className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-xl transition-colors">
            Tizimga kirish
          </button>
        </div>
      </div>
    );
  }

  if (isAuthLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
          <p className="text-gray-700 font-medium">
            Profil ma'lumotlari yuklanmoqda...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
          <p className="text-amber-700 font-medium">
            Foydalanuvchi ma'lumotlari mavjud emas
          </p>
        </div>
      </div>
    );
  }

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    const first = parts[0]?.[0] ?? "";
    const second = parts[1]?.[0] ?? "";
    const initials = `${first}${second}`.toUpperCase();

    if (initials) return initials;
    return name[0]?.toUpperCase() ?? "U";
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return "Hech qachon";
    const date = new Date(dateString);
    return date.toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleEditProfile = () => {
    setProfileForm({
      fio: user.fio || "",
      telefon: user.telefon || "",
      telegram_id: user.telegram_id || "",
    });
    setIsEditingProfile(true);
    setMessage(null);
  };

  const handleUpdateProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await api.put(API_ENDPOINTS.USERS.PROFILE, profileForm);
      await fetchUser();

      setMessage({
        type: "success",
        text: "Profil muvaffaqiyatli yangilandi!",
      });

      setIsEditingProfile(false);
    } catch (error: unknown) {
      setMessage({
        type: "error",
        text: getApiErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error("Yangi parollar mos kelmaydi");
      setLoading(false);
      return;
    }

    if (passwordForm.new_password.length < 8) {
      toast.error("Parol kamida 8 ta belgidan iborat bo'lishi kerak");
      setLoading(false);
      return;
    }

    try {
      await api.put(API_ENDPOINTS.USERS.CHANGE_PASSWORD, {
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password,
        new_password_confirm: passwordForm.confirm_password,
      });

      toast.success("Parol muvaffaqiyatli o'zgartirildi!");

      setPasswordForm({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });

      setTimeout(() => setIsChangingPassword(false), 1500);
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br  py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Shaxsiy profil
          </h1>
          <p className="text-gray-600">Hisob ma'lumotlari va sozlamalar</p>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl ${
              message.type === "success"
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <div className="flex items-center gap-3">
              {message.type === "success" ? (
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              <p
                className={`font-medium ${message.type === "success" ? "text-green-800" : "text-red-800"}`}
              >
                {message.text}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden sticky top-6">
              {/* Gradient Header */}
              <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 h-24 relative"></div>

              {/* Avatar */}
              <div className="relative px-6 pb-6">
                <div className="flex flex-col items-center -mt-12">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 shadow-2xl flex items-center justify-center text-3xl font-bold text-white ring-4 ring-white">
                    {getInitials(user.fio)}
                  </div>

                  <div className="text-center mt-4">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                      {user.fio}
                    </h2>
                    <p className=" text-indigo-600 font-medium mb-1">
                      {user.lavozim_display}
                    </p>

                    <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      @{user.username}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="mt-4">
                    <span
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                        user.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full animate-pulse ${user.is_active ? "bg-green-500" : "bg-gray-400"}`}
                      ></span>
                      {user.is_active ? "Faol hisob" : "Nofaol"}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="w-full mt-6 space-y-3">
                    <button
                      onClick={handleEditProfile}
                      className="w-full flex cursor-pointer items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-lg"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Profilni tahrirlash
                    </button>

                    <button
                      onClick={() => {
                        setIsChangingPassword(true);
                        setMessage(null);
                      }}
                      className="w-full flex items-center cursor-pointer justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-medium rounded-xl transition-all duration-300 hover:shadow-lg"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                        />
                      </svg>
                      Parolni o'zgartirish
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Edit Profile Form */}
            {isEditingProfile && (
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Profilni tahrirlash
                      </h3>
                      <p className="text-sm text-gray-500">
                        Ma'lumotlaringizni yangilang
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      F.I.O
                    </label>
                    <input
                      type="text"
                      value={profileForm.fio}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, fio: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon raqam
                    </label>
                    <input
                      type="tel"
                      value={profileForm.telefon}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          telefon: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="+998901234567"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telegram ID
                    </label>
                    <input
                      type="text"
                      value={profileForm.telegram_id}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          telegram_id: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="123456789"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r cursor-pointer from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Saqlanmoqda..." : "Saqlash"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-6 py-3 cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-colors"
                    >
                      Bekor qilish
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Change Password Form */}
            {isChangingPassword && (
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center text-white">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Parolni o'zgartirish
                      </h3>
                      <p className="text-sm text-gray-500">
                        Yangi parol kiriting
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsChangingPassword(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Joriy parol
                    </label>
                    <input
                      type="password"
                      value={passwordForm.old_password}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          old_password: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Yangi parol
                    </label>
                    <input
                      type="password"
                      value={passwordForm.new_password}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          new_password: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      // minLength={8}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Yangi parolni tasdiqlang
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirm_password}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirm_password: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      // minLength={8}
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-medium py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "O'zgartrilmoqda..." : "Parolni o'zgartirish"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordForm({
                          old_password: "",
                          new_password: "",
                          confirm_password: "",
                        });
                      }}
                      className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-colors"
                    >
                      Bekor qilish
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Aloqa ma'lumotlari
                  </h3>
                  <p className="text-sm text-gray-500">
                    Bog'lanish uchun ma'lumotlar
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard
                  icon={
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  }
                  label="Telefon raqam"
                  value={user.telefon}
                  linkPrefix="tel:"
                />

                <InfoCard
                  icon={
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  }
                  label="Telegram"
                  value={user.telegram_id ? `${user.telegram_id}` : "Ulanmagan"}
                  isEmpty={!user.telegram_id}
                />
              </div>
            </div>

            {/* Position Information */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Lavozim ma'lumotlari
                  </h3>
                  <p className="text-sm text-gray-500">
                    Ish joyi va mas'uliyat
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard
                  icon={
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  }
                  label="Lavozim nomi"
                  value={user.lavozim_display}
                />

                <InfoCard
                  icon={
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  }
                  label="Bo'lim"
                  value={user.boshqarma_nomi || "Belgilanmagan"}
                  isEmpty={!user.boshqarma_nomi}
                />
              </div>
            </div>

            {/* Account Activity */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Hisob faolligi
                  </h3>
                  <p className="text-sm text-gray-500">
                    Kirish va ro'yxat tarixi
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard
                  icon={
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  }
                  label="Ro'yxatdan o'tgan"
                  value={formatDate(user.date_joined)}
                />

                <InfoCard
                  icon={
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    </svg>
                  }
                  label="Oxirgi kirish"
                  value={formatDateTime(user.last_login)}
                  isEmpty={!user.last_login}
                />

                <InfoCard
                  icon={
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  }
                  label="Hisob holati"
                  value={
                    user.is_active ? "Tasdiqlangan va faol" : "Tasdiqlanmagan"
                  }
                />

                <InfoCard
                  icon={
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                      />
                    </svg>
                  }
                  label="Lavozim kodi"
                  value={user.lavozim}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({
  icon,
  label,
  value,
  isEmpty = false,
  linkPrefix,
}: {
  icon: ReactNode;
  label: string;
  value?: string | number;
  isEmpty?: boolean;
  linkPrefix?: string;
}) => {
  const content = (
    <div
      className={`group bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-indigo-200 ${linkPrefix && value && !isEmpty ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform ${
            isEmpty ? "text-gray-400" : "text-indigo-600"
          }`}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {label}
          </p>
          <p
            className={`text-sm font-semibold break-words ${
              isEmpty ? "text-gray-400 italic" : "text-gray-900"
            }`}
          >
            {value || "-"}
          </p>
        </div>
      </div>
    </div>
  );

  if (linkPrefix && value && !isEmpty) {
    return (
      <a href={`${linkPrefix}${value}`} className="block">
        {content}
      </a>
    );
  }

  return content;
};

export default ProfilePage;
