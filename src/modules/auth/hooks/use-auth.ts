import { useMutation } from "@tanstack/react-query";
import { LoginForm } from "../schema";
import { login } from "../services/auth.api";

export const useLogin = () => {
  return useMutation({
    mutationFn: ({ username, password }: LoginForm) =>
      login({ password, username }),
  });
};
