import React from "react";
import {
  Asset,
  Provider,
  AgentDetails,
  AgentListItem,
  EthereumMetrics,TicketBooking, TripBooking
} from "../../types/AgentInterfaces";



// Card Components

export const StakingAssetsCard: React.FC<{ assets: Asset[] }> = ({
  assets,
}) => (
  <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
    {assets.map((asset, idx) => (
      <div
        key={idx}
        className="border-2 border-black rounded-xl bg-white p-6 transition-all hover:bg-gray-50"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="h-6 w-1 bg-black"></div>
          <img
            src={asset.logo}
            alt={asset.name}
            className="w-12 h-12 rounded-lg border-2 border-black"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/fallback-asset-image.png";
            }}
          />
          <h3 className="text-xl font-bold text-black font-montserrat">{asset.name}</h3>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-black/70 font-montserrat">APR</span>
          <span className="text-black font-bold font-montserrat">{asset.rewardRate}%</span>
        </div>
      </div>
    ))}
  </div>
);

export const ProvidersCard: React.FC<{ providers: Provider[] }> = ({
  providers,
}) => (
  <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
    {providers.map((provider, idx) => (
      <div
        key={idx}
        className="border-2 border-black rounded-xl bg-white p-6 transition-all hover:bg-gray-50"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="h-6 w-1 bg-black"></div>
          <img
            src={provider.logo}
            alt={provider.name}
            className="w-12 h-12 rounded-lg border-2 border-black"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/fallback-provider-image.png";
            }}
          />
          <h3 className="text-xl font-bold text-black font-montserrat">{provider.name}</h3>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-black/70 font-montserrat">AUM</span>
          <span className="text-black font-bold font-montserrat">{provider.aum}</span>
        </div>
      </div>
    ))}
  </div>
);

export const AgentDetailsCard: React.FC<{ data: AgentDetails }> = ({
  data,
}) => (
  <div className="border-2 border-black rounded-xl bg-white p-6">
    <div className="flex items-center mb-6">
      <div className="h-6 w-1 bg-black mr-3"></div>
      <h2 className="text-2xl font-bold text-black font-montserrat">{data.agentName}</h2>
    </div>
    <div className="grid grid-cols-2 gap-6">
      <div className="border-2 border-black rounded-xl p-4">
        <p className="text-black/70 font-montserrat mb-1">Mindshare</p>
        <p className="text-xl font-bold text-black font-montserrat">{data.mindshare}%</p>
      </div>
      <div className="border-2 border-black rounded-xl p-4">
        <p className="text-black/70 font-montserrat mb-1">Market Cap</p>
        <p className="text-xl font-bold text-black font-montserrat">{data.marketCap}</p>
      </div>
      <div className="border-2 border-black rounded-xl p-4">
        <p className="text-black/70 font-montserrat mb-1">Price</p>
        <p className="text-xl font-bold text-black font-montserrat">{data.price}</p>
      </div>
      <div className="border-2 border-black rounded-xl p-4">
        <p className="text-black/70 font-montserrat mb-1">Holders</p>
        <p className="text-xl font-bold text-black font-montserrat">{data.holdersCount}</p>
      </div>
    </div>
  </div>
);

