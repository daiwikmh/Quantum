import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

class TripPlannerTool extends DynamicStructuredTool {
  constructor() {
    super({
      name: "TripPlannerAPI",
      description: `A tool for searching and booking hotel accommodations. 
      Available operations:
      - search: Find available hotels
      - book: Make a hotel reservation`,
      schema: z.object({
        action: z.enum(["search", "book"]),
        location: z.string(),
        check_in: z.string(),
        check_out: z.string(),
        guests: z.number(),
        room_type: z.enum(["single", "double", "suite"]).optional(),
        hotel_id: z.string().optional(),
        guest_name: z.string().optional(),
        special_requests: z.string().optional()
      }),
    });
  }

  async _call(args) {
    try {
      // Validate dates
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(args.check_in) || !dateRegex.test(args.check_out)) {
        throw new Error('Invalid date format. Use YYYY-MM-DD');
      }

      if (args.action === "search") {
        return {
          type: "hotel_search",
          status: "success",
          message: `Found hotels in ${args.location}`,
          data: this.#generateMockHotels(args.location)
        };
      } else if (args.action === "book") {
        if (!args.hotel_id || !args.room_type || !args.guest_name) {
          throw new Error('Missing required booking fields');
        }
        return {
          type: "hotel_booking",
          status: "success",
          message: "Booking confirmed successfully",
          data: this.#generateBookingConfirmation(args)
        };
      }
    } catch (error) {
      return {
        error: true,
        message: error.message,
        data: null
      };
    }
  }

  #generateMockHotels(location) {
    const hotelTypes = [
      { category: "Luxury", priceRange: { min: 300, max: 800 } },
      { category: "Business", priceRange: { min: 150, max: 300 } },
      { category: "Budget", priceRange: { min: 50, max: 150 } }
    ];

    return hotelTypes.map((type, index) => {
      const price = Math.floor(Math.random() * (type.priceRange.max - type.priceRange.min) + type.priceRange.min);
      return {
        hotel_id: `h${index + 1}${location.substring(0, 3).toLowerCase()}`,
        name: `${location} ${type.category} Hotel`,
        category: type.category,
        location: location,
        price_per_night: price,
        rating: (Math.random() * 2 + 3).toFixed(1),
        amenities: [
          "WiFi",
          "Restaurant",
          type.category === "Luxury" ? "Spa" : "Parking",
          type.category === "Luxury" ? "Pool" : "Gym"
        ],
        room_types: {
          single: { price: price * 0.8, available: Math.floor(Math.random() * 5) },
          double: { price: price, available: Math.floor(Math.random() * 5) },
          suite: { price: price * 1.5, available: Math.floor(Math.random() * 3) }
        },
        coordinates: {
          latitude: (Math.random() * 180 - 90).toFixed(6),
          longitude: (Math.random() * 360 - 180).toFixed(6)
        }
      };
    });
  }

  #generateBookingConfirmation(input) {
    const bookingId = Math.random().toString(36).substring(2, 15).toUpperCase();
    const roomNumber = `${Math.floor(Math.random() * 9) + 1}${Math.floor(Math.random() * 30) + 1}`;
    const mockHotel = this.#generateMockHotels(input.location)[0];
    const nights = Math.floor((new Date(input.check_out) - new Date(input.check_in)) / (1000 * 60 * 60 * 24));
    const pricePerNight = mockHotel.room_types[input.room_type].price;
    
    // Generate mock transaction details
    const txHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const walletAddress = `0x${Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    return {
      booking_id: bookingId,
      status: "confirmed",
      hotel_details: {
        hotel_id: mockHotel.hotel_id,
        name: mockHotel.name,
        category: mockHotel.category,
        location: mockHotel.location,
        coordinates: mockHotel.coordinates
      },
      room_details: {
        type: input.room_type,
        number: roomNumber,
        price_per_night: pricePerNight,
        total_price: pricePerNight * nights
      },
      payment_details: {
        status: "paid",
        amount: pricePerNight * nights,
        currency: "USD",
        payment_method: "wallet",
        wallet_address: walletAddress,
        transaction_hash: txHash,
        timestamp: new Date().toISOString()
      },
      guest_details: {
        name: input.guest_name,
        guests: input.guests
      },
      stay_details: {
        check_in: input.check_in,
        check_out: input.check_out,
        nights: nights
      },
      booking_time: new Date().toISOString(),
      cancellation_policy: "Free cancellation up to 24 hours before check-in",
      additional_info: {
        check_in_time: "15:00",
        check_out_time: "11:00",
        special_requests: input.special_requests || "None"
      }
    };
  }
}

// Create and export a single instance
const tripPlannerTool = new TripPlannerTool();
export default tripPlannerTool;
