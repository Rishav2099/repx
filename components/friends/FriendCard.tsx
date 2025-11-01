"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter, DialogClose } from "../ui/dialog";
import { Button } from "../ui/button";
import ChallengeForm from "./challenges/ChallengeForm";

const FriendCard = ({ friend, userId }: { friend: any; userId: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border p-4 rounded-lg shadow flex justify-between items-center">
      <p className="text-lg font-bold">{friend.name}</p>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-red-500 hover:bg-red-900 font-semibold text-white">
            Challenge
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Challenge <span className="text-red-500">{friend.name}</span>
            </DialogTitle>
            <DialogDescription>Set up your challenge details below</DialogDescription>
          </DialogHeader>

          <ChallengeForm friendId={friend._id} userId={userId} closeDialog={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FriendCard;
