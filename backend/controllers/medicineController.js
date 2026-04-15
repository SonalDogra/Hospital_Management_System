const pool = require('../config/db');

// GET /api/medicines
exports.getAll = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM medicine';
    let countQuery = 'SELECT COUNT(*) as total FROM medicine';
    const params = [];
    const countParams = [];

    if (search) {
      const clause = ' WHERE medicine_name LIKE ? OR manufacturer LIKE ?';
      query += clause;
      countQuery += clause;
      const s = `%${search}%`;
      params.push(s, s);
      countParams.push(s, s);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
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
    res.status(500).json({ message: 'Failed to fetch medicines' });
  }
};

// GET /api/medicines/all
exports.getAllList = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT medicine_id, medicine_name, price, stock FROM medicine ORDER BY medicine_name');
    res.json({ data: rows });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch medicines list' });
  }
};

// GET /api/medicines/:id
exports.getById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM medicine WHERE medicine_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Medicine not found' });
    res.json({ data: rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch medicine' });
  }
};

// POST /api/medicines
exports.create = async (req, res) => {
  try {
    const { medicine_name, manufacturer, price, stock, expiry_date } = req.body;

    if (!medicine_name) {
      return res.status(400).json({ message: 'Medicine name is required' });
    }

    const [result] = await pool.query(
      'INSERT INTO medicine (medicine_name, manufacturer, price, stock, expiry_date) VALUES (?, ?, ?, ?, ?)',
      [medicine_name, manufacturer || null, price || 0, stock || 0, expiry_date || null]
    );

    res.status(201).json({
      message: 'Medicine added successfully',
      data: { medicine_id: result.insertId },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add medicine' });
  }
};

// PUT /api/medicines/:id
exports.update = async (req, res) => {
  try {
    const { medicine_name, manufacturer, price, stock, expiry_date } = req.body;

    await pool.query(
      'UPDATE medicine SET medicine_name=?, manufacturer=?, price=?, stock=?, expiry_date=? WHERE medicine_id=?',
      [medicine_name, manufacturer, price, stock, expiry_date, req.params.id]
    );

    res.json({ message: 'Medicine updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update medicine' });
  }
};

// DELETE /api/medicines/:id
exports.remove = async (req, res) => {
  try {
    await pool.query('DELETE FROM medicine WHERE medicine_id = ?', [req.params.id]);
    res.json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete medicine' });
  }
};
