import { useState, useEffect } from "react";
import { useCurrentUser, useUpdateUserRole } from "../hooks/useSessions";
import { useUser } from "@clerk/clerk-react";
import { RoleContext } from "./roleStore";

export function RoleProvider({ children }) {
  const { isSignedIn, isLoaded } = useUser();
  const { data: userData, refetch } = useCurrentUser(!!isSignedIn);
  const updateRoleMutation = useUpdateUserRole();

  const [role, setRoleState] = useState(() => {
    return localStorage.getItem("talent_iq_role") || "candidate";
  });

  const [showRoleModal, setShowRoleModal] = useState(false);

  // Sync with backend user role once loaded
  useEffect(() => {
    if (userData?.user?.role) {
      setRoleState(userData.user.role);
      localStorage.setItem("talent_iq_role", userData.user.role);
    } else if (isSignedIn && isLoaded && !localStorage.getItem("talent_iq_role_chosen")) {
      // Prompt first-time users to choose role (like HackerRank)
      setShowRoleModal(true);
    }
  }, [userData, isSignedIn, isLoaded]);

  const selectRole = (newRole) => {
    setRoleState(newRole);
    localStorage.setItem("talent_iq_role", newRole);
    localStorage.setItem("talent_iq_role_chosen", "true");
    setShowRoleModal(false);

    if (isSignedIn) {
      updateRoleMutation.mutate(newRole, {
        onSuccess: () => refetch(),
      });
    }
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        isInterviewer: role === "interviewer",
        isCandidate: role === "candidate",
        selectRole,
        showRoleModal,
        setShowRoleModal,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}
