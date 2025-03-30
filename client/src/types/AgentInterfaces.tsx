export interface Message {
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

export interface Asset {
  name: string;
  rewardRate: string;
  logo: string;
  type: "asset";
}

export interface Provider {
  name: string;
  aum: string;
  logo: string;
  type: "provider";
}

export interface AgentDetails {
  agentName: string;
  mindshare: number;
  marketCap: string;
  price: string;
  holdersCount: number;
  type: "agent_details";
}

export interface AgentListItem {
  name: string;
  mindshare: number;
  marketCap: string;
  type: "agent_card";
}

export interface EthereumMetrics {
  currentRate: string;
  historicalRates: Array<{
    rate: string;
    date: string;
  }>;
  type: "metrics";
}

export interface LiquidStakingOption {
  provider: string;
  logo: string;
  isVerified: boolean;
  rewardRate: string;
  commission: string;
  stakingShare: string;
  type: "liquid_staking_option";
}

export interface Validator {
  address: string;
  rewardRate: string;
  commission: string;
  totalStaked: string;
}

export interface ValidatorMetrics {
  asset: string;
  rewardRate: string;
  validators: Validator[];
  type: "validator_metrics";
}


export interface TicketBooking {
  ticket_number: string;
  passenger: {
    name: string;
    age: number;
  };
  journey: {
    mode: 'bus' | 'train' | 'flight';
    date: string;
    from: string;
    to: string;
    departure_time: string;
    arrival_time: string;
    distance: string;
  };
  price: string;
  status: string;
  image_url: string;
  booking_time: string;
  seat_number: string;
  additional_info: {
    baggage_allowance: string;
    platform_number?: number;
    gate_number?: string;
    terminal?: number;
  };
}

export interface TripBooking {
  booking_id: string;
  status: string;
  hotel_details: {
    hotel_id: string;
    name: string;
    category: string;
    location: string;
    image_url: string;
    coordinates: {
      latitude: string;
      longitude: string;
    };
  };
  room_details: {
    type: string;
    number: string;
    price_per_night: number;
    total_price: number;
  };
  guest_details: {
    name: string;
    guests: number;
  };
  stay_details: {
    check_in: string;
    check_out: string;
    nights: number;
  };
  booking_time: string;
  cancellation_policy: string;
  additional_info: {
    check_in_time: string;
    check_out_time: string;
    special_requests?: string;
  };
}
