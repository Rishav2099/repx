import withAuth from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth?.token;

    //check if token exists and not allow authorized user to access auth pages
    if (
      (token && (pathname === "/login" || pathname === "/sign-up")) ||
      pathname.startsWith("/api/auth") 
    ) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // allow auth related routes
        if (
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/api/sign-up")
        ) {
          return true;
        }

        //public
        if (
          pathname === "/" ||
          pathname === "/login" ||
          pathname === "/sign-up"||
          pathname === "/images/analysis.png" ||
          pathname === "/images/add.png" ||
          pathname === "/images/track.png" 
        ) {
          return true;
        }

        return !!token;
      },
    },
  }
);
