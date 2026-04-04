"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/button";
import axios from "axios";
import { Check, X, User } from "lucide-react";

interface FriendRequest {
  _id: string;
  requester: {
    _id: string;
    name: string;
  };
  recipient: {
    _id: string;
    name: string;
  };
}

interface FriendRequestsProps {
  data: {
    isError?: boolean;
    length?: number;
  } & FriendRequest[];
}

const FriendRequests = ({ data }: FriendRequestsProps) => {
  const queryClient = useQueryClient();

  const handleAction = async (id: string, action: "accept" | "reject") => {
    try {
      await axios.post(`/api/friend/${action}/${id}`);
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
    }
  };

  if ((data)?.isError) return <p className="text-red-500 text-sm">Failed to load requests.</p>;
  if (!data?.length) return null;

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-bold tracking-tight">Pending Requests</h2>
        <span className="bg-red-600 text-white text-xs font-black px-2 py-0.5 rounded-full">
          {data.length}
        </span>
      </div>
      
      <div className="flex flex-col gap-3">
        {data.map((req: FriendRequest) => (
          <div
            key={req._id}
            className="flex justify-between items-center bg-muted/30 hover:bg-muted/50 border border-border/50 rounded-xl p-3 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="bg-background border shadow-sm p-2 rounded-full">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="font-semibold text-base capitalize">{req.requester.name}</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                className="h-10 w-10 rounded-full text-red-500 hover:bg-red-500/10 hover:border-red-500/50 transition-colors"
                onClick={() => handleAction(req._id, "reject")}
                title="Reject"
              >
                <X className="w-5 h-5" />
              </Button>
              <Button
                size="icon"
                className="h-10 w-10 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-transform active:scale-95"
                onClick={() => handleAction(req._id, "accept")}
                title="Accept"
              >
                <Check className="w-5 h-5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendRequests;