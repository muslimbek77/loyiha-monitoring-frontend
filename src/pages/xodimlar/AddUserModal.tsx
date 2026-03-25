import { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Button, Row, Col, message } from "antd";
import {
  UserAddOutlined,
  LockOutlined,
  PhoneOutlined,
  SendOutlined,
  IdcardOutlined,
  BankOutlined,
  MailOutlined,
} from "@ant-design/icons";
import api from "@/services/api/axios";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import { LAVOZIM_OPTIONS } from "@/shared/components/const/constValues";

const { Option } = Select;

interface Boshqarma {
  id: number;
  nomi: string;
  qisqa_nomi: string;
}

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddUserModal = ({ open, onClose, onSuccess }: AddUserModalProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [boshqarmalar, setBoshqarmalar] = useState<Boshqarma[]>([]);
  const [boshqarmaLoading, setBoshqarmaLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchBoshqarmalar();
    }
  }, [open]);

  const fetchBoshqarmalar = async () => {
    try {
      setBoshqarmaLoading(true);
      const res = await api.get(API_ENDPOINTS.BOSHQARMA.LIST);
      setBoshqarmalar(res.data.results);
    } catch (err) {
      console.error(err);
      message.error("Boshqarmalar yuklanmadi");
    } finally {
      setBoshqarmaLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await api.post(API_ENDPOINTS.USERS.CREATE, values);
      message.success("Xodim muvaffaqiyatli qo'shildi!");
      form.resetFields();
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err?.response?.data) {
        const errors = err.response.data;
        // Map backend field errors back into the form
        const fieldErrors = Object.entries(errors).map(([name, msgs]) => ({
          name,
          errors: Array.isArray(msgs) ? msgs : [msgs as string],
        }));
        form.setFields(fieldErrors);
      } else if (!err?.errorFields) {
        // Not a form validation error
        message.error("Xatolik yuz berdi. Qayta urinib ko'ring.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 py-1">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50">
            <UserAddOutlined className="text-blue-500 text-base" />
          </div>
          <span className="text-base font-semibold text-gray-800">
            Yangi xodim qo'shish
          </span>
        </div>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={620}
      destroyOnClose
      styles={{
        header: { borderBottom: "1px solid #f0f0f0", paddingBottom: 12 },
        body: { paddingTop: 20 },
      }}
    >
      <Form form={form} layout="vertical" requiredMark={false}>
        {/* FIO */}
        <Form.Item
          name="fio"
          label={
            <span className="text-sm font-medium text-gray-700">F.I.O</span>
          }
          rules={[{ required: true, message: "F.I.O ni kiriting" }]}
        >
          <Input
            prefix={<IdcardOutlined className="text-gray-400" />}
            placeholder="Familiya Ism Otasining ismi"
            size="large"
          />
        </Form.Item>

        {/* Username + Boshqarma */}
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              name="username"
              label={
                <span className="text-sm font-medium text-gray-700">
                  Foydalanuvchi nomi
                </span>
              }
              rules={[
                { required: true, message: "Username kiriting" },
                { min: 3, message: "Kamida 3 ta belgi" },
              ]}
            >
              <Input
                prefix={<UserAddOutlined className="text-gray-400" />}
                placeholder="username"
                size="large"
                autoComplete="new-password"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="boshqarma"
              label={
                <span className="text-sm font-medium text-gray-700">
                  Boshqarma
                </span>
              }
              rules={[{ required: true, message: "Boshqarmani tanlang" }]}
            >
              <Select
                placeholder="Boshqarmani tanlang"
                size="large"
                loading={boshqarmaLoading}
                suffixIcon={
                  boshqarmaLoading ? undefined : (
                    <BankOutlined className="text-gray-400" />
                  )
                }
                showSearch
                optionFilterProp="label"
                options={boshqarmalar.map((b) => ({
                  value: b.id,
                  label: b.nomi,
                  qisqa_nomi: b.qisqa_nomi,
                }))}
                optionRender={(opt) => (
                  <div className="flex flex-col py-0.5">
                    <span className="text-gray-800 text-sm font-medium">
                      {opt.data.label}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {opt.data.qisqa_nomi}
                    </span>
                  </div>
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Lavozim + Telefon */}
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              name="lavozim"
              label={
                <span className="text-sm font-medium text-gray-700">
                  Lavozim
                </span>
              }
              rules={[{ required: true, message: "Lavozimni tanlang" }]}
            >
              <Select placeholder="Lavozimni tanlang" size="large">
                {LAVOZIM_OPTIONS.map((l) => (
                  <Option key={l.value} value={l.value}>
                    {l.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="telefon"
              label={
                <span className="text-sm font-medium text-gray-700">
                  Telefon
                </span>
              }
              rules={[
                { required: true, message: "Telefon raqamini kiriting" },
                {
                  pattern: /^\+?[0-9]{9,13}$/,
                  message: "To'g'ri telefon raqam kiriting",
                },
              ]}
            >
              <Input
                prefix={<PhoneOutlined className="text-gray-400" />}
                placeholder="+998901234567"
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Telegram ID */}
        <Form.Item
          name="telegram_id"
          label={
            <span className="text-sm font-medium text-gray-700">
              Telegram ID
            </span>
          }
          rules={[{ required: true, message: "Telegram ID kiriting" }]}
        >
          <Input
            prefix={<SendOutlined className="text-gray-400" />}
            placeholder="@username yoki 123456789"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="email"
          label={
            <span className="text-sm font-medium text-gray-700">
              Elektron pochta
            </span>
          }
          rules={[
            { required: true, message: "Email kiriting" },
            { type: "email", message: "To'g'ri email kiriting" },
          ]}
        >
          <Input
            prefix={<MailOutlined className="text-gray-400" />}
            placeholder="email"
            size="large"
          />
        </Form.Item>

        {/* Password + Confirm */}
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              name="password"
              label={
                <span className="text-sm font-medium text-gray-700">Parol</span>
              }
              rules={[
                { required: true, message: "Parolni kiriting" },
                { min: 8, message: "Kamida 8 ta belgi" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="••••••••"
                size="large"
                autoComplete="new-password"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="password_confirm"
              label={
                <span className="text-sm font-medium text-gray-700">
                  Parolni tasdiqlash
                </span>
              }
              dependencies={["password"]}
              rules={[
                { required: true, message: "Parolni tasdiqlang" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Parollar mos emas!"));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="••••••••"
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 mt-2 border-t border-gray-100">
          <Button size="large" onClick={handleCancel} disabled={loading}>
            Bekor qilish
          </Button>
          <Button
            type="primary"
            size="large"
            loading={loading}
            onClick={handleSubmit}
            icon={<UserAddOutlined />}
          >
            Qo'shish
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddUserModal;
