import { useMemo, useState } from "react";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("shopspear_token"));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("shopspear_user");
    return raw ? JSON.parse(raw) : null;
  });

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login: ({ token: nextToken, user: nextUser }) => {
        localStorage.setItem("shopspear_token", nextToken);
        localStorage.setItem("shopspear_user", JSON.stringify(nextUser));
        setToken(nextToken);
        setUser(nextUser);
      },
      logout: () => {
        localStorage.removeItem("shopspear_token");
        localStorage.removeItem("shopspear_user");
        setToken(null);
        setUser(null);
      },
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
