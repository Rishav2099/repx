"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/button";
import axios from "axios";

// Define type for a single friend request
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

// Define props type for the component
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

  if ((data)?.isError) return <p>Error loading friend requests</p>;

  if (!data?.length) return null;

  return (
    <div className="border-y my-5 py-5">
      <p className="ml-2 font-semibold">Friend Requests</p>
      {data.map((req: FriendRequest) => (
        <div
          key={req._id}
          className="flex justify-between items-center border rounded-lg max-w-[80vw] mx-auto mt-3 bg-[#131518] p-2"
        >
          <p>{req.requester.name}</p>
          <div className="flex gap-2">
            <Button onClick={() => handleAction(req._id, "accept")}>
              Accept
            </Button>
            <Button
              variant="outline"
              onClick={() => handleAction(req._id, "reject")}
            >
              Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FriendRequests;
