const express = require('express');
const router = express.Router();
const db = require('../config/database')

//แสดงข้อมูลในหน้าแรกของเว็บ
router.get('/',(req,res)=>{
    db.query('SELECT * FROM products', (err, results) => {
        if (err) {
            console.error('Error fetching products:', err);
            res.status(500).send('Server Error');
            return;
        }
        res.render('index', { products: results });
    });
});

//ค้นหาข้อมูลสินค้าที่ต้องการ
router.get('/search', (req, res) => {
    const searchQuery = req.query.search;
    db.query('SELECT * FROM products WHERE name LIKE ?', [`%${searchQuery}%`], (err, results) => {
        if (err) {
            console.error('Error fetching products:', err);
            res.status(500).send('Server Error');
            return;
        }
        res.render('index', { products: results });
    });
});




module.exports = router 