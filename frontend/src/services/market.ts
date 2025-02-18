import axios from 'axios';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';
const COINMARKETCAP_API_URL = 'https://pro-api.coinmarketcap.com/v1';
const BINANCE_API_URL = 'https://api.binance.com/api/v3';

export interface MarketData {
  price: number;
  volume24h: number;
  percentChange24h: number;
  lastUpdated: Date;
}

class MarketService {
  private async fetchFromCoinGecko(symbol: string): Promise<MarketData> {
    const response = await axios.get(
      `${COINGECKO_API_URL}/simple/price`,
      {
        params: {
          ids: symbol.toLowerCase(),
          vs_currencies: 'usd',
          include_24hr_vol: true,
          include_24hr_change: true,
        },
        headers: {
          'x-cg-api-key': process.env.NEXT_PUBLIC_COINGECKO_API_KEY,
        },
      }
    );

    const data = response.data[symbol.toLowerCase()];
    return {
      price: data.usd,
      volume24h: data.usd_24h_vol,
      percentChange24h: data.usd_24h_change,
      lastUpdated: new Date(),
    };
  }

  private async fetchFromCoinMarketCap(symbol: string): Promise<MarketData> {
    const response = await axios.get(
      `${COINMARKETCAP_API_URL}/cryptocurrency/quotes/latest`,
      {
        params: { symbol },
        headers: {
          'X-CMC_PRO_API_KEY': process.env.NEXT_PUBLIC_COINMARKETCAP_API_KEY,
        },
      }
    );

    const data = response.data.data[symbol].quote.USD;
    return {
      price: data.price,
      volume24h: data.volume_24h,
      percentChange24h: data.percent_change_24h,
      lastUpdated: new Date(data.last_updated),
    };
  }

  private async fetchFromBinance(symbol: string): Promise<MarketData> {
    const response = await axios.get(
      `${BINANCE_API_URL}/ticker/24hr`,
      {
        params: { symbol: `${symbol}USDT` },
        headers: {
          'X-MBX-APIKEY': process.env.NEXT_PUBLIC_BINANCE_API_KEY,
        },
      }
    );

    return {
      price: parseFloat(response.data.lastPrice),
      volume24h: parseFloat(response.data.volume),
      percentChange24h: parseFloat(response.data.priceChangePercent),
      lastUpdated: new Date(),
    };
  }

  async getMarketData(symbol: string): Promise<MarketData> {
    try {
      return await this.fetchFromCoinGecko(symbol);
    } catch (error) {
      try {
        return await this.fetchFromCoinMarketCap(symbol);
      } catch (error) {
        return await this.fetchFromBinance(symbol);
      }
    }
  }

  async getMultipleMarketData(symbols: string[]): Promise<Record<string, MarketData>> {
    const results = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const data = await this.getMarketData(symbol);
          return [symbol, data];
        } catch (error) {
          console.error(`Failed to fetch data for ${symbol}:`, error);
          return [symbol, null];
        }
      })
    );

    return Object.fromEntries(results.filter(([_, data]) => data !== null));
  }
}

export const marketService = new MarketService(); 