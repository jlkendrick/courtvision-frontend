import { cn } from "@/utils/cn";
import React from "react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import {
  IconClipboardCopy,
  IconFileBroken,
  IconSignature,
  IconTableColumn,
} from "@tabler/icons-react";
import Image from "next/image";

export default function Home() {
  return (
    <BentoGrid className="max-w-4xl mx-auto md:auto-rows-[20rem]">
      {items.map((item, i) => (
        <BentoGridItem
          key={i}
          title={item.title}
          description={item.description}
          header={item.header}
          className={item.className}
          icon={item.icon}
        />
      ))}
    </BentoGrid>
  );
}
const Skeleton = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl   dark:bg-dot-white/[0.2] bg-dot-black/[0.2] [mask-image:radial-gradient(ellipse_at_center,white,transparent)]  border border-transparent dark:border-white/[0.2] bg-neutral-100 dark:bg-black">
    <Image src="/logo.png" alt="Your team grid picture" width={150} height={100}></Image>
  </div>
);
const items = [
  {
    title: "Your Team",
    description: "View Your Team.",
    header: <Skeleton />,
    className: "md:col-span-3",
    icon: <></>,
  },
  {
    title: "Lineup Generation",
    description: "See how you can use your player acquisitions to optimize your lineup.",
    header: <Skeleton />,
    className: "md:col-span-2",
    icon: <></>,
  },
  {
    title: "More Coming Soon",
    description: "Check back soon for new features.",
    header: <Skeleton />,
    className: "md:col-span-1",
    icon: <></>,
  },
];
