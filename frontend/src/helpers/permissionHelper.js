// helpers/permissionHelper.js
export const togglePermission = ({
  prevData,
  role,
  perm,
  modules
}) => {
  let list = prevData[role] || [];

  const [module, action] = perm.split(".");
  const moduleConfig = modules.find((m) => m.key === module);
  if (!moduleConfig?.actions) {
    return { ...prevData, [role]: list };
  }

  const baseAction = moduleConfig.actions.includes("read")
    ? "read"
    : "view";

  if (action !== baseAction && !list.includes(`${module}.${baseAction}`)) {
    list = [...list, `${module}.${baseAction}`];
  }

  if (list.includes(perm)) {
    list = list.filter(p => p !== perm);

    if (perm === `${module}.${baseAction}`) {
      list = list.filter(p => !p.startsWith(`${module}.`));
    }
  } else {
    list = [...list, perm];
  }

  return {
    ...prevData,
    [role]: list
  };
};
