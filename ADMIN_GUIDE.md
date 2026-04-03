# Admin Guide

Ushbu hujjat admin, texnik mas'ul va release qiluvchi jamoa a'zolari uchun.

## 1. Tizimni ishga tushirish

```bash
npm install
npm run dev
```

`.env` ichida backend manzili to'g'ri berilgan bo'lishi kerak:

```env
VITE_APP_BASE_URL=http://localhost:8000/api/v1
```

## 2. Release oldi tekshiruv

Har release oldidan:

```bash
npm run lint
npm run build
```

Tekshirilishi kerak:

- login va register ishlashi
- dashboard ochilishi
- hujjat create/detail/edit oqimi
- hujjat ko'rinish tanlovi va queryset filteri
- bayonnoma create/detail/topshiriq qo'shish oqimi
- talab create/action oqimi
- obyekt, jarima va topshiriq ro'yxatlari ochilishi

## 3. API integratsiya qoidasi

Yangi endpoint qo'shilsa:

1. `src/services/api/endpoints.ts` ga yozing
2. `src/services/api/axios.ts` dagi `api` instance orqali ishlating
3. string URL yozmang
4. role-based action bo'lsa permission tekshiring

## 4. Rollar bo'yicha nazorat

### Rahbariyat

- dashboard KPI va AI xulosani ko'radi
- boshqarma monitoringini kuzatadi
- AI hisobot generation access bo'lishi mumkin

### Boshqarma boshlig'i / boshqarma boshlig'i o'rinbosari

- hujjat tasdiqlash/rad etish
- o'z boshqarmasi xodimlariga topshiriq yaratish
- talab yaratish, qabul qilish va javob berish

### Yetakchi muhandis / muhandis

- topshiriqlarni ko'rish
- izoh va biriktirma yuborish
- yetakchi muhandis talab bilan ishlaydi, muhandis esa talab actionlarisiz ishlaydi

## 5. Production sozlamalari

- `vite.config.js` ichida port `5175`
- build vendor chunklarga bo'lingan:
  - `react-vendor`
  - `router-vendor`
  - `antd-vendor`
  - `data-vendor`

Bu browser cache uchun foydali.

## 6. Muammo bo'lsa qayerni tekshirish kerak

- auth/token muammolari: `src/services/api/axios.ts`
- noto'g'ri route: `src/app/router.tsx`
- endpoint mosligi: `src/services/api/endpoints.ts`
- layout/sidebar: `src/shared/components/layout`
- global theme: `src/app/App.tsx`, `src/styles/index.css`

## 7. Qolgan texnik hotspotlar

`antd-vendor` hali ham eng katta vendor chunk. Eng ko'p qolgan form/detail qismi quyidagi joylarda:

- `src/pages/xodimlar/XodimlarSinglePage.tsx`
- `src/pages/obyektlar/ObyektEditPage.tsx`
- `src/pages/hujjatlar/HujjatSinglePage.tsx`
- `src/pages/bayonnomalar/BayonnomaSinglePage.tsx`
- `src/pages/topshiriqlar/TopshiriqDetailPage.tsx`

Bu sahifalar productionga to'sqinlik qilmaydi, lekin keyingi performance sprint uchun eng to'g'ri nomzodlar shu.
