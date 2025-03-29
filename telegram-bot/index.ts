import TelegramBot from 'node-telegram-bot-api';
const API_URL = 'https://plutus-move.onrender.com';

const BOT_TOKEN = '7871171849:AAF0XJN4b-DGjLJu8ltNLiqDMmY5620JjjE';
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Define types
interface Market {
    id: string;
    coinAddress: string;
    supplyApr: number;
    borrowApr: number;
    price: number;
}

type UserState = 'supply' | 'withdraw' | 'borrow' | 'repay' | null;

// Track user states and market selections to handle multi-step interactions
const userStates = new Map<number, UserState>();
const userMarketSelections = new Map<number, Market[]>(); // Store full market objects
const userCurrentMarket = new Map<number, Market>(); // Store currently selected market

// Start command handler
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    sendMainMenu(chatId);
});

// Help command handler
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    sendHelpMessage(chatId);
});

// Function to send the main menu with buttons
function sendMainMenu(chatId: number) {
    const options = {
        reply_markup: {
            inline_keyboard: [
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
        }
    };

    bot.sendMessage(
        chatId,
        "Welcome to the Plutus Move Bot! What would you like to do?",
        options
    );
}

// Handle callback queries (button clicks)
bot.on('callback_query', async (callbackQuery) => {
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
        await bot.answerCallbackQuery(callbackQuery.id);
    } catch (error) {
        console.error('Error answering callback query:', error);
    }

    // Standard menu actions
    if (data === 'markets') {
        await handleMarkets(chatId);
    }
    else if (data === 'supply' || data === 'withdraw' || data === 'borrow' || data === 'repay') {
        // For these actions, we first need to show markets to select from
        await handleMarkets(chatId, data as UserState);
    }
    else if (data === 'menu') {
        userStates.delete(chatId);
        userMarketSelections.delete(chatId);
        userCurrentMarket.delete(chatId);
        sendMainMenu(chatId);
    }
    else if (data === 'help') {
        sendHelpMessage(chatId);
    }
    // Market-specific actions using numeric indexes
    else if (data.startsWith('s_')) {
        const marketIndex = parseInt(data.substring(2)); // Get market index
        const markets = userMarketSelections.get(chatId);
        
        if (!markets || marketIndex >= markets.length) {
            bot.sendMessage(chatId, "Market selection error. Please try again.", {
                reply_markup: {
                    inline_keyboard: [[{ text: '🔙 Back to Markets', callback_data: 'markets' }]]
                }
            });
            return;
        }

        const selectedMarket = markets[marketIndex];
        userCurrentMarket.set(chatId, selectedMarket);
        userStates.set(chatId, 'supply');

        bot.sendMessage(
            chatId,
            `Please provide the amount to supply to market:\n` +
            `Market ID: ${selectedMarket.id}\n` +
            `Coin Address: ${selectedMarket.coinAddress}\n` +
            `Current Supply APR: ${selectedMarket.supplyApr}%\n\n` +
            `Just enter the amount (e.g., 10):`,
            {
                reply_markup: {
                    inline_keyboard: [[{ text: '🔙 Back to Markets', callback_data: 'markets' }]]
                }
            }
        );
    }
    else if (data.startsWith('b_')) {
        const marketIndex = parseInt(data.substring(2)); // Get market index
        const markets = userMarketSelections.get(chatId);
        
        if (!markets || marketIndex >= markets.length) {
            bot.sendMessage(chatId, "Market selection error. Please try again.", {
                reply_markup: {
                    inline_keyboard: [[{ text: '🔙 Back to Markets', callback_data: 'markets' }]]
                }
            });
            return;
        }

        const selectedMarket = markets[marketIndex];
        userCurrentMarket.set(chatId, selectedMarket);
        userStates.set(chatId, 'borrow');

        bot.sendMessage(
            chatId,
            `Please provide the amount to borrow from market:\n` +
            `Market ID: ${selectedMarket.id}\n` +
            `Coin Address: ${selectedMarket.coinAddress}\n` +
            `Current Borrow APR: ${selectedMarket.borrowApr}%\n\n` +
            `Just enter the amount (e.g., 5):`,
            {
                reply_markup: {
                    inline_keyboard: [[{ text: '🔙 Back to Markets', callback_data: 'markets' }]]
                }
            }
        );
    }
    else if (data.startsWith('w_')) {
        const marketIndex = parseInt(data.substring(2)); // Get market index
        const markets = userMarketSelections.get(chatId);
        
        if (!markets || marketIndex >= markets.length) {
            bot.sendMessage(chatId, "Market selection error. Please try again.", {
                reply_markup: {
                    inline_keyboard: [[{ text: '🔙 Back to Markets', callback_data: 'markets' }]]
                }
            });
            return;
        }

        const selectedMarket = markets[marketIndex];
        userCurrentMarket.set(chatId, selectedMarket);
        userStates.set(chatId, 'withdraw');

        bot.sendMessage(
            chatId,
            `Please provide the amount to withdraw from market:\n` +
            `Market ID: ${selectedMarket.id}\n` +
            `Coin Address: ${selectedMarket.coinAddress}\n\n` +
            `Just enter the amount (e.g., 5):`,
            {
                reply_markup: {
                    inline_keyboard: [[{ text: '🔙 Back to Markets', callback_data: 'markets' }]]
                }
            }
        );
    }
    else if (data.startsWith('r_')) {
        const marketIndex = parseInt(data.substring(2)); // Get market index
        const markets = userMarketSelections.get(chatId);
        
        if (!markets || marketIndex >= markets.length) {
            bot.sendMessage(chatId, "Market selection error. Please try again.", {
                reply_markup: {
                    inline_keyboard: [[{ text: '🔙 Back to Markets', callback_data: 'markets' }]]
                }
            });
            return;
        }

        const selectedMarket = markets[marketIndex];
        userCurrentMarket.set(chatId, selectedMarket);
        userStates.set(chatId, 'repay');

        bot.sendMessage(
            chatId,
            `Please provide the amount to repay to market:\n` +
            `Market ID: ${selectedMarket.id}\n` +
            `Coin Address: ${selectedMarket.coinAddress}\n\n` +
            `Just enter the amount (e.g., 3):`,
            {
                reply_markup: {
                    inline_keyboard: [[{ text: '🔙 Back to Markets', callback_data: 'markets' }]]
                }
            }
        );
    }
    else if (data === 'confirm') {
        // In a real implementation, you would process the transaction here
        bot.sendMessage(
            chatId,
            "Transaction submitted successfully!",
            {
                reply_markup: {
                    inline_keyboard: [[{ text: '🔙 Back to Menu', callback_data: 'menu' }]]
                }
            }
        );

        // Reset user state
        userStates.delete(chatId);
        userMarketSelections.delete(chatId);
        userCurrentMarket.delete(chatId);
    }
    else {
        console.log(`Unknown callback data: ${data}`);
    }
});

