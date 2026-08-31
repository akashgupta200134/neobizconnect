import { api } from "@/services/axios";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { CustomerLedgerResponse } from "../types";

export const fetchCustomerLedger = async (
  groupCompanyName: string,
  fromDate?: string | null,
  toDate?: string | null,
): Promise<CustomerLedgerResponse> => {
  const params: Record<string, string> = {};
  if (fromDate) params.fromDate = fromDate;
  if (toDate) params.toDate = toDate;

  const res = await api.get(
    `/${groupCompanyName}/SAP/GetAccountBalance/Dealer`,
    { params },
  );
  return res.data;
};

export const downloadAndOpenLedgerPdf = async (
  groupCompanyName: string,
  docEntry: string,
) => {
  const response = await api.post(
    `/${groupCompanyName}/SAP/InvoicePDF`,
    { DocEntry: docEntry },
    { responseType: "arraybuffer" },
  );

  const file = new File(Paths.cache, `LedgerInvoice_${docEntry}.pdf`);

  if (file.exists) {
    file.delete();
  }

  file.create();
  file.write(new Uint8Array(response.data));

  const isAvailable = await Sharing.isAvailableAsync();
  if (isAvailable) {
    await Sharing.shareAsync(file.uri, {
      mimeType: "application/pdf",
      dialogTitle: `Invoice ${docEntry}`,
      UTI: "com.adobe.pdf", // iOS specific tag for PDF routing
    });
  } else {
    throw new Error("Sharing is not available on this device");
  }
};
