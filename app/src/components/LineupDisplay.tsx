export default function LineupDisplay({ data }: { data: any }) {
    return (
        <div className="flex flex-col items-center gap-1 w-3/4">
            {data.length == 0 ? (
                <h1 className="text-center">Enter your threshold for considering a player &quot;streamable&quot; and the week you wish to generate a lineup for to get started.</h1>
            ) : (
                <div>
                    <h1>Optimal Lineup for Week {data.week}</h1>
                </div>
            )}
        </div>
    );
}