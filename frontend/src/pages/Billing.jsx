import { useState, useEffect, useCallback } from 'react';
import { billingService, patientService } from '../services/services';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import LoadingSkeleton from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencilSquare, HiOutlineTrash, HiOutlineMagnifyingGlass, HiOutlineBanknotes } from 'react-icons/hi2';

const Billing = () => {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    patient_id: '', appointment_id: '', total_amount: '', payment_status: 'Pending', payment_method: '', billing_date: '',
  });

  const fetchBills = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await billingService.getAll({ search, payment_status: statusFilter, page, limit: 10 });
      setBills(data.data);
      setPagination(data.pagination);
    } catch { toast.error('Failed to fetch bills'); }
    finally { setLoading(false); }
  }, [search, statusFilter, page]);

  useEffect(() => { fetchBills(); }, [fetchBills]);
  useEffect(() => { patientService.getAll({ limit: 100 }).then(r => setPatients(r.data.data)).catch(() => {}); }, []);
  useEffect(() => { const t = setTimeout(() => setPage(1), 300); return () => clearTimeout(t); }, [search, statusFilter]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openCreate = () => {
    setEditing(null);
    setForm({ patient_id: '', appointment_id: '', total_amount: '', payment_status: 'Pending', payment_method: '', billing_date: new Date().toISOString().split('T')[0] });
    setModalOpen(true);
  };

  const openEdit = (bill) => {
    setEditing(bill);
    setForm({
      patient_id: bill.patient_id || '', appointment_id: bill.appointment_id || '',
      total_amount: bill.total_amount || '', payment_status: bill.payment_status || 'Pending',
      payment_method: bill.payment_method || '', billing_date: bill.billing_date ? bill.billing_date.split('T')[0] : '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patient_id || !form.total_amount || !form.billing_date) { toast.error('Patient, amount, and date required'); return; }
    try {
      if (editing) { await billingService.update(editing.bill_id, form); toast.success('Bill updated'); }
      else { await billingService.create(form); toast.success('Bill created'); }
      setModalOpen(false); fetchBills();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed'); }
  };

  const handlePayment = async (id, payment_status, payment_method) => {
    try { await billingService.updatePaymentStatus(id, { payment_status, payment_method }); toast.success('Payment updated'); fetchBills(); }
    catch { toast.error('Failed to update payment'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this bill?')) return;
    try { await billingService.remove(id); toast.success('Deleted'); fetchBills(); }
    catch { toast.error('Failed'); }
  };

  const statusColors = { Pending: 'badge-pending', Paid: 'badge-paid', Partial: 'badge-partial' };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-500/15 text-amber-400" style={{ marginLeft: '16px' }}>
            <HiOutlineBanknotes size={24} />
          </div>
          <div style={{ marginLeft: '10px' }}>
            <h1 className="text-2xl font-bold text-white tracking-tight">Billing</h1>
            <p className="text-sm text-gray-400 mt-1 tracking-wide">Manage bills & payments</p>
          </div>
        </div>
        <button onClick={openCreate} className="btn-glow flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white text-sm font-medium tracking-wide">
          <HiOutlinePlus size={18} /> Generate Bill
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-lg">
          <HiOutlineMagnifyingGlass className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="input-glass search-input" placeholder="Search bills..." />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select-glass max-w-[200px]">
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
          <option value="Partial">Partial</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? <div className="p-7"><LoadingSkeleton rows={5} columns={6} /></div> : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: '40px' }}>Bill #</th>
                  <th style={{ paddingLeft: '28px' }}>Patient</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Method</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((b) => (
                  <tr key={b.bill_id}>
                    <td className="text-gray-400 font-mono" style={{ paddingLeft: '40px' }}>#{b.bill_id}</td>
                    <td className="text-white font-medium" style={{ paddingLeft: '28px' }}>{b.patient_name}</td>
                    <td className="text-white font-semibold">${Number(b.total_amount).toLocaleString()}</td>
                    <td className="text-gray-400">{new Date(b.billing_date).toLocaleDateString()}</td>
                    <td>
                      <select
                        value={b.payment_status}
                        onChange={(e) => handlePayment(b.bill_id, e.target.value, b.payment_method)}
                        className={`badge cursor-pointer border-0 outline-none ${statusColors[b.payment_status]}`}
                        style={{ WebkitAppearance: 'none', backgroundImage: 'none', paddingRight: '14px' }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Partial">Partial</option>
                      </select>
                    </td>
                    <td className="text-gray-400">{b.payment_method || '—'}</td>
                    <td>
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => openEdit(b)} className="p-2.5 rounded-xl hover:bg-white/8 text-gray-400 hover:text-blue-400 transition-all">
                          <HiOutlinePencilSquare size={16} />
                        </button>
                        <button onClick={() => handleDelete(b.bill_id)} className="p-2.5 rounded-xl hover:bg-white/8 text-gray-400 hover:text-rose-400 transition-all">
                          <HiOutlineTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {bills.length === 0 && <tr><td colSpan={7} className="text-center py-16 text-gray-500 text-sm">No bills found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-7 pb-5"><Pagination pagination={pagination} onPageChange={setPage} /></div>
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Bill' : 'Generate Bill'} size="md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label>Patient *</label>
              <select name="patient_id" value={form.patient_id} onChange={handleChange} className="select-glass">
                <option value="">Select patient</option>
                {patients.map(p => <option key={p.patient_id} value={p.patient_id}>{p.first_name} {p.last_name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Amount *</label>
              <input type="number" step="0.01" name="total_amount" value={form.total_amount} onChange={handleChange} className="input-glass" placeholder="0.00" />
            </div>
            <div className="form-group">
              <label>Date *</label>
              <input type="date" name="billing_date" value={form.billing_date} onChange={handleChange} className="input-glass" />
            </div>
            <div className="form-group">
              <label>Payment Status</label>
              <select name="payment_status" value={form.payment_status} onChange={handleChange} className="select-glass">
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
              </select>
            </div>
            <div className="form-group">
              <label>Payment Method</label>
              <select name="payment_method" value={form.payment_method} onChange={handleChange} className="select-glass">
                <option value="">Select method</option>
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="UPI">UPI</option>
                <option value="Insurance">Insurance</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-5 border-t border-white/6">
            <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-3 rounded-xl text-sm text-gray-400 hover:bg-white/5 transition-colors tracking-wide">Cancel</button>
            <button type="submit" className="btn-glow px-7 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white text-sm font-medium tracking-wide">{editing ? 'Update' : 'Generate Bill'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Billing;
