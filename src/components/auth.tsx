"use client"

import { useAuth } from "@/components/auth-provider"
import { LoadingButton } from "@/components/ui/button.loader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { useUser } from "@/hooks/use-user"
import { Email } from "@/types/turnkey"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTurnkey } from "@turnkey/sdk-react"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import OrSeparator from "@/components/ui/or-separator"

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export default function Auth({setShowAuthModal}: {setShowAuthModal: React.Dispatch<React.SetStateAction<boolean>>}) {
  const { refreshUser } = useUser()
  const { passkeyClient } = useTurnkey()
  const { initEmailLogin, state, loginWithPasskey, loginWithWallet } = useAuth()
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const searchParams = useSearchParams()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  useEffect(() => {
    const qsError = searchParams.get("error")
    if (qsError) {
      toast({
        title: qsError
      })
    }
  }, [searchParams])

  const handlePasskeyLogin = async (email: Email) => {
    setLoadingAction("passkey")
    if (!passkeyClient) {
      setLoadingAction(null)
      return
    }

    await loginWithPasskey(email).then(() => {
      refreshUser()
      setShowAuthModal(false)
    })
    setLoadingAction(null)
  }

  const handleEmailLogin = async (email: Email) => {
    setLoadingAction("email")
    await initEmailLogin(email)
    // TODO: Do email magic link login
    setLoadingAction(null)
  }

  const handleWalletLogin = async () => {
    setLoadingAction("wallet")
    await loginWithWallet().then(() => {
      refreshUser()
      setShowAuthModal(false)
    })
    setLoadingAction(null)

  }

  return (
    <>

      <Card className="mx-auto w-full max-w-[500px]">
        <CardHeader className="space-y-4">
          {/* <Icons.turnkey className="h-16 w-full stroke-0 py-2 dark:stroke-white" /> */}

          <CardTitle className="text-center text-xl font-medium">
            Log in or sign up
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(() => {})} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <LoadingButton
                type="submit"
                className="w-full font-semibold"
                disabled={!form.formState.isValid}
                loading={state.loading && loadingAction === "passkey"}
                onClick={() =>
                  handlePasskeyLogin(form.getValues().email as Email)
                }
              >
                Continue with passkey
              </LoadingButton>

              <LoadingButton
                type="button"
                variant="outline"
                className="w-full font-semibold"
                disabled={!form.formState.isValid}
                onClick={() =>
                  handleEmailLogin(form.getValues().email as Email)
                }
                loading={state.loading && loadingAction === "email"}
              >
                Continue with email
              </LoadingButton>
              <OrSeparator />
              <LoadingButton
                type="button"
                variant="outline"
                className="w-full font-semibold"
                onClick={() => handleWalletLogin()}
                loading={state.loading && loadingAction === "wallet"}
              >
                Continue with wallet
              </LoadingButton>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  )
}

