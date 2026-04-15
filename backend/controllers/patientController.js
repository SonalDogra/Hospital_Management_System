const pool = require('../config/db');

// GET /api/patients
exports.getAll = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM patient';
    let countQuery = 'SELECT COUNT(*) as total FROM patient';
    const params = [];
    const countParams = [];

    if (search) {
      const searchClause = ' WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?';
      query += searchClause;
      countQuery += searchClause;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
      countParams.push(searchParam, searchParam, searchParam, searchParam);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(query, params);
    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ message: 'Failed to fetch patients' });
  }
};

// GET /api/patients/:id
exports.getById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM patient WHERE patient_id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json({ data: rows[0] });
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ message: 'Failed to fetch patient' });
  }
};

// POST /api/patients
exports.create = async (req, res) => {
  try {
    const { first_name, last_name, dob, gender, phone, email, address, blood_group } = req.body;

    if (!first_name || !last_name) {
      return res.status(400).json({ message: 'First name and last name are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO patient (first_name, last_name, dob, gender, phone, email, address, blood_group) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [first_name, last_name, dob || null, gender || 'Male', phone || null, email || null, address || null, blood_group || null]
    );

    res.status(201).json({
      message: 'Patient created successfully',
      data: { patient_id: result.insertId, first_name, last_name },
    });
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ message: 'Failed to create patient' });
  }
};

// PUT /api/patients/:id
exports.update = async (req, res) => {
  try {
    const { first_name, last_name, dob, gender, phone, email, address, blood_group } = req.body;
    const { id } = req.params;

    const [existing] = await pool.query('SELECT patient_id FROM patient WHERE patient_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    await pool.query(
      'UPDATE patient SET first_name=?, last_name=?, dob=?, gender=?, phone=?, email=?, address=?, blood_group=? WHERE patient_id=?',
      [first_name, last_name, dob || null, gender, phone, email, address, blood_group, id]
    );

    res.json({ message: 'Patient updated successfully' });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ message: 'Failed to update patient' });
  }
};

// DELETE /api/patients/:id
exports.remove = async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT patient_id FROM patient WHERE patient_id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    await pool.query('DELETE FROM patient WHERE patient_id = ?', [req.params.id]);
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({ message: 'Failed to delete patient' });
  }
};
