import { useState, useEffect, useCallback } from 'react';
import { appointmentService, patientService, doctorService } from '../services/services';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import LoadingSkeleton from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencilSquare, HiOutlineTrash, HiOutlineMagnifyingGlass, HiOutlineCalendar } from 'react-icons/hi2';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    patient_id: '', doctor_id: '', appointment_date: '', appointment_time: '', status: 'Scheduled', reason: '',
  });

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await appointmentService.getAll({ search, status: statusFilter, page, limit: 10 });
      setAppointments(data.data);
      setPagination(data.pagination);
    } catch { toast.error('Failed to fetch appointments'); }
    finally { setLoading(false); }
  }, [search, statusFilter, page]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);
  useEffect(() => {
    patientService.getAll({ limit: 100 }).then(r => setPatients(r.data.data)).catch(() => {});
    doctorService.getAllList().then(r => setDoctors(r.data.data)).catch(() => {});
  }, []);
  useEffect(() => { const t = setTimeout(() => setPage(1), 300); return () => clearTimeout(t); }, [search, statusFilter]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openCreate = () => {
    setEditing(null);
    setForm({ patient_id: '', doctor_id: '', appointment_date: '', appointment_time: '', status: 'Scheduled', reason: '' });
    setModalOpen(true);
  };

  const openEdit = (apt) => {
    setEditing(apt);
    setForm({
      patient_id: apt.patient_id || '', doctor_id: apt.doctor_id || '',
      appointment_date: apt.appointment_date ? apt.appointment_date.split('T')[0] : '',
      appointment_time: apt.appointment_time || '', status: apt.status || 'Scheduled', reason: apt.reason || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patient_id || !form.doctor_id || !form.appointment_date) { toast.error('Patient, doctor, and date are required'); return; }
    try {
      if (editing) { await appointmentService.update(editing.appointment_id, form); toast.success('Updated'); }
      else { await appointmentService.create(form); toast.success('Appointment booked'); }
      setModalOpen(false); fetchAppointments();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed'); }
  };

  const handleStatusChange = async (id, status) => {
    try { await appointmentService.updateStatus(id, { status }); toast.success('Status updated'); fetchAppointments(); }
    catch { toast.error('Failed to update status'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this appointment?')) return;
    try { await appointmentService.remove(id); toast.success('Deleted'); fetchAppointments(); }
    catch { toast.error('Failed'); }
  };

  const statusColors = { Scheduled: 'badge-scheduled', Completed: 'badge-completed', Cancelled: 'badge-cancelled' };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-purple-500/15 text-purple-400" style={{ marginLeft: '16px' }}>
            <HiOutlineCalendar size={24} />
          </div>
          <div style={{ marginLeft: '10px' }}>
            <h1 className="text-2xl font-bold text-white tracking-tight">Appointments</h1>
            <p className="text-sm text-gray-400 mt-1 tracking-wide">Schedule & manage appointments</p>
          </div>
        </div>
        <button onClick={openCreate} className="btn-glow flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-medium tracking-wide">
          <HiOutlinePlus size={18} /> Book Appointment
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-lg">
          <HiOutlineMagnifyingGlass className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="input-glass search-input" placeholder="Search appointments..." />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select-glass max-w-[200px]">
          <option value="">All Statuses</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? <div className="p-7"><LoadingSkeleton rows={5} columns={6} /></div> : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: '40px' }}>Patient</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.appointment_id}>
                    <td className="text-white font-medium" style={{ paddingLeft: '40px' }}>{a.patient_name}</td>
                    <td>
                      <div>
                        <p className="text-sm text-white">Dr. {a.doctor_name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{a.specialization}</p>
                      </div>
                    </td>
                    <td className="text-gray-400">{new Date(a.appointment_date).toLocaleDateString()}</td>
                    <td className="text-gray-400">{a.appointment_time || '—'}</td>
                    <td>
                      <select
                        value={a.status}
                        onChange={(e) => handleStatusChange(a.appointment_id, e.target.value)}
                        className={`badge cursor-pointer border-0 outline-none ${statusColors[a.status]} bg-opacity-100`}
                        style={{ WebkitAppearance: 'none', backgroundImage: 'none', paddingRight: '14px' }}
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => openEdit(a)} className="p-2.5 rounded-xl hover:bg-white/8 text-gray-400 hover:text-blue-400 transition-all">
                          <HiOutlinePencilSquare size={16} />
                        </button>
                        <button onClick={() => handleDelete(a.appointment_id)} className="p-2.5 rounded-xl hover:bg-white/8 text-gray-400 hover:text-rose-400 transition-all">
                          <HiOutlineTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {appointments.length === 0 && <tr><td colSpan={6} className="text-center py-16 text-gray-500 text-sm">No appointments found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-7 pb-5"><Pagination pagination={pagination} onPageChange={setPage} /></div>
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Appointment' : 'Book Appointment'} size="md">
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
              <label>Doctor *</label>
              <select name="doctor_id" value={form.doctor_id} onChange={handleChange} className="select-glass">
                <option value="">Select doctor</option>
                {doctors.map(d => <option key={d.doctor_id} value={d.doctor_id}>Dr. {d.first_name} {d.last_name} — {d.specialization}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Date *</label>
              <input type="date" name="appointment_date" value={form.appointment_date} onChange={handleChange} className="input-glass" />
            </div>
            <div className="form-group">
              <label>Time</label>
              <input type="time" name="appointment_time" value={form.appointment_time} onChange={handleChange} className="input-glass" />
            </div>
          </div>
          <div className="form-group">
            <label>Reason</label>
            <textarea name="reason" value={form.reason} onChange={handleChange} className="input-glass" rows={3} placeholder="Reason for visit" />
          </div>
          <div className="flex justify-end gap-3 pt-5 border-t border-white/6">
            <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-3 rounded-xl text-sm text-gray-400 hover:bg-white/5 transition-colors tracking-wide">Cancel</button>
            <button type="submit" className="btn-glow px-7 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-medium tracking-wide">{editing ? 'Update' : 'Book'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Appointments;
