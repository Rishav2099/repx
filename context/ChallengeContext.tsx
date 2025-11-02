"use client";

import { fetchFriendRequests, fetchFriends } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { createContext, useContext } from "react";

// ✅ Challenge type
export interface ChallengeProps {
  _id: string;
  challengeName: string;
  description: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  challenger: { _id: string; name: string };
  challengee: { _id: string; name: string };
  forDays: number;
  reps: number;
  progress: {
    challenger: string[];
    challengee: string[];
  };
  startDate: string;
  endDate: string;
}

// ✅ Friend type
export interface FriendProps {
  _id: string;
  requester: { _id: string; name: string };
  recipient: { _id: string; name: string };
  status: "pending" | "accepted" | "rejected" | 'resigned';
  challenges?: ChallengeProps[];
  createdAt?: string;
  updatedAt?: string;
}

// ✅ Context type
type FriendContextType = {
  friends: FriendProps[];
  requests: FriendProps[];
  isLoading: boolean;
  refetchFriends: () => void;
  refetchRequests: () => void;
};

const FriendContext = createContext<FriendContextType | null>(null);

export const FriendProvider = ({ children }: { children: React.ReactNode }) => {
  const friendsQuery = useQuery<{friends: FriendProps[]}>({
    queryKey: ["friends"],
    queryFn: fetchFriends,
    staleTime: 1000 * 60 * 10,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const requestsQuery = useQuery<FriendProps[]>({
    queryKey: ["friendRequests"],
    queryFn: fetchFriendRequests,
    staleTime: 1000 * 60 * 10,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const value: FriendContextType = {
    friends: friendsQuery.data?.friends ?? [],
    requests: requestsQuery.data ?? [],
    isLoading: friendsQuery.isLoading || requestsQuery.isLoading,
    refetchFriends: friendsQuery.refetch,
    refetchRequests: requestsQuery.refetch,
  };

  return <FriendContext.Provider value={value}>{children}</FriendContext.Provider>;
};

export const useFriend = () => {
  const ctx = useContext(FriendContext);
  if (!ctx) {
    throw new Error("useFriend must be used inside FriendProvider");
  }
  return ctx;
};
