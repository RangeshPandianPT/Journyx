import type { ProviderStatus } from "@/lib/domain/types";
import { METRO_INTERCHANGES, METRO_STATIONS } from "@/lib/data/reference";
import type { MetroLeg, MetroProvider, MetroRoute } from "./types";

const STATUS: ProviderStatus = "DEMO_DATA";

const BLUE_LINE = METRO_STATIONS.slice(0, 12);
const GREEN_LINE = METRO_STATIONS.slice(11);

function lineOf(station: string): "Blue Line" | "Green Line" | null {
  if (BLUE_LINE.includes(station)) return "Blue Line";
  if (GREEN_LINE.includes(station)) return "Green Line";
  return null;
}

function segment(list: string[], from: string, to: string): string[] {
  const a = list.indexOf(from);
  const b = list.indexOf(to);
  if (a === -1 || b === -1) return [];
  return a <= b ? list.slice(a, b + 1) : list.slice(b, a + 1).reverse();
}

function fareFor(stops: number) {
  if (stops <= 2) return 10;
  if (stops <= 5) return 20;
  if (stops <= 9) return 30;
  if (stops <= 14) return 40;
  return 50;
}

export const demoMetroProvider: MetroProvider = {
  id: "demo-metro",
  name: "Journyx Demo Metro Graph",
  status: STATUS,

  async planRoute({ from, to }) {
    const fromLine = lineOf(from);
    const toLine = lineOf(to);

    if (!fromLine || !toLine || from === to) {
      return {
        status: STATUS,
        providerName: demoMetroProvider.name,
        data: null,
        message: "We couldn't plan that route. Pick two different stations from the list.",
      };
    }

    let legs: MetroLeg[] = [];
    let interchanges: string[] = [];

    if (fromLine === toLine) {
      const list = fromLine === "Blue Line" ? BLUE_LINE : GREEN_LINE;
      const stops = segment(list, from, to);
      legs = [
        {
          line: fromLine,
          fromStation: from,
          toStation: to,
          stops,
          minutes: Math.max(3, (stops.length - 1) * 2),
        },
      ];
    } else {
      const interchange = METRO_INTERCHANGES.find(
        (station) => lineOf(station) !== null,
      )!;
      const firstList = fromLine === "Blue Line" ? BLUE_LINE : GREEN_LINE;
      const secondList = toLine === "Blue Line" ? BLUE_LINE : GREEN_LINE;
      const firstStops = segment(firstList, from, interchange);
      const secondStops = segment(secondList, interchange, to);
      interchanges = [interchange];
      legs = [
        {
          line: fromLine,
          fromStation: from,
          toStation: interchange,
          stops: firstStops.length ? firstStops : [from, interchange],
          minutes: Math.max(3, (firstStops.length - 1) * 2),
        },
        {
          line: toLine,
          fromStation: interchange,
          toStation: to,
          stops: secondStops.length ? secondStops : [interchange, to],
          minutes: Math.max(3, (secondStops.length - 1) * 2),
        },
      ];
    }

    const stationCount = legs.reduce((sum, leg) => sum + Math.max(0, leg.stops.length - 1), 0);
    const totalMinutes =
      legs.reduce((sum, leg) => sum + leg.minutes, 0) + interchanges.length * 4;

    const route: MetroRoute = {
      id: `metro_${from}_${to}`.replace(/\s+/g, "-").toLowerCase(),
      legs,
      interchanges,
      totalMinutes,
      fare: fareFor(stationCount),
      stationCount,
      status: STATUS,
    };

    return { status: STATUS, providerName: demoMetroProvider.name, data: route };
  },
};
