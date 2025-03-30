# AcehackQuantum Client

A comprehensive blockchain trading platform built with React, TypeScript, and Vite, integrating Aptos, Echelon, and Pyth networks with Telegram and Twitter bot functionalities for seamless trading and social interactions.

![AcehackQuantum Client](./draw.png)

## Features

- 🚀 Multi-chain Support (Aptos, Echelon, Pyth)
- 💬 Telegram Bot Integration for Trading
- 🐦 Twitter Bot for Social Presence
- 📊 Real-time Trading Dashboard
- 💫 On-chain Transaction Tracking
- 🔐 Secure Payment Processing
- 📱 Responsive Web Interface
- 🌙 Dark Mode Support
- 📈 Transaction History & Analytics
- 🤖 Automated Trading Actions
- 🔔 Real-time Notifications
- 🔄 Cross-chain Operations

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Telegram Account
- Twitter Developer Account
- Crypto Wallet (supporting Aptos, Echelon)
- API Keys for Pyth Network

## Getting Started

1. Clone the repository
```bash
git clone [your-repository-url]
cd client
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and visit `http://localhost:5173`

## Project Structure

```
client/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions and configurations
│   ├── assets/         # Static assets
│   └── App.tsx         # Main application component
├── public/             # Public assets
└── vite.config.ts      # Vite configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Tech Stack

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

## Features Detail
### Telegram Bot
- Execute trades directly through chat commands
- View portfolio balance and performance
- Set up price alerts and notifications
- Process payments and transfers
- View transaction history
- Real-time market updates
- Wallet connection and management
- Support for multiple markets and tokens
- Interactive command interface
- Secure transaction signing

### Twitter Bot
- Automated trading updates
- Custom social presence management
- Performance sharing
- Community engagement features
- Market sentiment analysis
- Automated trade notifications
- Portfolio performance updates
- Price alerts and market trends
- Integration with trading signals
- Social trading features

### Dashboard
- Real-time portfolio tracking
- Transaction history visualization
- Cross-chain asset management
- Performance analytics
- Bot configuration interface

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
