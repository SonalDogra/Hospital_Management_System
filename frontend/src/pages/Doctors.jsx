import { useState, useEffect, useCallback } from 'react';
import { doctorService, departmentService } from '../services/services';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import LoadingSkeleton from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencilSquare, HiOutlineTrash, HiOutlineMagnifyingGlass, HiOutlineUserGroup } from 'react-icons/hi2';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [form, setForm] = useState({
    first_name: '', last_name: '', specialization: '', phone: '',
    email: '', dept_id: '', qualification: '', experience_years: 0,
  });

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await doctorService.getAll({ search, page, limit: 10 });
      setDoctors(data.data);
      setPagination(data.pagination);
    } catch { toast.error('Failed to fetch doctors'); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);
  useEffect(() => { departmentService.getAll().then(r => setDepartments(r.data.data)).catch(() => {}); }, []);
  useEffect(() => { const t = setTimeout(() => setPage(1), 300); return () => clearTimeout(t); }, [search]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openCreate = () => {
    setEditingDoctor(null);
    setForm({ first_name: '', last_name: '', specialization: '', phone: '', email: '', dept_id: '', qualification: '', experience_years: 0 });
    setModalOpen(true);
  };

  const openEdit = (doc) => {
    setEditingDoctor(doc);
    setForm({
      first_name: doc.first_name || '', last_name: doc.last_name || '',
      specialization: doc.specialization || '', phone: doc.phone || '',
      email: doc.email || '', dept_id: doc.dept_id || '',
      qualification: doc.qualification || '', experience_years: doc.experience_years || 0,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.first_name || !form.last_name) { toast.error('Name is required'); return; }
    try {
      if (editingDoctor) {
        await doctorService.update(editingDoctor.doctor_id, form);
        toast.success('Doctor updated');
      } else {
        await doctorService.create(form);
        toast.success('Doctor added');
      }
      setModalOpen(false);
      fetchDoctors();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this doctor?')) return;
    try { await doctorService.remove(id); toast.success('Deleted'); fetchDoctors(); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 text-emerald-400">
            <HiOutlineUserGroup size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Doctors</h1>
            <p className="text-sm text-gray-400 mt-1 tracking-wide">Manage doctor profiles</p>
          </div>
        </div>
        <button onClick={openCreate} className="btn-glow flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-medium tracking-wide">
          <HiOutlinePlus size={18} /> Add Doctor
        </button>
      </div>

      {/* Search */}
      <div className="glass-card p-6">
        <div className="relative max-w-lg">
          <HiOutlineMagnifyingGlass className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="input-glass search-input" placeholder="Search doctors..." />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? <div className="p-7"><LoadingSkeleton rows={5} columns={6} /></div> : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: '40px' }}>Doctor</th>
                  <th>Specialization</th>
                  <th>Department</th>
                  <th>Experience</th>
                  <th>Phone</th>
                  <th className="text-right" style={{ paddingRight: '40px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((d) => (
                  <tr key={d.doctor_id}>
                    <td style={{ paddingLeft: '40px' }}>
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 flex items-center justify-center text-emerald-400 font-semibold text-sm flex-shrink-0">
                          {d.first_name.charAt(0)}{d.last_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">Dr. {d.first_name} {d.last_name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{d.qualification || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-blue-500/12 text-blue-400 border border-blue-500/20">{d.specialization || '—'}</span>
                    </td>
                    <td className="text-gray-400">{d.dept_name || '—'}</td>
                    <td className="text-gray-400">{d.experience_years} yrs</td>
                    <td className="text-gray-400">{d.phone || '—'}</td>
                    <td style={{ paddingRight: '40px' }}>
                      <div className="flex items-center justify-end gap-1.5" style={{ marginRight: '6px' }}>
                        <button onClick={() => openEdit(d)} className="p-2.5 rounded-xl hover:bg-white/8 text-gray-400 hover:text-blue-400 transition-all">
                          <HiOutlinePencilSquare size={16} />
                        </button>
                        <button onClick={() => handleDelete(d.doctor_id)} className="p-2.5 rounded-xl hover:bg-white/8 text-gray-400 hover:text-rose-400 transition-all">
                          <HiOutlineTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {doctors.length === 0 && <tr><td colSpan={6} className="text-center py-16 text-gray-500 text-sm">No doctors found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-7 pb-5"><Pagination pagination={pagination} onPageChange={setPage} /></div>
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingDoctor ? 'Edit Doctor' : 'Add Doctor'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group"><label>First Name *</label><input name="first_name" value={form.first_name} onChange={handleChange} className="input-glass" placeholder="First name" /></div>
            <div className="form-group"><label>Last Name *</label><input name="last_name" value={form.last_name} onChange={handleChange} className="input-glass" placeholder="Last name" /></div>
            <div className="form-group"><label>Specialization</label><input name="specialization" value={form.specialization} onChange={handleChange} className="input-glass" placeholder="e.g. Cardiology" /></div>
            <div className="form-group">
              <label>Department</label>
              <select name="dept_id" value={form.dept_id} onChange={handleChange} className="select-glass">
                <option value="">Select department</option>
                {departments.map(d => <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Qualification</label><input name="qualification" value={form.qualification} onChange={handleChange} className="input-glass" placeholder="e.g. MBBS, MD" /></div>
            <div className="form-group"><label>Experience (years)</label><input type="number" name="experience_years" value={form.experience_years} onChange={handleChange} className="input-glass" min="0" /></div>
            <div className="form-group"><label>Phone</label><input name="phone" value={form.phone} onChange={handleChange} className="input-glass" placeholder="Phone number" /></div>
            <div className="form-group"><label>Email</label><input type="email" name="email" value={form.email} onChange={handleChange} className="input-glass" placeholder="Email address" /></div>
          </div>
          <div className="flex justify-end gap-3 pt-5 border-t border-white/6">
            <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-3 rounded-xl text-sm text-gray-400 hover:bg-white/5 transition-colors tracking-wide">Cancel</button>
            <button type="submit" className="btn-glow px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-medium tracking-wide">{editingDoctor ? 'Update' : 'Add Doctor'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Doctors;
