const PageLoader = () => {
  return (
    <div className="app-loader">
      <div className="app-loader__ring" />
      <div className="space-y-1 text-center">
        <p className="text-sm font-semibold text-slate-700">Sahifa yuklanmoqda</p>
        <p className="text-xs text-slate-500">
          Ma'lumotlar tayyor bo'lishi uchun biroz kuting
        </p>
      </div>
    </div>
  );
};

export default PageLoader;
