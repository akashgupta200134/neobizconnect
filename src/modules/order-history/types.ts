export type SalesOrderItem = {
  ItemCode: string;
  Warehouse: string;
  HSN: string;
  Discount: number;
  TaxCode: string;
  Price: number;
  Quantity: number;
  ItemDescription: string;
  LineNo: number;
};

export type SalesOrder = {
  id: number;
  salesorderno: number;
  customer_name: string;
  customer_code: string;
  contact_person: string;
  customer_ref_no: string;
  branch: string;
  doc_status: string;
  posting_date: string;
  delivery_date: string;
  document_date: string;
  sales_manager: string;
  remarks: string;
  payment_terms: string;
  ship_to: string;
  ship_to_address: string;
  bill_to: string;
  bill_to_address: string;
  gstin: string;
  pan_no: string;
  doc_total: string;
  portal_status: string;
  create_dt: string;
  update_dt: string;
  items: SalesOrderItem[];
};

export type SalesOrderStats = {
  total_salesorder: number;
  total_salesorder_amount: string;
};

export type OrderStatusTab = "Pending" | "Approved" | "Dispatched" | "Rejected";

export type OrderDocumentItem = {
  ItemCode: string;
  Warehouse: string;
  HSN: string;
  Discount: number;
  TaxCode: string;
  Price: number;
  Quantity: number;
  ItemDescription: string;
  LineNo: number;
};

export type OrderDocument = {
  id: number;
  salesorderno: number;
  customer_name: string;
  customer_code: string;
  contact_person: string;
  customer_ref_no: string;
  branch: string;
  doc_status: string;
  posting_date: string;
  delivery_date: string;
  document_date: string;
  sales_manager: string;
  remarks: string;
  payment_terms: string;
  ship_to: string;
  ship_to_address: string;
  bill_to: string;
  bill_to_address: string;
  gstin: string;
  pan_no: string;
  doc_total: string;
  portal_status: string;
  create_dt: string;
  update_dt: string;
  items: OrderDocumentItem[];
};

export type StandardStats = {
  count: number;
  amount: number;
};

export type ArInvoiceItem = {
  ItemNo: string;
  ItemDescription: string;
  Warehouse: string;
  HSN: string;
  Quantity: string;
  UnitPrice: string;
  Discount: string;
  TaxCode: string;
  TaxAmount: string;
  LineTotal: string;
  LineNo: string;
};

export type ArInvoiceDocument = {
  id: number;
  customer_name: string;
  customer_code: string;
  contact_person: string;
  branch: string;
  invoice_number: string;
  invoice_status: string;
  posting_date: string;
  due_date: string;
  document_date: string;
  sales_manager: string;
  remarks: string;
  payment_terms: string;
  ship_to_address: string;
  bill_to_address: string;
  gstin: string;
  eway_bill_no: string;
  irn_no: string;
  ack_no: string;
  ack_date: string;
  freight: string;
  round_off: string;
  doc_total: string;
  items_quantity: number;
  invoice_doc_entry: string;
  lrno: string;
  lr_date: string;
  transport_name: string;
  items: ArInvoiceItem[];
};

export type PaginatedInvoiceResponse = {
  content: ArInvoiceDocument[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
  isLast: boolean;
  size: number;
};

export type InvoiceStats = {
  total_invoice: number;
  total_invoice_amount: string;
};

export type ArCreditMemoItem = {
  HSN: string;
  ItemNo: string;
  LineNo: string;
  TaxCode: string;
  Discount: string;
  Quantity: string;
  LineTotal: string;
  TaxAmount: string;
  UnitPrice: string;
  Warehouse: string;
  ItemDescription: string;
};

export type ArCreditMemoDocument = {
  id: number;
  customer_name: string;
  customer_code: string;
  contact_person: string;
  customer_ref_no: string;
  branch: string;
  arcreditmemono: string;
  arcreditmemodocentry: string;
  posting_date: string;
  due_date: string;
  document_date: string;
  sales_manager: string;
  remarks: string;
  payment_terms: string;
  ship_to: string;
  ship_to_address: string;
  bill_to: string;
  bill_to_address: string;
  gstin: string;
  pan_no: string;
  eway_bill_no: string;
  irn_no: string;
  ack_no: string;
  ack_date: string;
  freight: string;
  round_off: string;
  doc_total: string;
  items_quantity: number;
  month_name: string;
  financial_year: string;
  create_dt: string;
  update_dt: string;
  items: ArCreditMemoItem[];
  status: string;
};

export type ArCreditMemoStats = {
  total_arcreditmemo: number;
  total_arcreditmemo_amount: string;
};
