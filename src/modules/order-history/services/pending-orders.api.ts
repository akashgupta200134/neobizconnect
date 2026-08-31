import { api } from "@/services/axios";
import {
  OrderDocument,
  StandardStats
} from "../types";

export const fetchPendingList = async (
  groupCompanyName: string,
): Promise<OrderDocument[]> => {
  const res = await api.get(`/${groupCompanyName}/SalesOrder/List`);
  return res.data;
};

export const fetchPendingStats = async (
  groupCompanyName: string,
): Promise<StandardStats> => {
  const res = await api.get(`/${groupCompanyName}/SalesOrder/Count/Data`);
  return {
    count: res.data.total_salesorder || 0,
    amount: parseFloat(res.data.total_salesorder_amount || "0"),
  };
};
