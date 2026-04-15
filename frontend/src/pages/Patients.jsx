import { useState, useEffect, useCallback } from 'react';
import { patientService } from '../services/services';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import LoadingSkeleton from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus, HiOutlinePencilSquare, HiOutlineTrash,
  HiOutlineMagnifyingGlass, HiOutlineUsers,
} from 'react-icons/hi2';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [form, setForm] = useState({
    first_name: '', last_name: '', dob: '', gender: 'Male',
    phone: '', email: '', address: '', blood_group: '',
  });

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await patientService.getAll({ search, page, limit: 10 });
      setPatients(data.data);
      setPagination(data.pagination);
    } catch (error) {
      toast.error('Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  useEffect(() => {
    const timer = setTimeout(() => setPage(1), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openCreateModal = () => {
    setEditingPatient(null);
    setForm({ first_name: '', last_name: '', dob: '', gender: 'Male', phone: '', email: '', address: '', blood_group: '' });
    setModalOpen(true);
  };

  const openEditModal = (patient) => {
    setEditingPatient(patient);
    setForm({
      first_name: patient.first_name || '',
      last_name: patient.last_name || '',
      dob: patient.dob ? patient.dob.split('T')[0] : '',
      gender: patient.gender || 'Male',
      phone: patient.phone || '',
      email: patient.email || '',
      address: patient.address || '',
      blood_group: patient.blood_group || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.first_name || !form.last_name) {
      toast.error('First and last name are required');
      return;
    }
    try {
      if (editingPatient) {
        await patientService.update(editingPatient.patient_id, form);
        toast.success('Patient updated successfully');
      } else {
        await patientService.create(form);
        toast.success('Patient added successfully');
      }
      setModalOpen(false);
      fetchPatients();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this patient?')) return;
    try {
      await patientService.remove(id);
      toast.success('Patient deleted');
      fetchPatients();
    } catch (error) {
      toast.error('Failed to delete patient');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-blue-500/15 text-blue-400">
            <HiOutlineUsers size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Patients</h1>
            <p className="text-sm text-gray-400 mt-1 tracking-wide">Manage patient records</p>
          </div>
        </div>
        <button onClick={openCreateModal} className="btn-glow flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium tracking-wide">
          <HiOutlinePlus size={18} /> Add Patient
        </button>
      </div>

      {/* Search */}
      <div className="glass-card p-6">
        <div className="relative max-w-lg">
          <HiOutlineMagnifyingGlass className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-glass search-input"
            placeholder="Search patients by name, email, or phone..."
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-7"><LoadingSkeleton rows={5} columns={6} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: '40px' }}>Name</th>
                  <th>Gender</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Blood Group</th>
                  <th className="text-right" style={{ paddingRight: '40px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.patient_id}>
                    <td style={{ paddingLeft: '40px' }}>
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/15 to-purple-500/15 flex items-center justify-center text-blue-400 font-semibold text-sm flex-shrink-0">
                          {p.first_name.charAt(0)}{p.last_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{p.first_name} {p.last_name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{p.dob ? new Date(p.dob).toLocaleDateString() : '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-gray-400">{p.gender}</td>
                    <td className="text-gray-400">{p.phone || '—'}</td>
                    <td className="text-gray-400">{p.email || '—'}</td>
                    <td>
                      {p.blood_group ? (
                        <span className="badge bg-rose-500/12 text-rose-400 border border-rose-500/20">{p.blood_group}</span>
                      ) : '—'}
                    </td>
                    <td style={{ paddingRight: '40px' }}>
                      <div className="flex items-center justify-end gap-1.5" style={{ marginRight: '6px' }}>
                        <button onClick={() => openEditModal(p)} className="p-2.5 rounded-xl hover:bg-white/8 text-gray-400 hover:text-blue-400 transition-all">
                          <HiOutlinePencilSquare size={16} />
                        </button>
                        <button onClick={() => handleDelete(p.patient_id)} className="p-2.5 rounded-xl hover:bg-white/8 text-gray-400 hover:text-rose-400 transition-all">
                          <HiOutlineTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {patients.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-16 text-gray-500 text-sm">No patients found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-7 pb-5">
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingPatient ? 'Edit Patient' : 'Add Patient'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label>First Name *</label>
              <input name="first_name" value={form.first_name} onChange={handleChange} className="input-glass" placeholder="First name" />
            </div>
            <div className="form-group">
              <label>Last Name *</label>
              <input name="last_name" value={form.last_name} onChange={handleChange} className="input-glass" placeholder="Last name" />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input type="date" name="dob" value={form.dob} onChange={handleChange} className="input-glass" />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} className="select-glass">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} className="input-glass" placeholder="Phone number" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="input-glass" placeholder="Email address" />
            </div>
            <div className="form-group">
              <label>Blood Group</label>
              <select name="blood_group" value={form.blood_group} onChange={handleChange} className="select-glass">
                <option value="">Select</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea name="address" value={form.address} onChange={handleChange} className="input-glass" rows={2} placeholder="Full address" />
          </div>
          <div className="flex justify-end gap-3 pt-5 border-t border-white/6">
            <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-3 rounded-xl text-sm text-gray-400 hover:bg-white/5 transition-colors tracking-wide">
              Cancel
            </button>
            <button type="submit" className="btn-glow px-7 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium tracking-wide">
              {editingPatient ? 'Update Patient' : 'Add Patient'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Patients;
