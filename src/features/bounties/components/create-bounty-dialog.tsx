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
import { Textarea } from "@/components/ui/textarea";
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
import { SupportedChainKey, supportedChains } from "@/lib/viem";

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
    .positive({
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
  const activeChain = process.env.NEXT_PUBLIC_ACTIVE_CHAIN as SupportedChainKey;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      amount: 0,
    },
  });

  const { mutate: sendDataToBackupServer } = useMutation({
    mutationKey: ["backupBounty"],
    mutationFn: async (data: CreateBountySchema) => {
      const baseUrl = process.env.NEXT_PUBLIC_BACKUP_SERVER;
      const res = await fetch(`${baseUrl}/bounties`, {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bounties"] });
      form.reset();
      toast({
        title: "Bounty created on backup",
        description:
          "Please wait an hour for the bounty to be created on main db",
      });
      setOpen(false);
      router.push(`/`);
    },
    onError: async (error, data) => {
      sendDataToBackupServer(data);
      toast({
        title: "Error creating bounty",
        description: error.message,
        variant: "destructive",
      });
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
    onError: async (error, data) => {
      sendDataToBackupServer(data);
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
    const bountyData = {
      title: values.title,
      description: values.description,
      amount: Number(values.amount),
      creator: address,
      chainId: supportedChains[activeChain].chain.id,
    };

    const { bountyId } = await createBountyOnChain(values.amount).catch((e) => {
      toast({
        title: "Something went wrong creating bounty",
        description: e.message,
        variant: "destructive",
      });
      return { bountyId: null, hash: null };
    });

    if (bountyId) {
      const data: CreateBountySchema = { ...bountyData, id: bountyId };
      sendDataToDb(data);
    }
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
          className="sm:max-w-[425px] rounded-none sm:rounded-none"
          portalContainer={container}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-3xl">
                Create New Bounty
              </DialogTitle>

              <DialogDescription className="text-center">
                Fill in the details for your new bounty.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-4 rounded-none"
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
                          placeholder="title for your bounty"
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
                        <Textarea
                          className="rounded-none min-h-[100px] resize-y"
                          placeholder="Provide detailed information about your bounty..."
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
                  className="rounded-none"
                  isLoading={isSendingDataToDb || isCreatingBountyOnchain}
                  type="submit"
                >
                  Submit
                </Button>
              </form>
            </Form>
          </>
        </DialogContent>
        <div
          // @ts-expect-error: ref accepts set state action
          ref={setContainer}
          className="dialog-portal bg-transparent bg-orange-400"
        />
      </Dialog>
    </div>
  );
}
