"use client";

import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Dumbbell, LineChart, Activity, Sparkles } from "lucide-react";

interface SectionProps {
  title?: string;
  image: string;
  heading: string;
  text: string;
  buttonText: string;
  link: string;
  reverse?: boolean;
  icon?: React.ReactNode;
}

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden pb-32">
      
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      <div className="px-6 pt-20 md:pt-32 pb-14 max-w-7xl mx-auto">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center mb-24 sm:mb-32"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-500 font-bold text-sm mb-6 border border-red-500/20">
            <Sparkles className="w-4 h-4" />
            <span>Your Ultimate Fitness Companion</span>
          </div>
          
          <h1 className="font-black text-5xl md:text-7xl mb-6 tracking-tighter text-balance">
            Unleash your potential with <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-800 drop-shadow-sm">
              Repx
            </span>
          </h1>
          
          <p className="text-lg md:text-xl font-medium text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed text-balance">
            Every rep brings you closer to your strongest self. Build custom routines, track your progress, and challenge your friends to reach new heights.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
            <Link href="/sign-up">
              <Button className="w-full sm:w-auto h-14 px-8 rounded-full font-black text-lg bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-500/20 transition-transform hover:scale-105 active:scale-95">
                Start for free <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="w-full sm:w-auto h-14 px-8 rounded-full font-bold text-lg border-border hover:bg-muted transition-colors">
                I already have an account
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Feature Sections */}
        <div className="space-y-32 md:space-y-40">
          <Section
            icon={<Dumbbell className="w-6 h-6 text-red-500" />}
            image="/images/add.png"
            heading="Create Custom Workouts"
            text="Build personalized workout plans that fit your style and fitness goals. Start small, grow stronger, and stay consistent with routines tailored just for you."
            buttonText="Build a Routine"
            link="/sign-up"
            reverse={false}
          />

          <Section
            icon={<Activity className="w-6 h-6 text-red-500" />}
            image="/images/track.png"
            heading="Track Your Progress"
            text="Stay consistent by tracking sets, reps, and workout history — all in one place. Your journey, your progress, securely logged."
            buttonText="Start Tracking"
            link="/sign-up"
            reverse={true}
          />

          <Section
            icon={<LineChart className="w-6 h-6 text-red-500" />}
            image="/images/analysis.png"
            heading="Smart Insights"
            text="Analyze your workout data with simple and clear charts. Discover patterns, measure growth, and unlock your true physical potential."
            buttonText="View Analytics"
            link="/sign-up"
            reverse={false}
          />
        </div>

        {/* Closing Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 md:mt-40 text-center bg-muted/30 border border-border/50 rounded-[3rem] py-20 px-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-red-500/5 pointer-events-none" />
          <h2 className="font-black text-3xl md:text-5xl mb-6 tracking-tight relative z-10">
            ...and Much More
          </h2>
          <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed relative z-10">
            Repx is constantly evolving. From social challenges with friends to personalized AI suggestions, we are building the future of fitness tracking.
          </p>
        </motion.div>
      </div>

      {/* Floating Bottom Nav (Mobile/Tablet specific, but looks great everywhere) */}
      <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <div className="flex items-center gap-2 bg-background/80 backdrop-blur-xl border border-border shadow-2xl p-2 rounded-full pointer-events-auto">
          <Link href="/login">
            <Button variant="ghost" className="rounded-full px-6 font-bold hover:bg-muted">
              Login
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button className="rounded-full px-6 font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

/* Reusable Section Component */
const Section: React.FC<SectionProps> = ({ title, image, heading, text, buttonText, link, reverse, icon }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="max-w-6xl mx-auto"
    >
      {title && (
        <h2 className="text-center font-black text-3xl md:text-4xl mb-12 tracking-tight text-foreground">
          {title}
        </h2>
      )}
      
      <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
        
        {/* Image Side */}
        {/* We use md:order-last to alternate sides based on the 'reverse' prop */}
        <div className={`relative rounded-3xl overflow-hidden shadow-2xl border border-border/50 bg-muted aspect-[4/3] flex items-center justify-center group ${reverse ? "md:order-last" : ""}`}>
          <div className="absolute inset-0 bg-gradient-to-tr from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Image
            src={image}
            fill
            alt={heading}
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        {/* Text Content Side */}
        <div className="flex flex-col justify-center text-center md:text-left">
          {icon && (
            <div className="hidden md:flex bg-red-500/10 w-12 h-12 rounded-xl items-center justify-center mb-6 border border-red-500/20">
              {icon}
            </div>
          )}
          <h3 className="font-black text-3xl md:text-4xl mb-4 tracking-tight">{heading}</h3>
          <p className="mb-8 text-lg font-medium text-muted-foreground leading-relaxed">
            {text}
          </p>
          <div className="flex justify-center md:justify-start">
            <Link href={link}>
              <Button className="h-12 rounded-full px-8 font-bold bg-foreground text-background hover:bg-foreground/90 transition-transform hover:scale-105 active:scale-95">
                {buttonText}
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default LandingPage;