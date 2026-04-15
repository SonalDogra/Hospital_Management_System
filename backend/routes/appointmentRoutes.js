const router = require('express').Router();
const controller = require('../controllers/appointmentController');
const auth = require('../middleware/auth');

router.use(auth);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id/status', controller.updateStatus);
router.delete('/:id', controller.remove);

module.exports = router;
