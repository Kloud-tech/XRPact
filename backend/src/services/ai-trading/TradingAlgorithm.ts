/**
 * AI Trading Algorithm - Baseline Implementation
 *
 * Strategy: Conservative MA Crossover + RSI
 * - Simple Moving Average (SMA) 50/200 crossover
 * - RSI 14 for overbought/oversold signals
 * - Risk management: max 10% of pool per trade
 * - Paper trading mode for hackathon demo
 */

export interface MarketData {
  timestamp: Date;
  price: number;
  volume: number;
}

export interface TradingSignal {
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reason: string;
  suggestedAmount?: number;
}

export interface TradingPerformance {
  totalTrades: number;
  profitableTrades: number;
  totalProfit: number;
  totalLoss: number;
  roi: number;
  sharpeRatio: number;
  maxDrawdown: number;
}

export class TradingAlgorithm {
  private sma50: number[] = [];
  private sma200: number[] = [];
  private rsiPeriod = 14;
  private rsiValues: number[] = [];
  private priceHistory: number[] = [];
  private performance: TradingPerformance = {
    totalTrades: 0,
    profitableTrades: 0,
    totalProfit: 0,
    totalLoss: 0,
    roi: 0,
    sharpeRatio: 0,
    maxDrawdown: 0,
  };

  constructor() {
    console.log('[AI Trading] Algorithm initialized');
  }

  /**
   * Analyze market data and generate trading signal
   */
  analyze(marketData: MarketData[], poolBalance: number): TradingSignal {
    if (marketData.length < 200) {
      return {
        action: 'HOLD',
        confidence: 0,
        reason: 'Insufficient data for analysis (need 200+ candles)',
      };
    }

    // Update price history
    this.priceHistory = marketData.map(d => d.price);

    // Calculate indicators
    const sma50 = this.calculateSMA(this.priceHistory, 50);
    const sma200 = this.calculateSMA(this.priceHistory, 200);
    const rsi = this.calculateRSI(this.priceHistory, this.rsiPeriod);

    // Store indicators
    this.sma50.push(sma50);
    this.sma200.push(sma200);
    this.rsiValues.push(rsi);

    // Generate signal
    return this.generateSignal(sma50, sma200, rsi, poolBalance);
  }

  /**
   * Generate trading signal based on indicators
   */
  private generateSignal(
    sma50: number,
    sma200: number,
    rsi: number,
    poolBalance: number
  ): TradingSignal {
    const maxTradeAmount = poolBalance * 0.1; // Max 10% of pool

    // Buy signal: SMA50 crosses above SMA200 AND RSI < 70
    if (sma50 > sma200 && rsi < 70 && rsi > 30) {
      const previousSMA50 = this.sma50[this.sma50.length - 2] || 0;
      const previousSMA200 = this.sma200[this.sma200.length - 2] || 0;

      if (previousSMA50 <= previousSMA200) {
        // Golden cross
        return {
          action: 'BUY',
          confidence: 0.8,
          reason: `Golden Cross detected (SMA50: ${sma50.toFixed(2)}, SMA200: ${sma200.toFixed(2)}) + RSI: ${rsi.toFixed(2)}`,
          suggestedAmount: maxTradeAmount * 0.5, // Use 50% of max
        };
      }

      return {
        action: 'BUY',
        confidence: 0.6,
        reason: `Bullish trend (SMA50 > SMA200) + Neutral RSI: ${rsi.toFixed(2)}`,
        suggestedAmount: maxTradeAmount * 0.3,
      };
    }

    // Sell signal: SMA50 crosses below SMA200 OR RSI > 70
    if (sma50 < sma200 || rsi > 70) {
      const previousSMA50 = this.sma50[this.sma50.length - 2] || 0;
      const previousSMA200 = this.sma200[this.sma200.length - 2] || 0;

      if (previousSMA50 >= previousSMA200 && sma50 < sma200) {
        // Death cross
        return {
          action: 'SELL',
          confidence: 0.9,
          reason: `Death Cross detected (SMA50: ${sma50.toFixed(2)}, SMA200: ${sma200.toFixed(2)})`,
          suggestedAmount: maxTradeAmount * 0.8,
        };
      }

      if (rsi > 70) {
        return {
          action: 'SELL',
          confidence: 0.7,
          reason: `Overbought condition (RSI: ${rsi.toFixed(2)})`,
          suggestedAmount: maxTradeAmount * 0.4,
        };
      }

      return {
        action: 'SELL',
        confidence: 0.5,
        reason: `Bearish trend (SMA50 < SMA200)`,
        suggestedAmount: maxTradeAmount * 0.2,
      };
    }

    // Hold
    return {
      action: 'HOLD',
      confidence: 1.0,
      reason: `No clear signal (SMA50: ${sma50.toFixed(2)}, SMA200: ${sma200.toFixed(2)}, RSI: ${rsi.toFixed(2)})`,
    };
  }

