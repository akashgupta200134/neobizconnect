import { BrandType, useAuthStore } from "@/store/auth.store";
import { useQuery } from "@tanstack/react-query";
import { fetchDealerProducts } from "../services/products.api";
import { ProductQueryParams, StockFilterType } from "../types";

interface UseDealerProductsProps {
  stockType: StockFilterType;
  wheelSize?: string;
  brand: BrandType;
}

export const useDealerProducts = ({
  stockType,
  wheelSize,
  brand,
}: UseDealerProductsProps) => {
  const user = useAuthStore((state) => state.user);
  const groupCompanyName = user?.group_company_name.toUpperCase() || "";
  const brandName = brand?.toUpperCase();

  const queryParams: ProductQueryParams = {
    groupCompanyName,
    brand: brandName,
    stockType,
    wheelSize,
  };

  return useQuery({
    queryKey: ["dealer-products", queryParams],
    queryFn: () => fetchDealerProducts(queryParams),
    enabled: Boolean(brand),
    staleTime: 1000 * 60 * 2,
  });
};
