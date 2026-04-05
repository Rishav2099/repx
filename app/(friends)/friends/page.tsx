"use client";

import Challenges from "@/components/friends/challenges/Challenges";
import Friends from "@/components/friends/Friends";
import { Button } from "@/components/ui/button";
import { Share2, Users, Swords } from "lucide-react";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

const Page = () => {
  const [nav, setNav] = useState<"friends" | "challenges">("friends");
  const { data: session } = useSession();

  // Generates a unique invite link using the logged-in user's ID
  const handleShare = () => {
    const userId = session?.user?.id;
    if (!userId) {
      toast.error("Could not generate invite link.");
      return;
    }

    const inviteLink = `${window.location.origin}/friends/${userId}`;

    if (navigator.share) {
      navigator.share({
        title: "Join me on Repx!",
        text: "Let's track workouts and challenge each other to a duel.",
        url: inviteLink,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(inviteLink);
      toast.success("Invite link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-dvh bg-background text-foreground pb-20">
      
      {/* Sticky Header with Proper Flexbox */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 py-4 border-b bg-background/80 backdrop-blur-md">
        <h1 className="font-black text-2xl tracking-tight">Community</h1>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          onClick={handleShare}
          title="Share Invite Link"
        >
          <Share2 className="w-5 h-5" />
        </Button>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Segmented Control Navigation - Red Theme Applied */}
        <div className="flex p-1 bg-muted/40 rounded-2xl w-full max-w-md mx-auto mt-6 mb-8 border border-border/50 shadow-inner">
          <button
            onClick={() => setNav("friends")}
            className={`flex-1 py-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${
              nav === "friends"
                ? "bg-red-600 text-white shadow-md border border-red-500/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="w-4 h-4" />
            Friends
          </button>
          <button
            onClick={() => setNav("challenges")}
            className={`flex-1 py-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${
              nav === "challenges"
                ? "bg-red-600 text-white shadow-md border border-red-500/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Swords className="w-4 h-4" />
            Challenges
          </button>
        </div>

        {/* Animated Tab Content */}
        <div className="relative w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={nav}
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full"
            >
              {nav === "friends" ? <Friends /> : <Challenges />}
            </motion.div>
          </AnimatePresence>
        </div>

      </main>
    </div>
  );
};

export default Page;