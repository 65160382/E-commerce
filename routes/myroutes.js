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

// เส้นทางสำหรับแสดงรายละเอียดสินค้า
router.get('/product/:id', (req, res) => {
    const productId = req.params.id;
    db.query('SELECT * FROM products WHERE Product_id = ?', [productId], (err, result) => {
        if (err) {
            console.error('Error fetching product details:', err);
            res.status(500).send('Server Error');
            return;
        }
        res.render('product', { product: result[0] });
    });
});





module.exports = router 