  /**
   * Calculate Simple Moving Average
   */
  private calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return 0;

    const slice = prices.slice(-period);
    const sum = slice.reduce((acc, price) => acc + price, 0);
    return sum / period;
  }

  /**
   * Calculate RSI (Relative Strength Index)
   */
  private calculateRSI(prices: number[], period: number): number {
    if (prices.length < period + 1) return 50; // Neutral

    const changes: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      changes.push(prices[i] - prices[i - 1]);
    }

    const recentChanges = changes.slice(-period);
    const gains = recentChanges.filter(c => c > 0);
    const losses = recentChanges.filter(c => c < 0).map(c => Math.abs(c));

    const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / period : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / period : 0;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    return rsi;
  }

  /**
   * Simulate trade execution and update performance
   */
  simulateTrade(signal: TradingSignal, entryPrice: number, exitPrice: number): number {
    if (signal.action === 'HOLD' || !signal.suggestedAmount) return 0;

    this.performance.totalTrades++;

    const profit = signal.action === 'BUY'
      ? (exitPrice - entryPrice) * signal.suggestedAmount / entryPrice
      : (entryPrice - exitPrice) * signal.suggestedAmount / entryPrice;

    if (profit > 0) {
      this.performance.profitableTrades++;
      this.performance.totalProfit += profit;
    } else {
      this.performance.totalLoss += Math.abs(profit);
    }

    // Update ROI
    this.performance.roi = this.performance.totalProfit - this.performance.totalLoss;

    console.log(`[TRADE] ${signal.action} executed: ${profit > 0 ? '+' : ''}${profit.toFixed(2)} XRP`);

    return profit;
  }

  /**
   * Get performance metrics
   */
  getPerformance(): TradingPerformance {
    return { ...this.performance };
  }

  /**
   * Backtest strategy on historical data
   */
  backtest(historicalData: MarketData[], initialBalance: number): TradingPerformance {
    console.log(`[BACKTEST] Starting with ${historicalData.length} data points`);

    let balance = initialBalance;
    let position: 'LONG' | 'SHORT' | 'NONE' = 'NONE';
    let entryPrice = 0;

    for (let i = 200; i < historicalData.length; i++) {
      const slice = historicalData.slice(0, i);
      const signal = this.analyze(slice, balance);

      if (signal.action === 'BUY' && position === 'NONE') {
        position = 'LONG';
        entryPrice = historicalData[i].price;
      } else if (signal.action === 'SELL' && position === 'LONG') {
        const profit = this.simulateTrade(signal, entryPrice, historicalData[i].price);
        balance += profit;
        position = 'NONE';
      }
    }

    console.log(`[BACKTEST] Final balance: ${balance.toFixed(2)} XRP`);
    console.log(`[BACKTEST] Total profit: ${this.performance.roi.toFixed(2)} XRP`);
    console.log(`[BACKTEST] Win rate: ${(this.performance.profitableTrades / this.performance.totalTrades * 100).toFixed(2)}%`);

    return this.getPerformance();
  }

  /**
   * Generate mock market data for demo
   */
  static generateMockMarketData(days: number): MarketData[] {
    const data: MarketData[] = [];
    let price = 0.5; // Starting XRP price

    for (let i = 0; i < days * 24; i++) {
      // Hourly candles
      const randomWalk = (Math.random() - 0.5) * 0.02; // +/- 2%
      const trend = Math.sin(i / 100) * 0.01; // Cyclical trend
      price = Math.max(0.3, price * (1 + randomWalk + trend));

      data.push({
        timestamp: new Date(Date.now() - (days * 24 - i) * 3600000),
        price,
        volume: Math.random() * 1000000,
      });
    }

    return data;
  }
}

/**
 * Example usage
 */
export async function runTradingSimulation() {
  console.log('[SIMULATION] Starting AI trading algorithm demo...\n');

  const algo = new TradingAlgorithm();
  const mockData = TradingAlgorithm.generateMockMarketData(365); // 1 year of hourly data

  const initialBalance = 10000; // 10,000 XRP
  const performance = algo.backtest(mockData, initialBalance);

  console.log('\n[RESULTS] Trading Performance:');
  console.log(`  Total Trades: ${performance.totalTrades}`);
  console.log(`  Profitable Trades: ${performance.profitableTrades}`);
  console.log(`  Win Rate: ${(performance.profitableTrades / performance.totalTrades * 100).toFixed(2)}%`);
  console.log(`  Total Profit: ${performance.totalProfit.toFixed(2)} XRP`);
  console.log(`  Total Loss: ${performance.totalLoss.toFixed(2)} XRP`);
  console.log(`  Net ROI: ${performance.roi.toFixed(2)} XRP (${(performance.roi / initialBalance * 100).toFixed(2)}%)`);

  return performance;
}
