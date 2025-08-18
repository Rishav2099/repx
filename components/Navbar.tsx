"use client";

import { ChartLine, CirclePlus, Home, Timer } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

const Navbar = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const hideNavbarPaths = ["/login", "/register"];

  if (pathname.startsWith("/workout") || !session || hideNavbarPaths.includes(pathname)) {
    return null;
  }

  // helper fn for active state
  const isActive = (path: string) => pathname === path;

  return (
    <div>
      <ul className="flex justify-evenly items-center w-full py-3 border-t-2 text-xs">
        <li
          className={`flex flex-col items-center cursor-pointer ${
            isActive("/") ? "text-red-600 font-semibold" : "text-gray-600"
          }`}
          onClick={() => router.push("/")}
        >
          <Home />
          <span>Home</span>
        </li>

        <li
          className={`flex flex-col items-center cursor-pointer ${
            isActive("/track") ? "text-red-600 font-semibold" : "text-gray-600"
          }`}
          onClick={() => router.push("/track")}
        >
          <ChartLine />
          <span>Track</span>
        </li>

        <li
          className={`flex flex-col items-center cursor-pointer ${
            isActive("/add") ? "text-red-600 font-semibold" : "text-gray-600"
          }`}
          onClick={() => router.push("/workout/add")}
        >
          <CirclePlus />
          <span>Add</span>
        </li>

        <li
          className={`flex flex-col items-center cursor-pointer ${
            isActive("/timer") ? "text-red-600 font-semibold" : "text-gray-600"
          }`}
          onClick={() => router.push("/timer")}
        >
          <Timer />
          <span>Timer</span>
        </li>
      </ul>
    </div>
  );
};

export default Navbar;
