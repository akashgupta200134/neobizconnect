import { api } from "@/services/axios";
import { DealerProfileResponse } from "../types";

export const fetchDealerProfile = async (
  groupCompanyName: string,
): Promise<DealerProfileResponse> => {
  const res = await api.get(`/${groupCompanyName}/Dealer/User/profile`);
  return res.data;
};
