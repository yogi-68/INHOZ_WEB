import React, { useState, useEffect } from 'react';
import { FaHistory, FaUser, FaClock, FaFilter } from 'react-icons/fa';
import apiClient from '../../utils/api';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAuditLogs({ limit: 100 });
      if (response.success) {
        setLogs(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    filterAction === 'all' || log.action === filterAction
  );

  const actionTypes = [...new Set(logs.map(log => log.action))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-gray-700 to-gray-900 rounded-xl shadow-xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Audit Logs</h1>
        <p className="text-gray-300 text-lg">System activity and security logs</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Activity Log ({logs.length} entries)</h2>
          <div className="flex items-center space-x-2">
            <FaFilter className="text-gray-400" />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-gray-500 focus:outline-none"
            >
              <option value="all">All Actions</option>
              {actionTypes.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No audit logs available</p>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div key={log._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="px-3 py-1 bg-gray-200 text-gray-800 text-xs font-semibold rounded">
                        {log.action}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                        {log.actorRole}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <span><FaUser className="inline mr-1" />Actor ID: {log.actorUserId?.slice(-8)}</span>
                      <span><FaClock className="inline mr-1" />{new Date(log.createdAt).toLocaleString()}</span>
                      <span>IP: {log.ip}</span>
                    </div>
                    <div className="text-sm text-gray-700">
                      <p><span className="font-semibold">Resource:</span> {log.resource}</p>
                      {log.before && (
                        <p className="mt-1"><span className="font-semibold">Before:</span> {JSON.stringify(log.before).slice(0, 100)}...</p>
                      )}
                      {log.after && (
                        <p className="mt-1"><span className="font-semibold">After:</span> {JSON.stringify(log.after).slice(0, 100)}...</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
