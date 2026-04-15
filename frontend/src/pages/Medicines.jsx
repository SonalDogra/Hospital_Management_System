import { useState, useEffect, useCallback } from 'react';
import { medicineService } from '../services/services';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import LoadingSkeleton from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencilSquare, HiOutlineTrash, HiOutlineMagnifyingGlass, HiOutlineBeaker } from 'react-icons/hi2';

const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    medicine_name: '', manufacturer: '', price: '', stock: '', expiry_date: '',
  });

  const fetchMedicines = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await medicineService.getAll({ search, page, limit: 10 });
      setMedicines(data.data);
      setPagination(data.pagination);
    } catch { toast.error('Failed to fetch medicines'); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetchMedicines(); }, [fetchMedicines]);
  useEffect(() => { const t = setTimeout(() => setPage(1), 300); return () => clearTimeout(t); }, [search]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openCreate = () => {
    setEditing(null);
    setForm({ medicine_name: '', manufacturer: '', price: '', stock: '', expiry_date: '' });
    setModalOpen(true);
  };

  const openEdit = (med) => {
    setEditing(med);
    setForm({
      medicine_name: med.medicine_name || '', manufacturer: med.manufacturer || '',
      price: med.price || '', stock: med.stock || '',
      expiry_date: med.expiry_date ? med.expiry_date.split('T')[0] : '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.medicine_name) { toast.error('Medicine name is required'); return; }
    try {
      if (editing) { await medicineService.update(editing.medicine_id, form); toast.success('Medicine updated'); }
      else { await medicineService.create(form); toast.success('Medicine added'); }
      setModalOpen(false); fetchMedicines();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this medicine?')) return;
    try { await medicineService.remove(id); toast.success('Deleted'); fetchMedicines(); }
    catch { toast.error('Failed'); }
  };

  const getStockBadge = (stock) => {
    if (stock <= 0) return 'bg-rose-500/12 text-rose-400 border-rose-500/20';
    if (stock < 50) return 'bg-amber-500/12 text-amber-400 border-amber-500/20';
    return 'bg-emerald-500/12 text-emerald-400 border-emerald-500/20';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-purple-500/15 text-purple-400" style={{ marginLeft: '16px' }}>
            <HiOutlineBeaker size={24} />
          </div>
          <div style={{ marginLeft: '10px' }}>
            <h1 className="text-2xl font-bold text-white tracking-tight">Medicines</h1>
            <p className="text-sm text-gray-400 mt-1 tracking-wide">Manage medicine inventory</p>
          </div>
        </div>
        <button onClick={openCreate} className="btn-glow flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-medium tracking-wide">
          <HiOutlinePlus size={18} /> Add Medicine
        </button>
      </div>

      {/* Search */}
      <div className="glass-card p-6">
        <div className="relative max-w-lg">
          <HiOutlineMagnifyingGlass className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="input-glass search-input" placeholder="Search medicines..." />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? <div className="p-7"><LoadingSkeleton rows={5} columns={6} /></div> : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: '40px' }}>Medicine</th>
                  <th>Manufacturer</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Expiry</th>
                  <th className="text-right" style={{ paddingRight: '40px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map((m) => (
                  <tr key={m.medicine_id}>
                    <td style={{ paddingLeft: '40px' }}>
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/15 to-pink-500/15 flex items-center justify-center text-purple-400 font-semibold text-sm flex-shrink-0">
                          {m.medicine_name.charAt(0)}
                        </div>
                        <p className="text-sm font-medium text-white">{m.medicine_name}</p>
                      </div>
                    </td>
                    <td className="text-gray-400">{m.manufacturer || '—'}</td>
                    <td className="text-white font-medium">${Number(m.price).toFixed(2)}</td>
                    <td>
                      <span className={`badge border ${getStockBadge(m.stock)}`}>{m.stock} units</span>
                    </td>
                    <td className="text-gray-400">
                      {m.expiry_date ? new Date(m.expiry_date).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ paddingRight: '40px' }}>
                      <div className="flex items-center justify-end gap-1.5" style={{ marginRight: '6px' }}>
                        <button onClick={() => openEdit(m)} className="p-2.5 rounded-xl hover:bg-white/8 text-gray-400 hover:text-blue-400 transition-all">
                          <HiOutlinePencilSquare size={16} />
                        </button>
                        <button onClick={() => handleDelete(m.medicine_id)} className="p-2.5 rounded-xl hover:bg-white/8 text-gray-400 hover:text-rose-400 transition-all">
                          <HiOutlineTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {medicines.length === 0 && <tr><td colSpan={6} className="text-center py-16 text-gray-500 text-sm">No medicines found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-7 pb-5"><Pagination pagination={pagination} onPageChange={setPage} /></div>
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Medicine' : 'Add Medicine'} size="md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group"><label>Medicine Name *</label><input name="medicine_name" value={form.medicine_name} onChange={handleChange} className="input-glass" placeholder="Medicine name" /></div>
            <div className="form-group"><label>Manufacturer</label><input name="manufacturer" value={form.manufacturer} onChange={handleChange} className="input-glass" placeholder="Manufacturer" /></div>
            <div className="form-group"><label>Price ($)</label><input type="number" step="0.01" name="price" value={form.price} onChange={handleChange} className="input-glass" placeholder="0.00" /></div>
            <div className="form-group"><label>Stock</label><input type="number" name="stock" value={form.stock} onChange={handleChange} className="input-glass" placeholder="0" /></div>
            <div className="form-group"><label>Expiry Date</label><input type="date" name="expiry_date" value={form.expiry_date} onChange={handleChange} className="input-glass" /></div>
          </div>
          <div className="flex justify-end gap-3 pt-5 border-t border-white/6">
            <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-3 rounded-xl text-sm text-gray-400 hover:bg-white/5 transition-colors tracking-wide">Cancel</button>
            <button type="submit" className="btn-glow px-7 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-medium tracking-wide">{editing ? 'Update' : 'Add Medicine'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Medicines;
