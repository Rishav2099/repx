"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import FriendRequests from "./FriendRequests";
import FriendSearch from "./FriendSearch";
import FriendList from "./FriendList";
import { Button } from "../ui/button";
import { Search, UserPlus } from "lucide-react";
import Loader from "../loader";
import { useFriend } from "@/context/ChallengeContext";

const Friends = () => {
  const { data: session } = useSession();
  const userId = String(session?.user?.id ?? "");
  const [showSearch, setShowSearch] = useState(false);
  const { friends, requests, isLoading } = useFriend();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-24">
      {showSearch ? (
        <FriendSearch userId={userId} setShowSearch={setShowSearch} />
      ) : (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Header & Search Action */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-black text-3xl tracking-tight">Community</h1>
              <p className="text-muted-foreground font-medium mt-1">
                Connect and train with your friends.
              </p>
            </div>
            <Button
              onClick={() => setShowSearch(true)}
              className="rounded-full font-bold shadow-sm"
              size="sm"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Add Friend</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>

          {/* Pending Requests Section */}
          <FriendRequests data={requests} />

          {/* Friends List Section */}
          <FriendList data={friends} userId={userId} onSearchClick={() => setShowSearch(true)} />
          
        </div>
      )}
    </div>
  );
};

export default Friends;