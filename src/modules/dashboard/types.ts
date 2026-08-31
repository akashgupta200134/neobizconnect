export type TargetVsAchievement = {
  year: string;
  month: string;
  achieved_quantity: number;
  target_quantity: number;
};

export type TopSellingDesign = {
  design: string;
  total_quantity: number;
};

export type TopSellingSku = {
  item_description: string;
  total_quantity: number;
};

export type SalesMix = {
  wheel_size: string;
  total_quantity: number;
  sales_mix_percentage: number;
};

export type DashboardPayload = {
  financial_year: string;
  month: string;
};

export type DashboardResponse = {
  total_pending_quantity: number;
  total_pi_oip_quantity: number;
  total_invoice_quantity: number;
  total_outstanding: number;
  total_sales: number;
  target_sales: number;
  achieved_sales: number;
  credit_limit: number;
  target_vs_achievement: TargetVsAchievement[];
  top_selling_design: TopSellingDesign[];
  top_selling_sku: TopSellingSku[];
  sales_mix_by_wheel_size: SalesMix[];
};
