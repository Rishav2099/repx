"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import FriendRequests from "./FriendRequests";
import FriendSearch from "./FriendSearch";
import FriendList from "./FriendList";
import { Button } from "../ui/button";
import { Search } from "lucide-react";
import Loader from "../loader";
import { useFriend } from "@/context/ChallengeContext";

const Friends = () => {
  const { data: session } = useSession();
  const userId = String(session?.user?.id ?? "");
  const [showSearch, setShowSearch] = useState(false);
  const {friends, requests, isLoading} = useFriend();


  // 🌀 Show only ONE loader if it is loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="mt-5">
      {showSearch ? (
        <FriendSearch userId={userId} setShowSearch={setShowSearch} />
      ) : (
        <>
          {/* 🔍 Button to open Search Section */}
          <div className="flex justify-end mx-5 mb-5">
            <Button
              onClick={() => setShowSearch(true)}
              className="flex gap-1 items-center relative left-0"
            >
              <Search size={18} />
              Search Friends
            </Button>
          </div>

          {/* 📨 Friend Requests */}
          <FriendRequests data={requests} />

          {/* 👥 Friend List */}
          <FriendList data={friends} userId={userId} />
        </>
      )}
    </div>
  );
};

export default Friends;
