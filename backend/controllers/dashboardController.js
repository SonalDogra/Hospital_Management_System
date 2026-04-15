const pool = require('../config/db');

// GET /api/dashboard/stats
exports.getStats = async (req, res) => {
  try {
    const [patients] = await pool.query('SELECT COUNT(*) as count FROM patient');
    const [doctors] = await pool.query('SELECT COUNT(*) as count FROM doctor');
    const [appointments] = await pool.query('SELECT COUNT(*) as count FROM appointment');
    const [pendingBills] = await pool.query(
      "SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total FROM billing WHERE payment_status = 'Pending'"
    );
    const [totalRevenue] = await pool.query(
      "SELECT COALESCE(SUM(total_amount), 0) as total FROM billing WHERE payment_status = 'Paid'"
    );
    const [medicines] = await pool.query('SELECT COUNT(*) as count FROM medicine');
    const [lowStockMeds] = await pool.query('SELECT COUNT(*) as count FROM medicine WHERE stock < 50');

    res.json({
      data: {
        totalPatients: patients[0].count,
        totalDoctors: doctors[0].count,
        totalAppointments: appointments[0].count,
        pendingBills: pendingBills[0].count,
        pendingAmount: pendingBills[0].total,
        totalRevenue: totalRevenue[0].total,
        totalMedicines: medicines[0].count,
        lowStockMedicines: lowStockMeds[0].count,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
};

// GET /api/dashboard/recent-appointments
exports.getRecentAppointments = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, 
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        CONCAT(d.first_name, ' ', d.last_name) as doctor_name,
        d.specialization
      FROM appointment a
      LEFT JOIN patient p ON a.patient_id = p.patient_id
      LEFT JOIN doctor d ON a.doctor_id = d.doctor_id
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
      LIMIT 5`
    );
    res.json({ data: rows });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch recent appointments' });
  }
};

// GET /api/dashboard/appointment-chart
exports.getAppointmentChart = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        DATE_FORMAT(appointment_date, '%Y-%m') as month,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN status = 'Scheduled' THEN 1 ELSE 0 END) as scheduled
      FROM appointment
      GROUP BY DATE_FORMAT(appointment_date, '%Y-%m')
      ORDER BY month DESC
      LIMIT 6
    `);
    res.json({ data: rows.reverse() });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch chart data' });
  }
};

// GET /api/dashboard/revenue-chart
exports.getRevenueChart = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        DATE_FORMAT(billing_date, '%Y-%m') as month,
        COALESCE(SUM(total_amount), 0) as revenue,
        COUNT(*) as bills
      FROM billing
      WHERE payment_status = 'Paid'
      GROUP BY DATE_FORMAT(billing_date, '%Y-%m')
      ORDER BY month DESC
      LIMIT 6
    `);
    res.json({ data: rows.reverse() });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch revenue data' });
  }
};
