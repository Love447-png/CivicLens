import React from 'react';
import { MessageSquare, Server, Award, Zap, Mail } from 'lucide-react';

const Integrations: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900">Developer & Integration Hub</h1>
        <p className="text-slate-500 mt-2">Connecting Citizens via WhatsApp & Deploying Scale</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* WhatsApp Integration */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-100 text-green-700 rounded-lg">
              <MessageSquare size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">WhatsApp Bot Integration</h2>
          </div>
          
          <p className="text-slate-600 mb-4 text-sm">
            Enable citizens to report issues simply by sending a photo to the official WhatsApp number. 
            The system uses Webhooks to receive the media, processes it via Gemini Vision, and replies with the ticket ID.
          </p>

          <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
            <code className="text-xs text-green-400 font-mono block">
{`// Node.js Webhook Handler for WhatsApp Cloud API

app.post('/webhook', async (req, res) => {
  const message = req.body.entry?.[0]?.changes[0]?.value?.messages?.[0];
  
  if (message?.type === 'image') {
    const imageId = message.image.id;
    // 1. Download Media from WhatsApp API
    const imageUrl = await getWhatsAppMediaUrl(imageId);
    
    // 2. Analyze with Gemini
    const analysis = await gemini.analyzeImage(imageUrl);
    
    // 3. Save to Firestore
    const ticketId = await db.collection('tickets').add({ ...analysis });
    
    // 4. Reply to User
    await sendWhatsAppMessage(message.from, 
      \`Ticket #\${ticketId} created. Severity: \${analysis.severity}\`);
  }
  res.sendStatus(200);
});`}
            </code>
          </div>
        </div>

        {/* Backend & Deployment */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-100 text-purple-700 rounded-lg">
              <Server size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Deployment Architecture</h2>
          </div>

          <ul className="space-y-4">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">1</span>
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">Firebase Hosting</h3>
                <p className="text-slate-500 text-xs mt-1">Serve the React SPA with global CDN caching. Fast load times for citizens.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">2</span>
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">Firestore Database</h3>
                <p className="text-slate-500 text-xs mt-1">NoSQL schema storing Tickets: <code className="bg-slate-100 px-1 rounded">{'id, location: {lat, lng}, status, issueType'}</code>.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">3</span>
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">Cloud Functions</h3>
                <p className="text-slate-500 text-xs mt-1">Triggers on new image uploads to run Gemini analysis asynchronously if not done client-side.</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Email Notification Service */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 text-blue-700 rounded-lg">
              <Mail size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Real-time Email Alerts</h2>
          </div>
          
          <p className="text-slate-600 mb-4 text-sm">
             The system automatically dispatches email notifications to city administrators when high-severity issues are detected. 
             This backend function uses <strong>Nodemailer</strong> to format HTML emails with embedded evidence images.
          </p>

          <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
            <code className="text-xs text-blue-300 font-mono block">
{`// backend/emailService.js
const nodemailer = require('nodemailer');

exports.sendCivicIssueAlert = async (data) => {
  const { location, issueType, severity, imageUrl, timestamp } = data;
  
  const transporter = nodemailer.createTransport({ /* SMTP Config */ });

  const mailOptions = {
    from: '"CivicLens AI" <alerts@civiclens.com>',
    to: 'city-admin@gov.in',
    subject: \`⚠️ New Civic Issue at \${location}\`,
    html: \`
      <h1>CivicLens Alert</h1>
      <p><strong>Location:</strong> \${location}</p>
      <p><strong>Severity:</strong> \${severity}</p>
      <p><strong>Type:</strong> \${issueType}</p>
      <img src="\${imageUrl}" style="width: 100%; max-width: 500px;" />
      <a href="https://civiclens.app/dashboard">View Ticket</a>
    \`
  };

  await transporter.sendMail(mailOptions);
};`}
            </code>
          </div>
        </div>
      </div>

      {/* Roadmap Section */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-8 text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 p-12 opacity-10">
           <Zap size={120} />
         </div>
         <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
           <Award className="text-yellow-400" /> 
           Future Roadmap
         </h2>
         <div className="grid md:grid-cols-3 gap-6">
           <div className="bg-white/10 p-5 rounded-lg backdrop-blur-sm border border-white/10">
             <h3 className="font-bold text-blue-200 mb-2">Drone Integration</h3>
             <p className="text-sm text-blue-100">Autonomous drone pathing to scan highways and update the heatmap in real-time.</p>
           </div>
           <div className="bg-white/10 p-5 rounded-lg backdrop-blur-sm border border-white/10">
             <h3 className="font-bold text-blue-200 mb-2">Predictive Analytics</h3>
             <p className="text-sm text-blue-100">Use historical data to predict where potholes will form before they become dangerous.</p>
           </div>
           <div className="bg-white/10 p-5 rounded-lg backdrop-blur-sm border border-white/10">
             <h3 className="font-bold text-blue-200 mb-2">Citizen Gamification</h3>
             <p className="text-sm text-blue-100">Reward citizens with tax credits or "Civic Points" for verified reporting.</p>
           </div>
         </div>
      </div>
    </div>
  );
};

export default Integrations;