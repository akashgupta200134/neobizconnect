import { api } from "@/services/axios";
import {
  OrderPayload,
  ProductQueryParams,
  SapProduct,
  UserProfileResponse,
} from "../types";

export const fetchDealerProducts = async ({
  groupCompanyName,
  brand,
  stockType,
  wheelSize,
}: ProductQueryParams): Promise<SapProduct[]> => {
  const params: Record<string, string | boolean> = {
    brand,
  };

  if (stockType === "inStock") {
    params.inStock = true;
  } else if (stockType === "outOfStock") {
    params.inStock = false;
  } else if (stockType === "offerPrice") {
    params.offerItem = true;
  }

  if (wheelSize && wheelSize !== "all") {
    params.wheelSize = wheelSize;
  }

  const endpoint = `/Neo/sap-items/dealer`;
  const response = await api.get<SapProduct[]>(endpoint, { params });
  return response.data;
};

export const fetchUserProfile = async (
  groupCompanyName: string,
): Promise<UserProfileResponse> => {
  const response = await api.get(`/${groupCompanyName}/Dealer/User/profile`);
  return response.data;
};

export const submitSalesOrder = async (payload: OrderPayload) => {
  const response = await api.post(`/Sap/Add/Sales/Order`, payload);
  return response.data;
};
