# AntD Audit

Ushbu audit `antd-vendor` katta chunkni kamaytirish uchun keyingi sprintga yo'nalish beradi.

## Hozirgi holat

Build natijasida vendor chunklar ajralgan:

- `antd-vendor`
- `react-vendor`
- `router-vendor`
- `data-vendor`

`antd-vendor` hali ham eng katta chunk bo'lib qolmoqda.

## Eng ko'p qolgan AntD / icon / dayjs usage hotspotlari

Bu ro'yxat byte-aniq profiler emas, lekin qolgan import va komponent zichligi bo'yicha amaliy hotspotlarni ko'rsatadi:

### Yuqori ustuvorlik

- `src/pages/xodimlar/XodimlarSinglePage.tsx`
  - modal/form/upload/dayjs bor
  - detail sahifa og'irroq
- `src/pages/obyektlar/ObyektEditPage.tsx`
  - form-heavy edit oqimi
  - `dayjs` ishlatiladi
- `src/pages/hujjatlar/HujjatSinglePage.tsx`
  - modal/form/select/upload/dayjs detail oqimi
- `src/pages/bayonnomalar/BayonnomaSinglePage.tsx`
  - detail sahifa ichida hali AntD presentational qismlar bor
- `src/pages/topshiriqlar/TopshiriqDetailPage.tsx`
  - card/tag/badge/divider kabi detail UI qatlamlari bor

### O'rta ustuvorlik

- `src/pages/xodimlar/AddUserModal.tsx`
- `src/pages/chatXonalar/ChatXonalarSinglePage.tsx`
- `src/pages/chatXonalar/ChatXonalarPage.tsx`
- `src/pages/boshqarma/BoshqarmaPage.tsx`
- `src/pages/boshqarma/BoshqarmaSinglePage.tsx`

### Past ustuvorlik

- `src/app/App.tsx`
  - `ConfigProvider` va `App` wrapper
- `src/shared/components/layout/RouteErrorFallback.tsx`
- `src/pages/NotFoundPage.tsx`
- `src/pages/UnauthorizedPage.tsx`

## Tavsiya

Keyingi performance sprint uchun ketma-ketlik:

1. `XodimlarSinglePage`
2. `ObyektEditPage`
3. `HujjatSinglePage`
4. `BayonnomaSinglePage`
5. `TopshiriqDetailPage`

## Muhim eslatma

Hozirgi holatda loyiha production uchun yaroqli. Bu audit keyingi optimizatsiya bosqichi uchun yo'l xaritasi sifatida kerak.
