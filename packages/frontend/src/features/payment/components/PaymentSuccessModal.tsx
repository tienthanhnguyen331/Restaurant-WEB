
type Props = {
	onClose: () => void;
};

// Simple success modal to confirm payment completion
export default function PaymentSuccessModal({ onClose }: Props) {
	return (
		<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
			<div className="bg-white rounded-2xl p-6 w-80 shadow-xl text-center">
				<div className="text-green-600 text-4xl mb-3">✓</div>
				<h2 className="text-lg font-bold mb-2">Đơn đặt đã được thanh toán thành công</h2>
				<p className="text-sm text-gray-600 mb-6">
					Cảm ơn bạn! Tiếp tục chọn món tại trang menu.
				</p>
				<button
					className="w-full bg-yellow-500 text-white font-semibold py-2 rounded-xl hover:bg-yellow-600"
					onClick={onClose}
				>
					Quay lại menu
				</button>
			</div>
		</div>
	);
}
