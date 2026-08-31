import { BASE_URL } from "@/constants/config";
import { User } from "@/store/auth.store";
import axios from "axios";

export const validateToken = async (token: string): Promise<User> => {
  const response = await axios.get<User>(`${BASE_URL}/Roles`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
