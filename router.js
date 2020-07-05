const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('El servidor corre');
})

module.exports = router;