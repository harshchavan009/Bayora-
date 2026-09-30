"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole } from "@/lib/types";

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
}

const RoleContext = createContext<RoleContextType>({
  role: "admin",
  setRole: () => {},
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>("admin");

  useEffect(() => {
    const saved = localStorage.getItem("bayora_user_role") as UserRole;
    if (saved && ["admin", "auditor", "red", "blue"].includes(saved)) {
      setRole(saved);
    }
  }, []);

  const handleSetRole = (newRole: UserRole) => {
    setRole(newRole);
    localStorage.setItem("bayora_user_role", newRole);
  };

  return (
    <RoleContext.Provider value={{ role, setRole: handleSetRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
