const nodemailer = require('nodemailer');
const Setting = require('../models/Setting');

const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.in',
    port: 465,
    secure: true,
    auth: {
        user: 'levelup.dev@moinsheikh.in',
        pass: 'Aa4FuBkxb9cf'
    }
});

/**
 * Send an email if the specific notification setting is enabled
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @param {string} settingKey - Key in settings to check (e.g., 'notifyNewUser')
 */
const sendMail = async (to, subject, html, settingKey) => {
    try {
        // Fetch settings
        const settings = await Setting.findOne({ key: 'global' });

        // If settingKey is provided, check if it's enabled. Default to true if settings document not found yet.
        if (settingKey && settings && !settings[settingKey]) {
            console.log(`Email skipped: ${settingKey} is disabled.`);
            return;
        }

        const mailOptions = {
            from: '"LevelUp.dev" <levelup.dev@moinsheikh.in>',
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = { sendMail };
