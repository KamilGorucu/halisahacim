const express = require('express');
const router = express.Router();
const {
  createSubscriptionRequest,
  getBusinessSubscriptionRequests,
  approveSubscriptionRequest,
  cancelSubscription,
  rejectSubscriptionRequest, // ✅ eklendi
} = require('../controllers/subscriptionController');
const { protect, protectBusiness } = require('../middleware/authMiddleware');

router.post('/request', protect, createSubscriptionRequest);
router.get('/requests', protectBusiness, getBusinessSubscriptionRequests);
router.post('/approve', protectBusiness, approveSubscriptionRequest);
router.post('/reject', protectBusiness, rejectSubscriptionRequest); // ✅ eklendi
router.delete('/:id', protectBusiness, cancelSubscription);

module.exports = router;
