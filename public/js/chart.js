// breadcrumb แบบ dynamic
document.addEventListener('DOMContentLoaded', function() {
    const breadcrumb = document.getElementById('breadcrumb');
    const path = window.location.pathname.split('/').filter(function(part) {
        return part !== '';
    });

    let breadcrumbHTML = '<a href="/">หน้าแรก</a>';
    let currentPath = '';

    path.forEach(function(part, index) {
        currentPath += '/' + part;
        if (index === path.length - 1) {
            breadcrumbHTML += ' / ' + part;
        } else {
            breadcrumbHTML += ' / <a href="' + currentPath + '">' + part + '</a>';
        }
    });

    breadcrumb.innerHTML = breadcrumbHTML;
});

//อัพเดตจำนวนสินค้า
function updateQuantity(element) {
    const productId = element.getAttribute('data-id');
    const newQuantity = element.value;

    // อัปเดตจำนวนสินค้าในตาราง
    const row = element.closest('tr');
    const pricePerUnit = parseFloat(row.querySelector('td[data-price]').getAttribute('data-price'));
    const totalPriceElement = row.querySelector('.total-price');
    totalPriceElement.textContent = (pricePerUnit * newQuantity).toFixed(2);

    // อัปเดตราคาทั้งหมด
    updateTotalPrice();
}

// อัพเดตราคาทั้งหมด
function updateTotalPrice() {
    const totalPriceElements = document.querySelectorAll('.total-price');
    let totalPrice = 0;
    totalPriceElements.forEach(function(element) {
        totalPrice += parseFloat(element.textContent);
    });

    // อัปเดตจำนวนเงินรวมทั้งหมดใน div ที่มี id totalPrice
    document.getElementById('totalPrice').textContent = totalPrice.toFixed(2);
}

function deleteProduct(button) {
    // Get the product ID and the row element
    const productId = button.getAttribute('data-id');
    const row = button.closest('tr');

    // Remove the row from the table
    row.remove();

    // Update the total price after deletion
    updateTotalPrice();
}
