# Blupension API Documentation

## Authentication Endpoints

### Register User
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "password": "string",
    "phone": "string (optional)",
    "address": "string (optional)",
    "retirementAge": "number (optional)",
    "monthlyContribution": "number (optional)",
    "investmentPlan": "string (optional)"
  }
  ```
- **Response**: Returns user data and JWT token

### Login
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**: Returns user data and JWT token

### Get Profile
- **URL**: `/api/auth/profile`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Returns user profile data

## User Management Endpoints

### Update Profile
- **URL**: `/api/users/profile`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer {token}`
- **Body**: Any of the following fields:
  ```json
  {
    "firstName": "string",
    "lastName": "string",
    "phone": "string",
    "address": "string",
    "retirementAge": "number",
    "monthlyContribution": "number",
    "investmentPlan": "string",
    "notifications": "boolean"
  }
  ```
- **Response**: Returns updated user data

### Change Password
- **URL**: `/api/users/change-password`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer {token}`
- **Body**:
  ```json
  {
    "currentPassword": "string",
    "newPassword": "string"
  }
  ```
- **Response**: Success message

### Enable/Disable 2FA
- **URL**: `/api/users/2fa`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer {token}`
- **Body**:
  ```json
  {
    "enable": "boolean"
  }
  ```
- **Response**: Updated 2FA status

### Connect Wallet
- **URL**: `/api/users/connect-wallet`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer {token}`
- **Body**:
  ```json
  {
    "walletAddress": "string"
  }
  ```
- **Response**: Confirmation and wallet address

### Get Investment Summary
- **URL**: `/api/users/investment-summary`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Returns investment metrics and projections

### Delete Account
- **URL**: `/api/users/account`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer {token}`
- **Body**:
  ```json
  {
    "password": "string"
  }
  ```
- **Response**: Success message

## Pension Management Endpoints

### Get Balance
- **URL**: `/api/pension/balance`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Returns current pension balance

### Make Contribution
- **URL**: `/api/pension/contribute`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer {token}`
- **Body**:
  ```json
  {
    "amount": "number"
  }
  ```
- **Response**: Transaction confirmation

### Vest Tokens
- **URL**: `/api/pension/vest`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer {token}`
- **Body**:
  ```json
  {
    "amount": "number"
  }
  ```
- **Response**: Transaction confirmation

### Claim Tokens
- **URL**: `/api/pension/claim`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Transaction confirmation

### Get Contribution History
- **URL**: `/api/pension/history`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Returns contribution history and timestamps

## Error Responses

All endpoints may return the following error responses:

- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Invalid or missing authentication token
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Rate Limiting

API requests are limited to 100 requests per IP address per 15-minute window.

## Blockchain Integration

The API interacts with the Blupension smart contract deployed on the Ethereum network. All blockchain transactions require:
1. A connected wallet address
2. Sufficient ETH for gas fees
3. The appropriate token balance for transfers

## Notes

- All amounts are in wei (10^18 units)
- Dates are returned in ISO 8601 format
- Investment plans can be: 'conservative', 'moderate', or 'aggressive'
- Retirement age must be between 50 and 75 years
- Monthly contributions must be positive numbers 