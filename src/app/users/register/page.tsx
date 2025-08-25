'use client';

// System Components import
import Image from 'next/image'
import React from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import axios, { AxiosResponse } from "axios"
import { useRouter } from 'next/navigation'

// UI Components import
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'


const formSchema = z.object({
    name: z.string(),
    email: z.email(),
    password: z.string(),
    number: z.string(),
});

const Page = () => {

    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            number: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {

        try {
            const response: AxiosResponse = await axios.post('/api/user/', values, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = response.data;
            console.log(data);
            if (response.status === 201) {
                window.localStorage.setItem("name", data.name);
                window.localStorage.setItem("email", data.email);
                toast.success(data.message || "Account created successfully!", {
                    style: {
                        "backgroundColor": "#D5F5E3",
                        "color": "black",
                        "border": "none"
                    },
                    duration: 1500
                });
                form.reset();
                router.push('/users/login');
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                const { status, data } = error.response;
                if (status === 400) {
                    toast.error(data.error || "Missing fields!!", {
                        style: {
                            "backgroundColor": "#FADBD8",
                            "color": "black",
                            "border": "none"
                        },
                        duration: 2500
                    })
                    form.resetField('password');
                } else {
                    toast.error(data.error || "Some Error Occured", {
                        style: {
                            "backgroundColor": "#FADBD8",
                            "color": "black",
                            "border": "none"
                        },
                        duration: 2500
                    });
                    form.reset();
                }
            } else {
                toast.error("An unexpected error occurred. Please try again.", {
                    invert: false,
                    duration: 2500
                });
            }
        }
    }

    return (
        <React.Fragment>
            <main className=' h-screen w-screen overflow-hidden flex flex-row justify-center items-center'>
                <section className=' bg-white max-w-[50vw] max-md:max-w-[100vw] w-full h-screen overflow-hidden flex flex-col justify-center items-center gap-5'>
                    <h1 className=' text-3xl font-bold z-20 max-md:text-black'>
                        LOGIN
                    </h1>
                    <Card className=' max-w-[30vw] max-md:max-w-[75vw] max-lg:max-w-[40vw] w-full max-md:z-10'>
                        <CardHeader>
                            <CardTitle>User Registration</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input className='placeholder:text-gray-800 border-black' placeholder="enter your " type='text' {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input className='placeholder:text-gray-800 border-black' placeholder="someone@example.com" type='email' {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input className='placeholder:text-gray-800 border-black' placeholder="password" type='password' {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="number"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone Number</FormLabel>
                                                <FormControl>
                                                    <Input className='placeholder:text-gray-800 border-black' placeholder="enter mobile number" type='text' {...field}
                                                        pattern="[0-9]{10}"
                                                        maxLength={10} 
                                                        required />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className=' w-full h-fit flex items-center justify-center'>
                                        <Button
                                            type="submit"
                                            className='cursor-pointer rounded-sm bg-green-500 hover:bg-green-600 max-w-sm w-full'>
                                            Submit
                                        </Button>
                                    </div>
                                    Already have an account...? <a href="/users/login/">Login</a>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </section>
                <Image
                    src={'/assets/admin.jpg'}
                    alt='Admin Page'
                    width={800}
                    height={800}
                    className='w-full max-w-[50vw] h-screen object-cover max-md:absolute max-md:left-0 max-md:top-0 max-md:z-0 max-md:max-w-[100vw] max-md:blur-md'
                    priority
                />
            </main>
        </React.Fragment>
    )
}

export default Page