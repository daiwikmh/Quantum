import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { fetchWithTimeout } from './utils';
import {
    Aptos,
    AptosConfig,
    Account,
    Network,
    Ed25519PrivateKey,
    PrivateKey,
    PrivateKeyVariants,
} from "@aptos-labs/ts-sdk";

// Load environment variables
dotenv.config();

// Constants
const API_URL = process.env.API_URL || 'https://plutus-move.onrender.com';
const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
    console.error('BOT_TOKEN is missing in environment variables');
    process.exit(1);
}

const API_TIMEOUT = 1000000; // 10 seconds timeout for API calls

// Define types
interface Market {
    id: string;
    coinAddress: string;
    supplyApr: number;
    borrowApr: number;
    price: number;
    name?: string;       // Added name for better display
    symbol?: string;     // Added symbol for better display
    decimals?: number;   // Added decimals for amount formatting
}

interface UserPosition {
    marketId: string;
    supplied: number;
    borrowed: number;
}

interface User {
    telegramId: number;
    walletAddress?: string;
}

type UserState = 'supply' | 'withdraw' | 'borrow' | 'repay' | 'connect_wallet' | null;

// Session management
class SessionManager {
    private userStates = new Map<number, UserState>();
    private userMarketSelections = new Map<number, Market[]>();
    private userCurrentMarket = new Map<number, Market>();
    private userWallets = new Map<number, string>();
    private userAmounts = new Map<number, number>();
    private userPayloads = new Map<number, any>();  // Added to store transaction payloads

    // State management
    getState(chatId: number): UserState {
        return this.userStates.get(chatId) || null;
    }

    setState(chatId: number, state: UserState): void {
        this.userStates.set(chatId, state);
    }

    // Market management
    setMarkets(chatId: number, markets: Market[]): void {
        this.userMarketSelections.set(chatId, markets);
    }

    getMarkets(chatId: number): Market[] | undefined {
        return this.userMarketSelections.get(chatId);
    }

    setCurrentMarket(chatId: number, market: Market): void {
        this.userCurrentMarket.set(chatId, market);
    }

    getCurrentMarket(chatId: number): Market | undefined {
        return this.userCurrentMarket.get(chatId);
    }

    // Wallet management
    setWallet(chatId: number, address: string): void {
        this.userWallets.set(chatId, address);
    }

    getWallet(chatId: number): string | undefined {
        return this.userWallets.get(chatId);
    }

    // Amount management
    setAmount(chatId: number, amount: number): void {
        this.userAmounts.set(chatId, amount);
    }

    getAmount(chatId: number): number | undefined {
        return this.userAmounts.get(chatId);
    }

    // Payload management
    setPayload(chatId: number, payload: any): void {
        this.userPayloads.set(chatId, payload);
    }

    getPayload(chatId: number): any | undefined {
        return this.userPayloads.get(chatId);
    }

    // Reset user session
    resetSession(chatId: number): void {
        this.userStates.delete(chatId);
        this.userCurrentMarket.delete(chatId);
        this.userAmounts.delete(chatId);
        this.userPayloads.delete(chatId);
        // Don't delete wallet address or markets as they can be reused
    }
}

// API Service
class PlutusAPI {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    async getMarkets(): Promise<Market[]> {
        try {
            const response = await fetchWithTimeout(`${this.baseUrl}/api/markets`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                timeout: API_TIMEOUT
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch markets: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Market fetch error:', error);
            throw error;
        }
    }

