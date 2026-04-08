export interface LavozimOption {
  value: string;
  label: string;
}

export const DEFAULT_LAVOZIM_OPTIONS: LavozimOption[] = [
  { value: "superadmin", label: "Superadmin" },
  { value: "rais", label: "Boshqaruv Raisi" },
  { value: "rais_orinbosari", label: "Boshqaruv rais o'rinbosari" },
  { value: "boshqarma_boshi", label: "Boshqarma boshlig'i" },
  {
    value: "boshqarma_boshligi_orinbosari",
    label: "Boshqarma boshlig'i o'rinbosari",
  },
  { value: "yetakchi_muhandis", label: "Yetakchi muhandis" },
  { value: "muhandis", label: "Muhandis" },
  { value: "pto", label: "PTO xodimi" },
  { value: "iqtisod", label: "Iqtisodchi" },
  { value: "buxgalter", label: "Buxgalter" },
  { value: "kadr", label: "Kadrlar xodimi" },
  { value: "uchastka_rahbari", label: "Uchastka rahbari" },
  { value: "xodim", label: "Oddiy xodim" },
];

export const getLavozimLabel = (value?: string | null) =>
  DEFAULT_LAVOZIM_OPTIONS.find((option) => option.value === value)?.label ??
  value ??
  "Noma'lum";

export const getLavozimColor = (value?: string | null) =>
  (
    {
      superadmin: "gold",
      rais: "red",
      rais_orinbosari: "orange",
      boshqarma_boshi: "blue",
      boshqarma_boshligi_orinbosari: "cyan",
      yetakchi_muhandis: "geekblue",
      muhandis: "processing",
      pto: "lime",
      iqtisod: "purple",
      buxgalter: "green",
      kadr: "magenta",
      uchastka_rahbari: "volcano",
      xodim: "default",
    } as Record<string, string>
  )[value ?? ""] ?? "default";
