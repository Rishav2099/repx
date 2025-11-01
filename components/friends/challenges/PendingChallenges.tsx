"use client";

import React, { useState } from "react";
import { ChallengeProps } from "./Challenges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckIcon, XIcon } from "lucide-react";
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
  const [acceptingChallenge, setAcceptingChallenge] = useState<string | null>(
    null
  );
  const [rejectingChallenge, setRejectingChallenge] = useState(false);
  const queryClient = useQueryClient();

  const rejectChallenge = async (id: string) => {
    try {
      setRejectingChallenge(true);
      const res = await axios.delete(`/api/challenges/reject/${id}`);
      if (res.status === 200) {
        toast.success("Challenge rejected successfully");
        queryClient.invalidateQueries({ queryKey: ["friends"] });
      }
    } catch (error) {
      console.log(error);
      toast.error("Error while rejecting challenge");
    } finally {
      setRejectingChallenge(false);
    }
  };

  const acceptChallenge = async (id: string) => {
    try {
      setAcceptingChallenge(id);
      const res = await axios.post(`/api/challenges/accept/${id}`);
      if (res.status === 200) {
        toast.success("Challenge accepted successfully");
        queryClient.invalidateQueries({ queryKey: ["friends"] });
      }
    } catch (error) {
      console.log(error);
      toast.error("Error while accepting challenge");
    } finally {
      setAcceptingChallenge(null);
    }
  };

  if (pendingChallenges.length === 0) return null;

  return (
    <div>
      <h3 className="ml-2 font-semibold text-lg mb-3">New Challenges</h3>

      <div className="py-5 flex flex-col gap-5">
        {pendingChallenges.map((ch) => {
          const isChallenger = ch.challenger?._id === userId;

          return (
            <div
              key={ch._id}
              className="bg-[#1a1a1a] w-[90vw] mx-auto px-5 rounded-md border py-5"
            >
              <Badge className="mt-2">
                {ch.challenger?.name} challenged {ch.challengee?.name}
              </Badge>

              <p className="mt-3 font-semibold text-xl text-red-500 capitalize">
                {ch.challengeName}
              </p>

              <p className="mt-2">
                {ch.challenger?.name} challenged {ch.challengee?.name} to do{" "}
                <span className="font-semibold">{ch.reps}</span> pushups for{" "}
                <span className="font-semibold">{ch.forDays}</span> days.
              </p>

              {/* ✅ Conditionally Render */}
              {isChallenger ? (
                <div className="mt-3 text-right">
                  <Badge
                    variant={
                      ch.status === "accepted"
                        ? "default"
                        : ch.status === "pending"
                        ? "outline"
                        : "destructive"
                    }
                  >
                    {ch.status.charAt(0).toUpperCase() + ch.status.slice(1)}
                  </Badge>
                </div>
              ) : (
                <div className="mt-3 flex justify-end gap-5 items-center max-w-[80vw] mx-auto">
                  <Button
                    variant="outline"
                    onClick={() => rejectChallenge(ch._id)}
                    disabled={rejectingChallenge}
                  >
                    {rejectingChallenge ? (
                      "Rejecting..."
                    ) : (
                      <>
                        <XIcon />
                        Reject
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => acceptChallenge(ch._id)}
                    variant="primary"
                    disabled={acceptingChallenge === ch._id}
                  >
                    {acceptingChallenge === ch._id ? (
                      "Accepting..."
                    ) : (
                      <>
                        <CheckIcon />
                        Accept
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PendingChallenges;
