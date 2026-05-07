import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import {
  TrendingUp, TrendingDown, Wallet, DollarSign,
  Calendar as CalendarIcon, Loader2,
  ClipboardList, Receipt, Gauge, Users, ArrowRight
} from 'lucide-react';

const StatCard = ({ title, amount, icon: Icon, colorClass, onClick, subtitle }) => (
  <div onClick={onClick} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">₹{Number(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h3>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
    <div className={`p-4 rounded-full ${colorClass}`}><Icon className="w-6 h-6" /></div>
  </div>
);

const ActionCard = ({ title, stats, icon: Icon, colorClass, bgClass, onClick }) => (
  <div onClick={onClick} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all group">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${bgClass} group-hover:scale-110 transition-transform`}>
        <Icon className={`w-5 h-5 ${colorClass}`} />
      </div>
      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
    </div>
    <p className="font-semibold text-gray-800 mb-3">{title}</p>
    <div className="space-y-1.5">
      {stats.map((s, i) => (
        <div key={i} className="flex justify-between items-center">
          <span className="text-xs text-gray-500">{s.label}</span>
          <span className="text-xs font-semibold text-gray-700">{s.value}</span>
        </div>
      ))}
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [rates, setRates] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [summaryRes, jobsRes, expensesRes, ratesRes, usersRes] = await Promise.allSettled([
          axios.get('/api/dashboard/summary', { headers, params: { startDate: dateRange.start, endDate: dateRange.end } }),
          axios.get('/api/jobs', { headers }),
          axios.get('/api/expenses', { headers }),
          axios.get('/api/rates', { headers }),
          axios.get('/api/users', { headers }),
        ]);
        if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value.data);
        if (jobsRes.status === 'fulfilled') setJobs(jobsRes.value.data);
        if (expensesRes.status === 'fulfilled') setExpenses(expensesRes.value.data);
        if (ratesRes.status === 'fulfilled') setRates(ratesRes.value.data);
        if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data);
      } catch (err) {
        console.error('Dashboard fetch error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [dateRange]);

  const handleDateChange = (e) => {
    setDateRange(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const pendingJobs = jobs.filter(j => parseFloat(j.pending_amount) > 0);
  const totalPending = pendingJobs.reduce((sum, j) => sum + parseFloat(j.pending_amount || 0), 0);

  const expensesByCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + parseFloat(e.amount || 0);
    return acc;
  }, {});
  const topCategory = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1])[0];

  const driversCount = users.filter(u => u.role === 'driver').length;
  const adminsCount  = users.filter(u => u.role === 'admin').length;
  const harvesterRates = Array.isArray(rates) ? rates : [rates].filter(Boolean);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Insights Overview</h1>
        <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
          <CalendarIcon className="w-5 h-5 text-gray-400 ml-2" />
          <input type="date" name="start" value={dateRange.start} onChange={handleDateChange} className="text-sm border-none focus:ring-0 text-gray-600 bg-transparent" />
          <span className="text-gray-400">to</span>
          <input type="date" name="end" value={dateRange.end} onChange={handleDateChange} className="text-sm border-none focus:ring-0 text-gray-600 bg-transparent" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : (
        <>
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Income"    amount={summary.total_income}    icon={TrendingUp}  colorClass="bg-green-100 text-green-600"  subtitle={`${jobs.length} jobs this period`}      onClick={() => navigate('/admin/jobs')} />
              <StatCard title="Total Expenses"  amount={summary.total_expenses}  icon={TrendingDown} colorClass="bg-red-100 text-red-600"     subtitle={`${expenses.length} entries`}           onClick={() => navigate('/admin/expenses')} />
              <StatCard title="Net Profit"      amount={summary.profit}          icon={Wallet}      colorClass={summary.profit >= 0 ? 'bg-primary-100 text-primary-600' : 'bg-red-100 text-red-600'} subtitle={summary.profit >= 0 ? 'In profit' : 'In loss'} onClick={() => navigate('/admin/jobs')} />
              <StatCard title="Pending Payments" amount={summary.total_pending}  icon={DollarSign}  colorClass="bg-amber-100 text-amber-600"  subtitle={`${pendingJobs.length} jobs unpaid`}    onClick={() => navigate('/admin/jobs')} />
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <ActionCard
                title="Jobs" icon={ClipboardList} colorClass="text-green-600" bgClass="bg-green-100"
                onClick={() => navigate('/admin/jobs')}
                stats={[
                  { label: 'Total Jobs',       value: jobs.length },
                  { label: 'Pending Payment',  value: `₹${totalPending.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` },
                  { label: 'Jobs Unpaid',      value: pendingJobs.length },
                ]}
              />
              <ActionCard
                title="Expenses" icon={Receipt} colorClass="text-red-500" bgClass="bg-red-100"
                onClick={() => navigate('/admin/expenses')}
                stats={[
                  { label: 'Total Entries', value: expenses.length },
                  { label: 'Top Category',  value: topCategory ? topCategory[0] : '—' },
                  { label: 'Top Amount',    value: topCategory ? `₹${topCategory[1].toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '—' },
                ]}
              />
              <ActionCard
                title="Rates" icon={Gauge} colorClass="text-blue-600" bgClass="bg-blue-100"
                onClick={() => navigate('/admin/rates')}
                stats={
                  harvesterRates.length > 0
                    ? harvesterRates.slice(0, 3).map(r => ({
                        label: r.harvester_id,
                        value: `2x2: ₹${r.rate_2x2} | 4x4: ₹${r.rate_4x4}`
                      }))
                    : [{ label: 'No rates configured', value: '—' }]
                }
              />
              <ActionCard
                title="Users" icon={Users} colorClass="text-indigo-600" bgClass="bg-indigo-100"
                onClick={() => navigate('/admin/users')}
                stats={[
                  { label: 'Total Users', value: users.length },
                  { label: 'Drivers',     value: driversCount },
                  { label: 'Admins',      value: adminsCount },
                ]}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
