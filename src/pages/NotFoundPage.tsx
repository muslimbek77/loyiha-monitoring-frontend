import { Link } from "react-router-dom";
import { Button, Result } from "antd";

const NotFoundPage = () => {
  return (
    <div className="app-shell flex min-h-screen items-center justify-center p-6">
      <div className="page-surface w-full max-w-2xl p-6 sm:p-10">
        <Result
          status="404"
          title="Sahifa topilmadi"
          subTitle="Manzil noto'g'ri bo'lishi mumkin yoki sahifa ko'chirilgan."
          extra={
            <Button type="primary">
              <Link to="/">Bosh sahifaga qaytish</Link>
            </Button>
          }
        />
      </div>
    </div>
  );
};

export default NotFoundPage;
