const router = require('express').Router();
const controller = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

router.use(auth);
router.get('/stats', controller.getStats);
router.get('/recent-appointments', controller.getRecentAppointments);
router.get('/appointment-chart', controller.getAppointmentChart);
router.get('/revenue-chart', controller.getRevenueChart);

module.exports = router;
