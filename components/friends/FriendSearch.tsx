"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { ArrowLeft, Plus, Search } from "lucide-react";
import axios from "axios";
import Loader from "../loader";
import { useQueryClient } from "@tanstack/react-query";

interface FriendData {
  _id: string;
  requester: string;
  recipient: string;
  status: "pending" | "accepted" | "rejected" | "blocked";
}

interface SearchUser {
  _id: string;
  name: string;
  friends: FriendData[];
}

interface Props {
  userId: string;
  setShowSearch: (val: boolean) => void;
}

const FriendSearch = ({ userId, setShowSearch }: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const queryClient = useQueryClient();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    try {
      setLoading(true);
      setSearchResults(null);

      const res = await axios.get(`/api/friends/${searchTerm}`);
      setSearchResults(res.data);
    } catch (error) {
      console.error("Error searching friends:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (id: string) => {
    try {
      setSendingRequest(true);
      const res = await axios.post(`/api/friend/add/${id}`);

      // Update local UI to reflect friend request status
      setSearchResults((prev) =>
        prev
          ? prev.map((user) =>
              user._id === id
                ? {
                    ...user,
                    friends: [...user.friends, res.data],
                  }
                : user
            )
          : prev
      );

      // Refresh React Query cache for requests and friends
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    } catch (error) {
      console.error("Error sending friend request:", error);
    } finally {
      setSendingRequest(false);
    }
  };

  const getButtonText = (user: SearchUser): string => {
    const friendRelation = user.friends.find(
      (f) => f.requester === userId || f.recipient === userId
    );

    if (!friendRelation) return "Add Friend";

    if (friendRelation.status === "pending") {
      return friendRelation.requester === userId
        ? "Requested"
        : "Accept Request";
    }

    if (friendRelation.status === "accepted") return "Friends";
    if (friendRelation.status === "rejected") return "Add Friend";
    if (friendRelation.status === "blocked") return "Blocked";

    return "Add Friend";
  };

  return (
    <div className="mt-5 mx-3">
      {/* Header */}
      <div className="flex justify-center items-center">
        <div className="font-semibold text-lg w-full">Search Friends</div>
        <Button
          onClick={() => setShowSearch(false)}
          className="hover:scale-105 flex gap-1"
        >
          <ArrowLeft /> Go Back
        </Button>
      </div>

      {/* Search Bar */}
      <form
        onSubmit={handleSearch}
        className="flex justify-center items-center mt-4"
      >
        <input
          type="text"
          placeholder="Search your friends"
          className="border-2 rounded-lg px-5 py-2 w-full max-w-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button type="submit" className="ml-2">
          <Search />
        </Button>
      </form>

      {/* Search Results */}
      {loading ? (
        <div className="flex justify-center items-center h-[50vh]">
          <Loader />
        </div>
      ) : searchResults && searchResults.length > 0 ? (
        <div className="mt-5 w-[90vw] mx-auto flex flex-col gap-3">
          {searchResults.map((user) => {
            const btnText = getButtonText(user);
            return (
              <div
                key={user._id}
                className="border cursor-pointer p-4 rounded-lg shadow flex justify-between items-center"
              >
                <p className="text-lg font-bold">{user.name}</p>

                <Button
                  onClick={() => sendFriendRequest(user._id)}
                  disabled={
                    sendingRequest ||
                    btnText === "Requested" ||
                    btnText === "Friends" ||
                    btnText === "Blocked"
                  }
                  className={`font-semibold text-white flex items-center gap-1 ${
                    btnText === "Add Friend"
                      ? "bg-red-500 hover:bg-red-900"
                      : "bg-gray-800 hover:bg-gray-700"
                  }`}
                >
                  {btnText === "Add Friend" ? (
                    <>
                      <Plus /> Add Friend
                    </>
                  ) : (
                    btnText
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      ) : (
        !loading && (
          <div className="mt-20 flex justify-center items-center">
            <p>No Results found 😅</p>
          </div>
        )
      )}
    </div>
  );
};

export default FriendSearch;
