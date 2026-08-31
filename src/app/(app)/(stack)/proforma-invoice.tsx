import { OrderDocumentTemplate } from "@/modules/order-history/components/order-document-template";
import { fetchProformaList, fetchProformaStats } from "@/modules/order-history/services/proforma-invoice.api";

export default function ProformaScreen() {
  return (
    <OrderDocumentTemplate
      pageTitle="Proforma Invoice List"
      pageSubtitle="Here is a List of Proforma Invoice"
      documentNumberLabel="Proforma No."
      statsTitle="Total Proforma Invoices"
      queryKeyBase="proforma"
      fetchList={fetchProformaList}
      fetchStats={fetchProformaStats}
    />
  );
}