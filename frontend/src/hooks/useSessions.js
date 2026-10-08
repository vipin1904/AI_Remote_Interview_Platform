import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { sessionApi } from "../api/sessions";

export const useCreateSession = () => {
  const result = useMutation({
    mutationKey: ["createSession"],
    mutationFn: sessionApi.createSession,
    onSuccess: () => toast.success("Session created successfully!"),
    onError: (error) => toast.error(error.response?.data?.message || "Failed to create room"),
  });

  return result;
};

export const useActiveSessions = () => {
  const result = useQuery({
    queryKey: ["activeSessions"],
    queryFn: sessionApi.getActiveSessions,
  });

  return result;
};

export const useMyRecentSessions = () => {
  const result = useQuery({
    queryKey: ["myRecentSessions"],
    queryFn: sessionApi.getMyRecentSessions,
  });

  return result;
};

export const useSessionById = (id) => {
  const result = useQuery({
    queryKey: ["session", id],
    queryFn: () => sessionApi.getSessionById(id),
    enabled: !!id,
    refetchInterval: 5000, // refetch every 5 seconds to detect session status changes
  });

  return result;
};

export const useJoinSession = () => {
  const result = useMutation({
    mutationKey: ["joinSession"],
    mutationFn: sessionApi.joinSession,
    onSuccess: () => toast.success("Joined session successfully!"),
    onError: (error) => toast.error(error.response?.data?.message || "Failed to join session"),
  });

  return result;
};

export const useEndSession = () => {
  const result = useMutation({
    mutationKey: ["endSession"],
    mutationFn: sessionApi.endSession,
    onSuccess: () => toast.success("Session ended successfully!"),
    onError: (error) => toast.error(error.response?.data?.message || "Failed to end session"),
  });

  return result;
};

export const useCurrentUser = (enabled = true) => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: sessionApi.getCurrentUser,
    enabled,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
};

export const useUpdateUserRole = () => {
  return useMutation({
    mutationKey: ["updateUserRole"],
    mutationFn: sessionApi.updateUserRole,
    onSuccess: (data) => {
      toast.success(`Role switched to ${data.user.role === "interviewer" ? "Interviewer 👔" : "Candidate 🎓"}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update role");
    },
  });
};

export const useSaveEvaluation = () => {
  return useMutation({
    mutationKey: ["saveEvaluation"],
    mutationFn: ({ id, data }) => sessionApi.saveEvaluation(id, data),
    onSuccess: () => toast.success("Evaluation saved!"),
    onError: (error) => toast.error(error.response?.data?.message || "Failed to save evaluation"),
  });
};

export const useRevealHint = () => {
  return useMutation({
    mutationKey: ["revealHint"],
    mutationFn: ({ id, hintIndex }) => sessionApi.revealHint(id, hintIndex),
    onSuccess: () => toast.success("Hint shared with candidate!"),
    onError: (error) => toast.error(error.response?.data?.message || "Failed to reveal hint"),
  });
};

