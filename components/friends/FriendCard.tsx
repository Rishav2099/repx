"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogTrigger 
} from "../ui/dialog";
import { Button } from "../ui/button";
import ChallengeForm from "./challenges/ChallengeForm";
import { Swords, UserRound } from "lucide-react";

interface friendProps {
  name: string;
  _id: string
}

const FriendCard = ({ friend, userId }: { friend: friendProps; userId: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="group flex justify-between items-center bg-card hover:bg-accent/40 border border-border rounded-2xl p-4 transition-all duration-300 hover:shadow-md">
      
      {/* Avatar & Info */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20 group-hover:scale-105 transition-transform duration-300">
          <UserRound className="w-6 h-6" />
        </div>
        <div>
          <p className="text-lg font-bold capitalize leading-tight mb-0.5">
            {friend.name}
          </p>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[10px]">
            Athlete
          </p>
        </div>
      </div>

      {/* Challenge Button & Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            className="rounded-full font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-500/20 transition-transform active:scale-95"
          >
            <Swords className="w-4 h-4 mr-2" />
            Challenge
          </Button>
        </DialogTrigger>

        {/* Modal Styling */}
        <DialogContent className="sm:max-w-md rounded-[2rem] p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-black flex items-center gap-2 tracking-tight">
              <div className="bg-red-500/10 p-2 rounded-full">
                <Swords className="w-6 h-6 text-red-500" />
              </div>
              Challenge <span className="text-red-500 capitalize">{friend.name}</span>
            </DialogTitle>
            <DialogDescription className="text-base font-medium text-muted-foreground mt-2">
              Set the stakes, choose the workout, and push your limits together.
            </DialogDescription>
          </DialogHeader>

          {/* Form */}
          <div className="mt-2">
            <ChallengeForm 
              friendId={friend._id} 
              userId={userId} 
              closeDialog={() => setOpen(false)} 
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FriendCard;