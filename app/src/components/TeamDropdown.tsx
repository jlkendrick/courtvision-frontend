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
  CommandInput,
  CommandSeparator,
} from "@/components/ui/command";

export default function TeamDropdown({ teamDropdownState, setTeamDropdownState } : { teamDropdownState: any, setTeamDropdownState: any }) {

  return (
    <Select>
      <SelectTrigger className="w-[190px] text-xs hover:border-primary">
        <SelectValue placeholder="Select a Team" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <Command className="w-[180px]">
            <CommandInput placeholder="Search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup
                className="font-gray-400 font-medium"
                heading="Options"
              >
                <CommandItem>Manage Teams</CommandItem>        
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup
                className="font-gray-400 font-medium"
                heading="Teams"
              >
                <CommandItem>Team 1</CommandItem>
                <CommandItem>Team 2</CommandItem>
                <CommandItem>Team 3</CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
