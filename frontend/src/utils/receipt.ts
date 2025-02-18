import { jsPDF } from 'jspdf';
import { formatCurrency, formatPhoneNumber } from './format';

interface TransactionReceipt {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  phoneNumber: string;
  mpesaReference?: string;
  completedAt?: string;
}

export function generateReceipt(transaction: TransactionReceipt): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5',
  });

  // Add logo
  // doc.addImage('/logo.png', 'PNG', 10, 10, 30, 30);

  // Title
  doc.setFontSize(20);
  doc.text('BluPension', 105, 20, { align: 'center' });
  
  doc.setFontSize(16);
  doc.text('Transaction Receipt', 105, 30, { align: 'center' });

  // Transaction details
  doc.setFontSize(12);
  const startY = 50;
  const lineHeight = 8;

  const details = [
    ['Transaction ID:', transaction.id],
    ['Type:', transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)],
    ['Amount:', formatCurrency(transaction.amount)],
    ['Status:', transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)],
    ['Date:', new Date(transaction.date).toLocaleString()],
    ['Phone Number:', formatPhoneNumber(transaction.phoneNumber)],
  ];

  if (transaction.mpesaReference) {
    details.push(['M-Pesa Reference:', transaction.mpesaReference]);
  }

  if (transaction.completedAt) {
    details.push(['Completed At:', new Date(transaction.completedAt).toLocaleString()]);
  }

  details.forEach(([label, value], index) => {
    const y = startY + (index * lineHeight);
    doc.text(label, 20, y);
    doc.text(String(value), 80, y);
  });

  // Footer
  doc.setFontSize(10);
  doc.text('Thank you for using BluPension', 105, 130, { align: 'center' });
  doc.text('For any queries, please contact support@blupension.com', 105, 135, { align: 'center' });

  // Save the PDF
  doc.save(`blupension-receipt-${transaction.id}.pdf`);
} 