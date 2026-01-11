// ===== Order Form App =====
const STORAGE_KEY = 'orderFormAppData';

function getOrders() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveOrders(orders) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

function addOrder(order) {
    const orders = getOrders();
    order.id = Date.now().toString();
    order.createdAt = new Date().toISOString();
    order.status = '未処理';
    orders.unshift(order);
    saveOrders(orders);
    return order;
}

function updateOrder(id, updatedData) {
    const orders = getOrders();
    const index = orders.findIndex(o => o.id === id);
    if (index !== -1) {
        orders[index] = { ...orders[index], ...updatedData };
        saveOrders(orders);
        return orders[index];
    }
    return null;
}

function deleteOrder(id) {
    const orders = getOrders();
    const filtered = orders.filter(o => o.id !== id);
    saveOrders(filtered);
}

// DOM Elements
const navTabs = document.querySelectorAll('.nav-tab');
const tabContents = document.querySelectorAll('.tab-content');
const orderForm = document.getElementById('order-form');
const productsContainer = document.getElementById('products-container');
const addProductBtn = document.getElementById('add-product-btn');
const totalAmountDisplay = document.getElementById('total-amount');
const clearFormBtn = document.getElementById('clear-form-btn');
const ordersList = document.getElementById('orders-list');
const searchInput = document.getElementById('search-input');
const filterStatus = document.getElementById('filter-status');
const exportBtn = document.getElementById('export-btn');
const importFile = document.getElementById('import-file');
const clearAllBtn = document.getElementById('clear-all-btn');
const printModal = document.getElementById('print-modal');
const editModal = document.getElementById('edit-modal');
const detailModal = document.getElementById('detail-modal');
const printContent = document.getElementById('print-content');
const detailContent = document.getElementById('detail-content');

// Tab switching
navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        navTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `${tabName}-tab`) content.classList.add('active');
        });
        if (tabName === 'list') renderOrdersList();
    });
});

// Product rows
let productRowId = 0;

function createProductRow() {
    productRowId++;
    const row = document.createElement('div');
    row.className = 'product-row';
    row.innerHTML = `
        <input type="text" placeholder="商品名" class="product-name">
        <input type="number" placeholder="個数" min="1" value="1" class="product-quantity">
        <input type="number" placeholder="金額" min="0" class="product-price">
        <button type="button" class="remove-product-btn">×</button>
    `;
    row.querySelector('.product-price').addEventListener('input', updateTotal);
    row.querySelector('.product-quantity').addEventListener('input', updateTotal);
    row.querySelector('.remove-product-btn').addEventListener('click', () => {
        row.remove();
        updateTotal();
        if (productsContainer.children.length === 0) addProductRow();
    });
    return row;
}

function addProductRow() {
    productsContainer.appendChild(createProductRow());
}

function updateTotal() {
    let total = 0;
    productsContainer.querySelectorAll('.product-row').forEach(row => {
        const quantity = parseInt(row.querySelector('.product-quantity').value) || 0;
        const price = parseInt(row.querySelector('.product-price').value) || 0;
        total += quantity * price;
    });
    totalAmountDisplay.textContent = `¥${total.toLocaleString()}`;
}

addProductBtn.addEventListener('click', addProductRow);

function initForm() {
    document.getElementById('reception-date').value = new Date().toISOString().split('T')[0];
    productsContainer.innerHTML = '';
    addProductRow();
    updateTotal();
}

