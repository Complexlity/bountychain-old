import Image from "next/image"

import Features from "@/components/features"

import gradient from "../../../public/purple-gradient.png"
// interface LandingLayoutProps {
//   children: React.ReactNode
// }

export default function LandingLayout() {
  return (
    <main className="grid h-screen lg:grid-cols-[2fr,3fr]">
      <div className="relative hidden lg:block">
        <Image
          className="absolute -z-10 h-full w-full object-cover dark:opacity-65"
          src={gradient}
          alt="gradient"
        />
        <Features />
      </div>
      <div className="flex items-center justify-center px-6">
        <main className="flex w-full flex-col items-center justify-center">
          Hello World. Welcom to bountychain
    </main>
      </div>
    </main>
  )
}


