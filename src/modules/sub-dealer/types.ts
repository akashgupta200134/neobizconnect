export type SubDealer = {
  id: number;
  card_code: string;
  shopName: string;
  businessType: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstNo: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  instagram: string;
  brandsCurrentlySold: string;
  potentialSalesPerMonth: string;
  subDealerStatus: string;
  remarks: string;
  registeredBy: string;
  registrationDateTime: string;
};

export type SubDealerPayload = Omit<SubDealer, "id" | "card_code"> & {
  id?: number;
  card_code?: string;
};
