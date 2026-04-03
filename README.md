# Monitoring Frontend

Ushbu frontend `Vite + React + Ant Design + Tailwind CSS` asosida qurilgan va backenddagi `api/v1` endpointlari bilan ishlaydi. Loyiha monitoring, hujjat aylanishi, bayonnoma, topshiriq, talab, obyekt va boshqarma jarayonlarini yagona interfeysda boshqarish uchun mo'ljallangan.

## Ishga tushirish

1. `monitoring` papkaga kiring.
2. Agar kerak bo'lsa `npm install` bajaring.
3. `.env` faylda backend manzilini sozlang:

```env
VITE_APP_BASE_URL=http://localhost:8000/api/v1
```

4. Development serverni ishga tushiring:

```bash
npm run dev
```

Frontend default holatda `http://localhost:5175` da ishlaydi.

## Build va tekshiruv

```bash
npm run lint
npm run build
```

- `lint` kod sifati va import/xatolarni tekshiradi
- `build` production bundle holatini ko'rsatadi

## Arxitektura

- `src/services/api/axios.ts`
  Token yuborish, refresh va global xatolarni boshqaradi.
- `src/services/api/endpoints.ts`
  Barcha API route constantlari shu yerda saqlanadi.
- `src/app/router.tsx`
  Route-level lazy loading va error fallback shu yerda.
- `src/shared/components/layout`
  Global layout, sidebar, header, loader va route error fallback.
- `src/styles/index.css`
  Global dizayn tokenlari, shriftlar va Ant Design override'lari.

## API integratsiya qoidasi

Yangi sahifa yoki CRUD yozayotganda to'g'ridan-to'g'ri string URL ishlatmang. Har doim:

1. Endpointni `src/services/api/endpoints.ts` ga qo'shing.
2. So'rovni `src/services/api/axios.ts` dagi `api` instance orqali yuboring.
3. Sahifa ichida yuklanish, bo'sh holat va xatolik UI larini ko'rsating.
4. Role-based action bo'lsa `Can` yoki permission hook orqali tekshiring.

Misol:

```ts
const response = await api.get(API_ENDPOINTS.TALABLAR.LIST);
```

## Foydalanuvchi yo'riqnomasi

### 1. Tizimga kirish

- `/auth/login` sahifada username va parol bilan kiring.
- Token va refresh token avtomatik saqlanadi.
- Session tugasa `axios` refresh oqimi orqali tokenni yangilashga urinadi.

### 2. Ro'yxatdan o'tish

- `/auth/register` sahifa backenddagi haqiqiy boshqarma ro'yxatini yuklaydi.
- `PNFL`, `boshqarma`, `lavozim` va boshqa maydonlar backend validation bilan tekshiriladi.

### 3. Asosiy modullar

- `Dashboard`
  KPI, boshqarma reytingi, AI xulosa va umumiy nazorat ko'rinishi.
- `Boshqarma`
  Boshqarmalar kesimida reyting, holat va detail sahifalar.
- `Obyektlar`
  Qurilish obyektlari, progress, muddat va muammo holati.
- `Hujjatlar`
  Hujjat yuklash, ko'rinish auditoriyasini tanlash, kategoriya asosida filtrlash, tasdiqlash va versiyalar tarixi.
- `Bayonnomalar`
  Yig'ilish bayonnomalari, topshiriqlar va ijro nazorati.
- `Topshiriqlar`
  Bajarilish jarayoni, kechikishlar va ijrochi bo'limlar kesimi.
- `Talablar`
  Boshqarmalararo so'rov yuborish, qabul qilish va bajarish.
- `Chat xonalar`
  Ichki muloqot va xabar almashish.

### 4. Hujjat bilan ishlash

1. `Hujjatlar` bo'limida filterlardan foydalaning.
2. `Yangi Hujjat` orqali obyekt, boshqarma, kategoriya va kimga ko'rinishini tanlang.
3. Detail sahifada:
   - faylni yuklab olish
   - holatini ko'rish
   - versiyalar tarixini tekshirish
   - ruxsat bo'lsa tahrirlash yoki tasdiqlash

### 5. Bayonnoma va topshiriq bilan ishlash

