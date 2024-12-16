import Link from "next/link";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandItem,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandSeparator,
} from "@/components/ui/command";
import { useTeams } from "@/app/context/TeamsContext";

export function TeamDropdown() {
  const { teams, selectedTeam, setSelectedTeam, handleManageTeamsClick } =
    useTeams();
  const handleSelectedTeam = (team_id: number) => {
    const team = teams.find((team) => team.team_id === team_id);
    if (team) {
      setSelectedTeamName(team.team_info.team_name);
    }
  }
  const [selectedTeamName, setSelectedTeamName] = useState(teams && teams.length >= 1 ? handleSelectedTeam(0) : "Select Team");
  
  // useEffect so that placeholder updates when selectedTeam changes
  useEffect(() => {
    handleSelectedTeam(selectedTeam || 0);
  }, [selectedTeam]);

  return (
    <>
      <Select>
        <SelectTrigger className="w-[190px] text-xs hover:border-primary">
          <SelectValue
            placeholder={`${
              selectedTeamName 
            }`}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <Command className="w-[180px]">
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup
                  className="font-gray-400 font-medium"
                  heading="Options"
                >
                  <Link href="/manage-teams">
                    <CommandItem onSelect={handleManageTeamsClick}>
                      Manage Teams
                    </CommandItem>
                  </Link>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup
                  className="font-gray-400 font-medium"
                  heading="Teams"
                >
                  {teams.map((team) => (
                    <CommandItem
                      key={team.team_id}
                      onSelect={() => setSelectedTeam(team.team_id)}
                      value={team.team_info.team_name}
                    >
                      {team.team_info.team_name}
                      {selectedTeam === team.team_id && (
                        <Check size={20} className="ml-2" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </SelectGroup>
        </SelectContent>
      </Select>
    </>
  );
}