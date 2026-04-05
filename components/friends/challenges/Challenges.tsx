"use client";

import { useFriend } from "@/context/ChallengeContext";
import React, { useEffect, useState, useMemo } from "react";
import PendingChallenges from "./PendingChallenges";
import AcceptedChallenge from "./AcceptedChallenge";
import { useSession } from "next-auth/react";
import { Swords, Trophy } from "lucide-react";
import Loader from "@/components/loader";

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

  const { accepted, pending } = useMemo(() => {
    if (!userId || !Array.isArray(friends) || friends.length === 0) {
      return { accepted: [], pending: [] };
    }

    const allChallenges = friends.flatMap((friend) => friend.challenges || []);

    const accepted = allChallenges.filter((ch) => {
      const isAccepted = ch.status === "accepted";
      const isResignedByOpponent = ch.status === "resigned" && ch.challenger._id === userId;
      return isAccepted || isResignedByOpponent;
    });

    const pending = allChallenges.filter((ch) => {
      const isPending = ch.status === "pending";
      const isRelevantToUser = ch.challenger._id === userId || ch.challengee._id === userId;
      return isPending && isRelevantToUser;
    });

    return { accepted, pending };
  }, [friends, userId]);

  useEffect(() => {
    setAcceptedChallenges(accepted);
    setPendingChallenges(pending);
  }, [accepted, pending]);

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader /></div>;
  }

  if (acceptedChallenges.length === 0 && pendingChallenges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-border rounded-3xl bg-muted/10 max-w-2xl mx-auto mt-8">
        <div className="bg-muted p-4 rounded-full mb-4">
          <Trophy className="w-8 h-8 text-muted-foreground" />
        </div>
        <h4 className="font-bold text-xl mb-2">No Active Challenges</h4>
        <p className="text-muted-foreground mb-6 max-w-sm font-medium">
          Ready to push your limits? Go to your Friends list and challenge someone to a duel!
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-10 pb-20 pt-6 animate-in fade-in duration-300">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black tracking-tight flex items-center justify-center gap-2">
          <Swords className="w-8 h-8 text-red-600" />
          Active Duels
        </h2>
      </div>

      {pendingChallenges.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Awaiting Response
            </h3>
          </div>
          <PendingChallenges pendingChallenges={pendingChallenges} />
        </section>
      )}

      {acceptedChallenges.length > 0 && (
        <section className="space-y-4 mt-8">
          <div className="flex items-center gap-2 px-2">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              In Progress
            </h3>
          </div>
          <AcceptedChallenge acceptedChallenges={acceptedChallenges} />
        </section>
      )}
    </div>
  );
};

export default Challenges;