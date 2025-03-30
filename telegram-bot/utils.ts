/**
 * Utility functions for the Plutus Move Telegram Bot
 */

/**
 * Fetch with timeout to prevent hanging requests
 * @param url - The URL to fetch
 * @param options - Fetch options with additional timeout parameter
 * @returns A promise that resolves to the Response object
 */
export async function fetchWithTimeout(url: string, options: any = {}): Promise<Response> {
    const { timeout = 8000, ...fetchOptions } = options;

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            signal: abortController.signal
        });
        return response;
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error(`Request timed out after ${timeout}ms`);
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}

/**
 * Validates a blockchain wallet address
 * @param address - The wallet address to validate
 * @returns boolean indicating if the address is valid
 */
export function isValidWalletAddress(address: string): boolean {
    // Implement wallet address validation based on the Move blockchain requirements
    // This is a simplified example
    return !!address && address.length >= 32 && /^0x[a-fA-F0-9]{40,64}$/.test(address);
}

/**
 * Format currency values with appropriate decimals
 * @param value - The value to format
 * @param decimals - Number of decimal places
 * @returns Formatted string
 */
export function formatCurrency(value: number, decimals: number = 2): string {
    return value.toFixed(decimals);
}

/**
 * Rate limiting helper to prevent spam
 */
export class RateLimiter {
    private requests: Map<number, number[]> = new Map();
    private maxRequests: number;
    private timeWindow: number;

    /**
     * Create a new rate limiter
     * @param maxRequests - Maximum number of requests allowed in the time window
     * @param timeWindow - Time window in milliseconds
     */
    constructor(maxRequests: number = 5, timeWindow: number = 60000) {
        this.maxRequests = maxRequests;
        this.timeWindow = timeWindow;
    }

    /**
     * Check if a user has exceeded their rate limit
     * @param userId - User identifier
     * @returns boolean indicating if the user is rate limited
     */
    isRateLimited(userId: number): boolean {
        const now = Date.now();
        const userRequests = this.requests.get(userId) || [];

        // Filter out requests outside the time window
        const recentRequests = userRequests.filter(timestamp => now - timestamp < this.timeWindow);
        
        // Update the requests map
        this.requests.set(userId, recentRequests);

        // Check if user has exceeded the limit
        return recentRequests.length >= this.maxRequests;
    }

    /**
     * Record a new request for a user
     * @param userId - User identifier
     */
    addRequest(userId: number): void {
        const now = Date.now();
        const userRequests = this.requests.get(userId) || [];
        userRequests.push(now);
        this.requests.set(userId, userRequests);
    }

    /**
     * Get time remaining until user can make another request
     * @param userId - User identifier
     * @returns Time in milliseconds until next request allowed, or 0 if not rate limited
     */
    getTimeRemaining(userId: number): number {
        if (!this.isRateLimited(userId)) {
            return 0;
        }

        const userRequests = this.requests.get(userId) || [];
        if (userRequests.length === 0) {
            return 0;
        }

        // Sort requests to get the oldest one within the window
        userRequests.sort((a, b) => a - b);
        const oldestRequest = userRequests[0];
        const now = Date.now();
        
        return Math.max(0, this.timeWindow - (now - oldestRequest));
    }
}

/**
 * Format APR value for display
 * @param apr - APR value as a percentage
 * @returns Formatted APR string with 2 decimal places
 */
export function formatAPR(apr: number): string {
    return `${apr.toFixed(2)}%`;
}

/**
 * Format token amount with appropriate decimals
 * @param amount - The token amount
 * @param decimals - Number of decimal places for the token
 * @returns Formatted token amount string
 */
export function formatTokenAmount(amount: number, decimals: number = 18): string {
    const divisor = Math.pow(10, decimals);
    return (amount / divisor).toFixed(Math.min(decimals, 6));
}

/**
 * Truncate wallet address for display
 * @param address - Full wallet address
 * @returns Truncated address (e.g., 0x1234...abcd)
 */
export function truncateAddress(address: string): string {
    if (!address || address.length < 10) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

/**
 * Parse token amount input, handling various formats
 * @param input - User input string for token amount
 * @param decimals - Number of decimal places for the token
 * @returns Parsed amount or null if invalid
 */
export function parseTokenInput(input: string, decimals: number = 18): number | null {
    // Remove any commas and trim whitespace
    const cleaned = input.replace(/,/g, '').trim();
    
    // Check for valid number format
    if (!/^(\d+\.?\d*|\.\d+)$/.test(cleaned)) {
        return null;
    }
    
    const parsed = parseFloat(cleaned);
    
    // Check for NaN or negative values
    if (isNaN(parsed) || parsed < 0) {
        return null;
    }
    
    // Convert to token units with the appropriate decimals
    return parsed * Math.pow(10, decimals);
}

/**
 * Retry a function with exponential backoff
 * @param fn - Function to retry
 * @param maxRetries - Maximum number of retry attempts
 * @param baseDelay - Base delay in milliseconds
 * @returns Promise resolving to the function result
 */
export async function retry<T>(
    fn: () => Promise<T>, 
    maxRetries: number = 3, 
    baseDelay: number = 300
): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            
            // Calculate delay with exponential backoff
            const delay = baseDelay * Math.pow(2, attempt);
            
            // Wait before next retry
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    throw lastError;
}

/**
 * Log errors with additional context
 * @param message - Error message
 * @param error - Error object
 * @param context - Additional context information
 */
export function logError(message: string, error: any, context: Record<string, any> = {}): void {
    console.error(`[ERROR] ${message}`, {
        error: error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack
        } : error,
        context,
        timestamp: new Date().toISOString()
    });
}