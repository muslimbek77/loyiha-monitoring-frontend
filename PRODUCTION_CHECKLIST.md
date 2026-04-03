# Production Checklist

## Release oldidan

- [ ] `.env` ichida `VITE_APP_BASE_URL` production backendga qaragan
- [ ] `npm install` dependency holati toza
- [ ] `npm run lint` muvaffaqiyatli o'tgan
- [ ] `npm run build` muvaffaqiyatli o'tgan
- [ ] login/register qo'lda tekshirilgan
- [ ] dashboard va AI xulosa ko'rinishi tekshirilgan
- [ ] hujjatlar create/detail/edit oqimi tekshirilgan
- [ ] bayonnoma create/detail/topshiriq qo'shish oqimi tekshirilgan
- [ ] topshiriqlar list/detail tekshirilgan
- [ ] talablar list/action/create oqimi tekshirilgan
- [ ] obyektlar list/create/detail tekshirilgan
- [ ] jarimalar list/create/edit/delete tekshirilgan
- [ ] chat xonalar list/detail tekshirilgan

## Performance

- [ ] asosiy vendor chunklar build natijasida ajralgan
- [ ] browser cache strategiyasi deployment tomonda yoqilgan
- [ ] gzip yoki brotli server tomonda yoqilgan

## Xavfsizlik

- [ ] backend CORS production domain uchun sozlangan
- [ ] auth token refresh ishlashi tekshirilgan
- [ ] ruxsatga ega bo'lmagan actionlar UI va backendda bloklangan

## Deploydan keyin

- [ ] production domain ochilyapti
- [ ] login ishlayapti
- [ ] API so'rovlar 401/500 bermayapti
- [ ] asosiy sahifalar mobil va desktopda tekshirilgan
