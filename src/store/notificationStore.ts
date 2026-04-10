import { create } from "zustand";
import api from "@/services/api/axios";
import { API_ENDPOINTS } from "@/services/api/endpoints";

export type NotificationSummaryItem = {
  id: string;
  title: string;
  description: string;
  path: string;
  section: string;
  tone: string;
};

type NotificationSection = {
  count: number;
  items: NotificationSummaryItem[];
};

export type NotificationSummary = {
  total_unread: number;
  sidebar: {
    chat: number;
    talablar: number;
    topshiriqlar: number;
    hujjatlar: number;
  };
  sections: {
    chat: NotificationSection;
    talablar: NotificationSection;
    topshiriqlar: NotificationSection;
    hujjatlar: NotificationSection;
  };
};

type NotificationState = {
  summary: NotificationSummary | null;
  isLoading: boolean;
  error: string | null;
  fetchSummary: () => Promise<void>;
};

export const useNotificationStore = create<NotificationState>((set) => ({
  summary: null,
  isLoading: false,
  error: null,
  fetchSummary: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<NotificationSummary>(API_ENDPOINTS.DASHBOARD.NOTIFICATIONS);
      set({ summary: data, isLoading: false, error: null });
    } catch (error) {
      console.error("Failed to fetch notification summary", error);
      set({ isLoading: false, error: "Bildirishnomalarni yuklab bo'lmadi" });
    }
  },
}));
