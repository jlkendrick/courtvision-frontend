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
import Image from "next/image";


const stopzInput = z.object({
    threshold: z
    .string()
    .regex(/^\d+(\.\d+)?$/, 'Value must be a decimal number'),
    week: z.string().min(1).regex(/^\d+$/, { message: 'Week must be a number' })
  });

export function FeatureCard2() {
    const form = useForm<z.infer<typeof stopzInput>>({
        resolver: zodResolver(stopzInput),
    });

    const handleSubmit = async (values: z.infer<typeof stopzInput>) => {
        console.log(values);
    };
    
    return (
    <Card className="w-3/4">
        <CardHeader className="mb-[0rem]">
        <CardTitle>More coming soon!</CardTitle>
        </CardHeader>
    </Card>
    );
}
