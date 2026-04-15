const pool = require('../config/db');

// GET /api/doctors
exports.getAll = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `SELECT d.*, dep.dept_name FROM doctor d LEFT JOIN department dep ON d.dept_id = dep.dept_id`;
    let countQuery = 'SELECT COUNT(*) as total FROM doctor d';
    const params = [];
    const countParams = [];

    if (search) {
      const clause = ' WHERE d.first_name LIKE ? OR d.last_name LIKE ? OR d.specialization LIKE ?';
      query += clause;
      countQuery += clause;
      const s = `%${search}%`;
      params.push(s, s, s);
      countParams.push(s, s, s);
    }

    query += ' ORDER BY d.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(query, params);
    const [countResult] = await pool.query(countQuery, countParams);

    res.json({
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit),
      },
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ message: 'Failed to fetch doctors' });
  }
};

// GET /api/doctors/all - Get all without pagination (for dropdowns)
exports.getAllList = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT doctor_id, first_name, last_name, specialization FROM doctor ORDER BY first_name'
    );
    res.json({ data: rows });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch doctors list' });
  }
};

// GET /api/doctors/:id
exports.getById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT d.*, dep.dept_name FROM doctor d LEFT JOIN department dep ON d.dept_id = dep.dept_id WHERE d.doctor_id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Doctor not found' });
    res.json({ data: rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch doctor' });
  }
};

// POST /api/doctors
exports.create = async (req, res) => {
  try {
    const { first_name, last_name, specialization, phone, email, dept_id, qualification, experience_years } = req.body;

    if (!first_name || !last_name) {
      return res.status(400).json({ message: 'First name and last name are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO doctor (first_name, last_name, specialization, phone, email, dept_id, qualification, experience_years) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [first_name, last_name, specialization, phone, email, dept_id || null, qualification, experience_years || 0]
    );

    res.status(201).json({
      message: 'Doctor added successfully',
      data: { doctor_id: result.insertId },
    });
  } catch (error) {
    console.error('Create doctor error:', error);
    res.status(500).json({ message: 'Failed to create doctor' });
  }
};

// PUT /api/doctors/:id
exports.update = async (req, res) => {
  try {
    const { first_name, last_name, specialization, phone, email, dept_id, qualification, experience_years } = req.body;

    await pool.query(
      'UPDATE doctor SET first_name=?, last_name=?, specialization=?, phone=?, email=?, dept_id=?, qualification=?, experience_years=? WHERE doctor_id=?',
      [first_name, last_name, specialization, phone, email, dept_id || null, qualification, experience_years, req.params.id]
    );

    res.json({ message: 'Doctor updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update doctor' });
  }
};

// DELETE /api/doctors/:id
exports.remove = async (req, res) => {
  try {
    await pool.query('DELETE FROM doctor WHERE doctor_id = ?', [req.params.id]);
    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete doctor' });
  }
};
