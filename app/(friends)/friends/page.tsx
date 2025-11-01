"use client";

import Challenges from "@/components/friends/challenges/Challenges";
import Friends from "@/components/friends/Friends";
import { Badge } from "@/components/ui/badge";
import { Share2 } from "lucide-react";
import React, { useState } from "react";

const Page = () => {
  const [nav, setNav] = useState("friends");

  return (
    <div>
      <h1 className="text-center py-5 relative font-bold text-2xl border-b">
        Your Friends
      </h1>
      <span>
        <Share2 className="absolute cursor-pointer right-3 top-7 " />
      </span>
      <div className="ml-3 mt-3 flex gap-3">
        <Badge
          onClick={() => setNav("friends")}
          variant={`${nav === "friends" ? "primary" : "outline"}`}
          className={`p-2 text-sm`}
        >
          Friends
        </Badge>
        <Badge
          onClick={() => setNav("challenges")}
          variant={`${nav === "challenges" ? "primary" : "outline"}`}
          className={`p-2 text-sm`}
        >
          Challenges with friends
        </Badge>
      </div>
      {nav === "friends" ? (
        <Friends />
      ) : (
        <Challenges />
      )}
    </div>
  );
};

export default Page;
