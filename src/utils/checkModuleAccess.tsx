import { User } from "@/store/auth.store";

export const hasAccessToModule = (
  moduleName: string,
  isSubModule: boolean,
  user: User,
): boolean => {
  if (isSubModule) {
    return user.modules.some((module) =>
      module.subModules?.some(
        (subModule) => subModule.subModuleName === moduleName,
      ),
    );
  }
  return user.modules.some((module) => module.moduleName === moduleName);
};
