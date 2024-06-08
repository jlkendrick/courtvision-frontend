import { ESPN_FANTASY_API_ENDPOINT } from "@/endpoints";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Trash2, Pencil } from "lucide-react";
import {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
  FormItem,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { toast } from "sonner";

type ManageTeamsProps = {
  manageTeamsState: any;
  setManageTeamsState: React.Dispatch<
    React.SetStateAction<{
      selectedTeam: string;
      teams: never[];
      clickManageTeams: boolean;
    }>
  >;
};


const teams_info = [
  {
    team_id: "1",
    team_name: "James's Scary Team",
    league_name: "San Antonio H2H Points",
    league_id: "424233486",
    year: "2024",
  },
  {
    team_id: "2",
    team_name: "Lvl. 3 Goblins",
    league_name: "Austin H2H Points",
    league_id: "424233487",
    year: "2024",
  },
  {
    team_id: "3",
    team_name: "The Big Dippers",
    league_name: "Dallas H2H 8Cat",
    league_id: "424233488",
    year: "2024",
  },
];

export function TeamDropdown({
  manageTeamsState,
  setManageTeamsState,
}: ManageTeamsProps) {
  const handleManageTeamsClick = () => {
    setManageTeamsState({ ...manageTeamsState, clickManageTeams: true });
    console.log("Manage Teams clicked" + manageTeamsState.clickManageTeams);
  };

  return (
    <>
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
                  <CommandItem onSelect={handleManageTeamsClick}>
                    Manage Teams
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup
                  className="font-gray-400 font-medium"
                  heading="Teams"
                >
                  {teams_info.map((team) => (
                  <CommandItem>{team.team_name}</CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* Manage Teams Drawer
      {teamDropdownState.clickManageTeams && (
        <ManageTeamsDrawer
          clickManageTeams={teamDropdownState.clickManageTeams}
          setClickManageTeams={setTeamDropdownState}
        />
      )} */}
    </>
  );
}

// function ManageTeamsDrawer({
//   clickManageTeams,
//   setClickManageTeams,
// }: {
//   clickManageTeams: boolean;
//   setClickManageTeams: (teamDropdownState: any) => void;
// }) {
//   const handleManageTeamsClose: () => void = () => {
//     setClickManageTeams(false);
//   };

//   const handleFormSubmit: (e: React.FormEvent) => void = (e) => {
//     e.preventDefault();
//     console.log("Form submitted");
//   };

//   return (
//     <Drawer isOpen={clickManageTeams} onClose={handleManageTeamsClose}>
//       <DrawerTrigger asChild>
//         <Button variant="outline" className="mr-2 hover:border-primary">
//           Sign In
//         </Button>
//       </DrawerTrigger>
//       <DrawerContent>
//         <form onSubmit={handleFormSubmit}>
//           <ManageTeamsTable />
//           <DrawerFooter>
//             <Button type="submit">Save Changes</Button>
//             <DrawerClose asChild>
//               <Button variant="outline">Cancel</Button>
//             </DrawerClose>
//           </DrawerFooter>
//         </form>
//       </DrawerContent>
//     </Drawer>
//   );
// }

export function ManageTeamsTable() {
  return (
    <Table>
      <TableCaption>Add, delete, or edit teams.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Team Name</TableHead>
          <TableHead>League Name</TableHead>
          <TableHead>League ID</TableHead>
          <TableHead className="text-right w-[50px]">Year</TableHead>
          <TableHead className="w-[100px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {teams_info.map((team) => (
          <TableRow key={team.team_id}>
            <TableCell className="font-medium">{team.team_name}</TableCell>
            <TableCell>{team.league_name}</TableCell>
            <TableCell>{team.league_id}</TableCell>
            <TableCell className="text-right">{team.year}</TableCell>
            <TableCell>
              <EditTeamMenubar />
            </TableCell>
          </TableRow>
        ))}
        <TableRow>
          <TableCell colSpan={5}>
            <AddTeamForm />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

// This is part of the ManageTeamsTable component, no need to export
function EditTeamMenubar() {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>
          <Pencil size={20} />
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            New Tab <MenubarShortcut>⌘T</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            New Window <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>New Incognito Window</MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Share</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Email link</MenubarItem>
              <MenubarItem>Messages</MenubarItem>
              <MenubarItem>Notes</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>
            Print... <MenubarShortcut>⌘P</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>
          <Trash2 size={20} />
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Undo <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Find</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Search the web</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Find...</MenubarItem>
              <MenubarItem>Find Next</MenubarItem>
              <MenubarItem>Find Previous</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>Cut</MenubarItem>
          <MenubarItem>Copy</MenubarItem>
          <MenubarItem>Paste</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

function AddTeamForm() {
  const leagueInfoSchema = z.object({
    leagueID: z
      .string()
      .min(1)
      .regex(/^\d+$/, { message: "League ID must be a number" }),
    leagueYear: z
      .string()
      .min(1)
      .regex(/^\d+$/, { message: "League Year must be a number" }),
    teamName: z.string().min(1),
    s2: z.string().optional(),
    swid: z.string().optional(),
  });

  interface leagueInfoRequest {
    league_id: number;
    espn_s2?: string;
    swid?: string;
    team_name: string;
    year: number;
  }

  const form = useForm<z.infer<typeof leagueInfoSchema>>({
    resolver: zodResolver(leagueInfoSchema),
    defaultValues: {
      leagueID: "",
      leagueYear: "",
      teamName: "",
      s2: "",
      swid: "",
    },
  });
  const reset = form.reset;

  const handleClearClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    reset();
  };

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (values: z.infer<typeof leagueInfoSchema>) => {
    setSubmitted(true);

    console.log(values);

    const request: leagueInfoRequest = {
      league_id: parseInt(values.leagueID),
      espn_s2: values.s2,
      swid: values.swid,
      team_name: values.teamName,
      year: parseInt(values.leagueYear),
    };

    try {
      const response = await fetch(
        `${ESPN_FANTASY_API_ENDPOINT}/validate_league/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        }
      );

      setSubmitted(false);

      const data = await response.json();
      console.log(data);

      if (data.valid) {
        toast.success("Team found.");
      } else {
        toast.error("Invalid league information. Please try again.");
      }
    } catch (error) {

      toast.error("Internal server error. Please try again later.");
      setSubmitted(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="w-full">
        <Button
          variant="outline"
          className="flex justify-start w-full hover:bg-input"
        >
          + Add Team
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Team</DialogTitle>
          <DialogDescription>
            Find your ESPN fantasy basketball league.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-3"
          >
            <FormField
              control={form.control}
              name="leagueID"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>
                      League ID
                      <span style={{ color: "red" }}> *</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="leagueYear"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>
                      League Year<span style={{ color: "red" }}> *</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="YYYY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="teamName"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>
                      Team Name<span style={{ color: "red" }}> *</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <hr></hr>
            <DialogDescription>For private leagues.</DialogDescription>

            <FormField
              control={form.control}
              name="s2"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>ESPN s2</FormLabel>
                    <FormControl>
                      <Input placeholder="s2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="swid"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>SWID</FormLabel>
                    <FormControl>
                      <Input placeholder="SWID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <div className="flex justify-between pl-0 pr-0 mb-[-1rem]">
              <Button
                type="button"
                className="size-sm bg-primary"
                onClick={handleClearClick}
              >
                <Image
                  src="/clear.png"
                  alt="clear"
                  width={30}
                  height={30}
                  fill-true
                />
              </Button>
              <Button type="submit" className="size-sm bg-primary">
                <Image
                  src="/arrow.png"
                  alt="submit"
                  width={30}
                  height={30}
                  fill-true
                />
              </Button>
            </div>
            <div className="text-center justify-center items-center">
              <Skeleton
                className={` ${
                  submitted
                    ? "h-4 mt-5 w-full justify-center items-center"
                    : "hidden"
                }`}
              ></Skeleton>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
