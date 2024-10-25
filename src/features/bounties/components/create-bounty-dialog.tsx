"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { insertBountiesSchema } from "@/db/schema";
import { useCreateBounty } from "@/features/bounties/hooks/use-create-bounty";
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useAccount, useWriteContract } from "wagmi";
import { z } from "zod";
import { createBounty } from "../lib/queries";

const formSchema = z.object({
  title: z.string().min(1, {
    message: "Title not provided",
  }),
  description: z.string().min(1, {
    message: "Description not provided",
  }),
  amount: z.coerce
    .number({
      required_error: "Amount not provided",
      invalid_type_error: "Amount must be a number",
    })
    .min(0, {
      message: "Amount must be greater than 0",
    }),
});

type CreateBountySchema = z.infer<typeof insertBountiesSchema>;

export function CreateBountyDialog({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { isConnected } = useAccount();
  const [container, setContainer] = useState(null);
  const { openConnectModal } = useConnectModal();
  const { address, chain } = useAccount();
  const queryClient = useQueryClient();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      amount: 0,
    },
  });

  const { mutate: sendDataToDb, isPending: isSendingDataToDb } = useMutation({
    mutationKey: ["createBounty"],
    mutationFn: async (data: CreateBountySchema) => {
      const res = await fetch("/api/bounties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        throw result;
      }
      const returned = result as Awaited<ReturnType<typeof createBounty>>;
      return returned;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bounties"] });
      form.reset();
      toast({
        title: "Bounty created successfully",
      });
      setOpen(false);
      router.push(`/bounty/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error creating bounty",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { writeContractAsync } = useWriteContract();

  const {
    mutateAsync: createBountyOnChain,
    isPending: isCreatingBountyOnchain,
  } = useCreateBounty({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-expect-error
    writeContractAsync,
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!address || !chain) {
      toast({
        title: "Address not found. Please connect your wallet",
        variant: "destructive",
      });
      setOpen(false);
      return;
    }
    const { bountyId, hash } = await createBountyOnChain(values.amount);

    if (!bountyId) {
      toast({
        title: "Something went wrong creating bounty",
        description:
          "Please copy your transaction hash from the alert for dispute",
      });
      alert(`Transaction hash ${hash}`);
      return;
    }
    const data: CreateBountySchema = {
      title: values.title,
      description: values.description,
      amount: Number(values.amount),
      creator: address,
      id: bountyId,
    };

    sendDataToDb(data);
  };

  return (
    <div>
      <Dialog open={open && isConnected} onOpenChange={setOpen}>
        <DialogTrigger
          asChild
          onClick={!isConnected ? openConnectModal : () => {}}
        >
          {children ? children : <Button>Create Bounty</Button>}
        </DialogTrigger>
        <DialogContent
          className="sm:max-w-[425px]"
          portalContainer={container}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <>
            <DialogHeader>
              <DialogTitle>Create New Bounty</DialogTitle>

              <DialogDescription>
                Fill in the details for your new bounty. Click create when
                you&apos;re done.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          className="rounded-none"
                          placeholder="cool title for your bounty"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input
                          className="rounded-none"
                          placeholder="give the user some additional information to help"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input
                          className="rounded-none"
                          type="number"
                          placeholder="amount to be paid"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  isLoading={isSendingDataToDb || isCreatingBountyOnchain}
                  type="submit"
                >
                  Submit
                </Button>
              </form>
            </Form>
          </>
        </DialogContent>
      </Dialog>
      <div
        // @ts-expect-error: ref accepts set state action
        ref={setContainer}
        className="dialog-portal bg-transparent"
      />
    </div>
  );
}
