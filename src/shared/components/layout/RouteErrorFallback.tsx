import { Button, Result } from "antd";
import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";

const RouteErrorFallback = () => {
  const error = useRouteError();

  const title = isRouteErrorResponse(error)
    ? `${error.status} - ${error.statusText}`
    : "Kutilmagan xatolik";
  const subtitle = isRouteErrorResponse(error)
    ? "Sahifa vaqtincha ochilmadi. Iltimos, qayta urinib ko'ring."
    : "Ilova ichida xatolik yuz berdi. Asosiy sahifaga qaytib davom etishingiz mumkin.";

  return (
    <div className="app-shell flex min-h-screen items-center justify-center p-6">
      <div className="page-surface w-full max-w-2xl p-6 sm:p-10">
        <Result
          status="error"
          title={title}
          subTitle={subtitle}
          extra={[
            <Button key="home" type="primary">
              <Link to="/">Bosh sahifaga qaytish</Link>
            </Button>,
            <Button key="reload" onClick={() => window.location.reload()}>
              Qayta yuklash
            </Button>,
          ]}
        />
      </div>
    </div>
  );
};

export default RouteErrorFallback;