export const AgentsListCard: React.FC<{ agents: AgentListItem[] }> = ({
  agents,
}) => (
  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
    {agents.map((agent, idx) => (
      <div
        key={idx}
        className="bg-black border border-[#50fa7b]/30 shadow-[0_0_10px_rgba(80,250,123,0.2)] rounded-xl p-4 hover:shadow-[0_0_15px_rgba(80,250,123,0.3)] transition-shadow"
      >
        <h3 className="font-mono text-[#50fa7b] text-lg mb-3">{agent.name}</h3>
        <div className="space-y-2 font-mono">
          <div className="flex justify-between items-center">
            <span className="text-white/70">Mindshare</span>
            <span className="text-[#50fa7b]">{agent.mindshare}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/70">Market Cap</span>
            <span className="text-[#50fa7b]">{agent.marketCap}</span>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const EthereumMetricsCard: React.FC<{ data: EthereumMetrics }> = ({
  data,
}) => (
  <div className="bg-black border border-[#50fa7b]/30 shadow-[0_0_10px_rgba(80,250,123,0.2)] rounded-xl p-6">
    <h2 className="text-2xl font-mono text-[#50fa7b] mb-6">
      Ethereum Staking Metrics
    </h2>
    <div className="mb-8">
      <p className="text-white/70 mb-2 font-mono">Current APR</p>
      <p className="text-3xl font-mono text-[#50fa7b]">{data.currentRate}%</p>
    </div>
    <div className="space-y-4">
      <h3 className="font-mono text-[#50fa7b] text-lg">Historical Rates</h3>
      <div className="space-y-2">
        {data.historicalRates.map((rate, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center p-2 hover:bg-[#50fa7b]/5 rounded font-mono"
          >
            <span className="text-white/70">
              {new Date(rate.date).toLocaleDateString()}
            </span>
            <span className="text-[#50fa7b]">{rate.rate}%</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Error Card Component
export const ErrorCard: React.FC<{ message: string }> = ({ message }) => (
  <div className="border-2 border-red-500 rounded-xl bg-white p-6">
    <div className="flex items-center gap-3 text-red-500 mb-4">
      <div className="h-6 w-1 bg-red-500"></div>
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h3 className="text-xl font-bold font-montserrat">Error Loading Data</h3>
    </div>
    <p className="text-black/70 font-montserrat">{message}</p>
  </div>
);

export const LiquidStakingOptionsCard: React.FC<{ options: any[] }> = ({
  options,
}) => (
  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
    {options.map((option, idx) => (
      <div
        key={idx}
        className="bg-black border border-[#50fa7b]/30 shadow-[0_0_10px_rgba(80,250,123,0.2)] rounded-xl p-4 hover:shadow-[0_0_15px_rgba(80,250,123,0.3)] transition-shadow"
      >
        <div className="flex items-center gap-3 mb-3">
          <img
            src={option.logo}
            alt={option.provider}
            className="w-12 h-12 rounded-full border border-[#50fa7b]/30"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/fallback-provider-image.png";
            }}
          />
          <div>
            <h3 className="font-mono text-[#50fa7b] text-lg">
              {option.provider}
            </h3>
            {option.isVerified && (
              <span className="text-xs text-white/50">Verified Provider</span>
            )}
          </div>
        </div>
        <div className="space-y-2 font-mono">
          <div className="flex justify-between items-center">
            <span className="text-white/70">Reward Rate</span>
            <span className="text-[#50fa7b]">{option.rewardRate}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/70">Commission</span>
            <span className="text-[#50fa7b]">{option.commission}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/70">Staking Share</span>
            <span className="text-[#50fa7b]">{option.stakingShare}%</span>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const ValidatorMetricsCard: React.FC<{ data: any }> = ({ data }) => (
  <div className="bg-black border border-[#50fa7b]/30 shadow-[0_0_10px_rgba(80,250,123,0.2)] rounded-xl p-6">
    <h2 className="text-2xl font-mono text-[#50fa7b] mb-6">
      {data.asset} Validator Metrics
    </h2>
    <div className="mb-4">
      <p className="text-white/70 mb-2 font-mono">Network Reward Rate</p>
      <p className="text-3xl font-mono text-[#50fa7b]">{data.rewardRate}%</p>
    </div>
    <div className="space-y-4">
      <h3 className="font-mono text-[#50fa7b] text-lg">Validators</h3>
      <div className="space-y-4">
        {data.validators.map((validator: any, idx: number) => (
          <div
            key={idx}
            className="p-4 bg-black border border-[#50fa7b]/30 rounded-lg"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-white/70 font-mono">Address</p>
                <p className="text-sm text-[#50fa7b] font-mono truncate">
                  {validator.address}
                </p>
              </div>
              <div>
                <p className="text-sm text-white/70 font-mono">Reward Rate</p>
                <p className="text-[#50fa7b] font-mono">
                  {validator.rewardRate}%
                </p>
              </div>
              <div>
                <p className="text-sm text-white/70 font-mono">Commission</p>
                <p className="text-[#50fa7b] font-mono">
                  {validator.commission}%
                </p>
              </div>
              <div>
                <p className="text-sm text-white/70 font-mono">Total Staked</p>
                <p className="text-[#50fa7b] font-mono">
                  {validator.totalStaked}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const TravelTicketCard: React.FC<{ data: TicketBooking }> = ({ data }) => (
  <div className="border-2 border-black rounded-xl bg-white p-6">
    <div className="flex items-center mb-6">
      <div className="h-6 w-1 bg-black mr-3"></div>
      <h2 className="text-2xl font-bold text-black font-montserrat">Travel Ticket</h2>
    </div>
    <div className="grid gap-6">
      <div className="flex items-center justify-between border-2 border-black rounded-xl p-4">
        <div>
          <p className="text-black/70 font-montserrat mb-1">Passenger</p>
          <p className="text-xl font-bold text-black font-montserrat">{data.passenger.name}</p>
        </div>
        <div className="text-right">
          <p className="text-black/70 font-montserrat mb-1">Ticket #</p>
          <p className="text-xl font-bold text-black font-montserrat">{data.ticket_number}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="border-2 border-black rounded-xl p-4">
          <p className="text-black/70 font-montserrat mb-1">From</p>
          <p className="text-lg font-bold text-black font-montserrat">{data.journey.from}</p>
        </div>
        <div className="border-2 border-black rounded-xl p-4">
          <p className="text-black/70 font-montserrat mb-1">To</p>
          <p className="text-lg font-bold text-black font-montserrat">{data.journey.to}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="border-2 border-black rounded-xl p-4">
          <p className="text-black/70 font-montserrat mb-1">Date</p>
          <p className="text-md font-bold text-black font-montserrat">{data.journey.date}</p>
        </div>
        <div className="border-2 border-black rounded-xl p-4">
          <p className="text-black/70 font-montserrat mb-1">Departure</p>
          <p className="text-md font-bold text-black font-montserrat">{data.journey.departure_time}</p>
        </div>
        <div className="border-2 border-black rounded-xl p-4">
          <p className="text-black/70 font-montserrat mb-1">Seat</p>
          <p className="text-md font-bold text-black font-montserrat">{data.seat_number}</p>
        </div>
      </div>

      <div className="border-2 border-black rounded-xl p-4">
        <p className="text-black/70 font-montserrat mb-1">Price</p>
        <p className="text-2xl font-bold text-black font-montserrat">{data.price}</p>
      </div>
    </div>
  </div>
);

export const HotelBookingCard: React.FC<{ data: TripBooking }> = ({ data }) => (
  <div className="border-2 border-black rounded-xl bg-white p-6">
    <div className="flex items-center mb-6">
      <div className="h-6 w-1 bg-black mr-3"></div>
      <div>
        <h2 className="text-2xl font-bold text-black font-montserrat">{data.hotel_details.name}</h2>
        <p className="text-black/70 font-montserrat">{data.hotel_details.category}</p>
      </div>
    </div>

    <div className="grid gap-6">
      <div className="flex items-center justify-between border-2 border-black rounded-xl p-4">
        <div>
          <p className="text-black/70 font-montserrat mb-1">Guest</p>
          <p className="text-xl font-bold text-black font-montserrat">{data.guest_details.name}</p>
        </div>
        <div className="text-right">
          <p className="text-black/70 font-montserrat mb-1">Booking #</p>
          <p className="text-xl font-bold text-black font-montserrat">{data.booking_id}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="border-2 border-black rounded-xl p-4">
          <p className="text-black/70 font-montserrat mb-1">Check-in</p>
          <p className="text-lg font-bold text-black font-montserrat">{data.stay_details.check_in}</p>
          <p className="text-sm text-black/70 font-montserrat">{data.additional_info.check_in_time}</p>
        </div>
        <div className="border-2 border-black rounded-xl p-4">
          <p className="text-black/70 font-montserrat mb-1">Check-out</p>
          <p className="text-lg font-bold text-black font-montserrat">{data.stay_details.check_out}</p>
          <p className="text-sm text-black/70 font-montserrat">{data.additional_info.check_out_time}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="border-2 border-black rounded-xl p-4">
          <p className="text-black/70 font-montserrat mb-1">Room Type</p>
          <p className="text-lg font-bold text-black font-montserrat">{data.room_details.type}</p>
          <p className="text-sm text-black/70 font-montserrat">Room {data.room_details.number}</p>
        </div>
        <div className="border-2 border-black rounded-xl p-4">
          <p className="text-black/70 font-montserrat mb-1">Total Price</p>
          <p className="text-lg font-bold text-black font-montserrat">
            ${data.room_details.total_price.toFixed(2)}
          </p>
          <p className="text-sm text-black/70 font-montserrat">
            {data.stay_details.nights} nights
          </p>
        </div>
      </div>
    </div>
  </div>
);
