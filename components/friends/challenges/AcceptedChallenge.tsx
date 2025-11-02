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
import { EllipsisVerticalIcon } from "lucide-react";
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
import axios from "axios"; // ← ADD THIS

interface AcceptedChallengeProps {
  acceptedChallenges: ChallengeProps[];
}

const AcceptedChallenge = ({ acceptedChallenges }: AcceptedChallengeProps) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  // State for confirmation dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<"resign" | "delete" | null>(null);
  const [dialogChallengeId, setDialogChallengeId] = useState<string | null>(null);

  // Handlers
  const openDialog = (action: "resign" | "delete", id: string) => {
    setDialogAction(action);
    setDialogChallengeId(id);
    setDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (!dialogChallengeId || !dialogAction) return;

    try {
      const url =
        dialogAction === "resign"
          ? `/api/challenges/${dialogChallengeId}/resign`
          : `/api/challenges/${dialogChallengeId}/delete`;

      const method = dialogAction === "resign" ? "POST" : "DELETE";

      // Axios with method
      const response = await axios({
        method,
        url,
      });

      toast.success(
        dialogAction === "resign" ? "Resigned successfully" : "Challenge deleted"
      );

      queryClient.invalidateQueries({ queryKey: ["friends"] });
    } catch (error) {
      // Axios error handling
      const message = "Something went wrong";
      toast.error(message);
    } finally {
      setDialogOpen(false);
      setDialogAction(null);
      setDialogChallengeId(null);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center w-full py-5 mb-16 gap-5">
        {acceptedChallenges.map((ch) => {
          const isChallenger = ch.challenger._id === userId;
          const isChallengee = ch.challengee._id === userId;
          const canResign = isChallengee && ch.status === "accepted";
          const canDelete =
            isChallenger &&
            ["accepted", "resigned", "pending"].includes(ch.status);
          const showResignedBadge = isChallenger && ch.status === "resigned";

          return (
            <div
              key={ch._id}
              className="flex flex-col items-center bg-[#1a1a1a] w-[90vw] md:w-[80vw] md:max-w-[800px] py-5 rounded-lg relative"
            >
              {/* Header */}
              <div className="grid grid-cols-3 place-items-center w-full">
                <div className="flex flex-col items-center">
                  <ProgressAvatar
                    progress={calcProgress(ch.progress?.challenger?.length, ch.forDays)}
                    name={getInitials(ch.challenger.name)}
                    image={ch.challenger.image ?? ""}
                  />
                  <p className="mt-1">{ch.challenger.name}</p>
                </div>

                <h3 className="font-bold text-2xl md:text-3xl text-center">
                  {ch.challengeName}
                </h3>

                <div className="flex flex-col items-center">
                  <ProgressAvatar
                    progress={calcProgress(ch.progress?.challengee?.length, ch.forDays)}
                    name={getInitials(ch.challengee.name)}
                    image={ch.challengee.image ?? ""}
                  />
                  <p className="mt-1">{ch.challengee.name}</p>
                </div>
              </div>

              {ch.description && (
                <p className="mt-3 text-center text-sm text-gray-400 px-4">
                  {ch.description}
                </p>
              )}

              {showResignedBadge && (
                <p className="mt-2 text-xs text-orange-400">
                  Opponent resigned
                </p>
              )}

              {/* Calendar */}
              <div className="mt-6 w-full flex justify-center">
                <ChallengeCalendar
                  challengerDates={ch.progress.challenger}
                  challengeeDates={ch.progress.challengee}
                  startDate={ch.startDate.split("T")[0]}
                  endDate={ch.endDate.split("T")[0]}
                  id={ch._id}
                  challengerName={ch.challenger.name}
                  challengeeName={ch.challengee.name}
                />
              </div>

              {/* Dropdown */}
              {(canResign || canDelete) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2"
                    >
                      <EllipsisVerticalIcon className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canResign && (
                      <DropdownMenuItem
                        className="text-orange-500"
                        onSelect={() => openDialog("resign", ch._id)}
                      >
                        Resign
                      </DropdownMenuItem>
                    )}
                    {canDelete && (
                      <DropdownMenuItem
                        className="text-red-500"
                        onSelect={() => openDialog("delete", ch._id)}
                      >
                        {ch.status === "resigned"
                          ? "Delete (Resigned)"
                          : "Delete Challenge"}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogAction === "resign"
                ? "Resign from Challenge?"
                : "Delete Challenge Permanently?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogAction === "resign"
                ? "You will leave this challenge. The challenger will be notified."
                : "This action cannot be undone. The challenge and all progress will be deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              {dialogAction === "resign" ? "Resign" : "Delete"}
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
  const bg = `conic-gradient(#e7000b ${progress * 3.6}deg, #333 0deg)`;

  return (
    <div className="flex flex-col items-center">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center p-[3px]"
        style={{ background: bg }}
      >
        <Avatar className="w-12 h-12 border-2 border-[#1a1a1a]">
          <AvatarImage src={image} />
          <AvatarFallback>{name}</AvatarFallback>
        </Avatar>
      </div>
      <p className="text-xs mt-1 text-gray-300">{progress}%</p>
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