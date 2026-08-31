import { OrderDocumentTemplate } from "@/modules/order-history/components/order-document-template";
import { fetchPendingList, fetchPendingStats } from "@/modules/order-history/services/pending-orders.api";


export default function PendingOrdersScreen() {
  return (
    <OrderDocumentTemplate
      pageTitle="Pending Orders List"
      pageSubtitle="Here is a List of Pending Orders"
      documentNumberLabel="Order No."
      statsTitle="Total Sales Orders"
      queryKeyBase="pending-orders"
      fetchList={fetchPendingList}
      fetchStats={fetchPendingStats}
    />
  );
}