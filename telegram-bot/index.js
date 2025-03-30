"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const dotenv_1 = __importDefault(require("dotenv"));
const utils_1 = require("./utils");
const ts_sdk_1 = require("@aptos-labs/ts-sdk");
// Load environment variables
dotenv_1.default.config();
// Constants
const API_URL = process.env.API_URL || 'https://plutus-move.onrender.com';
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
    console.error('BOT_TOKEN is missing in environment variables');
    process.exit(1);
}
const API_TIMEOUT = 1000000; // 10 seconds timeout for API calls
// Add WebSocket connection management to SessionManager
class SessionManager {
    constructor() {
        this.userStates = new Map();
        this.userMarketSelections = new Map();
        this.userCurrentMarket = new Map();
        this.userWallets = new Map();
        this.userAmounts = new Map();
        this.userPayloads = new Map();
        this.userWebSockets = new Map(); // Added to store transaction payloads
    }
    // State management
    getState(chatId) {
        return this.userStates.get(chatId) || null;
    }
    setState(chatId, state) {
        this.userStates.set(chatId, state);
    }
    // Market management
    setMarkets(chatId, markets) {
        this.userMarketSelections.set(chatId, markets);
    }
    getMarkets(chatId) {
        return this.userMarketSelections.get(chatId);
    }
    setCurrentMarket(chatId, market) {
        this.userCurrentMarket.set(chatId, market);
    }
    getCurrentMarket(chatId) {
        return this.userCurrentMarket.get(chatId);
    }
    // Wallet management
    setWallet(chatId, address) {
        this.userWallets.set(chatId, address);
    }
    getWallet(chatId) {
        return this.userWallets.get(chatId);
    }
    // Amount management
    setAmount(chatId, amount) {
        this.userAmounts.set(chatId, amount);
    }
    getAmount(chatId) {
        return this.userAmounts.get(chatId);
    }
    // Payload management
    setPayload(chatId, payload) {
        this.userPayloads.set(chatId, payload);
    }
    getPayload(chatId) {
        return this.userPayloads.get(chatId);
    }
    // Add WebSocket management
    setWebSocket(chatId, ws) {
        this.userWebSockets.set(chatId, ws);
    }
    getWebSocket(chatId) {
        return this.userWebSockets.get(chatId);
    }
    closeWebSocket(chatId) {
        const ws = this.userWebSockets.get(chatId);
        if (ws) {
            ws.close();
            this.userWebSockets.delete(chatId);
        }
    }
    // Update resetSession to include WebSocket cleanup
    resetSession(chatId) {
        this.closeWebSocket(chatId);
        this.userStates.delete(chatId);
        this.userCurrentMarket.delete(chatId);
        this.userAmounts.delete(chatId);
        this.userPayloads.delete(chatId);
        // Don't delete wallet address or markets as they can be reused
    }
}
// API Service
class PlutusAPI {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    getMarkets() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield (0, utils_1.fetchWithTimeout)(`${this.baseUrl}/api/markets`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    timeout: API_TIMEOUT
                });
                if (!response.ok) {
                    throw new Error(`Failed to fetch markets: ${response.status} ${response.statusText}`);
                }
                return yield response.json();
            }
            catch (error) {
                console.error('Market fetch error:', error);
                throw error;
            }
        });
    }
    getUserPositions(walletAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield (0, utils_1.fetchWithTimeout)(`${this.baseUrl}/api/user/${walletAddress}/positions`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    timeout: API_TIMEOUT
                });
                if (!response.ok) {
                    throw new Error(`Failed to fetch user positions: ${response.status} ${response.statusText}`);
                }
                return yield response.json();
            }
            catch (error) {
                console.error('User positions fetch error:', error);
                throw error;
            }
        });
    }
    createTransactionPayload(type, coinAddress, marketId, amount, walletAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield (0, utils_1.fetchWithTimeout)(`${this.baseUrl}/api/transaction/payload`, {
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
                return yield response.json();
            }
            catch (error) {
                console.error('Transaction payload error:', error);
                throw error;
            }
        });
    }
}
// UI Helper
class TelegramUI {
    constructor(bot) {
        this.bot = bot;
    }
    sendMainMenu(chatId_1) {
        return __awaiter(this, arguments, void 0, function* (chatId, walletConnected = false) {
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
                parse_mode: 'Markdown'
            };
            yield this.bot.sendMessage(chatId, "Welcome to the *Plutus Move Bot*!\nYour gateway to DeFi on the Move blockchain.", options);
        });
    }
    sendWalletInfo(chatId, walletAddress, positions) {
        return __awaiter(this, void 0, void 0, function* () {
            let message = `*Your Wallet*\n\nAddress: \`${walletAddress}\`\n\n`;
            if (positions && positions.length > 0) {
                message += "*Your Positions:*\n\n";
                positions.forEach(position => {
                    message += `Market: ${position.marketId}\n`;
                    message += `Supplied: ${position.supplied}\n`;
                    message += `Borrowed: ${position.borrowed}\n\n`;
                });
            }
            else {
                message += "You don't have any active positions yet.";
            }
            yield this.bot.sendMessage(chatId, message, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🔙 Back to Menu', callback_data: 'menu' }]
                    ]
                }
            });
        });
    }
    sendMarketsList(chatId_1, markets_1) {
        return __awaiter(this, arguments, void 0, function* (chatId, markets, initialAction = null) {
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
            yield this.bot.sendMessage(chatId, message, {
                parse_mode: 'Markdown',
                reply_markup: { inline_keyboard: marketButtons }
            });
        });
    }
    sendTransactionForm(chatId, action, market) {
        return __awaiter(this, void 0, void 0, function* () {
            // Format better titles for actions
            const actionTitles = {
                'supply': 'Supply',
                'withdraw': 'Withdraw',
                'borrow': 'Borrow',
                'repay': 'Repay'
            };
            const name = market.name || market.id;
            const actionTitle = action && actionTitles[action]
                ? actionTitles[action]
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
            }
            else {
                message += `Action is not specified. Please try again.`;
            }
            yield this.bot.sendMessage(chatId, message, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🔙 Back to Markets', callback_data: 'markets' }]
                    ]
                }
            });
        });
    }
    sendTransactionConfirmation(chatId, action, market, amount, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const name = market.name || market.id;
            const actionTitle = action ? action.charAt(0).toUpperCase() + action.slice(1) : 'Unknown Action';
            let message = `*${actionTitle} Transaction Confirmation*\n\n`;
            message += `Market: ${name}\n`;
            message += `Amount: ${amount}\n\n`;
            message += `*Transaction Payload:*\n\`\`\`json\n${JSON.stringify(payload, null, 2)}\n\`\`\``;
            yield this.bot.sendMessage(chatId, message, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '✅ Confirm Transaction', callback_data: 'confirm' }],
                        [{ text: '❌ Cancel', callback_data: 'menu' }]
                    ]
                }
            });
        });
    }
    sendTransaction(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("Transaction Started");
                const config = new ts_sdk_1.AptosConfig({ network: ts_sdk_1.Network.TESTNET });
                const aptos = new ts_sdk_1.Aptos(config);
                const account = yield aptos.deriveAccountFromPrivateKey({
                    privateKey: new ts_sdk_1.Ed25519PrivateKey(ts_sdk_1.PrivateKey.formatPrivateKey('0xab9349629b525a0f8db2b436793f533dab2175d95db360b84ff9d4ddfb50b0c2', ts_sdk_1.PrivateKeyVariants.Ed25519)),
                });
                console.log("Account address:", account.accountAddress.toString());
                console.log("Account derived:", account);
                console.log("Payload", payload);
                const txn = yield aptos.transaction.build.simple({
                    sender: account.accountAddress,
                    data: {
                        typeArguments: payload.typeArguments,
                        functionArguments: payload.functionArguments,
                        function: payload.function
                    },
                });
                console.log("Transaction built:", txn);
                const committedTxn = yield aptos.signAndSubmitTransaction({
                    signer: account,
                    transaction: txn,
                });
                console.log("Transaction submitted:", committedTxn);
                const executedTransaction = yield aptos.waitForTransaction({
                    transactionHash: committedTxn.hash,
                });
                return executedTransaction.hash;
            }
            catch (error) {
                console.error('Error sending transaction:', error);
                throw new Error('Failed to send transaction');
            }
        });
    }
    sendErrorMessage(chatId, errorMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.bot.sendMessage(chatId, `❌ *Error:* ${errorMessage}`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[{ text: '🔙 Back to Menu', callback_data: 'menu' }]]
                }
            });
        });
    }
    sendHelpMessage(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
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
            yield this.bot.sendMessage(chatId, helpMessage, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[{ text: '🔙 Back to Menu', callback_data: 'menu' }]]
                }
            });
        });
    }
    sendWalletConnectPrompt(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.bot.sendMessage(chatId, "*Connect your Wallet*\n\nPlease enter your Move blockchain wallet address to connect it to the bot:", {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[{ text: '🔙 Cancel', callback_data: 'menu' }]]
                }
            });
        });
    }
    sendSuccessMessage(chatId, message) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.bot.sendMessage(chatId, `✅ *Success:* ${message}`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[{ text: '🔙 Back to Menu', callback_data: 'menu' }]]
                }
            });
        });
    }
}
// Main Bot class
class PlutusBot {
    constructor(token, apiUrl) {
        this.bot = new node_telegram_bot_api_1.default(token, { polling: true });
        this.sessionManager = new SessionManager();
        this.api = new PlutusAPI(apiUrl);
        this.ui = new TelegramUI(this.bot);
        this.setupEventHandlers();
        // Error handler
        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);
        });
    }
    setupEventHandlers() {
        // Command handlers
        this.bot.onText(/\/start/, this.handleStartCommand.bind(this));
        this.bot.onText(/\/help/, this.handleHelpCommand.bind(this));
        // Callback query handler
        this.bot.on('callback_query', this.handleCallbackQuery.bind(this));
        // Message handler
        this.bot.on('message', this.handleMessage.bind(this));
    }
    handleStartCommand(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            const chatId = msg.chat.id;
            const wallet = this.sessionManager.getWallet(chatId);
            yield this.ui.sendMainMenu(chatId, !!wallet);
        });
    }
    handleHelpCommand(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            const chatId = msg.chat.id;
            yield this.ui.sendHelpMessage(chatId);
        });
    }
    handleCallbackQuery(callbackQuery) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const chatId = (_a = callbackQuery.message) === null || _a === void 0 ? void 0 : _a.chat.id;
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
                yield this.bot.answerCallbackQuery(callbackQuery.id);
            }
            catch (error) {
                console.error('Error answering callback query:', error);
            }
            // Process the callback data
            yield this.processCallbackData(chatId, data);
        });
    }
    processCallbackData(chatId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Standard menu actions
                if (data === 'markets') {
                    yield this.handleShowMarkets(chatId);
                }
                else if (data === 'supply' || data === 'withdraw' || data === 'borrow' || data === 'repay') {
                    yield this.handleShowMarkets(chatId, data);
                }
                else if (data === 'menu') {
                    this.sessionManager.resetSession(chatId);
                    const wallet = this.sessionManager.getWallet(chatId);
                    yield this.ui.sendMainMenu(chatId, !!wallet);
                }
                else if (data === 'help') {
                    yield this.ui.sendHelpMessage(chatId);
                }
                else if (data === 'connect_wallet') {
                    this.sessionManager.setState(chatId, 'connect_wallet');
                    yield this.ui.sendWalletConnectPrompt(chatId);
                }
                else if (data === 'wallet') {
                    yield this.handleWalletInfo(chatId);
                }
                // Market-specific actions
                else if (data.startsWith('s_') || data.startsWith('b_') ||
                    data.startsWith('w_') || data.startsWith('r_')) {
                    yield this.handleMarketSelection(chatId, data);
                }
                else if (data === 'confirm') {
                    yield this.handleTransactionConfirmation(chatId);
                }
                else {
                    console.log(`Unknown callback data: ${data}`);
                }
            }
            catch (error) {
                console.error('Error processing callback:', error);
                yield this.ui.sendErrorMessage(chatId, 'An unexpected error occurred. Please try again.');
            }
        });
    }
    handleMessage(msg) {
        return __awaiter(this, void 0, void 0, function* () {
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
                    yield this.handleWalletConnection(chatId, text);
                }
                else if (state === 'supply' || state === 'withdraw' || state === 'borrow' || state === 'repay') {
                    yield this.handleAmountInput(chatId, text, state);
                }
            }
            catch (error) {
                console.error('Error handling message:', error);
                yield this.ui.sendErrorMessage(chatId, 'An unexpected error occurred. Please try again.');
            }
        });
    }
    handleWalletConnection(chatId, walletAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            // Basic validation - in real app, would need stronger validation
            if (!walletAddress || walletAddress.length < 10) {
                yield this.ui.sendErrorMessage(chatId, 'Please enter a valid wallet address.');
                return;
            }
            // Store wallet address
            this.sessionManager.setWallet(chatId, walletAddress);
            this.sessionManager.setState(chatId, null);
            yield this.ui.sendSuccessMessage(chatId, `Your wallet has been connected successfully!\nAddress: ${walletAddress}`);
            // Show main menu after connecting wallet
            yield this.ui.sendMainMenu(chatId, true);
        });
    }
    handleWalletInfo(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            const walletAddress = this.sessionManager.getWallet(chatId);
            if (!walletAddress) {
                this.sessionManager.setState(chatId, 'connect_wallet');
                yield this.ui.sendWalletConnectPrompt(chatId);
                return;
            }
            try {
                const positions = yield this.api.getUserPositions(walletAddress);
                yield this.ui.sendWalletInfo(chatId, walletAddress, positions);
            }
            catch (error) {
                console.error('Error fetching wallet info:', error);
                yield this.ui.sendWalletInfo(chatId, walletAddress);
            }
        });
    }
    handleShowMarkets(chatId_1) {
        return __awaiter(this, arguments, void 0, function* (chatId, initialAction = null) {
            try {
                // Check if wallet is connected for supply/withdraw/borrow/repay actions
                if (initialAction && !this.sessionManager.getWallet(chatId)) {
                    this.sessionManager.setState(chatId, 'connect_wallet');
                    yield this.ui.sendErrorMessage(chatId, `You need to connect your wallet first to ${initialAction} tokens.`);
                    yield this.ui.sendWalletConnectPrompt(chatId);
                    return;
                }
                const markets = yield this.api.getMarkets();
                if (!markets || markets.length === 0) {
                    yield this.ui.sendErrorMessage(chatId, 'No markets available at the moment.');
                    return;
                }
                // Enhance market data with names if not provided by API
                const enhancedMarkets = markets.map((market, index) => (Object.assign(Object.assign({}, market), { name: market.name || `Market ${index + 1}`, symbol: market.symbol || '' })));
                // Store markets for later use
                this.sessionManager.setMarkets(chatId, enhancedMarkets);
                // Set initial action if provided
                if (initialAction) {
                    this.sessionManager.setState(chatId, initialAction);
                }
                yield this.ui.sendMarketsList(chatId, enhancedMarkets, initialAction);
            }
            catch (error) {
                console.error('Error showing markets:', error);
                yield this.ui.sendErrorMessage(chatId, 'Failed to fetch market data. Please try again later.');
            }
        });
    }
    handleMarketSelection(chatId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const actionCode = data.charAt(0);
            const marketIndex = parseInt(data.substring(2));
            const markets = this.sessionManager.getMarkets(chatId);
            if (!markets || marketIndex >= markets.length) {
                yield this.ui.sendErrorMessage(chatId, 'Invalid market selection. Please try again.');
                return;
            }
            const selectedMarket = markets[marketIndex];
            this.sessionManager.setCurrentMarket(chatId, selectedMarket);
            // Map action code to state
            const actionMap = {
                's': 'supply',
                'b': 'borrow',
                'w': 'withdraw',
                'r': 'repay'
            };
            const action = actionMap[actionCode];
            if (!action) {
                yield this.ui.sendErrorMessage(chatId, 'Invalid action. Please try again.');
                return;
            }
            this.sessionManager.setState(chatId, action);
            yield this.ui.sendTransactionForm(chatId, action, selectedMarket);
        });
    }
    handleAmountInput(chatId, amountStr, state) {
        return __awaiter(this, void 0, void 0, function* () {
            // Parse and validate amount
            const amount = parseFloat(amountStr);
            if (isNaN(amount) || amount <= 0) {
                yield this.ui.sendErrorMessage(chatId, 'Please enter a valid positive number for the amount.');
                return;
            }
            const selectedMarket = this.sessionManager.getCurrentMarket(chatId);
            const walletAddress = this.sessionManager.getWallet(chatId);
            if (!selectedMarket) {
                yield this.ui.sendErrorMessage(chatId, 'Market selection error. Please try again.');
                return;
            }
            if (!walletAddress) {
                this.sessionManager.setState(chatId, 'connect_wallet');
                yield this.ui.sendWalletConnectPrompt(chatId);
                return;
            }
            try {
                // Store amount for confirmation step
                this.sessionManager.setAmount(chatId, amount);
                // Generate transaction payload
                const response = yield this.api.createTransactionPayload(state, selectedMarket.coinAddress, selectedMarket.id, amount, walletAddress);
                console.log("payload:", response.payload);
                // Store payload for confirmation step
                this.sessionManager.setPayload(chatId, response.payload);
                yield this.ui.sendTransactionConfirmation(chatId, state, selectedMarket, amount, response.payload);
            }
            catch (error) {
                console.error('Transaction error:', error);
                yield this.ui.sendErrorMessage(chatId, `Error creating ${state} transaction. Please try again later.`);
            }
        });
    }
    handleTransactionConfirmation(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Transaction Confirmation Started");
            const state = this.sessionManager.getState(chatId);
            const market = this.sessionManager.getCurrentMarket(chatId);
            const amount = this.sessionManager.getAmount(chatId);
            const payload = this.sessionManager.getPayload(chatId);
            console.log("Payload:", payload);
            if (!state || !market || !amount || !payload) {
                yield this.ui.sendErrorMessage(chatId, 'Transaction details missing. Please try again.');
                return;
            }
            try {
                // Submit the transaction to the blockchain
                const txHash = yield this.ui.sendTransaction(payload);
                yield this.ui.sendSuccessMessage(chatId, `Your ${state} transaction of ${amount} tokens has been submitted successfully!\nTransaction Hash: ${txHash}`);
                // Reset user state
                this.sessionManager.resetSession(chatId);
            }
            catch (error) {
                console.error('Transaction submission error:', error);
                yield this.ui.sendErrorMessage(chatId, 'Failed to submit transaction. Please try again later.');
            }
        });
    }
}
// Run the bot
try {
    const bot = new PlutusBot(BOT_TOKEN, API_URL);
    console.log('Plutus Move Telegram Bot is running...');
}
catch (error) {
    console.error('Failed to start the bot:', error);
    process.exit(1);
}