function getFormData() {
    const formData = new FormData(orderForm);
    const data = {
        receptionDate: formData.get('receptionDate'),
        receptionMethod: formData.get('receptionMethod'),
        staffName: formData.get('staffName'),
        orderDatetime: formData.get('orderDatetime'),
        deliveryMethod: formData.get('deliveryMethod'),
        customerName: formData.get('customerName'),
        phoneNumber: formData.get('phoneNumber'),
        deliveryAddress: formData.get('deliveryAddress'),
        taxType: formData.get('taxType'),
        notes: formData.get('notes'),
        paymentMethod: formData.get('paymentMethod'),
        billingName: formData.get('billingName'),
        departments: formData.getAll('departments'),
        products: [],
        totalAmount: 0
    };
    productsContainer.querySelectorAll('.product-row').forEach(row => {
        const name = row.querySelector('.product-name').value;
        const quantity = parseInt(row.querySelector('.product-quantity').value) || 0;
        const price = parseInt(row.querySelector('.product-price').value) || 0;
        if (name || quantity || price) {
            data.products.push({ name, quantity, price });
            data.totalAmount += quantity * price;
        }
    });
    return data;
}

orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = getFormData();
    if (!data.customerName) { alert('お客様氏名を入力してください'); return; }
    if (data.products.length === 0 || !data.products.some(p => p.name)) { alert('商品を1つ以上入力してください'); return; }
    addOrder(data);
    alert('注文を保存しました！');
    orderForm.reset();
    initForm();
});

clearFormBtn.addEventListener('click', () => {
    if (confirm('入力内容をクリアしますか？')) { orderForm.reset(); initForm(); }
});

function renderOrdersList() {
    const orders = getOrders();
    const searchTerm = searchInput.value.toLowerCase();
    const statusFilter = filterStatus.value;
    let filtered = orders;
    if (searchTerm) filtered = filtered.filter(o => o.customerName.toLowerCase().includes(searchTerm) || o.phoneNumber?.includes(searchTerm));
    if (statusFilter !== 'all') filtered = filtered.filter(o => o.status === statusFilter);
    
    if (filtered.length === 0) {
        ordersList.innerHTML = `<div class="empty-list"><div class="empty-list-icon">📋</div><p>注文データがありません</p></div>`;
        return;
    }
    
    ordersList.innerHTML = filtered.map(order => `
        <div class="order-card ${order.status === '処理済み' ? 'processed' : ''}" data-id="${order.id}">
            <div class="order-card-header">
                <div><div class="order-card-title">${escapeHtml(order.customerName)}</div><div class="order-card-date">${formatDate(order.receptionDate)}</div></div>
                <span class="order-card-status ${order.status === '処理済み' ? 'completed' : 'pending'}">${order.status}</span>
            </div>
            <div class="order-card-body">
                <div class="order-card-info">📞 ${escapeHtml(order.phoneNumber || '未登録')}</div>
                <div class="order-card-info">🚚 ${order.deliveryMethod}</div>
                <div class="order-card-amount">合計: ¥${order.totalAmount.toLocaleString()}</div>
            </div>
            <div class="order-card-actions">
                <button class="btn btn-secondary view-btn" data-id="${order.id}">詳細</button>
                <button class="btn btn-secondary print-preview-btn" data-id="${order.id}">印刷</button>
                <button class="btn btn-primary toggle-status-btn" data-id="${order.id}">${order.status === '処理済み' ? '未処理に戻す' : '処理済みにする'}</button>
                <button class="btn btn-danger delete-btn" data-id="${order.id}">削除</button>
            </div>
        </div>
    `).join('');
    
    ordersList.querySelectorAll('.view-btn').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); showOrderDetail(btn.dataset.id); }));
    ordersList.querySelectorAll('.print-preview-btn').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); showPrintPreview(btn.dataset.id); }));
    ordersList.querySelectorAll('.toggle-status-btn').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); toggleOrderStatus(btn.dataset.id); }));
    ordersList.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); handleDeleteOrder(btn.dataset.id); }));
    ordersList.querySelectorAll('.order-card').forEach(card => card.addEventListener('click', () => showOrderDetail(card.dataset.id)));
}

searchInput.addEventListener('input', renderOrdersList);
filterStatus.addEventListener('change', renderOrdersList);

