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
        res.render('index', { products: results }  );
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

router.post('/order', (req, res) => {
    const { productId, quantity } = req.body;
    
    // สมมติว่าคุณมี query เพื่อดึงข้อมูลสินค้าจาก database
    db.query('SELECT * FROM products WHERE Product_id = ?', [productId], (err, result) => {
        if (err) {
            console.error('Error fetching product details:', err);
            res.status(500).send('Server Error');
            return;
        }
        
        if (result.length > 0) {
            const product = result[0];
            const totalPrice = parseInt(product.price) * quantity;
            
            // สร้าง array ของสินค้าเพื่อส่งไปยัง template
            const products = [{
                image: product.image, // ปรับตามชื่อ field ในฐานข้อมูลของคุณ
                name: product.name,
                price: product.price,
                quantity: quantity
            }];
            
            res.render('chart', { 
                products: products, 
                totalPrice: totalPrice 
            });
        } else {
            res.status(404).send('Product not found');
        }
    });
});


//แสดงหน้า login
router.get('/login',(req,res)=>{
    res.render('login')
})

// บันทึกผู้ใช้ที่ login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Query ฐานข้อมูลเพื่อตรวจสอบผู้ใช้
    db.query('SELECT * FROM register WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            res.status(500).send('Server Error');
            return;
        }
        
        if (results.length > 0) {
            const user = results[0];

            // ตรวจสอบรหัสผ่าน
            if (password === user.password) {
                // บันทึกข้อมูลผู้ใช้ใน session
                req.session.user = {
                    id: user.id,
                    username: user.username,
                };

                // เปลี่ยนเส้นทางไปยังหน้าแรก
                res.redirect('/');
            } else {
                res.status(401).send('Invalid username or password');
            }
        } else {
            res.status(401).send('Invalid username or password');
        }
    });
});

//logout เพื่อล้าง session 
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Logout Error');
        }
        res.clearCookie('connect.sid'); // ลบ cookie ที่เก็บ session ID
        res.redirect('/');
    });
});



module.exports = router 