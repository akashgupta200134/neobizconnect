import { api } from "@/services/axios";
import { SubDealer, SubDealerPayload } from "../types";

export const fetchSubDealers = async (
  groupCompanyName: string,
): Promise<SubDealer[]> => {
  const res = await api.get(`/List/${groupCompanyName}/Sub/Dealer/User`);
  return res.data;
};

export const createSubDealer = async (
  groupCompanyName: string,
  payload: SubDealerPayload,
) => {
  const res = await api.post(
    `/Add/${groupCompanyName}/Sub/Dealer/User`,
    payload,
  );
  return res.data;
};

export const updateSubDealer = async (
  groupCompanyName: string,
  payload: SubDealerPayload,
) => {
  const res = await api.post(
    `/Update/${groupCompanyName}/Sub/Dealer/User`,
    payload,
  );
  return res.data;
};
