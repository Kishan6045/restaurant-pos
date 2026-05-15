import { createContext } from "react";

export const AuthContext = createContext(null);

/** Layout shell only; session handling lives on Login + axios interceptors. */
const AuthProvider = ({ children }) => {
  return (
    <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
