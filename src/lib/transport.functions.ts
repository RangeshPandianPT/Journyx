import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  getCabProvider,
  getMetroProvider,
  getSeatedProvider,
  getTrainProvider,
} from "@/lib/providers/registry";

/**
 * Server layer. All transport reads go through these typed endpoints, which
 * delegate to the service/provider layer. No business logic lives in
 * components, and any future provider credentials are read from process.env
 * inside handlers only.
 */

const searchSchema = z.object({
  from: z.string().min(2).max(60),
  to: z.string().min(2).max(60),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a valid travel date"),
  passengers: z.number().int().min(1).max(6),
});

const tripIdSchema = z.object({ tripId: z.string().min(4).max(120) });

export const searchBusTrips = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => searchSchema.parse(input))
  .handler(async ({ data }) => {
    if (data.from.trim().toLowerCase() === data.to.trim().toLowerCase()) {
      return {
        status: "UNAVAILABLE" as const,
        providerName: "Journyx",
        data: [],
        message: "Origin and destination can't be the same. Change one of them.",
      };
    }
    return getSeatedProvider("bus").searchTrips(data);
  });

export const searchTrainTrips = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => searchSchema.parse(input))
  .handler(async ({ data }) => {
    if (data.from.trim().toLowerCase() === data.to.trim().toLowerCase()) {
      return {
        status: "UNAVAILABLE" as const,
        providerName: "Journyx",
        data: [],
        message: "Origin and destination can't be the same. Change one of them.",
      };
    }
    return getSeatedProvider("train").searchTrips(data);
  });

export const getTripDetails = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => tripIdSchema.parse(input))
  .handler(async ({ data }) => {
    const type = data.tripId.startsWith("train") ? "train" : "bus";
    return getSeatedProvider(type).getTripDetails(data.tripId);
  });

export const getSeatMap = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    tripIdSchema.extend({ trainClass: z.string().max(4).optional() }).parse(input),
  )
  .handler(async ({ data }) => {
    if (data.tripId.startsWith("train")) {
      const provider = getTrainProvider();
      return provider.getBerthMap(data.tripId, data.trainClass ?? "SL");
    }
    return getSeatedProvider("bus").getSeatMap(data.tripId);
  });

export const reserveSeats = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    tripIdSchema.extend({ seatLabels: z.array(z.string().max(8)).min(1).max(6) }).parse(input),
  )
  .handler(async ({ data }) => {
    const type = data.tripId.startsWith("train") ? "train" : "bus";
    return getSeatedProvider(type).reserveSeat(data.tripId, data.seatLabels);
  });

export const getCabQuotes = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z
      .object({
        pickup: z.string().min(2).max(80),
        drop: z.string().min(2).max(80),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        time: z.string().regex(/^\d{2}:\d{2}$/),
        passengers: z.number().int().min(1).max(6),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const provider = getCabProvider();
    const result = await provider.getQuotes(data);
    return { ...result, mapStatus: provider.mapStatus };
  });

export const planMetroRoute = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ from: z.string().min(2).max(60), to: z.string().min(2).max(60) }).parse(input),
  )
  .handler(async ({ data }) => getMetroProvider().planRoute(data));

/**
 * Sandbox payment processor. No real money moves. A real PSP would be called
 * here with server-side secrets and webhook signature verification.
 */
export const processSandboxPayment = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        method: z.enum(["upi", "card", "netbanking", "demo-balance"]),
        amount: z.number().int().positive().max(1_000_000),
        forceFailure: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    await new Promise((resolve) => setTimeout(resolve, 900));
    if (data.forceFailure) {
      return {
        status: "FAILED" as const,
        environment: "SANDBOX" as const,
        transactionId: `SBX-FAIL-${Date.now().toString(36).toUpperCase()}`,
        message: "The sandbox processor declined this attempt. Try paying again.",
      };
    }
    return {
      status: "SUCCESS" as const,
      environment: "SANDBOX" as const,
      transactionId: `SBX-${Math.random().toString(36).slice(2, 8).toUpperCase()}-${Date.now()
        .toString(36)
        .toUpperCase()}`,
      message: "Sandbox payment authorised. No real money was charged.",
    };
  });
