"use client"
import dynamic from "next/dynamic"

const Map = dynamic(() => import("./MapComponent"), { ssr: false })

export default function DynamicMap({ data }: { data: any }) {
  return <Map data={data} />
}
