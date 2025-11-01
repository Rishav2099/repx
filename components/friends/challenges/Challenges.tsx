"use client";

import { useFriend } from "@/context/ChallengeContext";
import React, { useEffect, useState } from "react";
import PendingChallenges from "./PendingChallenges";
import AcceptedChallenge from "./AcceptedChallenge";

// Define Challenge structure
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

// Define Friend structure
export interface FriendProps {
  _id: string;
  requester: { _id: string; name: string };
  recipient: { _id: string; name: string };
  challenges?: ChallengeProps[];
}

// Component
const Challenges = () => {
  const { friends } = useFriend();
  const [acceptedChallenges, setAcceptedChallenges] = useState<ChallengeProps[]>([]);
  const [pendingChallenges, setPendingChallenges] = useState<ChallengeProps[]>([]);

  useEffect(() => {
    if (!friends?.friends?.length) return;

    // ✅ flatten all challenges from each friend
    const allChallenges = friends.friends.flatMap(
      (friend: FriendProps) => friend.challenges || []
    );

    // ✅ Separate based on status
    const accepted = allChallenges.filter((ch: { status: string; }) => ch.status === "accepted");
    const pending = allChallenges.filter((ch: { status: string; }) => ch.status === "pending");

    setAcceptedChallenges(accepted);
    setPendingChallenges(pending);

    console.log("✅ allChallenges:", allChallenges);
    console.log("✅ accepted:", accepted);
    console.log("✅ pending:", pending);
  }, [friends]);

  // 🧩 UI rendering
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

      {/* Pending */}
      {pendingChallenges.length > 0 && (
        <PendingChallenges pendingChallenges={pendingChallenges} />
      )}

      {/* Accepted */}
      {acceptedChallenges.length > 0 && (
        <AcceptedChallenge acceptedChallenges={acceptedChallenges} />
      )}
    </div>
  );
};

export default Challenges;
