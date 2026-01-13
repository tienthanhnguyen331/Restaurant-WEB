import { useParams } from 'react-router-dom';

export const OrderDetail = () => {
  const { id } = useParams();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Order Detail</h1>
      <p>Order ID: {id}</p>
      {/* TODO: Implement order detail view */}
    </div>
  );
};
