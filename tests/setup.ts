import { beforeEach } from "vitest";
import { prisma } from "@/lib/db";

beforeEach(async () => {
  await prisma.alertEvent.deleteMany();
  await prisma.priceSnapshot.deleteMany();
  await prisma.watchItem.deleteMany();
  await prisma.productCandidate.deleteMany();
  await prisma.searchSession.deleteMany();
  await prisma.platformStatus.deleteMany();
});
