import { api } from "@/services/axios";
import { DashboardPayload, DashboardResponse } from "../types";

// Dummy data fallbacks for when the backend returns empty arrays
const DUMMY_TARGET_ACHIEVEMENT = [
  { month: "Apr", quantity: 921, target_quantity: 1332 },
  { month: "May", quantity: 215, target_quantity: 282 },
  { month: "Jun", quantity: 555, target_quantity: 919 },
  { month: "Jul", quantity: 418, target_quantity: 1195 },
  { month: "Aug", quantity: 404, target_quantity: 1195 },
  { month: "Sep", quantity: 0, target_quantity: 1361 },
  { month: "Oct", quantity: 0, target_quantity: 1361 },
  { month: "Nov", quantity: 0, target_quantity: 1361 },
];

const DUMMY_TOP_DESIGN = [
  { design: "Techno", quantity: 878 },
  { design: "Radar", quantity: 493 },
  { design: "Slice", quantity: 378 },
  { design: "Surya", quantity: 142 },
  { design: "Exotic", quantity: 88 },
];

const DUMMY_TOP_SKU = [
  { item_description: "16X7-Techno-4X100-BM", quantity: 157 },
  { item_description: "16X7-Radar-4X100-BM", quantity: 138 },
  { item_description: "17X8-Techno-4X100-BM", quantity: 100 },
  { item_description: "15X7-Techno-4X100-BMUC", quantity: 82 },
  { item_description: "14X5.5-Techno-4X100-BMUC", quantity: 85 },
];

const DUMMY_SALES_MIX = [
  { wheel_size: "18 Inch", total_quantity: 844, sales_mix_percentage: 38.27 },
  { wheel_size: "15 Inch", total_quantity: 564, sales_mix_percentage: 23.37 },
  { wheel_size: "17 Inch", total_quantity: 510, sales_mix_percentage: 18.1 },
  { wheel_size: "14 Inch", total_quantity: 184, sales_mix_percentage: 8.26 },
  { wheel_size: "13 Inch", total_quantity: 163, sales_mix_percentage: 6.03 },
];

export const fetchDashboardData = async (
  groupCompanyName: string,
  payload: DashboardPayload,
): Promise<DashboardResponse> => {
  const res = await api.post(`/${groupCompanyName}/Dashboard`, payload);
  const data: DashboardResponse = res.data;

  // Intercept empty arrays and inject dummy data
  return {
    ...data,
    target_vs_achievement: data.target_vs_achievement?.length
      ? data.target_vs_achievement
      : DUMMY_TARGET_ACHIEVEMENT,
    top_selling_design: data.top_selling_design?.length
      ? data.top_selling_design
      : DUMMY_TOP_DESIGN,
    top_selling_sku: data.top_selling_sku?.length
      ? data.top_selling_sku
      : DUMMY_TOP_SKU,
    sales_mix_by_wheel_size: data.sales_mix_by_wheel_size?.length
      ? data.sales_mix_by_wheel_size
      : DUMMY_SALES_MIX,
  };
};