    async getUserPositions(walletAddress: string): Promise<UserPosition[]> {
        try {
            const response = await fetchWithTimeout(`${this.baseUrl}/api/user/${walletAddress}/positions`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                timeout: API_TIMEOUT
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch user positions: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('User positions fetch error:', error);
            throw error;
        }
    }

    async createTransactionPayload(
        type: UserState,
        coinAddress: string,
        marketId: string,
        amount: number,
        walletAddress: string
    ): Promise<any> {
        try {
            const response = await fetchWithTimeout(`${this.baseUrl}/api/transaction/payload`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                timeout: API_TIMEOUT,
                body: JSON.stringify({
                    type,
                    coinAddress,
                    market: marketId,
                    amount,
                    walletAddress
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to create transaction payload: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Transaction payload error:', error);
            throw error;
        }
    }
}

// UI Helper
class TelegramUI {
    private bot: TelegramBot;

    constructor(bot: TelegramBot) {
        this.bot = bot;
    }

    async sendMainMenu(chatId: number, walletConnected: boolean = false): Promise<void> {
        const walletRow = walletConnected
            ? [{ text: '👛 My Wallet', callback_data: 'wallet' }]
            : [{ text: '🔗 Connect Wallet', callback_data: 'connect_wallet' }];

        const options = {
            reply_markup: {
                inline_keyboard: [
                    walletRow,
                    [
                        { text: '📊 Show Markets', callback_data: 'markets' }
                    ],
                    [
                        { text: '💰 Supply Tokens', callback_data: 'supply' },
                        { text: '🔄 Withdraw Tokens', callback_data: 'withdraw' }
                    ],
                    [
                        { text: '💸 Borrow Tokens', callback_data: 'borrow' },
                        { text: '💵 Repay Tokens', callback_data: 'repay' }
                    ],
                    [
                        { text: '❓ Help', callback_data: 'help' }
                    ]
                ]
            },
            parse_mode: 'Markdown' as const
        };

        await this.bot.sendMessage(
            chatId,
            "Welcome to the *Plutus Move Bot*!\nYour gateway to DeFi on the Move blockchain.",
            options
        );
    }

    async sendWalletInfo(chatId: number, walletAddress: string, positions?: UserPosition[]): Promise<void> {
        let message = `*Your Wallet*\n\nAddress: \`${walletAddress}\`\n\n`;

        if (positions && positions.length > 0) {
            message += "*Your Positions:*\n\n";
            positions.forEach(position => {
                message += `Market: ${position.marketId}\n`;
                message += `Supplied: ${position.supplied}\n`;
                message += `Borrowed: ${position.borrowed}\n\n`;
            });
        } else {
            message += "You don't have any active positions yet.";
        }

        await this.bot.sendMessage(chatId, message, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🔙 Back to Menu', callback_data: 'menu' }]
                ]
            }
        });
    }

    async sendMarketsList(
        chatId: number,
        markets: Market[],
        initialAction: UserState = null
    ): Promise<void> {
        let message = '*Available Markets:*\n\n';

        markets.forEach((market, index) => {
            const name = market.name || `Market #${index + 1}`;
            const symbol = market.symbol ? ` (${market.symbol})` : '';

            message += `*${name}${symbol}*\n`;
            message += `ID: \`${market.id}\`\n`;
            message += `Coin Address: \`${market.coinAddress}\`\n`;
            message += `Supply APR: ${market.supplyApr}%\n`;
            message += `Borrow APR: ${market.borrowApr}%\n`;
            message += `Price: $${market.price.toFixed(2)}\n\n`;
        });

        // Create action buttons for each market based on the initial action
        const marketButtons = [];

        if (initialAction === 'supply') {
            markets.forEach((market, index) => {
                const name = market.name || `Market #${index + 1}`;
                marketButtons.push([{ text: `Supply to ${name}`, callback_data: `s_${index}` }]);
            });
        }
        else if (initialAction === 'borrow') {
            markets.forEach((market, index) => {
                const name = market.name || `Market #${index + 1}`;
                marketButtons.push([{ text: `Borrow from ${name}`, callback_data: `b_${index}` }]);
            });
        }
        else if (initialAction === 'withdraw') {
            markets.forEach((market, index) => {
                const name = market.name || `Market #${index + 1}`;
                marketButtons.push([{ text: `Withdraw from ${name}`, callback_data: `w_${index}` }]);
            });
        }
        else if (initialAction === 'repay') {
            markets.forEach((market, index) => {
                const name = market.name || `Market #${index + 1}`;
                marketButtons.push([{ text: `Repay to ${name}`, callback_data: `r_${index}` }]);
            });
        }
        else {
            // Show all options in a more compact format
            markets.forEach((market, index) => {
                const name = market.name || `Market #${index + 1}`;
                marketButtons.push([
                    { text: `${name} - Supply`, callback_data: `s_${index}` },
                    { text: `${name} - Borrow`, callback_data: `b_${index}` }
                ]);
            });
        }

        // Add back button
        marketButtons.push([{ text: '🔙 Back to Menu', callback_data: 'menu' }]);

        await this.bot.sendMessage(chatId, message, {
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: marketButtons }
        });
    }

