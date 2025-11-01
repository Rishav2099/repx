"use client";

import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Handshake } from "lucide-react";
import React, { useEffect, useState } from "react";

interface friendProps {
  name: string;
}

const Page = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = React.use(params);
  const [friend, setFriend] = useState<friendProps>();
  const [loading, setLoading] = useState(true);

  const fetchFriend = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/friends/${id}`);
      if (res.status === 200) {
        setFriend(res.data);
      }
      console.log(res);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriend();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  return friend ? (
    <div className="flex justify-center items-center h-screen dark:bg-[#1b1b1b] bg-gray-200">
      <div className="bg-white dark:bg-black shadow-lg rounded-2xl p-10 w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <Handshake
            size={120}
            className="text-red-600 dark:text-white border-2 border-red-200 p-4 rounded-full"
          />
        </div>
        <h1 className="text-xl font-bold text-gray-800 dark:text-red-600">{friend.name}</h1>
        <p className="text-gray-600 dark:text-white text-lg mb-6">
          wants to be your friend 👋
        </p>

        <div className="flex gap-4 justify-center">
          <Button variant="outline" className="w-28">
            Decline
          </Button>
          <Button className="bg-red-500 text-white hover:bg-red-700 w-28">
            Accept
          </Button>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex flex-col justify-center items-center h-screen text-center gap-4 bg-gray-100">
      <div className="bg-white shadow-md rounded-xl p-8">
        <p className="text-2xl font-semibold text-gray-700 mb-4">
          No friend found 😕
        </p>
        <Button variant="outline" onClick={fetchFriend}>
          Try Again
        </Button>
      </div>
    </div>
  );
};

export default Page;