function toggleOrderStatus(id) {
    const orders = getOrders();
    const order = orders.find(o => o.id === id);
    if (order) {
        updateOrder(id, { status: order.status === '処理済み' ? '未処理' : '処理済み' });
        renderOrdersList();
    }
}

function handleDeleteOrder(id) {
    const orders = getOrders();
    const order = orders.find(o => o.id === id);
    if (!order) return;
    if (confirm(`「${order.customerName}」さんの注文を削除しますか？\nこの操作は取り消せません。`)) {
        deleteOrder(id);
        renderOrdersList();
    }
}

let currentOrderId = null;

function showOrderDetail(id) {
    const orders = getOrders();
    const order = orders.find(o => o.id === id);
    if (!order) return;
    currentOrderId = id;
    detailContent.innerHTML = `
        <div class="detail-section"><h3>受付情報</h3><p>受付日: ${formatDate(order.receptionDate)}</p><p>受付方法: ${order.receptionMethod}</p><p>受注者: ${escapeHtml(order.staffName || '未登録')}</p><p>受け取り方法: ${order.deliveryMethod}</p></div>
        <div class="detail-section"><h3>お客様情報</h3><p>氏名: ${escapeHtml(order.customerName)}</p><p>電話番号: ${escapeHtml(order.phoneNumber || '未登録')}</p><p>配達先: ${escapeHtml(order.deliveryAddress || '未登録')}</p></div>
        <div class="detail-section"><h3>注文商品 (${order.taxType})</h3><div class="detail-products">${order.products.map(p => `<div class="detail-product-item"><span>${escapeHtml(p.name)}</span><span>${p.quantity}個 × ¥${p.price.toLocaleString()} = ¥${(p.quantity * p.price).toLocaleString()}</span></div>`).join('')}<div class="detail-product-item" style="font-weight: bold; border-top: 2px solid var(--border-color);"><span>合計</span><span>¥${order.totalAmount.toLocaleString()}</span></div></div></div>
        <div class="detail-section"><h3>備考</h3><p>${escapeHtml(order.notes || 'なし')}</p></div>
        <div class="detail-section"><h3>支払い・その他</h3><p>支払方法: ${order.paymentMethod}</p><p>請求先: ${escapeHtml(order.billingName || '未登録')}</p><p>部門: ${order.departments.length > 0 ? order.departments.join(', ') : '未選択'}</p></div>
    `;
    detailModal.classList.add('active');
}

document.getElementById('detail-print-btn').addEventListener('click', () => { detailModal.classList.remove('active'); showPrintPreview(currentOrderId); });
document.getElementById('detail-edit-btn').addEventListener('click', () => { detailModal.classList.remove('active'); alert('編集機能は今後実装予定です'); });

function showPrintPreview(id) {
    const orders = getOrders();
    const order = orders.find(o => o.id === id);
    if (!order) return;
    currentOrderId = id;
    printContent.innerHTML = generatePrintHtml(order);
    printModal.classList.add('active');
}

