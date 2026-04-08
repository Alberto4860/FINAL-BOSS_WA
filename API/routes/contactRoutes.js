const { Router } = require('express');
const controller = require('../controllers/contactController');

const router = Router();

router.get('/', controller.getContacts);
router.get('/:id', controller.getContact);
router.post('/', controller.createContact);
router.put('/:id', controller.updateContact);
router.delete('/:id', controller.deleteContact);

module.exports = router;
