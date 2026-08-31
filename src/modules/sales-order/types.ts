export type SapProduct = {
  id: number;
  cardCode: string;
  itemCode: string;
  itemName: string;
  brand: string;
  wheelSize: string;
  offerPrice: number;
  offerLastDate: string | null;
  inStockQty: number;
  totalProdOrderQty: number;
  firstPoDueDate: string | null;
  attachment: string;
  price: number;
  offerItem: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

export type StockFilterType = "inStock" | "outOfStock" | "offerPrice";

export type ProductQueryParams = {
  groupCompanyName: string;
  brand: string;
  stockType: StockFilterType;
  wheelSize?: string;
};

export type ViewMode = "table" | "grid";

export type BillToAddress = {
  bill_to_addressname: string;
  bill_to_buildingfloorroom: string;
  bill_to_address: string;
  bill_to_gstin: string;
};

export type ShipToAddress = {
  ship_to_addressname: string;
  ship_to_buildingfloorroom: string;
  ship_to_address: string;
  ship_to_gstin: string;
};

export type UserProfileResponse = {
  dealer_name: string;
  dealer_code: string;
  contact_person: string;
  phone_no: string;
  phone_no_2: string;
  email: string;
  brand_type: string[];
  bill_to: BillToAddress[];
  ship_to: ShipToAddress[];
};

export type OrderPayload = {
  brand: string;
  PayToCode: string;
  ShipToCode: string;
  DocumentLines: {
    ItemCode: string;
    Quantity: number;
    UnitPrice: number;
  }[];
};
