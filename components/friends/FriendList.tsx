"use client";

import { Search, Users } from "lucide-react";
import FriendCard from "./FriendCard";
import { Button } from "../ui/button";

interface User {
  _id: string;
  name: string;
}

interface Friend {
  _id: string;
  requester: User;
  recipient: User;
}

interface FriendListProps {
  data: Friend[] | { friends: Friend[] } | null | undefined;
  userId: string;
  onSearchClick: () => void;
}

const FriendList = ({ data, userId, onSearchClick }: FriendListProps) => {
  // handle both possible shapes
  const list = Array.isArray(data)
    ? data
    : data?.friends
    ? data.friends
    : [];

if (list.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-border rounded-3xl bg-muted/10">
        <div className="bg-muted p-4 rounded-full mb-4">
          <Users className="w-8 h-8 text-muted-foreground" />
        </div>
        <h4 className="font-bold text-xl mb-2">No friends yet</h4>
        <p className="text-muted-foreground mb-6 max-w-sm font-medium">
          Working out is better together. Search for your friends to share workouts and track progress.
        </p>
        <Button onClick={onSearchClick} variant="secondary" className="rounded-full font-bold">
          <Search className="w-4 h-4 mr-2" />
          Find Friends
        </Button>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-lg font-semibold mt-3 ml-3">Friends</h2>
      <div className="mt-5 w-[90vw] mx-auto flex flex-col gap-3">
        {list.map((f) => {
          const otherUser =
            f.requester._id === userId ? f.recipient : f.requester;
          return <FriendCard key={f._id} friend={otherUser} userId={userId} />;
        })}
      </div>
    </>
  );
};

export default FriendList;
