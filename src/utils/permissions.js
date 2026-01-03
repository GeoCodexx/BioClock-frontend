import useAuthStore from "../store/useAuthStore";

export const usePermission = () => {
  const permissions = useAuthStore((s) => s.permissions);

  const can = (permissionCode) => {
    return permissions.includes(permissionCode);
  };

  const canAny = (permissionCodes = []) => {
    return permissionCodes.some((p) => permissions.includes(p));
  };

  const canAll = (permissionCodes = []) => {
    return permissionCodes.every((p) => permissions.includes(p));
  };

  return { can, canAny, canAll };
};
