"use client";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";

const leagueInfoSchema = z.object({
  leagueID: z.string(),
  leagueYear: z.string(),
  teamName: z.string(),
  s2: z.string(),
  swid: z.string(),
});

export default function LeagueInfoForm() {
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

  const handleSubmit = () => {};

  return (
    <div className="w-full pl-8 pr-4">
      <Card>
        <CardHeader>
          <CardTitle>League Info</CardTitle>
          <CardDescription>
            Find your ESPN fantasy basketball league.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex flex-col gap-3">

              <FormField
                control={form.control}
                name="leagueID"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>League ID<span style={{ color: 'red'}}> *</span></FormLabel>
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
                      <FormLabel>League Year<span style={{ color: 'red'}}> *</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Year" {...field} />
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
                      <FormLabel>Team Name<span style={{ color: 'red'}}> *</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

							<hr className="border-primary"></hr>
							<CardDescription>For private leagues.</CardDescription>

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

              <CardFooter className="flex justify-between pl-0 pr-0">
                <Button type="button" className="w-1/3">
                  Clear
                </Button>
                <Button type="submit" className="w-1/3">
                  Find
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
