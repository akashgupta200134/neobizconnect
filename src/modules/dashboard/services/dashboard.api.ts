import { api } from "@/services/axios";
import { DashboardPayload, DashboardResponse } from "../types";

export const fetchDashboardData = async (
  groupCompanyName: string,
  payload: DashboardPayload,
): Promise<DashboardResponse> => {
  const res = await api.post(`/${groupCompanyName}/Dashboard`, payload);
  return res.data;
};
