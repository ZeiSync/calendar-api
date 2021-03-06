const router = require('express').Router();

const controllers = require('./controllers');
const requireAuth = require('./auth');

router
  .route('/auth/login')
  .post(controllers.login);

router
  .route('/events')
  .get(requireAuth.auth(), controllers.getUserEvents)
  .post(requireAuth.auth(), controllers.postUserEvent);

router.route('/events/:id').delete(requireAuth.auth(), controllers.deleteUserEvent);

module.exports = router;