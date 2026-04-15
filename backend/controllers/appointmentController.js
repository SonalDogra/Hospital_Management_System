const pool = require('../config/db');

// GET /api/appointments
exports.getAll = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT a.*, 
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        CONCAT(d.first_name, ' ', d.last_name) as doctor_name,
        d.specialization
      FROM appointment a
      LEFT JOIN patient p ON a.patient_id = p.patient_id
      LEFT JOIN doctor d ON a.doctor_id = d.doctor_id
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM appointment a LEFT JOIN patient p ON a.patient_id = p.patient_id';
    const params = [];
    const countParams = [];
    const conditions = [];

    if (search) {
      conditions.push("(CONCAT(p.first_name, ' ', p.last_name) LIKE ? OR a.reason LIKE ?)");
      const s = `%${search}%`;
      params.push(s, s);
      countParams.push(s, s);
    }

    if (status) {
      conditions.push('a.status = ?');
      params.push(status);
      countParams.push(status);
    }

    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }

    query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC LIMIT ? OFFSET ?';
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
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
};

// GET /api/appointments/:id
exports.getById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, 
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        CONCAT(d.first_name, ' ', d.last_name) as doctor_name
      FROM appointment a
      LEFT JOIN patient p ON a.patient_id = p.patient_id
      LEFT JOIN doctor d ON a.doctor_id = d.doctor_id
      WHERE a.appointment_id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Appointment not found' });
    res.json({ data: rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch appointment' });
  }
};

// POST /api/appointments
exports.create = async (req, res) => {
  try {
    const { patient_id, doctor_id, appointment_date, appointment_time, status, reason } = req.body;

    if (!patient_id || !doctor_id || !appointment_date) {
      return res.status(400).json({ message: 'Patient, doctor, and date are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO appointment (patient_id, doctor_id, appointment_date, appointment_time, status, reason) VALUES (?, ?, ?, ?, ?, ?)',
      [patient_id, doctor_id, appointment_date, appointment_time || null, status || 'Scheduled', reason || null]
    );

    res.status(201).json({
      message: 'Appointment created successfully',
      data: { appointment_id: result.insertId },
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: 'Failed to create appointment' });
  }
};

// PUT /api/appointments/:id
exports.update = async (req, res) => {
  try {
    const { patient_id, doctor_id, appointment_date, appointment_time, status, reason } = req.body;

    await pool.query(
      'UPDATE appointment SET patient_id=?, doctor_id=?, appointment_date=?, appointment_time=?, status=?, reason=? WHERE appointment_id=?',
      [patient_id, doctor_id, appointment_date, appointment_time, status, reason, req.params.id]
    );

    res.json({ message: 'Appointment updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update appointment' });
  }
};

// PATCH /api/appointments/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Scheduled', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    await pool.query('UPDATE appointment SET status = ? WHERE appointment_id = ?', [status, req.params.id]);
    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update status' });
  }
};

// DELETE /api/appointments/:id
exports.remove = async (req, res) => {
  try {
    await pool.query('DELETE FROM appointment WHERE appointment_id = ?', [req.params.id]);
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete appointment' });
  }
};
