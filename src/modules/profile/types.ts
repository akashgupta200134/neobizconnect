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

export type DealerProfileResponse = {
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
