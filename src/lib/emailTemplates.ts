
export interface OrderTemplateData {
  customerName: string;
  itemName: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'completed';
  dateDetails: string;
  price: string;
  supportEmail: string;
}

export const getOrderStatusEmailTemplate = (data: OrderTemplateData) => {
  const { customerName, itemName, orderNumber, status, dateDetails, price, supportEmail } = data;

  const statusColors = {
    pending: '#FFC107',
    confirmed: '#4CAF50',
    completed: '#2196F3'
  };

  const statusText = {
    pending: 'Currently Pending',
    confirmed: 'Booking Confirmed!',
    completed: 'Service Completed'
  };

  const mainColor = statusColors[status];

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
    .header { text-align: center; padding-bottom: 20px; border-bottom: 3px solid ${mainColor}; }
    .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; background: ${mainColor}20; color: ${mainColor}; font-weight: bold; font-size: 14px; margin-top: 10px; }
    .content { padding: 30px 0; }
    .footer { text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 20px; }
    .order-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .btn { display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">LinkVertex Booking</h1>
      <div class="status-badge">${statusText[status]}</div>
    </div>
    <div class="content">
      <p>Hi <strong>${customerName}</strong>,</p>
      <p>Your booking for <strong>${itemName}</strong> is now <strong>${status}</strong>.</p>
      
      <div class="order-details">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span>Order Number:</span>
          <strong>#${orderNumber}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span>Booking Date:</span>
          <strong>${dateDetails || 'TBD'}</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Total:</span>
          <strong>${price}</strong>
        </div>
      </div>

      <p>If you have any questions, please reach out to the provider at <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
      
      <div style="text-align: center;">
        <a href="https://linkvertex.com/orders/${orderNumber}" class="btn">View Order Details</a>
      </div>
    </div>
    <div class="footer">
      <p>&copy; 2026 LinkVertex Profile System. All rights reserved.</p>
      <p>This is an automated notification. Please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>
`;
};
