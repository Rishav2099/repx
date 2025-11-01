import { FriendProvider } from "@/context/ChallengeContext";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <FriendProvider>{children}</FriendProvider>
    </>
  );
};

export default layout;
