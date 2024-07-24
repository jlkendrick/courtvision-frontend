"use client";
import { useLineup } from "@/app/context/LineupContext";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import StopzForm from "@/components/StopzForm";
import LineupDisplay from "@/components/LineupDisplay";

function SkeletonCard() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[125px] w-[250px] rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}

export default function LineupGeneration() {
  const { lineup, isLoading } = useLineup();

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Lineup Generation</h1>
      </div>
      <div className="flex flex-1 justify-center rounded-lg border border-primary border-dashed shadow-sm">
        <section className="py-5 flex-row gap-3">
          <div>
            <StopzForm />
          </div>

          <div className="flex flex-col items-center">
            <Separator
              orientation="horizontal"
              className="w-3/4 my-4 bg-primary"
            />
            {isLoading ? (
              <>
                <SkeletonCard />
              </>
            ) : (
              <>
                <LineupDisplay lineup={lineup} />
              </>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
