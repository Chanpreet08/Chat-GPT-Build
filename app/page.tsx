import Image from "next/image";
import { ModeToggle } from "@/components/ui/mode-toggle";

export default function Home() {
  return (
    <div>
      <h1>Hello World</h1>
      <ModeToggle />
    </div>
  );
}
