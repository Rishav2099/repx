"use client";

import React, { useState } from "react";
import { ChallengeProps } from "./Challenges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckIcon, XIcon, Flame } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";

interface pendingChallengeProps {
  pendingChallenges: ChallengeProps[];
}

const PendingChallenges = ({ pendingChallenges }: pendingChallengeProps) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [acceptingChallenge, setAcceptingChallenge] = useState<string | null>(null);
  const [rejectingChallenge, setRejectingChallenge] = useState(false);
  const queryClient = useQueryClient();

  const rejectChallenge = async (id: string) => {
    try {
      setRejectingChallenge(true);
      const res = await axios.delete(`/api/challenges/reject/${id}`);
      if (res.status === 200) {
        toast.success("Challenge rejected");
        queryClient.invalidateQueries({ queryKey: ["friends"] });
      }
    } catch (error) {
      toast.error("Error rejecting challenge");
    } finally {
      setRejectingChallenge(false);
    }
  };

  const acceptChallenge = async (id: string) => {
    try {
      setAcceptingChallenge(id);
      const res = await axios.post(`/api/challenges/accept/${id}`);
      if (res.status === 200) {
        toast.success("Challenge accepted! Game on.");
        queryClient.invalidateQueries({ queryKey: ["friends"] });
      }
    } catch (error) {
      toast.error("Error accepting challenge");
    } finally {
      setAcceptingChallenge(null);
    }
  };

  if (pendingChallenges.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {pendingChallenges.map((ch) => {
        const isChallenger = ch.challenger?._id === userId;

        return (
          <div
            key={ch._id}
            className="bg-card border shadow-sm w-full mx-auto p-5 sm:p-6 rounded-2xl relative overflow-hidden"
          >
            {/* Subtle background flair */}
            <div className="absolute -top-4 -right-4 text-red-500/5">
              <Flame className="w-32 h-32" />
            </div>

            <div className="relative z-10">
              <Badge variant="secondary" className="mb-3">
                {isChallenger ? "You challenged " : ""}<span className="font-bold capitalize">{ch.challenger?.name}</span>
                {!isChallenger ? " challenged you" : ""}
              </Badge>

              <h4 className="font-black text-2xl sm:text-3xl text-foreground capitalize tracking-tight mb-2">
                {ch.challengeName}
              </h4>

              <p className="text-muted-foreground font-medium text-sm sm:text-base max-w-md">
                Complete <span className="font-bold text-foreground">{ch.reps} reps</span> daily for <span className="font-bold text-foreground">{ch.forDays} days</span> straight.
              </p>

              <div className="mt-6">
                {isChallenger ? (
                  <Badge variant="outline" className="text-orange-500 border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs uppercase tracking-widest">
                    Awaiting Response
                  </Badge>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 sm:flex-none border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-600 rounded-xl"
                      onClick={() => rejectChallenge(ch._id)}
                      disabled={rejectingChallenge}
                    >
                      <XIcon className="w-4 h-4 mr-2" />
                      Decline
                    </Button>
                    <Button
                      className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-500/20 transition-transform active:scale-95"
                      onClick={() => acceptChallenge(ch._id)}
                      disabled={acceptingChallenge === ch._id}
                    >
                      <CheckIcon className="w-4 h-4 mr-2" />
                      {acceptingChallenge === ch._id ? "Accepting..." : "Accept Duel"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PendingChallenges;