function generatePrintHtml(order) {
    const productsHtml = order.products.map(p => `<div class="print-product-item"><div>${escapeHtml(p.name)}</div><div style="text-align: center;">${p.quantity}</div><div>¥${(p.quantity * p.price).toLocaleString()}</div></div>`).join('');
    const paymentMethods = ['代金', '代スミ', '未収', '売掛', '代引', '納品請求書'];
    const paymentHtml = paymentMethods.map(m => `<span class="print-checkbox"><span class="print-checkbox-box">${order.paymentMethod === m ? '✓' : ''}</span><span>${m}</span></span>`).join('');
    const departments = ['青果', '精肉', '鮮魚', '惣菜', '日配'];
    const departmentsHtml = departments.map(d => `<span class="print-checkbox"><span class="print-checkbox-box">${order.departments.includes(d) ? '✓' : ''}</span><span>${d}</span></span>`).join('');
    
    return `
        <div class="print-form">
            <div class="print-row"><div class="print-cell header">受付日</div><div class="print-cell content">${formatDate(order.receptionDate)}</div><div class="print-cell header small">${order.receptionMethod === '来店' ? '✓' : ''}来店</div><div class="print-cell header small">${order.receptionMethod === '電話' ? '✓' : ''}電話</div><div class="print-cell header">受注者</div><div class="print-cell content">${escapeHtml(order.staffName || '')}</div></div>
            <div class="print-row"><div class="print-cell header">ご注文日時</div><div class="print-cell content">${order.orderDatetime ? formatDateTime(order.orderDatetime) : ''}</div><div class="print-cell header small">${order.deliveryMethod === '配達' ? '✓' : ''}配達</div><div class="print-cell header small">${order.deliveryMethod === '来店' ? '✓' : ''}来店</div></div>
            <div class="print-row"><div class="print-cell header">お客さま氏名</div><div class="print-cell content" style="flex: 2;">${escapeHtml(order.customerName)}</div></div>
            <div class="print-row"><div class="print-cell header">お電話番号</div><div class="print-cell content" style="flex: 2;">${escapeHtml(order.phoneNumber || '')}</div></div>
            <div class="print-row"><div class="print-cell header">ご注文品</div><div class="print-cell content print-products"><div class="print-product-header"><div>商品名</div><div>個数</div><div>金額</div></div>${productsHtml}</div><div class="print-cell" style="flex-direction: column; align-items: flex-end;"><div style="font-size: 11px; margin-bottom: 8px;">(${order.taxType})</div><div class="print-total">合計: ¥${order.totalAmount.toLocaleString()}</div></div></div>
            <div class="print-row"><div class="print-cell header">詳細・備考</div><div class="print-cell content print-notes">${escapeHtml(order.notes || '').replace(/\n/g, '<br>')}</div></div>
            <div class="print-row"><div class="print-cell header">配達先住所</div><div class="print-cell content" style="flex: 2;">${escapeHtml(order.deliveryAddress || '')}</div></div>
            <div class="print-row"><div class="print-cell content" style="flex: 2;"><div class="print-checkbox-group">${paymentHtml}</div></div></div>
            <div class="print-row"><div class="print-cell header">ご請求先<br>領収書宛名</div><div class="print-cell content" style="flex: 2;">${escapeHtml(order.billingName || '')}</div></div>
            <div class="print-row"><div class="print-cell content" style="flex: 2;"><div class="print-checkbox-group">${departmentsHtml}</div></div></div>
        </div>
        <p style="margin-top: 10px; font-size: 11px;">※お願い　この注文書はお支払いいただいた後、担当部門へ戻してください。</p>
    `;
}

document.getElementById('print-btn').addEventListener('click', () => window.print());

document.querySelectorAll('.close-modal').forEach(btn => btn.addEventListener('click', () => btn.closest('.modal').classList.remove('active')));
document.querySelectorAll('.modal').forEach(modal => modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); }));

exportBtn.addEventListener('click', () => {
    const orders = getOrders();
    const blob = new Blob([JSON.stringify(orders, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `order-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    alert('データをエクスポートしました');
});

importFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            if (Array.isArray(data) && confirm(`${data.length}件のデータをインポートします。既存のデータは上書きされます。よろしいですか？`)) {
                saveOrders(data);
                alert('データをインポートしました');
                renderOrdersList();
            }
        } catch (err) { alert('ファイルの読み込みに失敗しました'); }
    };
    reader.readAsText(file);
    e.target.value = '';
});

clearAllBtn.addEventListener('click', () => {
    if (confirm('すべてのデータを削除しますか？この操作は取り消せません。') && confirm('本当に削除してよろしいですか？')) {
        localStorage.removeItem(STORAGE_KEY);
        alert('すべてのデータを削除しました');
        renderOrdersList();
    }
});

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return '';
    const date = new Date(dateTimeStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
}

document.addEventListener('DOMContentLoaded', () => { initForm(); renderOrdersList(); });
