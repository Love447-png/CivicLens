import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Ticket, Severity } from '../types';
import L from 'leaflet';
import { PieChart, Pie, Cell, Tooltip as ReTooltip, ResponsiveContainer, Legend } from 'recharts';
import { CheckCircle2, Clock, AlertOctagon, Map as MapIcon, List } from 'lucide-react';

// Fix Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Mock Data - In a real app, fetch this from Firestore
const MOCK_TICKETS: Ticket[] = [
  { id: 'CIV-9281', imageUrl: 'https://picsum.photos/200', issue_type: 'Pothole', severity: Severity.HIGH, status: 'Open', timestamp: '2023-10-24 10:30', location: { lat: 12.9716, lng: 77.5946, address: 'MG Road' } },
  { id: 'CIV-3829', imageUrl: 'https://picsum.photos/201', issue_type: 'Garbage Dump', severity: Severity.MEDIUM, status: 'In Progress', timestamp: '2023-10-24 11:15', location: { lat: 12.9756, lng: 77.6046, address: 'Indiranagar' } },
  { id: 'CIV-1120', imageUrl: 'https://picsum.photos/202', issue_type: 'Broken Light', severity: Severity.LOW, status: 'Resolved', timestamp: '2023-10-23 18:45', location: { lat: 12.9356, lng: 77.6146, address: 'Koramangala' } },
  { id: 'CIV-5592', imageUrl: 'https://picsum.photos/203', issue_type: 'Open Manhole', severity: Severity.HIGH, status: 'Open', timestamp: '2023-10-24 09:00', location: { lat: 12.9256, lng: 77.5846, address: 'Jayanagar' } },
  { id: 'CIV-7734', imageUrl: 'https://picsum.photos/204', issue_type: 'Illegal Parking', severity: Severity.MEDIUM, status: 'Open', timestamp: '2023-10-24 14:20', location: { lat: 12.9856, lng: 77.5646, address: 'Malleshwaram' } },
];

const ANALYTICS_DATA = [
  { name: 'Potholes', value: 45 },
  { name: 'Garbage', value: 32 },
  { name: 'Lights', value: 18 },
  { name: 'Manholes', value: 12 },
  { name: 'Parking', value: 28 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getStatusColor = (status: string) => {
    if (status === 'Resolved') return 'text-emerald-600 bg-emerald-50';
    if (status === 'In Progress') return 'text-blue-600 bg-blue-50';
    return 'text-red-600 bg-red-50';
  };

  const getSeverityBadge = (severity: Severity) => {
    const colors = {
      [Severity.HIGH]: 'bg-red-500',
      [Severity.MEDIUM]: 'bg-yellow-400', 
      [Severity.LOW]: 'bg-green-500',
      [Severity.NONE]: 'bg-gray-500',
    };
    return <span className={`w-2.5 h-2.5 rounded-full ${colors[severity]} inline-block mr-2`} />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">City Operations Dashboard</h1>
          <p className="text-slate-500">Overview of civic infrastructure health</p>
        </div>
        <div className="flex bg-white rounded-lg p-1 shadow-sm border border-slate-200">
          <button 
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${viewMode === 'list' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <List size={16} /> List View
          </button>
          <button 
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${viewMode === 'map' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <MapIcon size={16} /> Map View
          </button>
        </div>
      </div>

      {/* Stats Grid Counters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Active Issues</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">128</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg text-red-600">
            <AlertOctagon size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Resolved This Week</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">45</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <CheckCircle2 size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Avg. Response Time</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">4.2 Hrs</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <Clock size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
          {viewMode === 'list' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Ticket ID</th>
                    <th className="px-6 py-4">Issue</th>
                    <th className="px-6 py-4">Severity</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_TICKETS.map((ticket) => (
                    <tr key={ticket.id} className="bg-white border-b hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">{ticket.id}</td>
                      <td className="px-6 py-4">{ticket.issue_type}</td>
                      <td className="px-6 py-4 flex items-center">
                         {getSeverityBadge(ticket.severity)}
                         {ticket.severity}
                      </td>
                      <td className="px-6 py-4 truncate max-w-[150px]">{ticket.location.address}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-[500px] w-full z-0 relative">
               {isClient && (
                <MapContainer center={[12.9716, 77.5946]} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  />
                  {MOCK_TICKETS.map((ticket) => (
                    <Marker key={ticket.id} position={[ticket.location.lat, ticket.location.lng]}>
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-bold">{ticket.issue_type}</h3>
                          <p className="text-sm text-slate-500">{ticket.location.address}</p>
                          <p className={`text-xs mt-1 font-semibold ${
                            ticket.severity === Severity.HIGH ? 'text-red-600' : 'text-blue-600'
                          }`}>Severity: {ticket.severity}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
               )}
            </div>
          )}
        </div>

        {/* Analytics Sidebar with Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <h3 className="font-bold text-slate-900 mb-6">Issue Distribution</h3>
          <div className="flex-grow min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ANALYTICS_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {ANALYTICS_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ReTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Priority Alerts</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg text-sm text-red-800">
                <AlertOctagon size={16} className="shrink-0 mt-0.5" />
                <p>Open manhole reported in Jayanagar Zone 4. Crew dispatched.</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg text-sm text-orange-800">
                <AlertOctagon size={16} className="shrink-0 mt-0.5" />
                <p>Multiple streetlight failures on MG Road flyover.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;