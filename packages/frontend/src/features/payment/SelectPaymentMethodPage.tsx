import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Banknote, Smartphone, Landmark } from 'lucide-react';

export type PaymentMethod = 'cash' | 'bank' | 'payon' | 'momo';

export const PaymentMethod = {
  CASH: 'cash',
  BANK: 'bank',
  PAYON: 'payon',
  MOMO: 'momo',
} as const;

const paymentMethods = [
  {
    value: PaymentMethod.CASH,
    label: 'Tiền mặt',
    icon: <Banknote className="w-6 h-6 text-green-600" />,
  },
  {
    value: PaymentMethod.BANK,
    label: 'Chuyển khoản ngân hàng',
    icon: <Landmark className="w-6 h-6 text-blue-600" />,
  },
  {
    value: PaymentMethod.MOMO,
    label: 'Ví MoMo',
    icon: <Smartphone className="w-6 h-6 text-pink-500" />,
  },
];

export default function SelectPaymentMethodPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { items, total, orderId, userId } = location.state || {};
  const [selected, setSelected] = useState<PaymentMethod>(PaymentMethod.CASH);

  const handlePay = () => {
    navigate('/payment', {
      state: {
        items,
        total,
        orderId,
        userId,
        paymentMethod: selected,
      },
    });
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50">
      <div className="w-full max-w-[420px] bg-white shadow-lg min-h-screen md:rounded-xl md:my-8 flex flex-col relative">
        {/* Header */}
        <div className="flex items-center gap-2 p-4 border-b sticky top-0 bg-white z-10">
          <button
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
            onClick={() => navigate(-1)}
            aria-label="Quay lại"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="font-bold text-lg flex-1">Thanh toán</div>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 py-6">
          <div className="mb-4 text-gray-700 font-semibold text-base">Phương thức thanh toán</div>
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <button
                key={method.value}
                className={`w-full flex items-center gap-3 p-4 border rounded-lg transition-all focus:outline-none ${
                  selected === method.value
                    ? 'border-yellow-500 bg-yellow-50 shadow'
                    : 'border-gray-200 bg-white'
                }`}
                onClick={() => setSelected(method.value)}
                type="button"
              >
                {method.icon}
                <span className="flex-1 text-left font-medium text-gray-900">{method.label}</span>
                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected === method.value ? 'border-yellow-500' : 'border-gray-300'}`}>
                  {selected === method.value && <span className="w-3 h-3 bg-yellow-500 rounded-full block" />}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 w-full flex justify-center bg-white border-t z-20">
          <div className="w-full max-w-[420px] flex p-4">
            <button
              className="flex-1 bg-yellow-400 text-white font-bold py-3 rounded-full text-lg shadow-lg hover:bg-yellow-500 transition-all"
              onClick={handlePay}
            >
              {`Thanh toán ${total?.toLocaleString() || ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