1. `Bayonnomalar` sahifasida qidiruv va tartiblashdan foydalaning.
2. Bayonnoma detail ichida topshiriqlar va izohlar ko'rinadi.
3. `Boshqarma boshlig'i` va `boshqarma_boshligi_orinbosari` o'z boshqarmasi xodimlariga topshiriq qo'sha oladi.
4. `Muhandis` faqat o'ziga yoki o'z boshqarmasiga berilgan topshiriqlarga javob beradi.
5. `Topshiriqlar` bo'limida kechikkan va bajarilgan vazifalar alohida ajraladi.

### 6. Talablar bilan ishlash

1. `Talablar` sahifasida kelgan va yuborilgan talablar ajratilgan.
2. `Muhandis` talab yaratmaydi va talabga javob bermaydi.
3. Boshqarma rahbariyati va yetakchi muhandis uchun ruxsat bo'lsa:
   - qabul qilish
   - rad etish
   - bajarildi deb belgilash
4. Har bir action to'g'ridan-to'g'ri backend action endpointiga ulanadi.

## Admin va rahbar use-case'lari

### Rahbariyat

- dashboardda umumiy KPI va AI xulosani ko'radi
- boshqarma reytinglarini tahlil qiladi
- hujjatlar, talablar va topshiriqlardagi muammoli nuqtalarni kuzatadi
- AI hisobotni yaratish yoki yangilash imkoniga ega bo'lishi mumkin

### Boshqarma boshlig'i / boshqarma boshlig'i o'rinbosari

- o'z boshqarmasiga tegishli hujjatlar va topshiriqlarni nazorat qiladi
- hujjatlarni tasdiqlaydi yoki rad etadi
- o'z boshqarmasi xodimlariga topshiriq yaratadi
- talab yaratadi, qabul qiladi va javob beradi

### Yetakchi muhandis / muhandis

- topshiriqlarni ko'radi
- izoh va biriktirma yuklaydi
- yetakchi muhandis talab bilan ishlaydi, muhandis esa talab yarata olmaydi va javob bermaydi
- hujjat yuklash va chat barcha rollar uchun ochiq

### Admin / texnik foydalanuvchi

- foydalanuvchi va boshqarma konfiguratsiyasini kuzatadi
- endpoint o'zgarishida `API_ENDPOINTS` ni yangilaydi
- `lint` va `build` bilan release oldidan tekshiradi

## Xatolik holatlari

- route xatolari uchun maxsus fallback sahifa bor
- runtime xatolar `ErrorBoundary` orqali ushlanadi
- network yoki permission xatosi bo'lsa sahifalarda xabar/fallback ko'rsatiladi

## Optimallashtirish holati

So'nggi optimizatsiya ishlari:

- route-level lazy loading yoqilgan
- og'ir `Table`-ga bog'liq sahifalarning katta qismi custom/native tablega o'tkazilgan
- ko'p joydagi `DatePicker` native `input type="date"` ga almashtirilgan
- build uchun ehtiyotkor `manualChunks` qo'shilgan:
  - `react-vendor`
  - `router-vendor`
  - `antd-vendor`
  - `data-vendor`

Bu yondashuv katta shared chunkni mantiqan bo'lib, browser caching'ni yaxshilaydi.

## AntD audit xulosasi

Hozir Ant Design asosan quyidagi joylarda qoldirilgan:

- global `ConfigProvider` va `App` wrapper
- modal, form, select, input kabi tez yetkaziladigan form qismlari
- ayrim detail sahifalardagi card/badge/spin komponentlar

Eng og'ir `Table`-ga bog'liq list sahifalarning ko'pchiligi allaqachon yengillashtirilgan. Keyingi bosqich kerak bo'lsa form-heavy sahifalarni ham bosqichma-bosqich custom komponentlarga o'tkazish mumkin.

## Tavsiya etilgan ish jarayoni

1. Endpointni backendda tekshiring.
2. Uni `API_ENDPOINTS` ga qo'shing.
3. Sahifa yoki modalni shared style classlari bilan yozing:
   `page-surface`, `page-header`, `section-card`.
4. Yangi UI yozilganda avval native/light komponentni ko'rib chiqing.
5. `npm run lint` va `npm run build` bilan tekshirib boring.
