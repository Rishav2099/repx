"use client";

import { useFriend } from "@/context/ChallengeContext";
import React, { useEffect, useState, useMemo } from "react";
import PendingChallenges from "./PendingChallenges";
import AcceptedChallenge from "./AcceptedChallenge";
import { useSession } from "next-auth/react";

export interface ChallengeProps {
  _id: string;
  challengeName: string;
  description: string;
  status: "pending" | "accepted" | "rejected" | "completed" | "resigned";
  challenger: { _id: string; name: string; image?: string };
  challengee: { _id: string; name: string; image?: string };
  forDays: number;
  reps: number;
  progress: {
    challenger: string[];
    challengee: string[];
  };
  startDate: string;
  endDate: string;
}

export interface FriendProps {
  _id: string;
  requester: { _id: string; name: string };
  recipient: { _id: string; name: string };
  challenges?: ChallengeProps[];
}

const Challenges = () => {
  const { friends, isLoading } = useFriend();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [acceptedChallenges, setAcceptedChallenges] = useState<ChallengeProps[]>([]);
  const [pendingChallenges, setPendingChallenges] = useState<ChallengeProps[]>([]);

  // Memoize to avoid recomputing on every render
  const { accepted, pending } = useMemo(() => {
    if (!userId || !Array.isArray(friends) || friends.length === 0) {
      return { accepted: [], pending: [] };
    }

    const allChallenges = friends.flatMap((friend) => friend.challenges || []);

    const accepted = allChallenges.filter((ch) => {
      const isAccepted = ch.status === "accepted";
      const isResignedByOpponent =
        ch.status === "resigned" && ch.challenger._id === userId;

      return isAccepted || isResignedByOpponent;
    });

    const pending = allChallenges.filter((ch) => {
      const isPending = ch.status === "pending";
      const isRelevantToUser =
        ch.challenger._id === userId || ch.challengee._id === userId;
      return isPending && isRelevantToUser;
    });

    console.log(allChallenges)

    return { accepted, pending };
  }, [friends, userId]);

  // Sync state only when memoized values change
  useEffect(() => {
    setAcceptedChallenges(accepted);
    setPendingChallenges(pending);
  }, [accepted, pending]);

  // Loading
  if (isLoading) {
    return (
      <div className="flex flex-col items-center py-10">
        <div className="animate-pulse text-gray-400">Loading challenges...</div>
      </div>
    );
  }

  // Empty state
  if (acceptedChallenges.length === 0 && pendingChallenges.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold mb-4">Challenges</h2>
        <p className="text-gray-400">No challenges found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <h2 className="text-2xl font-bold text-center">Challenges</h2>

      {/* Pending Challenges */}
      {pendingChallenges.length > 0 && (
        <section>
          <h3 className="text-lg font-medium text-center mb-3 text-orange-400">
            Pending
          </h3>
          <PendingChallenges pendingChallenges={pendingChallenges} />
        </section>
      )}

      {/* Accepted / Resigned Challenges */}
      {acceptedChallenges.length > 0 && (
        <section>
          <AcceptedChallenge acceptedChallenges={acceptedChallenges} />
        </section>
      )}
    </div>
  );
};

export default Challenges;