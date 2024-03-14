"use client";
import * as z from "zod";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "./ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const stopzInput = z.object({
    threshold: z.number().min(1).max(82),
  });

export function FeatureCard() {
    const form = useForm<z.infer<typeof stopzInput>>({
        resolver: zodResolver(stopzInput),
        defaultValues: {
            threshold: 30.0,
        },
    });

    const handleSubmit = async (values: z.infer<typeof stopzInput>) => {
        console.log(values);
    };
    
    return (
    <Card className="w-3/4">
        <CardHeader>
        <CardTitle>Streaming Optimization</CardTitle>
        <CardDescription>
            Find the optimal streaming schedule for your league.
        </CardDescription>
        </CardHeader>
        <CardContent className="w-full">
            <Form {...form}>

            <form
            onSubmit={form.handleSubmit(handleSubmit)}>

                <section className="flex justify-center">
                    <div className="flex flex-col items-center justify-center w-full">
                        <FormField
                            control={form.control}
                            name="threshold"
                            render={({ field }) => {
                                return (
                                    <FormItem className="w-full">
                                        <FormLabel>Threshold for streamable players<span style={{ color: 'red'}}> *</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="ex. 31.0" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
                        />
                    </div>

                    <div className="flex flex-col items-center justify-end">
                        <Button className="ml-2" type="submit" variant="default" size="default">
                            Submit
                        </Button>
                    </div>
                </section>

            </form>

            </Form>
        </CardContent>
    </Card>
    );
}