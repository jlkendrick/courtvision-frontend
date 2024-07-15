"use client";

import React from "react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function Home() {

  return (
    <BentoGrid className="max-w-4xl mx-auto md:auto-rows-[17rem]">
      {items.map((item, i) => (
        <Link href={item.page} passHref>
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
    </BentoGrid>
  );
}

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
    page: "/teams",
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
