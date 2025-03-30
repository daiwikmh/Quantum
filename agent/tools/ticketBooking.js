import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

class TicketBookingTool extends DynamicStructuredTool {
  constructor() {
    super({
      name: "TicketBookingAPI",
      description: `A tool for booking travel tickets (bus, train, flight). 
      Input should be a JSON object with required fields for booking.`,
      schema: z.object({
        mode: z.enum(["bus", "train", "flight"]),
        name: z.string(),
        age: z.number(),
        date: z.string(),
        from: z.string(),
        to: z.string()
      }),
    });
  }

  async _call(args) {
    try {
      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(args.date)) {
        throw new Error('Invalid date format. Use YYYY-MM-DD');
      }

      // Generate mock ticket details
      const ticketDetails = this.#generateMockTicketDetails(args);

      return {
        type: "ticket_booking",
        status: "success",
        message: `Successfully booked ${args.mode} ticket`,
        data: ticketDetails
      };

    } catch (error) {
      return {
        error: true,
        message: error.message,
        data: null
      };
    }
  }

  #generateMockTicketDetails(input) {

    const mockPrices = {
      bus: { base: 30, rate: 0.1 },
      train: { base: 50, rate: 0.15 },
      flight: { base: 200, rate: 0.25 },
    };

    const distance = Math.floor(Math.random() * 1000) + 100;
    const price = mockPrices[input.mode].base + (distance * mockPrices[input.mode].rate);
    const ticketNumber = Math.random().toString(36).substring(2, 15).toUpperCase();
    
    const departureTimes = {
      bus: "08:00 AM",
      train: "10:30 AM",
      flight: "14:45 PM",
    };

    const arrivalTimes = {
      bus: "02:30 PM",
      train: "03:45 PM",
      flight: "16:15 PM",
    };

    // Generate mock transaction details
    const txHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const walletAddress = `0x${Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    return {
      ticket_number: ticketNumber,
      passenger: {
        name: input.name,
        age: input.age
      },
      journey: {
        mode: input.mode,
        date: input.date,
        from: input.from,
        to: input.to,
        departure_time: departureTimes[input.mode],
        arrival_time: arrivalTimes[input.mode],
        distance: `${distance} km`
      },
      payment_details: {
        status: "paid",
        amount: price.toFixed(2),
        currency: "USD",
        payment_method: "wallet",
        wallet_address: walletAddress,
        transaction_hash: txHash,
        timestamp: new Date().toISOString()
      },
      status: "Confirmed",
      booking_time: new Date().toISOString(),
      seat_number: `${String.fromCharCode(65 + Math.floor(Math.random() * 6))}${Math.floor(Math.random() * 30) + 1}`,
      additional_info: {
        baggage_allowance: input.mode === "flight" ? "20kg" : "2 pieces",
        platform_number: input.mode === "train" ? Math.floor(Math.random() * 10) + 1 : null,
        gate_number: input.mode === "flight" ? `G${Math.floor(Math.random() * 20) + 1}` : null,
        terminal: input.mode === "flight" ? Math.floor(Math.random() * 5) + 1 : null
      }
    };
  }
}

// Create and export a single instance
const ticketBookingTool = new TicketBookingTool();
export default ticketBookingTool;