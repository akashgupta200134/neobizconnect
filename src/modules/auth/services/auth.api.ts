import { api } from "@/services/axios";
import { User } from "@/store/auth.store";
import { LoginForm } from "../schema";

export const login = async (data: LoginForm): Promise<User> => {
  const res = await api.post<User>("/Login/Check", data);
  return res.data;
};
