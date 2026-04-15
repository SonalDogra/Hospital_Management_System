const pool = require('../config/db');

// GET /api/departments
exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM department ORDER BY dept_name');
    res.json({ data: rows });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch departments' });
  }
};

// GET /api/departments/:id
exports.getById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM department WHERE dept_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Department not found' });
    res.json({ data: rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch department' });
  }
};

// POST /api/departments
exports.create = async (req, res) => {
  try {
    const { dept_name, dept_head, description } = req.body;
    if (!dept_name) return res.status(400).json({ message: 'Department name is required' });

    const [result] = await pool.query(
      'INSERT INTO department (dept_name, dept_head, description) VALUES (?, ?, ?)',
      [dept_name, dept_head || null, description || null]
    );

    res.status(201).json({ message: 'Department created', data: { dept_id: result.insertId } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create department' });
  }
};

// PUT /api/departments/:id
exports.update = async (req, res) => {
  try {
    const { dept_name, dept_head, description } = req.body;
    await pool.query(
      'UPDATE department SET dept_name=?, dept_head=?, description=? WHERE dept_id=?',
      [dept_name, dept_head, description, req.params.id]
    );
    res.json({ message: 'Department updated' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update department' });
  }
};

// DELETE /api/departments/:id
exports.remove = async (req, res) => {
  try {
    await pool.query('DELETE FROM department WHERE dept_id = ?', [req.params.id]);
    res.json({ message: 'Department deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete department' });
  }
};
