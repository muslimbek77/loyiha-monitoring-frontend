export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login/",
    REGISTER: "/auth/register/",
    LOGOUT: "/auth/logout/",
    REFRESH: "/auth/token/refresh/",
  },

  USERS: {
    LIST: "/auth/users/",
    LIST_ALL: "/auth/users/?all=true",
    LAVOZIMLAR: "/auth/users/lavozimlar/",
    CREATE: "/auth/users/",
    DETAIL: (id: string | number) => `/auth/users/${id}/`,
    UPDATE: (id: string | number) => `/auth/users/${id}/`,
    DELETE: (id: string | number) => `/auth/users/${id}/`,
    PROFILE: "/auth/profile/",
    CHANGE_PASSWORD: "/auth/password/change/",
    BOSHQARMA_XODIMLARI: "/auth/users/boshqarma_xodimlari/",
  },

  LAVOZIMLAR: {
    LIST: "/auth/lavozimlar/",
    DETAIL: (id: string | number) => `/auth/lavozimlar/${id}/`,
  },

  DASHBOARD: {
    STATS: "/analytics/dashboard/",
    NOTIFICATIONS: "/analytics/notifications/summary/",
    REYTING: "/analytics/reyting/",
    XARITA: "/analytics/xarita/",
    MOLIYA: "/analytics/moliya/",
    AI_HISOBOTLAR: "/analytics/hisobotlar/",
    AI_HISOBOT_GENERATE: "/analytics/hisobotlar/generate/",
  },

  BOSHQARMA: {
    LIST: "/core/boshqarmalar/",
    LIST_ALL: "/core/boshqarmalar/?all=true",
    DETAIL: (id: string | number) => `/core/boshqarmalar/${id}/`,
    STATISTIKA: (id: string | number) => `/core/boshqarmalar/${id}/statistika/`,
    OVERVIEW: (id: string | number) => `/core/boshqarmalar/${id}/overview/`,
  },

  HUJJATLAR: {
    LIST: "/hujjatlar/",
    DETAIL: (id: string | number) => `/hujjatlar/${id}/`,
    TARIX: (id: string | number) => `/hujjatlar/${id}/tarix/`,
    TASDIQLASH: (id: string | number) => `/hujjatlar/${id}/tasdiqlash/`,
    YANGILASH: (id: string | number) => `/hujjatlar/${id}/yangilash/`,
    KECHIKKAN: "/hujjatlar/kechikkan/",
    KUTILMOQDA: "/hujjatlar/kutilmoqda/",
    BOSHQARMA_HUJJATLARI: "/hujjatlar/boshqarma_hujjatlari/",
    OBYEKT_HUJJATLARI: "/hujjatlar/obyekt_hujjatlari/",
    KATEGORIYA_HUJJATLARI: "/hujjatlar/kategoriya_hujjatlari/",
    BOSHQARMA_KATEGORIYALARI: "/hujjatlar/boshqarma_kategoriyalar/",
  },

  KATEGORIYALAR: {
    LIST: "/hujjatlar/kategoriyalar/",
    DETAIL: (id: string | number) => `/hujjatlar/kategoriyalar/${id}/`,
    TREE: "/hujjatlar/kategoriyalar/tree/",
    BOSHQARMA: "/hujjatlar/kategoriyalar/boshqarma_kategoriyalari/",
  },

  OBYEKTLAR: {
    LIST: "/obyektlar/",
    STATISTIKA: "/obyektlar/statistika/",
    DETAIL: (id: string | number) => `/obyektlar/${id}/`,
    MUAMMOLI: "/obyektlar/muammoli/",
    YANGILIKLAR: (id: string | number) => `/obyektlar/${id}/yangiliklar/`,
    YANGILIK_QOSHISH: (id: string | number) => `/obyektlar/${id}/yangilik_qoshish/`,
    FOIZ_YANGILASH: (id: string | number) => `/obyektlar/${id}/foiz_yangilash/`,
  },

  BAYONNOMALAR: {
    LIST: "/bayonnomalar/",
    DETAIL: (id: string | number) => `/bayonnomalar/${id}/`,
  },

  TOPSHIRIQLAR: {
    LIST: "/bayonnomalar/topshiriqlar/",
    DETAIL: (id: string | number) => `/bayonnomalar/topshiriqlar/${id}/`,
    MENING: "/bayonnomalar/topshiriqlar/mening/",
    IZOH_QOSHISH: (id: string | number) =>
      `/bayonnomalar/topshiriqlar/${id}/izoh_qoshish/`,
    TASDIQLASH: (id: string | number) =>
      `/bayonnomalar/topshiriqlar/${id}/tasdiqlash/`,
  },

  JARIMALAR: {
    LIST: "/jarimalar/",
    STATISTIKA: "/jarimalar/boshqarma_statistika/",
    DETAIL: (id: string | number) => `/jarimalar/${id}/`,
  },

  CHAT_XONALAR: {
    LIST: "/chat/xonalar/",
    DETAIL: (id: string | number) => `/chat/xonalar/${id}/`,
    SOZLAMALAR: (id: string | number) => `/chat/xonalar/${id}/sozlamalar/`,
    XABARLAR: (id: string | number) => `/chat/xonalar/${id}/xabarlar/`,
    XABAR_YUBORISH: (id: string | number) => `/chat/xonalar/${id}/xabar_yuborish/`,
    ISHTIROKCHI_QOSHISH: (id: string | number) =>
      `/chat/xonalar/${id}/ishtirokchi_qoshish/`,
    ISHTIROKCHI_OCHIRISH: (id: string | number) =>
      `/chat/xonalar/${id}/ishtirokchi_ochirish/`,
    CHIQISH: (id: string | number) => `/chat/xonalar/${id}/chiqish/`,
  },

  TALABLAR: {
    LIST: "/talablar/",
    DETAIL: (id: string | number) => `/talablar/${id}/`,
    KELGAN: "/talablar/kelgan/",
    YUBORGAN: "/talablar/yuborgan/",
    QABUL_QILISH: (id: string | number) => `/talablar/${id}/qabul_qilish/`,
    BAJARISH: (id: string | number) => `/talablar/${id}/bajarish/`,
    JAVOB_YUBORISH: (id: string | number) => `/talablar/${id}/javob_yuborish/`,
    RAD_ETISH: (id: string | number) => `/talablar/${id}/rad_etish/`,
    YOPISH: (id: string | number) => `/talablar/${id}/yopish/`,
    STATUS_OZGARTIRISH: (id: string | number) =>
      `/talablar/${id}/status_ozgartirish/`,
    IZOH_QOSHISH: (id: string | number) => `/talablar/${id}/izoh_qoshish/`,
  },
};
