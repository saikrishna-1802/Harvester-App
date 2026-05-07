import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Loader2, Info } from 'lucide-react';

const Settings = () => {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const { data } = await axios.get('http://192.168.1.15:5000/api/rates');
      setRates(data);
    } catch (err) {
      console.error('Failed to fetch rates');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (index, field, value) => {
    const newRates = [...rates];
    newRates[index][field] = value;
    setRates(newRates);
  };

  const saveRate = async (rate) => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await axios.put(`http://192.168.1.15:5000/api/rates/${rate.id}`, {
        rate_2x2: rate.rate_2x2,
        rate_4x4: rate.rate_4x4,
        tractor_trip_rate: rate.tractor_trip_rate
      });
      setMessage({ type: 'success', text: `${rate.harvester_id} updated successfully!` });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update rates' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Rates Configuration</h1>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg flex items-center ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          <Info className="w-5 h-5 mr-2" />
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rates.map((rate, index) => (
          <div key={rate.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">{rate.harvester_id}</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">2x2 Mode Rate (per hour)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                  <input
                    type="number"
                    value={rate.rate_2x2}
                    onChange={(e) => handleInputChange(index, 'rate_2x2', parseFloat(e.target.value))}
                    className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">4x4 Mode Rate (per hour)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                  <input
                    type="number"
                    value={rate.rate_4x4}
                    onChange={(e) => handleInputChange(index, 'rate_4x4', parseFloat(e.target.value))}
                    className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tractor Trip Rate</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                  <input
                    type="number"
                    value={rate.tractor_trip_rate}
                    onChange={(e) => handleInputChange(index, 'tractor_trip_rate', parseFloat(e.target.value))}
                    className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => saveRate(rate)}
                  disabled={saving}
                  className="w-full flex justify-center items-center py-2.5 px-4 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors disabled:opacity-70"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                  Save Rates
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Settings;
