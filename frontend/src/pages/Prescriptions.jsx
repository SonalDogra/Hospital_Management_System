import { useState, useEffect, useCallback } from 'react';
import { prescriptionService, patientService, doctorService, medicineService } from '../services/services';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import LoadingSkeleton from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencilSquare, HiOutlineTrash, HiOutlineMagnifyingGlass, HiOutlineClipboardDocument, HiOutlineEye, HiOutlineXMark } from 'react-icons/hi2';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    patient_id: '', doctor_id: '', prescription_date: '', diagnosis: '', notes: '',
    medicines: [],
  });

  const fetchPrescriptions = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await prescriptionService.getAll({ search, page, limit: 10 });
      setPrescriptions(data.data);
      setPagination(data.pagination);
    } catch { toast.error('Failed to fetch prescriptions'); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetchPrescriptions(); }, [fetchPrescriptions]);
  useEffect(() => {
    patientService.getAll({ limit: 100 }).then(r => setPatients(r.data.data)).catch(() => {});
    doctorService.getAllList().then(r => setDoctors(r.data.data)).catch(() => {});
    medicineService.getAllList().then(r => setMedicines(r.data.data)).catch(() => {});
  }, []);
  useEffect(() => { const t = setTimeout(() => setPage(1), 300); return () => clearTimeout(t); }, [search]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addMedicine = () => {
    setForm({ ...form, medicines: [...form.medicines, { medicine_id: '', dosage: '', duration: '', frequency: '' }] });
  };

  const removeMedicine = (index) => {
    setForm({ ...form, medicines: form.medicines.filter((_, i) => i !== index) });
  };

  const updateMedicine = (index, field, value) => {
    const updated = [...form.medicines];
    updated[index][field] = value;
    setForm({ ...form, medicines: updated });
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ patient_id: '', doctor_id: '', prescription_date: new Date().toISOString().split('T')[0], diagnosis: '', notes: '', medicines: [] });
    setModalOpen(true);
  };

  const openEdit = async (p) => {
    try {
      const { data } = await prescriptionService.getById(p.prescription_id);
      const presc = data.data;
      setEditing(presc);
      setForm({
        patient_id: presc.patient_id, doctor_id: presc.doctor_id,
        prescription_date: presc.prescription_date ? presc.prescription_date.split('T')[0] : '',
        diagnosis: presc.diagnosis || '', notes: presc.notes || '',
        medicines: presc.medicines || [],
      });
      setModalOpen(true);
    } catch { toast.error('Failed to load prescription'); }
  };

  const openView = async (p) => {
    try {
      const { data } = await prescriptionService.getById(p.prescription_id);
      setViewData(data.data);
      setViewModal(true);
    } catch { toast.error('Failed to load prescription details'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patient_id || !form.doctor_id || !form.prescription_date) { toast.error('Patient, doctor, and date required'); return; }
    try {
      if (editing) { await prescriptionService.update(editing.prescription_id, form); toast.success('Updated'); }
      else { await prescriptionService.create(form); toast.success('Prescription created'); }
      setModalOpen(false); fetchPrescriptions();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this prescription?')) return;
    try { await prescriptionService.remove(id); toast.success('Deleted'); fetchPrescriptions(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-cyan-500/15 text-cyan-400" style={{ marginLeft: '16px' }}>
            <HiOutlineClipboardDocument size={24} />
          </div>
          <div style={{ marginLeft: '10px' }}>
            <h1 className="text-2xl font-bold text-white tracking-tight">Prescriptions</h1>
            <p className="text-sm text-gray-400 mt-1 tracking-wide">Create & manage prescriptions</p>
          </div>
        </div>
        <button onClick={openCreate} className="btn-glow flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-700 text-white text-sm font-medium tracking-wide">
          <HiOutlinePlus size={18} /> New Prescription
        </button>
      </div>

      {/* Search */}
      <div className="glass-card p-6">
        <div className="relative max-w-lg">
          <HiOutlineMagnifyingGlass className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="input-glass search-input" placeholder="Search prescriptions..." />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? <div className="p-7"><LoadingSkeleton rows={5} columns={5} /></div> : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: '40px' }}>Patient</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Diagnosis</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((p) => (
                  <tr key={p.prescription_id}>
                    <td className="text-white font-medium" style={{ paddingLeft: '40px' }}>{p.patient_name}</td>
                    <td className="text-gray-400">Dr. {p.doctor_name}</td>
                    <td className="text-gray-400">{new Date(p.prescription_date).toLocaleDateString()}</td>
                    <td className="text-gray-400 max-w-[220px] truncate">{p.diagnosis || '—'}</td>
                    <td>
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => openView(p)} className="p-2.5 rounded-xl hover:bg-white/8 text-gray-400 hover:text-cyan-400 transition-all">
                          <HiOutlineEye size={16} />
                        </button>
                        <button onClick={() => openEdit(p)} className="p-2.5 rounded-xl hover:bg-white/8 text-gray-400 hover:text-blue-400 transition-all">
                          <HiOutlinePencilSquare size={16} />
                        </button>
                        <button onClick={() => handleDelete(p.prescription_id)} className="p-2.5 rounded-xl hover:bg-white/8 text-gray-400 hover:text-rose-400 transition-all">
                          <HiOutlineTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {prescriptions.length === 0 && <tr><td colSpan={5} className="text-center py-16 text-gray-500 text-sm">No prescriptions found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-7 pb-5"><Pagination pagination={pagination} onPageChange={setPage} /></div>
      </div>

      {/* View Modal */}
      <Modal isOpen={viewModal} onClose={() => setViewModal(false)} title="Prescription Details" size="lg">
        {viewData && (
          <div className="space-y-7">
            <div className="grid grid-cols-2 gap-6">
              <div className="form-group">
                <label className="text-xs text-gray-500">Patient</label>
                <p className="text-sm text-white font-medium">{viewData.patient_name}</p>
              </div>
              <div className="form-group">
                <label className="text-xs text-gray-500">Doctor</label>
                <p className="text-sm text-white font-medium">Dr. {viewData.doctor_name}</p>
              </div>
              <div className="form-group">
                <label className="text-xs text-gray-500">Date</label>
                <p className="text-sm text-gray-300">{new Date(viewData.prescription_date).toLocaleDateString()}</p>
              </div>
              <div className="form-group">
                <label className="text-xs text-gray-500">Diagnosis</label>
                <p className="text-sm text-gray-300">{viewData.diagnosis || '—'}</p>
              </div>
            </div>
            {viewData.notes && (
              <div className="form-group">
                <label className="text-xs text-gray-500">Notes</label>
                <p className="text-sm text-gray-300 leading-relaxed">{viewData.notes}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-white mb-4 tracking-wide">Prescribed Medicines</p>
              {viewData.medicines?.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-white/6">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Medicine</th>
                        <th>Dosage</th>
                        <th>Frequency</th>
                        <th>Duration</th>
                      </tr>
                    </thead>
                    <tbody>{viewData.medicines.map((m, i) => (
                      <tr key={i}>
                        <td className="text-gray-300 font-medium">{m.medicine_name}</td>
                        <td className="text-gray-400">{m.dosage}</td>
                        <td className="text-gray-400">{m.frequency}</td>
                        <td className="text-gray-400">{m.duration}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              ) : <p className="text-sm text-gray-500">No medicines prescribed</p>}
            </div>
          </div>
        )}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Prescription' : 'New Prescription'} size="lg">
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
                {doctors.map(d => <option key={d.doctor_id} value={d.doctor_id}>Dr. {d.first_name} {d.last_name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Date *</label>
              <input type="date" name="prescription_date" value={form.prescription_date} onChange={handleChange} className="input-glass" />
            </div>
          </div>
          <div className="form-group">
            <label>Diagnosis</label>
            <textarea name="diagnosis" value={form.diagnosis} onChange={handleChange} className="input-glass" rows={2} placeholder="Diagnosis details" />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} className="input-glass" rows={2} placeholder="Additional notes" />
          </div>

          {/* Medicines */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-gray-300 tracking-wide">Medicines</label>
              <button type="button" onClick={addMedicine} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1.5 font-medium tracking-wide">
                <HiOutlinePlus size={14} /> Add Medicine
              </button>
            </div>
            <div className="space-y-4">
              {form.medicines.map((m, i) => (
                <div key={i} className="flex gap-3 items-start p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                  <select value={m.medicine_id} onChange={(e) => updateMedicine(i, 'medicine_id', e.target.value)} className="select-glass flex-1">
                    <option value="">Select medicine</option>
                    {medicines.map(med => <option key={med.medicine_id} value={med.medicine_id}>{med.medicine_name}</option>)}
                  </select>
                  <input value={m.dosage} onChange={(e) => updateMedicine(i, 'dosage', e.target.value)} className="input-glass w-28" placeholder="Dosage" />
                  <input value={m.frequency} onChange={(e) => updateMedicine(i, 'frequency', e.target.value)} className="input-glass w-32" placeholder="Frequency" />
                  <input value={m.duration} onChange={(e) => updateMedicine(i, 'duration', e.target.value)} className="input-glass w-28" placeholder="Duration" />
                  <button type="button" onClick={() => removeMedicine(i)} className="p-2.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/8 rounded-xl transition-all flex-shrink-0">
                    <HiOutlineXMark size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-5 border-t border-white/6">
            <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-3 rounded-xl text-sm text-gray-400 hover:bg-white/5 transition-colors tracking-wide">Cancel</button>
            <button type="submit" className="btn-glow px-7 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-700 text-white text-sm font-medium tracking-wide">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Prescriptions;
