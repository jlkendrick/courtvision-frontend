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
  SelectItem,
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
import { useTeams } from "@/app/context/TeamsContext";

// type ManageTeamsProps = {
//   manageTeamsState: any;
//   setManageTeamsState: React.Dispatch<
//     React.SetStateAction<{
//       selectedTeam: string;
//       teams: never[];
//       clickManageTeams: boolean;
//     }>
//   >;
// };

export function TeamDropdown() {

  const { teams, setSelectedTeam, handleManageTeamsClick } = useTeams();

  // if (teams.length === 0) {
  //   return <Skeleton className="w-[190px] h-[30px]" />;
  // }

  return (
    <>
      <Select>
        <SelectTrigger className="w-[190px] text-xs hover:border-primary">
          <SelectValue
            placeholder={`${
              teams.length ? teams[0].team_info.team_name : "No teams"
            }`}
          />
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
                  {teams.map((team) => (
                    <SelectItem onClick={() => setSelectedTeam(team.team_id)} value={team.team_info.team_name}>
                      {team.team_info.team_name}
                    </SelectItem>
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
  const { teams } = useTeams();

  return (
    <Table className="w-full">
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
        {teams.map((team) => (
          <TableRow key={team.team_id}>
            <TableCell className="font-medium">
              {team.team_info.team_name}
            </TableCell>
            <TableCell>{"N/A"}</TableCell>
            <TableCell>{team.team_info.league_id}</TableCell>
            <TableCell className="text-right">{team.team_info.year}</TableCell>
            <TableCell>
              <EditTeamMenubar team_id={team.team_id} />
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
function EditTeamMenubar({ team_id }: { team_id: number }) {

  return (
    <Menubar>
      <MenubarMenu>
        <EditTeamForm />
        <DeleteTeamConfirmation />
      </MenubarMenu>
    </Menubar>
  );
}

function EditTeamForm() {
  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="ghost" className="hover:bg-input ml-[-5px]">
          <Pencil size={20} />
        </Button>
      </DialogTrigger>
      
      
    </Dialog>
  );
}

function DeleteTeamConfirmation() {

  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="ghost" className="hover:bg-input mr-[-5px]">
          <Trash2 size={20} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Team</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this team?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" className="mr-2">
            Cancel
          </Button>
          <Button variant="default">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddTeamForm() {
  const { addTeam } = useTeams();

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
    setSubmitted(false);
    reset();
  };

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (values: z.infer<typeof leagueInfoSchema>) => {
    setSubmitted(true);

    console.log(values);
    const response = await addTeam(
      values.leagueID,
      values.teamName,
      values.leagueYear,
      values.s2,
      values.swid
    );
    setSubmitted(false);
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
