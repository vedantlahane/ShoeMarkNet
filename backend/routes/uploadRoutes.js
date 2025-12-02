const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
    res.send('Upload route');
});

module.exports = router;
