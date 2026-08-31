import { api } from "@/services/axios";
import { CreateQueryPayload, DealerQuery, UpdateQueryPayload } from "../types";

export const fetchDealerQueries = async (
  groupCompanyName: string,
): Promise<DealerQuery[]> => {
  const res = await api.get(
    `/${groupCompanyName}/Crm/Portal/Dealer/User/leadlist`,
  );

  // Replicating the web code's specific extraction logic
  return res.data.flatMap((item: any) =>
    (item.formJson || []).map((form: any) => ({
      id: item.id,
      ...form,
    })),
  );
};

export const createDealerQuery = async (
  groupCompanyName: string,
  payload: CreateQueryPayload,
) => {
  const res = await api.post(
    `/${groupCompanyName}/Crm/Portal/Dealer/User/leaddetails`,
    payload,
  );
  return res.data;
};

export const updateDealerQuery = async (
  groupCompanyName: string,
  payload: UpdateQueryPayload,
) => {
  const res = await api.post(
    `/${groupCompanyName}/Crm/Portal/Update/Dealer/User/leaddetails`,
    payload,
  );
  return res.data;
};
