// ✅ FriendList.tsx
"use client";
import FriendCard from "./FriendCard";

interface User {
  _id: string;
  name: string;
}

interface Friend {
  _id: string;
  requester: User;
  recipient: User;
}

interface FriendListProps {
  friends: Friend[];
  userId: string;
  isError?: boolean;
}

const FriendList = ({ friends, userId, isError }: FriendListProps) => {
  if (isError) return <p>Error loading friends</p>;
  if (!friends?.length)
    return (
      <div className="mt-20 flex justify-center items-center">
        <p>No Friends yet 😅</p>
      </div>
    );

  return (
    <>
      <h2 className="text-lg font-semibold mt-3 ml-3">Friends</h2>
      <div className="mt-5 w-[90vw] mx-auto flex flex-col gap-3">
        {friends.map((f) => {
          const otherUser = f.requester._id === userId ? f.recipient : f.requester;
          return <FriendCard key={f._id} friend={otherUser} userId={userId} />;
        })}
      </div>
    </>
  );
};

export default FriendList;
