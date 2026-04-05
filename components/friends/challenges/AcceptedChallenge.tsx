"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChallengeProps } from "./Challenges";
import ChallengeCalendar from "./ChallengeCalendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EllipsisVerticalIcon, Flag } from "lucide-react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";

interface AcceptedChallengeProps {
  acceptedChallenges: ChallengeProps[];
}

const AcceptedChallenge = ({ acceptedChallenges }: AcceptedChallengeProps) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<"resign" | "delete" | null>(null);
  const [dialogChallengeId, setDialogChallengeId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openDialog = (action: "resign" | "delete", id: string) => {
    setDialogAction(action);
    setDialogChallengeId(id);
    setDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (!dialogChallengeId || !dialogAction) return;

    try {
      setIsSubmitting(true);
      const url =
        dialogAction === "resign"
          ? `/api/challenges/${dialogChallengeId}/resign`
          : `/api/challenges/${dialogChallengeId}/delete`;
      const method = dialogAction === "resign" ? "POST" : "DELETE";

      await axios({ method, url });

      toast.success(dialogAction === "resign" ? "Resigned successfully" : "Challenge deleted");
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setDialogOpen(false);
      setDialogAction(null);
      setDialogChallengeId(null);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-8 w-full">
        {acceptedChallenges.map((ch) => {
          const isChallenger = ch.challenger._id === userId;
          const isChallengee = ch.challengee._id === userId;
          const canResign = isChallengee && ch.status === "accepted";
          const canDelete =
            isChallenger && ["accepted", "resigned", "pending"].includes(ch.status);
          const showResignedBadge = isChallenger && ch.status === "resigned";

          return (
            <div
              key={ch._id}
              className="flex flex-col items-center bg-card border shadow-lg w-full max-w-2xl mx-auto py-6 sm:py-8 rounded-3xl relative"
            >
              {/* Context Menu */}
              {(canResign || canDelete) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="absolute right-4 top-4 text-muted-foreground">
                      <EllipsisVerticalIcon className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl">
                    {canResign && (
                      <DropdownMenuItem className="text-orange-500 font-semibold" onSelect={() => openDialog("resign", ch._id)}>
                        <Flag className="w-4 h-4 mr-2" /> Resign
                      </DropdownMenuItem>
                    )}
                    {canDelete && (
                      <DropdownMenuItem className="text-red-500 font-semibold" onSelect={() => openDialog("delete", ch._id)}>
                        {ch.status === "resigned" ? "Delete (Resigned)" : "Delete Challenge"}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Title & Description */}
              <div className="text-center px-4 mb-6">
                <h3 className="font-black text-2xl md:text-3xl tracking-tighter uppercase text-foreground">
                  {ch.challengeName}
                </h3>
                {ch.description && (
                  <p className="mt-1 text-sm font-medium text-muted-foreground max-w-sm mx-auto">
                    {ch.description}
                  </p>
                )}
              </div>

              {/* VS Header Layout */}
              <div className="flex justify-center items-center w-full px-6 mb-6">
                <div className="flex flex-col items-center flex-1">
                  <ProgressAvatar
                    progress={calcProgress(ch.progress?.challenger?.length, ch.forDays)}
                    name={getInitials(ch.challenger.name)}
                    image={ch.challenger.image ?? ""}
                  />
                  <p className="mt-2 font-bold text-sm uppercase tracking-widest truncate max-w-[100px] sm:max-w-[150px]">
                    {ch.challenger.name}
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center px-4">
                  <div className="bg-red-600 text-white font-black italic text-xl px-3 py-1 rounded-lg transform -skew-x-12 shadow-md">
                    VS
                  </div>
                </div>

                <div className="flex flex-col items-center flex-1">
                  <ProgressAvatar
                    progress={calcProgress(ch.progress?.challengee?.length, ch.forDays)}
                    name={getInitials(ch.challengee.name)}
                    image={ch.challengee.image ?? ""}
                  />
                  <p className="mt-2 font-bold text-sm uppercase tracking-widest truncate max-w-[100px] sm:max-w-[150px]">
                    {ch.challengee.name}
                  </p>
                </div>
              </div>

              {showResignedBadge && (
                <div className="bg-orange-500/10 text-orange-500 border border-orange-500/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                  Opponent Resigned
                </div>
              )}

              {/* Calendar Section */}
              <div className="w-full px-4 sm:px-8 mt-2">
                <div className="bg-muted/30 rounded-2xl p-4 border border-border/50">
                  <ChallengeCalendar
                    challengerDates={ch.progress.challenger}
                    challengeeDates={ch.progress.challengee}
                    startDate={ch.startDate.split("T")[0]}
                    endDate={ch.endDate.split("T")[0]}
                    id={ch._id}
                    challengerName={ch.challenger.name.split(" ")[0]} // First name only for cleaner legend
                    challengeeName={ch.challengee.name.split(" ")[0]}
                  />
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black text-xl">
              {dialogAction === "resign" ? "Resign from Challenge?" : "Delete Challenge?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-base">
              {dialogAction === "resign"
                ? "You will forfeit this challenge. Your opponent will be notified of your surrender."
                : "This action cannot be undone. The challenge and all progress will be permanently wiped."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl font-bold">Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isSubmitting} onClick={handleConfirm} className="rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white">
              {dialogAction === "resign" ? "Surrender" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AcceptedChallenge;

/* ──────────────────────────────────────
   Helper Components
   ────────────────────────────────────── */
const ProgressAvatar = ({
  progress,
  image,
  name,
}: {
  progress: number;
  image: string;
  name: string;
}) => {
  // Uses tailwind red-600 (rgb(220 38 38)) and transparent for theme compatibility
  const bg = `conic-gradient(rgb(220 38 38) ${progress * 3.6}deg, transparent 0deg)`;

  return (
    <div className="flex flex-col items-center">
      <div
        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center bg-muted"
        style={{ background: bg }}
      >
        {/* Inner circle acts as a mask to create the ring effect */}
        <div className="w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] rounded-full bg-card flex items-center justify-center p-1">
          <Avatar className="w-full h-full border-2 border-border shadow-inner">
            <AvatarImage src={image} className="object-cover" />
            <AvatarFallback className="font-black text-xl bg-muted text-muted-foreground">{name}</AvatarFallback>
          </Avatar>
        </div>
      </div>
      <div className="mt-2 bg-background border shadow-sm px-2 py-0.5 rounded-full text-xs font-bold tabular-nums">
        {progress}%
      </div>
    </div>
  );
};

/* ──────────────────────────────────────
   Utilities
   ────────────────────────────────────── */
const calcProgress = (done: number = 0, total: number) =>
  total > 0 ? Math.round((done / total) * 100) : 0;

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();