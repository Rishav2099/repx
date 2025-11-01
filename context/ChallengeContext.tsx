"use client";

import { fetchFriendRequests, fetchFriends } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { createContext, useContext } from "react";

type FriendContextType = {
  friends: any[];
  requests: any[];
  isLoading: boolean;
  refetchFriends: () => void;
  refetchRequests: () => void;
}

const FriendContext = createContext<FriendContextType | null>(null);

export const FriendProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const friendsQuery = useQuery({
    queryKey: ["friends"],
    queryFn: fetchFriends,
    staleTime: 1000 * 60 * 10,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const requestsQuery = useQuery({
    queryKey: ["friendRequests"],
    queryFn: fetchFriendRequests,
    staleTime: 1000 * 60 * 10,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const value = {
    friends: friendsQuery.data,
    requests: requestsQuery.data,
    isLoading: friendsQuery.isLoading || requestsQuery.isLoading,
    refetchFriends: friendsQuery.refetch,
    refetchRequests: requestsQuery.refetch,
  };

  return (
    <FriendContext.Provider value={value}>
      {children}
    </FriendContext.Provider>
  );
};

export const useFriend = () => {
  const ctx = useContext(FriendContext);
  if (!ctx) {
    throw new Error("useFriend must be used inside FriendProvider");
  }
  return ctx;
};
