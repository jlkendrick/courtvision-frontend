"use client";

import React from "react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";

import { User } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  IconChartArrowsVertical,
  IconCloud,
  IconClockHour4,
  IconTrendingUp,
  IconChartPie,
  IconChessKnight,
} from "@tabler/icons-react";

export default function Home() {

  return (
    <>
    <div className="flex items-center">
      <h1 className="text-lg font-semibold md:text-2xl">Home</h1>
    </div>
    <div className="flex flex-1 justify-center rounded-lg border border-primary border-dashed shadow-sm">
      <div className="flex flex-col items-center gap-1 text-center">
        <FeaturesSectionDemo />
      </div>
    </div>

    </>
  );
}

function FeaturesSectionDemo() {
  const features = [
    {
      title: "Advanced tools",
      description:
        "Bringing you insights to help you win your ESPN Points league.",
      icon: <IconChessKnight />,
      page: "/",
    },
    {
      title: "Analyze Your Teams",
      description:
        "Get a broad snapshot of your teams.",
      icon: <IconChartPie />,
      page: "/your-teams",
    },
    {
      title: "Lineup Generation",
      description:
        "Optimize your streaming moves for the week.",
      icon: <IconTrendingUp />,
      page: "/lineup-generation",
    },
    {
      title: "Standings",
      description:
        "View the rankings of all fantasy basketball players, updated daily.",
      icon: <IconChartArrowsVertical />,
      page: "/standings",
    },
    {
      title: "Account",
      description: "Login to your account or create an account.",
      icon: <User />,
      page: "/account",
    },
    {
      title: "More Coming Soon",
      description: "As a solo developer, I am working hard to bring you more features.",
      icon: <IconClockHour4 />,
      page: "/new-features",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  relative z-10 py-10 max-w-7xl mx-auto">
      {features.map((feature, index) => (
        <Link href={feature.page} key={feature.title} passHref>
          <Feature key={feature.title} {...feature} index={index} />
        </Link>
      ))}
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    
    <div
      className={cn(
        "m-1 flex flex-col rounded-lg border lg:border-r  py-10 relative group/feature dark:border-neutral-800",
        (index === 0 || index === 4) && "lg:border-l dark:border-neutral-800",
        index < 4 && "lg:border-b dark:border-neutral-800"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-neutral-600 dark:text-neutral-400">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-primary transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800 dark:text-neutral-100">
          {title}
        </span>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};

const Skeleton = () => (
  <>
    <div className="group/canvas-card flex items-center justify-center max-w-full w-full mx-auto p-4 relative h-[30rem] relative">
      <AnimatePresence>
        <div className="h-full w-full absolute inset-0">
          <CanvasRevealEffect
            animationSpeed={3.8}
            containerClassName="bg-white dark:bg-black"
            colors={[
              [252, 115, 3],
              [34, 37, 69],
              [203, 203, 209],
            ]}
            dotSize={4}
          />
        </div>
      </AnimatePresence>
    </div>
  </>
);

const items = [
  {
    title: "Your Teams",
    description: "View Your Teams.",
    header: <Skeleton />,
    className: "md:col-span-3 justify-end border-gray-300",
    icon: <></>,
    page: "/your-teams",
  },
  {
    title: "Lineup Generation",
    description:
      "See how you can use your player acquisitions to optimize your lineup.",
    header: <Skeleton />,
    className: "md:col-span-2 justify-end border-gray-300",
    icon: <></>,
    page: "/lineup-generation",
  },
  {
    title: "More Coming Soon",
    description: "Check back soon for new features.",
    header: <Skeleton />,
    className: "md:col-span-1 justify-end border-gray-300",
    icon: <></>,
    page: "/",
  },
];

function InfiniteMovingFeatures() {
  return (
    // <div className="h-[30rem] rounded-md flex flex-col antialiased bg-white dark:bg-black dark:bg-grid-white/[0.05] items-center justify-center relative overflow-hidden">
      <InfiniteMovingCards
        className="w-full mx-auto md:auto-rows-[17rem]"
        items={features}
        direction="right"
        speed="slow"
      />
    // </div>
  );
}

const features = [
  {
    quote:
      "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair.",
    name: "Charles Dickens",
    title: "A Tale of Two Cities",
  },
  {
    quote:
      "To be, or not to be, that is the question: Whether 'tis nobler in the mind to suffer The slings and arrows of outrageous fortune, Or to take Arms against a Sea of troubles, And by opposing end them: to die, to sleep.",
    name: "William Shakespeare",
    title: "Hamlet",
  },
  {
    quote: "All that we see or seem is but a dream within a dream.",
    name: "Edgar Allan Poe",
    title: "A Dream Within a Dream",
  },
  {
    quote:
      "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
    name: "Jane Austen",
    title: "Pride and Prejudice",
  },
  {
    quote:
      "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.",
    name: "Herman Melville",
    title: "Moby-Dick",
  },
];

{/* <BentoGrid className="max-w-4xl mx-auto md:auto-rows-[17rem]">
{items.map((item, i) => (
  <Link href={item.page} key={i} passHref>
    <BentoGridItem
      key={i}
      title={item.title}
      description={item.description}
      header={item.header}
      className={item.className}
      icon={item.icon}
    />
  </Link>
))}
</BentoGrid> */}