// Handle text messages for transaction data input
bot.on('message', async (msg) => {
    if (!msg.text || msg.text.startsWith('/')) {
        return;
    }

    const chatId = msg.chat.id;
    const text = msg.text;
    const userState = userStates.get(chatId);
    const selectedMarket = userCurrentMarket.get(chatId);

    // If no state or no selected market, ignore
    if (!userState || !selectedMarket) {
        return;
    }

    // Check if input is a valid number
    const amountStr = text.trim();
    const amount = parseFloat(amountStr);

    if (isNaN(amount) || amount <= 0) {
        bot.sendMessage(
            chatId,
            "Please enter a valid positive number for the amount.",
            {
                reply_markup: {
                    inline_keyboard: [[{ text: '🔙 Back to Menu', callback_data: 'menu' }]]
                }
            }
        );
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/transaction/payload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: userState,
                coinAddress: selectedMarket.coinAddress,
                market: selectedMarket.id,
                amount
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to create ${userState} transaction payload`);
        }

        const { payload } = await response.json();

        bot.sendMessage(
            chatId,
            `${userState.charAt(0).toUpperCase() + userState.slice(1)} Transaction Payload Created:\n` +
            `Market ID: ${selectedMarket.id}\n` +
            `Coin Address: ${selectedMarket.coinAddress}\n` +
            `Amount: ${amount}\n\n` +
            `Payload: ${JSON.stringify(payload, null, 2)}`,
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '✅ Confirm Transaction', callback_data: 'confirm' }
                        ],
                        [
                            { text: '❌ Cancel', callback_data: 'menu' }
                        ]
                    ]
                }
            }
        );

    } catch (error) {
        console.error('API request error:', error);
        bot.sendMessage(
            chatId,
            `Error creating ${userState} transaction. Please try again later.`,
            {
                reply_markup: {
                    inline_keyboard: [[{ text: '🔙 Back to Menu', callback_data: 'menu' }]]
                }
            }
        );
    }
});

// Function to handle market data retrieval and display with action buttons
const handleMarkets = async (chatId: number, initialAction: UserState = null) => {
    try {
        console.log('Attempting to fetch markets from API...');
        const response = await fetch(`${API_URL}/api/markets`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch markets: ${response.status} ${response.statusText}`);
        }

        const markets: Market[] = await response.json();

        if (!markets || markets.length === 0) {
            bot.sendMessage(
                chatId,
                'No markets available at the moment.',
                {
                    reply_markup: {
                        inline_keyboard: [[{ text: '🔙 Back to Menu', callback_data: 'menu' }]]
                    }
                }
            );
            return;
        }

        // Store all market objects for reference
        userMarketSelections.set(chatId, markets);

        let message = 'Available Markets:\n\n';
        markets.forEach((market, index) => {
            message += `Market #${index + 1}:\n`;
            message += `ID: ${market.id}\n`;
            message += `Coin Address: ${market.coinAddress}\n`;
            message += `Supply APR: ${market.supplyApr}%\n`;
            message += `Borrow APR: ${market.borrowApr}%\n`;
            message += `Price: $${market.price}\n\n`;
        });

        console.log("Message prepared");

        // Create action buttons for each market based on the initial action
        const marketButtons = [];
        
        if (initialAction === 'supply') {
            // Only show supply buttons
            markets.forEach((_, index) => {
                marketButtons.push([{ text: `Supply to Market #${index + 1}`, callback_data: `s_${index}` }]);
            });
        } 
        else if (initialAction === 'borrow') {
            // Only show borrow buttons
            markets.forEach((_, index) => {
                marketButtons.push([{ text: `Borrow from Market #${index + 1}`, callback_data: `b_${index}` }]);
            });
        }
        else if (initialAction === 'withdraw') {
            // Only show withdraw buttons
            markets.forEach((_, index) => {
                marketButtons.push([{ text: `Withdraw from Market #${index + 1}`, callback_data: `w_${index}` }]);
            });
        }
        else if (initialAction === 'repay') {
            // Only show repay buttons
            markets.forEach((_, index) => {
                marketButtons.push([{ text: `Repay to Market #${index + 1}`, callback_data: `r_${index}` }]);
            });
        }
        else {
            // Show all options
            markets.forEach((_, index) => {
                marketButtons.push([
                    { text: `Supply to Market #${index + 1}`, callback_data: `s_${index}` },
                    { text: `Borrow from Market #${index + 1}`, callback_data: `b_${index}` }
                ]);
                marketButtons.push([
                    { text: `Withdraw from Market #${index + 1}`, callback_data: `w_${index}` },
                    { text: `Repay to Market #${index + 1}`, callback_data: `r_${index}` }
                ]);
            });
        }

        console.log("Buttons created");

        // Add back button
        marketButtons.push([{ text: '🔙 Back to Menu', callback_data: 'menu' }]);

        console.log("Bot sending message");

        // Set initial action if provided
        if (initialAction) {
            userStates.set(chatId, initialAction);
        }

        bot.sendMessage(
            chatId,
            message,
            {
                reply_markup: {
                    inline_keyboard: marketButtons
                }
            }
        );
    } catch (error) {
        console.error('Market fetch error:', error);
        bot.sendMessage(
            chatId,
            'Error fetching market data. Please try again later.',
            {
                reply_markup: {
                    inline_keyboard: [[{ text: '🔙 Back to Menu', callback_data: 'menu' }]]
                }
            }
        );
    }
};

// Help message function with buttons
const sendHelpMessage = (chatId: number) => {
    const helpMessage = "Welcome to the Plutus Move Bot! Here's what you can do:\n\n" +
        "- Show markets - Display available markets with full IDs and coin addresses\n" +
        "- Supply tokens - Supply tokens to a market\n" +
        "- Withdraw tokens - Withdraw your tokens\n" +
        "- Borrow tokens - Borrow tokens from a market\n" +
        "- Repay tokens - Repay borrowed tokens\n\n" +
        "The process is simplified:\n" +
        "1. Select an action from the menu\n" +
        "2. Choose a market from the list\n" +
        "3. Enter only the amount you wish to transact\n" +
        "4. Confirm the transaction";

    bot.sendMessage(
        chatId,
        helpMessage,
        {
            reply_markup: {
                inline_keyboard: [[{ text: '🔙 Back to Menu', callback_data: 'menu' }]]
            }
        }
    );
};

// Error handler
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

console.log('Bot is running with interactive buttons...');