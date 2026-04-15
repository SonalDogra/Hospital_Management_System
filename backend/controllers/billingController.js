const pool = require('../config/db');

// GET /api/billing
exports.getAll = async (req, res) => {
  try {
    const { search, payment_status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT b.*, 
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        a.appointment_date
      FROM billing b
      LEFT JOIN patient p ON b.patient_id = p.patient_id
      LEFT JOIN appointment a ON b.appointment_id = a.appointment_id
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM billing b LEFT JOIN patient p ON b.patient_id = p.patient_id';
    const params = [];
    const countParams = [];
    const conditions = [];

    if (search) {
      conditions.push("CONCAT(p.first_name, ' ', p.last_name) LIKE ?");
      const s = `%${search}%`;
      params.push(s);
      countParams.push(s);
    }

    if (payment_status) {
      conditions.push('b.payment_status = ?');
      params.push(payment_status);
      countParams.push(payment_status);
    }

    if (conditions.length > 0) {
      const where = ' WHERE ' + conditions.join(' AND ');
      query += where;
      countQuery += where;
    }

    query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
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
    console.error('Get billing error:', error);
    res.status(500).json({ message: 'Failed to fetch bills' });
  }
};

// GET /api/billing/:id
exports.getById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.*, CONCAT(p.first_name, ' ', p.last_name) as patient_name
       FROM billing b LEFT JOIN patient p ON b.patient_id = p.patient_id
       WHERE b.bill_id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Bill not found' });
    res.json({ data: rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bill' });
  }
};

// POST /api/billing
exports.create = async (req, res) => {
  try {
    const { patient_id, appointment_id, total_amount, payment_status, payment_method, billing_date } = req.body;

    if (!patient_id || !total_amount || !billing_date) {
      return res.status(400).json({ message: 'Patient, amount, and date are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO billing (patient_id, appointment_id, total_amount, payment_status, payment_method, billing_date) VALUES (?, ?, ?, ?, ?, ?)',
      [patient_id, appointment_id || null, total_amount, payment_status || 'Pending', payment_method || null, billing_date]
    );

    res.status(201).json({
      message: 'Bill created successfully',
      data: { bill_id: result.insertId },
    });
  } catch (error) {
    console.error('Create billing error:', error);
    res.status(500).json({ message: 'Failed to create bill' });
  }
};

// PUT /api/billing/:id
exports.update = async (req, res) => {
  try {
    const { patient_id, appointment_id, total_amount, payment_status, payment_method, billing_date } = req.body;

    await pool.query(
      'UPDATE billing SET patient_id=?, appointment_id=?, total_amount=?, payment_status=?, payment_method=?, billing_date=? WHERE bill_id=?',
      [patient_id, appointment_id, total_amount, payment_status, payment_method, billing_date, req.params.id]
    );

    res.json({ message: 'Bill updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update bill' });
  }
};

// PATCH /api/billing/:id/status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { payment_status, payment_method } = req.body;

    await pool.query(
      'UPDATE billing SET payment_status = ?, payment_method = ? WHERE bill_id = ?',
      [payment_status, payment_method, req.params.id]
    );

    res.json({ message: 'Payment status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update payment status' });
  }
};

// DELETE /api/billing/:id
exports.remove = async (req, res) => {
  try {
    await pool.query('DELETE FROM billing WHERE bill_id = ?', [req.params.id]);
    res.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete bill' });
  }
};
