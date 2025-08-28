import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";

interface SectionProps {
  title: string;
  image: string;
  heading: string;
  text: string;
  buttonText: string;
  link: string;
  reverse?: boolean; // optional
}

const LandingPage = () => {
  return (
    <>
      <div className="min-h-screen px-6 py-14">
        {/* Heading */}
        <h1 className="font-extrabold text-5xl md:text-6xl text-center mb-6 tracking-tight">
          Welcome to <span className="text-red-500 drop-shadow">Repx</span>
        </h1>
        <p className="text-center text-lg md:text-xl font-medium mb-20 max-w-2xl mx-auto leading-relaxed">
          “Every rep brings you closer to your strongest self 💪”
        </p>

        {/* Reusable Section Wrapper */}
        <div className="space-y-32">
          {/* Section: Create Workout */}
          <Section
            title="Create Your Own Workout"
            image="/images/add.png"
            heading="Create Custom Workout"
            text="Build personalized workout plans that fit your style and fitness goals. Start small, grow stronger, and stay consistent."
            buttonText="Get Started"
            link="/sign-up"
            reverse={false}
          />

          {/* Section: Track Workout */}
          <Section
            title="Track Your Workout"
            image="/images/track.png"
            heading="Track Your Progress"
            text="Stay consistent by tracking sets, reps, and workout history — all in one place. Your journey, your progress."
            buttonText="Track Now"
            link="/sign-up"
            reverse={true}
          />

          {/* Section: Analyse Data */}
          <Section
            title="Analyse Your Data"
            image="/images/analysis.png"
            heading="Smart Insights"
            text="Analyse your workout data with simple and clear insights. Discover patterns, measure growth, and unlock your true potential."
            buttonText="View Insights"
            link="/sign-up"
            reverse={false}
          />
        </div>

        {/* Section: More Features */}
        <div className="my-28 text-center">
          <h2 className="font-bold text-3xl md:text-4xl mb-6">
            ...and More Features
          </h2>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed">
            Repx is constantly evolving — from goal setting and progress charts
            to personalized AI suggestions. More exciting features are coming
            soon 🚀
          </p>
        </div>
      </div>

      {/* Bottom Fixed CTA */}
      <div className="flex justify-evenly items-center border-t fixed bottom-0 w-full pb-8 pt-4 dark:bg-black/40 bg-white/40 backdrop-blur-md shadow-lg">
        <Link href={"/sign-up"}>
          <Button className="cursor-pointer px-6" variant={"outline"}>
            Login
          </Button>
        </Link>
        <Link href={"/sign-up"}>
          <Button className="px-6" variant={"primary"}>
            Signup
          </Button>
        </Link>
      </div>
    </>
  );
};

/* Section Component */
const Section: React.FC<SectionProps> = ({ title, image, heading, text, buttonText, link, reverse }) => {
  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-center font-bold text-2xl md:text-3xl mb-12 tracking-tight">
        {title}
      </h2>
      <div
        className={`grid md:grid-cols-2 gap-12 items-center ${
          reverse ? "md:flex-row-reverse" : ""
        }`}
      >
        {/* Image */}
        <div className="rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:scale-105 flex justify-center">
          <Image
            src={image}
            width={450}
            height={280}
            alt={heading}
            className="rounded-lg object-cover"
          />
        </div>

        {/* Text Content */}
        <div className="rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 p-10 text-center flex flex-col justify-center items-center">
          <h3 className="font-semibold text-2xl md:text-3xl mb-4">{heading}</h3>
          <p className="mb-6 text-base md:text-lg leading-relaxed max-w-md">
            {text}
          </p>
          <Link href={link}>
            <Button className="px-6" variant="primary">
              {buttonText}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
