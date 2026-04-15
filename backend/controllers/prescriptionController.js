const pool = require('../config/db');

// GET /api/prescriptions
exports.getAll = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT pr.*, 
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        CONCAT(d.first_name, ' ', d.last_name) as doctor_name
      FROM prescription pr
      LEFT JOIN patient p ON pr.patient_id = p.patient_id
      LEFT JOIN doctor d ON pr.doctor_id = d.doctor_id
    `;
    let countQuery = `SELECT COUNT(*) as total FROM prescription pr 
      LEFT JOIN patient p ON pr.patient_id = p.patient_id`;
    const params = [];
    const countParams = [];

    if (search) {
      const clause = ` WHERE CONCAT(p.first_name, ' ', p.last_name) LIKE ? OR pr.diagnosis LIKE ?`;
      query += clause;
      countQuery += clause;
      const s = `%${search}%`;
      params.push(s, s);
      countParams.push(s, s);
    }

    query += ' ORDER BY pr.created_at DESC LIMIT ? OFFSET ?';
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
    console.error('Get prescriptions error:', error);
    res.status(500).json({ message: 'Failed to fetch prescriptions' });
  }
};

// GET /api/prescriptions/:id
exports.getById = async (req, res) => {
  try {
    const [prescriptions] = await pool.query(
      `SELECT pr.*, 
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        CONCAT(d.first_name, ' ', d.last_name) as doctor_name
      FROM prescription pr
      LEFT JOIN patient p ON pr.patient_id = p.patient_id
      LEFT JOIN doctor d ON pr.doctor_id = d.doctor_id
      WHERE pr.prescription_id = ?`,
      [req.params.id]
    );

    if (prescriptions.length === 0) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Get medicines for this prescription
    const [medicines] = await pool.query(
      `SELECT c.*, m.medicine_name, m.price 
       FROM \`contains\` c 
       LEFT JOIN medicine m ON c.medicine_id = m.medicine_id 
       WHERE c.prescription_id = ?`,
      [req.params.id]
    );

    res.json({
      data: { ...prescriptions[0], medicines },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch prescription' });
  }
};

// POST /api/prescriptions
exports.create = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { patient_id, doctor_id, prescription_date, diagnosis, notes, medicines } = req.body;

    if (!patient_id || !doctor_id || !prescription_date) {
      return res.status(400).json({ message: 'Patient, doctor, and date are required' });
    }

    const [result] = await connection.query(
      'INSERT INTO prescription (patient_id, doctor_id, prescription_date, diagnosis, notes) VALUES (?, ?, ?, ?, ?)',
      [patient_id, doctor_id, prescription_date, diagnosis || null, notes || null]
    );

    const prescriptionId = result.insertId;

    // Insert medicines into contains table
    if (medicines && medicines.length > 0) {
      const values = medicines.map((m) => [prescriptionId, m.medicine_id, m.dosage, m.duration, m.frequency]);
      await connection.query(
        'INSERT INTO `contains` (prescription_id, medicine_id, dosage, duration, frequency) VALUES ?',
        [values]
      );
    }

    await connection.commit();
    res.status(201).json({
      message: 'Prescription created successfully',
      data: { prescription_id: prescriptionId },
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create prescription error:', error);
    res.status(500).json({ message: 'Failed to create prescription' });
  } finally {
    connection.release();
  }
};

// PUT /api/prescriptions/:id
exports.update = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { patient_id, doctor_id, prescription_date, diagnosis, notes, medicines } = req.body;

    await connection.query(
      'UPDATE prescription SET patient_id=?, doctor_id=?, prescription_date=?, diagnosis=?, notes=? WHERE prescription_id=?',
      [patient_id, doctor_id, prescription_date, diagnosis, notes, req.params.id]
    );

    // Update medicines: delete old and insert new
    await connection.query('DELETE FROM `contains` WHERE prescription_id = ?', [req.params.id]);

    if (medicines && medicines.length > 0) {
      const values = medicines.map((m) => [parseInt(req.params.id), m.medicine_id, m.dosage, m.duration, m.frequency]);
      await connection.query(
        'INSERT INTO `contains` (prescription_id, medicine_id, dosage, duration, frequency) VALUES ?',
        [values]
      );
    }

    await connection.commit();
    res.json({ message: 'Prescription updated successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Failed to update prescription' });
  } finally {
    connection.release();
  }
};

// DELETE /api/prescriptions/:id
exports.remove = async (req, res) => {
  try {
    await pool.query('DELETE FROM `contains` WHERE prescription_id = ?', [req.params.id]);
    await pool.query('DELETE FROM prescription WHERE prescription_id = ?', [req.params.id]);
    res.json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete prescription' });
  }
};
