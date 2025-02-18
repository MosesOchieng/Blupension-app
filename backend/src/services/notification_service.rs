use reqwest::Client;
use crate::error::Result;

impl NotificationService {
    pub async fn send_deposit_confirmation(
        &self,
        phone_number: &str,
        amount: Decimal,
        reference: &str,
    ) -> Result<()> {
        let message = format!(
            "Your deposit of KES {} has been received. Reference: {}. Thank you for using our service.",
            amount, reference
        );
        
        self.send_sms(phone_number, &message).await
    }

    pub async fn send_withdrawal_initiated(
        &self,
        phone_number: &str,
        amount: Decimal,
    ) -> Result<()> {
        let message = format!(
            "Your withdrawal request for KES {} has been initiated. You will receive an M-PESA prompt shortly.",
            amount
        );
        
        self.send_sms(phone_number, &message).await
    }
}
