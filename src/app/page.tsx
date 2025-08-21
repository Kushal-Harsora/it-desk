'use client';

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import React from 'react'

const Page = () => {

  const router = useRouter();

  return (
    <React.Fragment>
      <main className=' h-screen w-screen flex flex-col items-center justify-center gap-4'>
        Landing Page
        <div className='h-fit w-full flex flex-row items-center justify-center gap-2'>
          <Button onClick={() => router.push("/login")}>
            Login
          </Button>
          <Button onClick={() => router.push("/technician")}>
            Technician Login
          </Button>
        </div>
      </main>
    </React.Fragment>
  )
}

export default Page