const warningBanks = [
  'EQUITY_BANK',
  'COOPERATIVE_BANK',
  'NATIONAL_BANK'
];

function bankWarning(req, res, next) {
  const { bank } = req.body;

  if (warningBanks.includes(bank)) {
    return res.status(200).json({
      warning: true,
      message: `Warning: ${bank} transactions may take 24-48 hours to process.`,
      bank,
      estimatedTime: '24-48 hours'
    });
  }

  next();
}

module.exports = { bankWarning }; 