    async sendTransactionForm(
        chatId: number,
        action: UserState,
        market: Market
    ): Promise<void> {
        // Format better titles for actions
        const actionTitles = {
            'supply': 'Supply',
            'withdraw': 'Withdraw',
            'borrow': 'Borrow',
            'repay': 'Repay'
        };

        const name = market.name || market.id;
        const actionTitle = action && actionTitles[action as keyof typeof actionTitles]
            ? actionTitles[action as keyof typeof actionTitles]
            : 'Unknown Action';
        const aprType = action === 'supply' || action === 'withdraw' ? 'Supply' : 'Borrow';
        const aprValue = action === 'supply' || action === 'withdraw' ? market.supplyApr : market.borrowApr;

        let message = `*${actionTitle} Tokens to ${name}*\n\n`;
        message += `Market ID: \`${market.id}\`\n`;
        message += `Coin Address: \`${market.coinAddress}\`\n`;

        if (action === 'supply' || action === 'borrow') {
            message += `Current ${aprType} APR: ${aprValue}%\n\n`;
        }

        if (action) {
            message += `Please enter the amount you wish to ${action.toLowerCase()}:`;
        } else {
            message += `Action is not specified. Please try again.`;
        }

        await this.bot.sendMessage(chatId, message, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🔙 Back to Markets', callback_data: 'markets' }]
                ]
            }
        });
    }

    async sendTransactionConfirmation(
        chatId: number,
        action: UserState,
        market: Market,
        amount: number,
        payload: any
    ): Promise<void> {
        const name = market.name || market.id;
        const actionTitle = action ? action.charAt(0).toUpperCase() + action.slice(1) : 'Unknown Action';

        let message = `*${actionTitle} Transaction Confirmation*\n\n`;
        message += `Market: ${name}\n`;
        message += `Amount: ${amount}\n\n`;
        message += `*Transaction Payload:*\n\`\`\`json\n${JSON.stringify(payload, null, 2)}\n\`\`\``;

        await this.bot.sendMessage(chatId, message, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '✅ Confirm Transaction', callback_data: 'confirm' }],
                    [{ text: '❌ Cancel', callback_data: 'menu' }]
                ]
            }
        });
    }

    async sendTransaction(payload: any): Promise<string> {
        try {
            console.log("Transaction Started");
            const config = new AptosConfig({ network: Network.TESTNET });
            const aptos = new Aptos(config);
            const account = await aptos.deriveAccountFromPrivateKey({
                privateKey: new Ed25519PrivateKey(
                    PrivateKey.formatPrivateKey(
                        '0xab9349629b525a0f8db2b436793f533dab2175d95db360b84ff9d4ddfb50b0c2',
                        PrivateKeyVariants.Ed25519
                    )
                ),
            });
            console.log("Account address:", account.accountAddress.toString());
            console.log("Account derived:", account);

            console.log("Payload" , payload);
            const txn = await aptos.transaction.build.simple({
                sender: account.accountAddress,
                data: payload,
            });

            console.log("Transaction built:", txn);

            const committedTxn = await aptos.signAndSubmitTransaction({
                signer:account,
                transaction:txn,
            });
            
            console.log("Transaction submitted:", committedTxn);
            const executedTransaction = await aptos.waitForTransaction({
                transactionHash: committedTxn.hash,
            });
            return executedTransaction.hash;
        } catch (error) {
            console.error('Error sending transaction:', error);
            throw new Error('Failed to send transaction');
        }
    }

    async sendErrorMessage(chatId: number, errorMessage: string): Promise<void> {
        await this.bot.sendMessage(chatId, `❌ *Error:* ${errorMessage}`, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [[{ text: '🔙 Back to Menu', callback_data: 'menu' }]]
            }
        });
    }

    async sendHelpMessage(chatId: number): Promise<void> {
        const helpMessage = "*Plutus Move Bot Help*\n\n" +
            "This bot allows you to interact with the Plutus protocol on the Move blockchain.\n\n" +
            "*Available Commands:*\n\n" +
            "• */start* - Show the main menu\n" +
            "• */help* - Show this help message\n\n" +
            "*Main Features:*\n\n" +
            "• *Connect Wallet* - Link your Move blockchain wallet\n" +
            "• *Show Markets* - View all available markets\n" +
            "• *Supply* - Provide liquidity to earn interest\n" +
            "• *Withdraw* - Remove your supplied assets\n" +
            "• *Borrow* - Take a loan using your collateral\n" +
            "• *Repay* - Pay back borrowed assets\n\n" +
            "*How to use:*\n\n" +
            "1. Connect your wallet\n" +
            "2. Select an action from the menu\n" +
            "3. Choose a market\n" +
            "4. Enter the amount\n" +
            "5. Confirm the transaction\n\n" +
            "For more information, visit our website or contact support.";

        await this.bot.sendMessage(chatId, helpMessage, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [[{ text: '🔙 Back to Menu', callback_data: 'menu' }]]
            }
        });
    }

    async sendWalletConnectPrompt(chatId: number): Promise<void> {
        await this.bot.sendMessage(
            chatId,
            "*Connect your Wallet*\n\nPlease enter your Move blockchain wallet address to connect it to the bot:",
            {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[{ text: '🔙 Cancel', callback_data: 'menu' }]]
                }
            }
        );
    }

    async sendSuccessMessage(chatId: number, message: string): Promise<void> {
        await this.bot.sendMessage(chatId, `✅ *Success:* ${message}`, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [[{ text: '🔙 Back to Menu', callback_data: 'menu' }]]
            }
        });
    }
}

