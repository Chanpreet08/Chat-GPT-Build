"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";


export async function onBoard() {
  const user = await currentUser();

  console.log("user", user);
  if (!user) {
    throw new Error("Unauthorized")
  }

  const email = user.emailAddresses[0].emailAddress;

  return prisma.user.upsert({
    where: { clerkId: user.id },
    create: {
        clerkId: user.id,
        email: email,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
    },
    update: {
        email: email,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
    },
  })
}