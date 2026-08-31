import { useAuthStore } from "@/store/auth.store";

export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

  const isHydrating = useAuthStore((state) => state.isHydrating);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const hydrate = useAuthStore((state) => state.hydrate);

  return {
    user,
    accessToken,
    clearSession,
    hydrate,
    isAuthenticated,
    isHydrating,
    setSession,

    hasAccess: (moduleName: string) =>
      user?.modules.some((module) => module.moduleName === moduleName) ?? false,
  };
};