// Main Bot class
class PlutusBot {
    private bot: TelegramBot;
    private sessionManager: SessionManager;
    private api: PlutusAPI;
    private ui: TelegramUI;

    constructor(token: string, apiUrl: string) {
        this.bot = new TelegramBot(token, { polling: true });
        this.sessionManager = new SessionManager();
        this.api = new PlutusAPI(apiUrl);
        this.ui = new TelegramUI(this.bot);

        this.setupEventHandlers();

        // Error handler
        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);
        });
    }

    private setupEventHandlers(): void {
        // Command handlers
        this.bot.onText(/\/start/, this.handleStartCommand.bind(this));
        this.bot.onText(/\/help/, this.handleHelpCommand.bind(this));

        // Callback query handler
        this.bot.on('callback_query', this.handleCallbackQuery.bind(this));

        // Message handler
        this.bot.on('message', this.handleMessage.bind(this));
    }

    private async handleStartCommand(msg: TelegramBot.Message): Promise<void> {
        const chatId = msg.chat.id;
        const wallet = this.sessionManager.getWallet(chatId);
        await this.ui.sendMainMenu(chatId, !!wallet);
    }

    private async handleHelpCommand(msg: TelegramBot.Message): Promise<void> {
        const chatId = msg.chat.id;
        await this.ui.sendHelpMessage(chatId);
    }

    private async handleCallbackQuery(callbackQuery: TelegramBot.CallbackQuery): Promise<void> {
        const chatId = callbackQuery.message?.chat.id;
        if (!chatId) {
            console.error('Callback query message or chat ID is undefined.');
            return;
        }

        const data = callbackQuery.data;
        if (!data) {
            console.error('Callback data is undefined.');
            return;
        }

        console.log(`Received callback data: ${data}`);

        // Acknowledge the button click
        try {
            await this.bot.answerCallbackQuery(callbackQuery.id);
        } catch (error) {
            console.error('Error answering callback query:', error);
        }

        // Process the callback data
        await this.processCallbackData(chatId, data);
    }

    private async processCallbackData(chatId: number, data: string): Promise<void> {
        try {
            // Standard menu actions
            if (data === 'markets') {
                await this.handleShowMarkets(chatId);
            }
            else if (data === 'supply' || data === 'withdraw' || data === 'borrow' || data === 'repay') {
                await this.handleShowMarkets(chatId, data as UserState);
            }
            else if (data === 'menu') {
                this.sessionManager.resetSession(chatId);
                const wallet = this.sessionManager.getWallet(chatId);
                await this.ui.sendMainMenu(chatId, !!wallet);
            }
            else if (data === 'help') {
                await this.ui.sendHelpMessage(chatId);
            }
            else if (data === 'connect_wallet') {
                this.sessionManager.setState(chatId, 'connect_wallet');
                await this.ui.sendWalletConnectPrompt(chatId);
            }
            else if (data === 'wallet') {
                await this.handleWalletInfo(chatId);
            }
            // Market-specific actions
            else if (data.startsWith('s_') || data.startsWith('b_') ||
                data.startsWith('w_') || data.startsWith('r_')) {
                await this.handleMarketSelection(chatId, data);
            }
            else if (data === 'confirm') {
                await this.handleTransactionConfirmation(chatId);
            }
            else {
                console.log(`Unknown callback data: ${data}`);
            }
        } catch (error) {
            console.error('Error processing callback:', error);
            await this.ui.sendErrorMessage(chatId, 'An unexpected error occurred. Please try again.');
        }
    }

    private async handleMessage(msg: TelegramBot.Message): Promise<void> {
        if (!msg.text || msg.text.startsWith('/')) {
            return;
        }

        const chatId = msg.chat.id;
        const text = msg.text.trim();
        const state = this.sessionManager.getState(chatId);

        if (!state) {
            return;
        }

        try {
            if (state === 'connect_wallet') {
                await this.handleWalletConnection(chatId, text);
            } else if (state === 'supply' || state === 'withdraw' || state === 'borrow' || state === 'repay') {
                await this.handleAmountInput(chatId, text, state);
            }
        } catch (error) {
            console.error('Error handling message:', error);
            await this.ui.sendErrorMessage(chatId, 'An unexpected error occurred. Please try again.');
        }
    }

    private async handleWalletConnection(chatId: number, walletAddress: string): Promise<void> {
        // Basic validation - in real app, would need stronger validation
        if (!walletAddress || walletAddress.length < 10) {
            await this.ui.sendErrorMessage(chatId, 'Please enter a valid wallet address.');
            return;
        }

        // Store wallet address
        this.sessionManager.setWallet(chatId, walletAddress);
        this.sessionManager.setState(chatId, null);

        await this.ui.sendSuccessMessage(
            chatId,
            `Your wallet has been connected successfully!\nAddress: ${walletAddress}`
        );

        // Show main menu after connecting wallet
        await this.ui.sendMainMenu(chatId, true);
    }

    private async handleWalletInfo(chatId: number): Promise<void> {
        const walletAddress = this.sessionManager.getWallet(chatId);

        if (!walletAddress) {
            this.sessionManager.setState(chatId, 'connect_wallet');
            await this.ui.sendWalletConnectPrompt(chatId);
            return;
        }

        try {
            const positions = await this.api.getUserPositions(walletAddress);
            await this.ui.sendWalletInfo(chatId, walletAddress, positions);
        } catch (error) {
            console.error('Error fetching wallet info:', error);
            await this.ui.sendWalletInfo(chatId, walletAddress);
        }
    }

    private async handleShowMarkets(chatId: number, initialAction: UserState = null): Promise<void> {
        try {
            // Check if wallet is connected for supply/withdraw/borrow/repay actions
            if (initialAction && !this.sessionManager.getWallet(chatId)) {
                this.sessionManager.setState(chatId, 'connect_wallet');
                await this.ui.sendErrorMessage(
                    chatId,
                    `You need to connect your wallet first to ${initialAction} tokens.`
                );
                await this.ui.sendWalletConnectPrompt(chatId);
                return;
            }

            const markets = await this.api.getMarkets();

            if (!markets || markets.length === 0) {
                await this.ui.sendErrorMessage(chatId, 'No markets available at the moment.');
                return;
            }

            // Enhance market data with names if not provided by API
            const enhancedMarkets = markets.map((market, index) => ({
                ...market,
                name: market.name || `Market ${index + 1}`,
                symbol: market.symbol || '',
            }));

            // Store markets for later use
            this.sessionManager.setMarkets(chatId, enhancedMarkets);

            // Set initial action if provided
            if (initialAction) {
                this.sessionManager.setState(chatId, initialAction);
            }

            await this.ui.sendMarketsList(chatId, enhancedMarkets, initialAction);
        } catch (error) {
            console.error('Error showing markets:', error);
            await this.ui.sendErrorMessage(chatId, 'Failed to fetch market data. Please try again later.');
        }
    }

    private async handleMarketSelection(chatId: number, data: string): Promise<void> {
        const actionCode = data.charAt(0);
        const marketIndex = parseInt(data.substring(2));
        const markets = this.sessionManager.getMarkets(chatId);

        if (!markets || marketIndex >= markets.length) {
            await this.ui.sendErrorMessage(chatId, 'Invalid market selection. Please try again.');
            return;
        }

        const selectedMarket = markets[marketIndex];
        this.sessionManager.setCurrentMarket(chatId, selectedMarket);

        // Map action code to state
        const actionMap: { [key: string]: UserState } = {
            's': 'supply',
            'b': 'borrow',
            'w': 'withdraw',
            'r': 'repay'
        };

        const action = actionMap[actionCode];
        if (!action) {
            await this.ui.sendErrorMessage(chatId, 'Invalid action. Please try again.');
            return;
        }

        this.sessionManager.setState(chatId, action);
        await this.ui.sendTransactionForm(chatId, action, selectedMarket);
    }

    private async handleAmountInput(chatId: number, amountStr: string, state: UserState): Promise<void> {
        // Parse and validate amount
        const amount = parseFloat(amountStr);

        if (isNaN(amount) || amount <= 0) {
            await this.ui.sendErrorMessage(chatId, 'Please enter a valid positive number for the amount.');
            return;
        }

        const selectedMarket = this.sessionManager.getCurrentMarket(chatId);
        const walletAddress = this.sessionManager.getWallet(chatId);

        if (!selectedMarket) {
            await this.ui.sendErrorMessage(chatId, 'Market selection error. Please try again.');
            return;
        }

        if (!walletAddress) {
            this.sessionManager.setState(chatId, 'connect_wallet');
            await this.ui.sendWalletConnectPrompt(chatId);
            return;
        }

        try {
            // Store amount for confirmation step
            this.sessionManager.setAmount(chatId, amount);

            // Generate transaction payload
            const response = await this.api.createTransactionPayload(
                state,
                selectedMarket.coinAddress,
                selectedMarket.id,
                amount,
                walletAddress
            );
            console.log("payload:", response.payload);
            // Store payload for confirmation step
            this.sessionManager.setPayload(chatId, response.payload);

            await this.ui.sendTransactionConfirmation(
                chatId,
                state,
                selectedMarket,
                amount,
                response.payload
            );
        } catch (error) {
            console.error('Transaction error:', error);
            await this.ui.sendErrorMessage(
                chatId,
                `Error creating ${state} transaction. Please try again later.`
            );
        }
    }

    private async handleTransactionConfirmation(chatId: number): Promise<void> {
        console.log("Transaction Confirmation Started");
        const state = this.sessionManager.getState(chatId);
        const market = this.sessionManager.getCurrentMarket(chatId);
        const amount = this.sessionManager.getAmount(chatId);
        const payload = this.sessionManager.getPayload(chatId);
        console.log("Payload:", payload);
        if (!state || !market || !amount || !payload) {
            await this.ui.sendErrorMessage(chatId, 'Transaction details missing. Please try again.');
            return;
        }

        try {
            // Submit the transaction to the blockchain
            const txHash = await this.ui.sendTransaction(payload);

            await this.ui.sendSuccessMessage(
                chatId,
                `Your ${state} transaction of ${amount} tokens has been submitted successfully!\nTransaction Hash: ${txHash}`
            );

            // Reset user state
            this.sessionManager.resetSession(chatId);
        } catch (error) {
            console.error('Transaction submission error:', error);
            await this.ui.sendErrorMessage(
                chatId,
                'Failed to submit transaction. Please try again later.'
            );
        }
    }
}

// Run the bot
try {
    const bot = new PlutusBot(BOT_TOKEN, API_URL);
    console.log('Plutus Move Telegram Bot is running...');
} catch (error) {
    console.error('Failed to start the bot:', error);
    process.exit(1);
}