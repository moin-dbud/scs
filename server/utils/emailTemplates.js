/**
 * Premium Email Templates for LevelUp.dev
 */

const colors = {
    bg: '#ffffff',
    text: '#1a1a1b',
    muted: '#4b5563',
    accent: '#3C83F6',
    border: '#e5e7eb',
    card: '#f9fafb'
};

const head = `
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap');
        body { font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f3f4f6; padding-bottom: 40px; }
        .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; color: #1a1a1b; border-radius: 12px; overflow: hidden; margin-top: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background-color: #0a0a0a; padding: 40px 20px; text-align: center; }
        .content { padding: 40px 30px; line-height: 1.6; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
        .btn { display: inline-block; background-color: #3C83F6; color: #ffffff !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; margin-top: 20px; }
        .h1 { font-size: 24px; font-weight: 800; color: #0a0a0a; margin: 0 0 20px; }
        .p { margin: 0 0 15px; color: #4b5563; font-size: 16px; }
        .card { background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .logo { font-size: 24px; font-weight: 900; color: #ffffff; text-decoration: none; }
        .accent { color: #3C83F6; }
    </style>
</head>
`;

const layout = (content) => `
<!DOCTYPE html>
<html>
${head}
<body>
    <div class="wrapper">
        <table class="main">
            <tr>
                <td class="header">
                    <a href="https://levelup.dev" class="logo">LevelUp<span class="accent">.dev</span></a>
                </td>
            </tr>
            <tr>
                <td class="content">
                    ${content}
                </td>
            </tr>
            <tr>
                <td class="footer">
                    &copy; 2026 LevelUp.dev. All rights reserved.<br>
                    Empowering the next generation of developers.
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
`;

const welcomeTemplate = (name) => layout(`
    <h1 class="h1">Welcome to the future, ${name}! 🚀</h1>
    <p class="p">We're thrilled to have you at <strong>LevelUp.dev</strong>. You've just taken the first step towards mastering the most in-demand technical skills.</p>
    <div class="card">
        <p class="p" style="margin-bottom: 5px; font-weight: 700; color: #0a0a0a;">What's next?</p>
        <p class="p" style="font-size: 14px;">Browse our catalog and pick your first course. Our interactive curriculum is designed to help you learn by building.</p>
    </div>
    <center>
        <a href="http://localhost:5173/courses" class="btn">Explore Courses</a>
    </center>
`);

const enrollmentTemplate = (courseTitle) => layout(`
    <h1 class="h1">Enrollment Confirmed! ✅</h1>
    <p class="p">You are now officially enrolled in:</p>
    <div class="card" style="text-align: center;">
        <h2 style="margin: 0; color: #3C83F6; font-size: 20px; font-weight: 800;">${courseTitle}</h2>
    </div>
    <p class="p">Your learning materials are ready and waiting for you on your dashboard.</p>
    <center>
        <a href="http://localhost:5173/dashboard" class="btn">Start Learning Now</a>
    </center>
`);

const submissionTemplate = (projectTitle) => layout(`
    <h1 class="h1">Project Received! 📬</h1>
    <p class="p">Great job on completing your project! We've successfully received your submission for <strong>${projectTitle}</strong>.</p>
    <div class="card">
        <p class="p" style="margin: 0; font-size: 14px; font-style: italic;">"The best way to predict the future is to create it."</p>
    </div>
    <p class="p">Our team will review your work shortly. You can track your submission status on your profile page.</p>
    <center>
        <a href="http://localhost:5173/profile" class="btn">View My Profile</a>
    </center>
`);

module.exports = {
    welcomeTemplate,
    enrollmentTemplate,
    submissionTemplate
};
