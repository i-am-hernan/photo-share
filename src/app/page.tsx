'use client';

import Share from "@/components/custom/Share";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dancing_Script, Playfair_Display } from 'next/font/google';
import Album from "@/components/custom/Album";

const dancingScript = Dancing_Script({ weight: '400', subsets: ["latin"] });
const playfairDisplay = Playfair_Display({ weight: '400', subsets: ["latin"] })

export default function Home() {

  return (
    <main className="h-100">
      <Tabs defaultValue="share" className='items-center'>
        <TabsList className="justify-center">
          <TabsTrigger value="share" className={`${playfairDisplay.className} text-[1rem]`}>Upload</TabsTrigger>
          <TabsTrigger value="album" className={`${playfairDisplay.className} text-[1rem]`}>Album</TabsTrigger>
        </TabsList>
        <TabsContent value="share">
          <h2 className={`text-1xl text-center mb-2 text-gray-500 text-[1.5em] ${dancingScript.className}`}>Please share your photos with us</h2>
          <Share />
        </TabsContent>
        <TabsContent value="album">
          <Album />
        </TabsContent>
      </Tabs>
    </main>
  );
}
