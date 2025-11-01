"use client";

import { useFriend } from "@/context/ChallengeContext";
import React, { useEffect, useState } from "react";
import PendingChallenges from "./PendingChallenges";
import AcceptedChallenge from "./AcceptedChallenge";

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
  challenges?: ChallengeProps[];
}


const Challenges = () => {
  const { friends } = useFriend();
  const [acceptedChallenges, setAcceptedChallenges] = useState<ChallengeProps[]>([]);
  const [pendingChallenges, setPendingChallenges] = useState<ChallengeProps[]>([]);

  useEffect(() => {
    if (!friends?.friends?.length) return;

    const allChallenges = friends.friends.flatMap(
      (friend: FriendProps) => friend.challenges || []
    );

    const accepted = allChallenges.filter((ch: { status: string; }) => ch.status === "accepted");
    const pending = allChallenges.filter((ch: { status: string; }) => ch.status === "pending");

    setAcceptedChallenges(accepted);
    setPendingChallenges(pending);

    console.log("✅ allChallenges:", allChallenges);
  }, [friends]);

  if (acceptedChallenges.length === 0 && pendingChallenges.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4 text-center">Challenges</h2>
        <p>No challenges found.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-center">Challenges</h2>

      {pendingChallenges.length > 0 && (
        <PendingChallenges pendingChallenges={pendingChallenges} />
      )}

      {acceptedChallenges.length > 0 && (
        <AcceptedChallenge acceptedChallenges={acceptedChallenges} />
      )}
    </div>
  );
};

export default Challenges;
