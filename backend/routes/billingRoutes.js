const router = require('express').Router();
const controller = require('../controllers/billingController');
const auth = require('../middleware/auth');

router.use(auth);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id/status', controller.updatePaymentStatus);
router.delete('/:id', controller.remove);

module.exports = router;
