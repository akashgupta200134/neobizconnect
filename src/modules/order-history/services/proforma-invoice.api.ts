import { api } from "@/services/axios";
import { OrderDocument, StandardStats } from "../types";

export const fetchProformaList = async (
  groupCompanyName: string,
): Promise<OrderDocument[]> => {
  const res = await api.get(`/${groupCompanyName}/PerformaInvoice/List`);
  return res.data;
};

export const fetchProformaStats = async (
  groupCompanyName: string,
): Promise<StandardStats> => {
  const res = await api.get(`/${groupCompanyName}/PerformaInvoice/Count/Data`);
  return {
    count: res.data.total_performainvoice || 0,
    amount: parseFloat(res.data.total_performainvoice_amount || "0"),
  };
};
