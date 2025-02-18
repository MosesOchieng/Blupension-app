import { rest } from 'msw';

const API_URL = process.env.REACT_APP_API_URL;

export const handlers = [
  rest.post(`${API_URL}/auth/login`, (req, res, ctx) => {
    return res(
      ctx.json({
        token: 'mock-jwt-token',
        user: {
          id: '1',
          email: 'test@example.com',
        },
      })
    );
  }),

  rest.get(`${API_URL}/investments`, (req, res, ctx) => {
    return res(
      ctx.json({
        total_value: 100000,
        investments: [
          {
            id: '1',
            amount: 50000,
            stablecoin_percentage: 60,
            growing_assets_percentage: 40,
            status: 'ACTIVE',
          },
        ],
      })
    );
  }),
]; 