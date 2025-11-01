"use client";

import FriendCard from "./FriendCard";

interface FriendListProps {
  data: {
    isError?: boolean;
    friends?: any[];
  };
  userId: string;
}

const FriendList = ({ data, userId }: FriendListProps) => {
  if (data?.isError) return <p>Error loading friends</p>;

  if (!data?.friends?.length)
    return (
      <div className="mt-20 flex justify-center items-center">
        <p>No Friends yet 😅</p>
      </div>
    );

  return (
    <>
      <h2 className="text-lg font-semibold mt-3 ml-3">Friends</h2>
      <div className="mt-5 w-[90vw] mx-auto flex flex-col gap-3">
        {data.friends.map((f: any) => {
          const otherUser =
            f.requester._id === userId ? f.recipient : f.requester;
          return (
            <FriendCard key={f._id} friend={otherUser} userId={userId} />
          );
        })}
      </div>
    </>
  );
};

export default FriendList;