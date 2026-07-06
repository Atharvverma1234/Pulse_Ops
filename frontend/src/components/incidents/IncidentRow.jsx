// frontend/src/components/incidents/IncidentRow.jsx
import { useNavigate } from 'react-router-dom';
import SeverityBadge from './SeverityBadge';
import StatusBadge   from './StatusBadge';
import { timeAgo }   from '../../utils/incidentUtils';

export default function IncidentRow({ incident }) {
  const navigate = useNavigate();

  return (
    <tr
      onClick={() => navigate(`/incidents/${incident._id}`)}
      className="border-b border-indigo-900/20 hover:bg-indigo-900/10 cursor-pointer transition-colors"
    >
      <td className="px-4 py-3">
        <div>
          <p className="text-white text-sm font-medium leading-tight">
            {incident.title}
          </p>
          {incident.host && (
            <p className="text-slate-500 text-xs mt-0.5">{incident.host}</p>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <SeverityBadge severity={incident.severity} />
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={incident.status} />
      </td>
      <td className="px-4 py-3 text-slate-400 text-sm">
        {incident.assignedTo?.name || (
          <span className="text-slate-600">Unassigned</span>
        )}
      </td>
      <td className="px-4 py-3 text-slate-500 text-xs">
        {timeAgo(incident.createdAt)}
      </td>
    </tr>
  );
}