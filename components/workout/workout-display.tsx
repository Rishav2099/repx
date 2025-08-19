import React, { useState } from "react";
import { EllipsisVertical, Pencil, Share2, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";

interface workoutProps {
  workout: {
    _id: string;
    workoutName: string;
    exercises: {
      name: string;
      reps?: number;
      sets?: number;
      time?: number;
    }[];
  };
}

const WorkoutDisplay = ({ workout }: workoutProps) => {
  const router = useRouter();
  const [showShareLink, setShowShareLink] = useState(false);
  const [shareLink, setShareLink] = useState("");

  const deleteWorkout = async (id: string) => {
    try {
      const res = await axios.delete(`/api/workout/${id}`);
      if (res.status === 200) {
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const shareWorkout = async (id: string) => {
    const shareUrl = `${window.location.origin}/workout/share/${id}`;
    setShareLink(shareUrl);

    const shareData = {
      title: `Check out my ${workout.workoutName} workout 💪`,
      text: "Here’s my workout plan!",
      url: shareUrl,
    };

    await navigator.share(shareData);
  };

  return (
    <>
      <Link href={`/workout/preview/${workout._id}`}>
        <AlertDialog>
          <div className="cursor-pointer">
            <div className=" border p-4 rounded-lg shadow flex justify-between">
              <h3 className="text-lg font-bold">{workout.workoutName}</h3>
              <DropdownMenu>
                <DropdownMenuTrigger className="cursor-pointer">
                  <EllipsisVertical />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    className="cursor-pointer flex items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/workout/edit/${workout._id}`);
                    }}
                  >
                    <Pencil className="text-red-500" /> <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer flex items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      shareWorkout(workout._id);
                    }}
                  >
                    <Share2 className="text-red-500" />
                    <span>Share</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <AlertDialogTrigger
                      className="cursor-pointer flex items-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Trash className="text-red-500" />
                      <span>Delete</span>
                    </AlertDialogTrigger>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <AlertDialogContent
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                workout and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={(e) => e.stopPropagation()}
                className="cursor-pointer"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.stopPropagation();
                  deleteWorkout(workout._id);
                }}
                className="cursor-pointer"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Link>
      {showShareLink && (
        <Dialog open={showShareLink} onOpenChange={setShowShareLink}>
          <form>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Share Link</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <input
                  className="bg-[#3c191a] border-2 border-red-500 p-2 rounded-lg"
                  type="text"
                  defaultValue={shareLink}
                  disabled
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  variant={"primary"}
                  onClick={() => navigator.clipboard.writeText(shareLink)}
                >
                  Copy Link
                </Button>
              </DialogFooter>
            </DialogContent>
          </form>
        </Dialog>
      )}
    </>
  );
};

export default WorkoutDisplay;
