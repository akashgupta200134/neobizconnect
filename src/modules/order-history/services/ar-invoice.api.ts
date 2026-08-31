import { api } from "@/services/axios";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { InvoiceStats, PaginatedInvoiceResponse } from "../types";

export const fetchArInvoices = async (
  groupCompanyName: string,
  page: number = 0,
  size: number = 10,
): Promise<PaginatedInvoiceResponse> => {
  const res = await api.get(`/${groupCompanyName}/Invoice/List/Pagenation`, {
    params: { page, size },
  });
  return res.data;
};

export const fetchArInvoiceStats = async (
  groupCompanyName: string,
): Promise<InvoiceStats> => {
  const res = await api.get(`/${groupCompanyName}/Invoice/Count/Data`);
  return res.data;
};

export const downloadAndOpenInvoicePdf = async (
  groupCompanyName: string,
  invoiceDocEntry: string,
) => {
  // 1. Fetch the raw binary data
  const response = await api.post(
    `/${groupCompanyName}/SAP/InvoicePDF`,
    { DocEntry: invoiceDocEntry },
    { responseType: "arraybuffer" },
  );

  // 2. Create the file reference in the cache directory
  const file = new File(Paths.cache, `Invoice_${invoiceDocEntry}.pdf`);

  // 3. Prevent the "already exists" crash by deleting the old cache file
  if (file.exists) {
    file.delete();
  }

  // 4. Create the empty file and write the raw binary bytes directly
  file.create();
  file.write(new Uint8Array(response.data));

  // 5. Hand the file off to the operating system
  const isAvailable = await Sharing.isAvailableAsync();
  if (isAvailable) {
    await Sharing.shareAsync(file.uri, {
      mimeType: "application/pdf",
      dialogTitle: `View Invoice ${invoiceDocEntry}`,
      UTI: "com.adobe.pdf", // Helps the OS prioritize PDF viewer apps in the menu
    });
  } else {
    throw new Error("Sharing is not available on this device");
  }
};
