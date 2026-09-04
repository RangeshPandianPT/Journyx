import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Eye, XCircle, MapPin } from "lucide-react";

export const Route = createFileRoute("/my-bookings")({
  component: MyBookings,
});

import { useState, useEffect } from "react";

function MyBookings() {
  const [localBookings, setLocalBookings] = useState<any[]>([]);

  useEffect(() => {
    try {
      const existing = JSON.parse(localStorage.getItem("journyx_bookings") || "[]");
      setLocalBookings(existing);
    } catch (e) {
      console.error("Failed to load local bookings", e);
    }
  }, []);

  const defaultMockBookings = [
    {
      id: "JNX-849201",
      operator: "VRL Travels",
      from: "Chennai",
      to: "Bangalore",
      date: "Tomorrow",
      status: "Upcoming",
      amount: 1349,
      seats: "A1, B1",
      isDemo: true
    },
    {
      id: "JNX-291844",
      operator: "IntrCity SmartBus",
      from: "Bangalore",
      to: "Chennai",
      date: "Oct 15, 2023",
      status: "Completed",
      amount: 1450,
      seats: "C4",
      isDemo: true
    }
  ];

  const mockBookings = [...localBookings, ...defaultMockBookings];

  return (
    <div className="min-h-screen bg-background text-foreground py-10 font-sans">
      <div className="container-page max-w-5xl">
        <h1 className="font-display text-3xl font-bold mb-8">My Bookings</h1>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="mb-6 bg-surface-muted p-1 rounded-xl">
            <TabsTrigger value="upcoming" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm px-6">Upcoming</TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm px-6">Completed</TabsTrigger>
            <TabsTrigger value="cancelled" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm px-6">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4 outline-none">
            {mockBookings.filter(b => b.status === "Upcoming").map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4 outline-none">
            {mockBookings.filter(b => b.status === "Completed").map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </TabsContent>

          <TabsContent value="cancelled" className="outline-none">
            <div className="text-center py-20 bg-card rounded-xl border border-border shadow-soft">
              <p className="text-muted-foreground">You have no cancelled bookings.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function BookingCard({ booking }: { booking: any }) {
  return (
    <Card className="border-border shadow-soft hover:shadow-raise transition-shadow overflow-hidden group">
      <CardContent className="p-0">
        <div className="p-6 flex flex-col md:flex-row justify-between gap-6">
          
          {/* Booking Info */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <span className="font-bold text-lg">{booking.operator}</span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                booking.status === "Upcoming" ? "bg-primary/10 text-primary" : "bg-green-100 text-green-700"
              }`}>
                {booking.status}
              </span>
              {booking.isDemo && (
                <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-bold">
                  Demo Booking
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span className="font-medium text-foreground">{booking.from}</span>
              </div>
              <div className="h-[1px] w-8 bg-border"></div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span className="font-medium text-foreground">{booking.to}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Date</p>
                <p className="font-medium">{booking.date}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Booking ID</p>
                <p className="font-medium">{booking.id}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Seats</p>
                <p className="font-medium">{booking.seats}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Amount</p>
                <p className="font-medium text-price">₹{booking.amount}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col justify-center gap-2 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
            <Button variant="outline" className="w-full justify-start gap-2">
              <Eye className="h-4 w-4" /> View Ticket
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Download className="h-4 w-4" /> Download
            </Button>
            {booking.status === "Upcoming" && (
              <Button variant="ghost" className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10">
                <XCircle className="h-4 w-4" /> Cancel Booking
              </Button>
            )}
          </div>
          
        </div>
      </CardContent>
    </Card>
  );
}
