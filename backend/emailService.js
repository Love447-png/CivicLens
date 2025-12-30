// This is a Node.js server-side function.
// Dependencies: npm install nodemailer

const nodemailer = require('nodemailer');

/**
 * Configure email transporter
 * For Gmail: Use App Password, not your login password.
 * For SendGrid: Use 'nodemailer-sendgrid-transport'
 */
const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER, // e.g., 'alerts@civiclens.com'
    pass: process.env.EMAIL_PASS  // App Password
  }
});

/**
 * Sends an email notification when a civic issue is detected.
 * 
 * @param {Object} data - The issue data object.
 * @param {string} data.location - The detected address or coordinates.
 * @param {string} data.issueType - Type of issue (e.g., Pothole).
 * @param {string} data.severity - Severity level (High/Medium/Low).
 * @param {string} data.imageUrl - URL or Base64 string of the issue image.
 * @param {string} data.timestamp - ISO timestamp string.
 */
exports.sendCivicIssueAlert = async (data) => {
  const { location, issueType, severity, imageUrl, timestamp } = data;
  
  // Determine color based on severity
  const severityColor = severity === 'High' ? '#dc2626' : (severity === 'Medium' ? '#d97706' : '#16a34a');

  const mailOptions = {
    from: '"CivicLens AI" <alerts@civiclens.com>',
    to: 'city-admin@example.gov', // Recipient
    subject: `⚠️ New Civic Issue at ${location}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #1e293b; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">CivicLens Alert</h1>
        </div>
        
        <div style="padding: 24px;">
          <h2 style="color: #334155; margin-top: 0;">New Infrastructure Issue Detected</h2>
          
          <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 8px 0;"><strong>📍 Location:</strong> ${location}</p>
            <p style="margin: 8px 0;"><strong>🚨 Severity:</strong> <span style="color: ${severityColor}; font-weight: bold;">${severity}</span></p>
            <p style="margin: 8px 0;"><strong>⚠️ Type:</strong> ${issueType}</p>
            <p style="margin: 8px 0;"><strong>🕒 Time:</strong> ${new Date(timestamp).toLocaleString()}</p>
          </div>

          <p style="color: #64748b;">Snapshot Evidence:</p>
          <img src="${imageUrl}" alt="Issue Evidence" style="width: 100%; height: auto; border-radius: 4px; border: 1px solid #cbd5e1;" />
          
          <div style="margin-top: 30px; text-align: center;">
            <a href="https://civiclens.app/dashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View in Admin Dashboard</a>
          </div>
        </div>
        
        <div style="background-color: #f1f5f9; padding: 12px; text-align: center; color: #94a3b8; font-size: 12px;">
          Generated automatically by CivicLens AI Vision System
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Alert email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending alert email:', error);
    throw error;
  }
};