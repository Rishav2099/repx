"use client";

import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Handshake, UserX, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface FriendProps {
  name: string;
}

const Page = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = React.use(params);
  const router = useRouter();
  
  const [friend, setFriend] = useState<FriendProps>();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState<"accept" | "decline" | null>(null);

  const fetchFriend = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/friends/${id}`);
      if (res.status === 200) {
        setFriend(res.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriend();
  }, [id]);

  // Handle the accept/decline actions
  const handleAction = async (action: "accept" | "decline") => {
    setIsSubmitting(action);
    try {
      // Replace with your actual accept/decline API route
      await axios.post(`/api/friend/${action}/${id}`);
      toast.success(`Request ${action}ed!`);
      router.push("/friends"); // Redirect back to community page
    } catch (error) {
      console.error(error);
      toast.error(`Failed to ${action} request.`);
    } finally {
      setIsSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Loader />
      </div>
    );
  }

  return friend ? (
    <div className="flex justify-center items-center min-h-screen bg-muted/20 p-4">
      <div className="bg-card border border-border shadow-2xl rounded-[2rem] p-8 sm:p-10 w-full max-w-sm text-center animate-in fade-in zoom-in-95 duration-500">
        
        {/* Pulsing Icon */}
        <div className="flex justify-center mb-6 relative">
          <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping opacity-75 blur-xl"></div>
          <div className="relative bg-background border-4 border-red-500/20 p-6 rounded-full shadow-lg">
            <Handshake size={64} className="text-red-600" />
          </div>
        </div>

        <h1 className="text-2xl font-black text-foreground capitalize tracking-tight">
          {friend.name}
        </h1>
        <p className="text-muted-foreground font-medium text-lg mb-8 mt-1">
          wants to connect with you 👋
        </p>

        <div className="flex flex-col gap-3">
          <Button 
            className="w-full h-14 rounded-xl text-lg font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20 transition-transform active:scale-95"
            onClick={() => handleAction("accept")}
            disabled={isSubmitting !== null}
          >
            {isSubmitting === "accept" ? <Loader2 className="w-5 h-5 animate-spin" /> : "Accept Request"}
          </Button>
          <Button 
            variant="outline" 
            className="w-full h-14 rounded-xl text-lg font-bold border-border/50 hover:bg-muted"
            onClick={() => handleAction("decline")}
            disabled={isSubmitting !== null}
          >
            {isSubmitting === "decline" ? <Loader2 className="w-5 h-5 animate-spin" /> : "Decline"}
          </Button>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex flex-col justify-center items-center min-h-screen text-center p-4 bg-muted/20">
      <div className="bg-card border border-border shadow-xl rounded-[2rem] p-8 w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="bg-muted p-4 rounded-full">
            <UserX size={48} className="text-muted-foreground" />
          </div>
        </div>
        <p className="text-xl font-black text-foreground mb-2">
          Invite Expired
        </p>
        <p className="text-muted-foreground font-medium mb-8">
          We could not find this friend request. The link may be invalid or already processed.
        </p>
        <Button 
          className="w-full h-12 rounded-xl font-bold bg-foreground text-background hover:bg-foreground/90"
          onClick={() => router.push("/friends")}
        >
          Go to Community
        </Button>
      </div>
    </div>
  );
};

export default Page;