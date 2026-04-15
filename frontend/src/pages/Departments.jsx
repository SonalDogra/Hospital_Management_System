import { useState, useEffect } from 'react';
import { departmentService } from '../services/services';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencilSquare, HiOutlineTrash, HiOutlineBuildingOffice2 } from 'react-icons/hi2';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ dept_name: '', dept_head: '', description: '' });

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const { data } = await departmentService.getAll();
      setDepartments(data.data);
    } catch { toast.error('Failed to fetch departments'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDepartments(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openCreate = () => { setEditing(null); setForm({ dept_name: '', dept_head: '', description: '' }); setModalOpen(true); };
  const openEdit = (d) => { setEditing(d); setForm({ dept_name: d.dept_name || '', dept_head: d.dept_head || '', description: d.description || '' }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.dept_name) { toast.error('Department name is required'); return; }
    try {
      if (editing) { await departmentService.update(editing.dept_id, form); toast.success('Updated'); }
      else { await departmentService.create(form); toast.success('Created'); }
      setModalOpen(false); fetchDepartments();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    try { await departmentService.remove(id); toast.success('Deleted'); fetchDepartments(); }
    catch { toast.error('Failed'); }
  };

  const deptColors = [
    'from-blue-500/15 to-cyan-500/15',
    'from-purple-500/15 to-pink-500/15',
    'from-emerald-500/15 to-teal-500/15',
    'from-amber-500/15 to-orange-500/15',
    'from-rose-500/15 to-red-500/15',
    'from-indigo-500/15 to-violet-500/15',
  ];

  const deptIconColors = [
    'text-blue-400', 'text-purple-400', 'text-emerald-400',
    'text-amber-400', 'text-rose-400', 'text-indigo-400',
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-indigo-500/15 text-indigo-400" style={{ marginLeft: '16px' }}>
            <HiOutlineBuildingOffice2 size={24} />
          </div>
          <div style={{ marginLeft: '10px' }}>
            <h1 className="text-2xl font-bold text-white tracking-tight">Departments</h1>
            <p className="text-sm text-gray-400 mt-1 tracking-wide">Hospital departments</p>
          </div>
        </div>
        <button onClick={openCreate} className="btn-glow flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-sm font-medium tracking-wide">
          <HiOutlinePlus size={18} /> Add Department
        </button>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {[1,2,3,4,5,6].map(i => <div key={i} className="glass-card p-7 h-44 skeleton" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {departments.map((d, i) => (
            <div key={d.dept_id} className="glass-card p-7 animate-slide-up group" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex items-start justify-between mb-5">
                <div className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${deptColors[i % deptColors.length]} flex items-center justify-center`} style={{ width: 52, height: 52, marginLeft: '12px' }}>
                  <HiOutlineBuildingOffice2 size={24} className={`${deptIconColors[i % deptIconColors.length]} opacity-80`} />
                </div>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button onClick={() => openEdit(d)} className="p-2 rounded-xl hover:bg-white/8 text-gray-400 hover:text-blue-400 transition-all">
                    <HiOutlinePencilSquare size={14} />
                  </button>
                  <button onClick={() => handleDelete(d.dept_id)} className="p-2 rounded-xl hover:bg-white/8 text-gray-400 hover:text-rose-400 transition-all">
                    <HiOutlineTrash size={14} />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 tracking-tight" style={{ marginLeft: '12px' }}>{d.dept_name}</h3>
              <p className="text-sm text-blue-400 mb-2.5 font-medium" style={{ marginLeft: '12px' }}>{d.dept_head || 'No head assigned'}</p>
              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed" style={{ marginLeft: '12px' }}>{d.description || 'No description'}</p>
            </div>
          ))}
          {departments.length === 0 && (
            <div className="col-span-full text-center py-16 text-gray-500 text-sm">No departments found</div>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Department' : 'Add Department'} size="md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group"><label>Department Name *</label><input name="dept_name" value={form.dept_name} onChange={handleChange} className="input-glass" placeholder="Department name" /></div>
          <div className="form-group"><label>Department Head</label><input name="dept_head" value={form.dept_head} onChange={handleChange} className="input-glass" placeholder="Head of department" /></div>
          <div className="form-group"><label>Description</label><textarea name="description" value={form.description} onChange={handleChange} className="input-glass" rows={3} placeholder="Department description" /></div>
          <div className="flex justify-end gap-3 pt-5 border-t border-white/6">
            <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-3 rounded-xl text-sm text-gray-400 hover:bg-white/5 transition-colors tracking-wide">Cancel</button>
            <button type="submit" className="btn-glow px-7 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-sm font-medium tracking-wide">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Departments;
