import { ConfirmedOrder } from "@/components/storefront-ui";
import { useAppSelector } from "@/lib/store/hooks";

export default function OrderConfirmationPage({ id }: { id?: string }) {
  const order = useAppSelector((state) =>
    id
      ? state.app.orders.find((item) => item.id === id) || null
      : state.app.lastOrder,
  );
  return <ConfirmedOrder order={order} />;
}
