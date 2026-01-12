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
        <input type="number" placeholder="単価" min="0" class="product-price">
        <span class="product-subtotal">¥0</span>
        <button type="button" class="remove-product-btn">×</button>
    `;
    const updateRowSubtotal = () => {
        const quantity = parseInt(row.querySelector('.product-quantity').value) || 0;
        const price = parseInt(row.querySelector('.product-price').value) || 0;
        row.querySelector('.product-subtotal').textContent = `¥${(quantity * price).toLocaleString()}`;
        updateTotal();
    };
    row.querySelector('.product-price').addEventListener('input', updateRowSubtotal);
    row.querySelector('.product-quantity').addEventListener('input', updateRowSubtotal);
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
        paymentType: formData.get('paymentType'),
        invoiceRequired: formData.get('invoiceRequired') === '要',
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

// 編集中の注文ID（新規の場合はnull）
let editingOrderId = null;

orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = getFormData();
    if (!data.customerName) { alert('お客様氏名を入力してください'); return; }
    if (data.products.length === 0 || !data.products.some(p => p.name)) { alert('商品を1つ以上入力してください'); return; }

    if (editingOrderId) {
        // 編集モード：既存の注文を更新
        updateOrder(editingOrderId, data);
        alert('注文を更新しました！');
        editingOrderId = null;
    } else {
        // 新規モード
        addOrder(data);
        alert('注文を保存しました！');
    }
    orderForm.reset();
    initForm();
});

clearFormBtn.addEventListener('click', () => {
    if (confirm('入力内容をクリアしますか？')) {
        orderForm.reset();
        initForm();
        editingOrderId = null;
    }
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
                <button class="btn btn-secondary edit-btn" data-id="${order.id}">編集</button>
                <button class="btn btn-secondary print-preview-btn" data-id="${order.id}">印刷</button>
                <button class="btn btn-primary toggle-status-btn" data-id="${order.id}">${order.status === '処理済み' ? '未処理に戻す' : '処理済みにする'}</button>
                <button class="btn btn-danger delete-btn" data-id="${order.id}">削除</button>
            </div>
        </div>
    `).join('');

    ordersList.querySelectorAll('.view-btn').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); showOrderDetail(btn.dataset.id); }));
    ordersList.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); editOrder(btn.dataset.id); }));
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
        <div class="detail-section"><h3>支払い・その他</h3><p>代金: ${order.paymentType || order.paymentMethod || '未選択'}</p><p>納品請求書: ${order.invoiceRequired ? '要' : '不要'}</p><p>請求先: ${escapeHtml(order.billingName || '未登録')}</p><p>部門: ${order.departments.length > 0 ? order.departments.join(', ') : '未選択'}</p></div>
    `;
    detailModal.classList.add('active');
}

document.getElementById('detail-print-btn').addEventListener('click', () => { detailModal.classList.remove('active'); showPrintPreview(currentOrderId); });
document.getElementById('detail-edit-btn').addEventListener('click', () => { detailModal.classList.remove('active'); editOrder(currentOrderId); });

// ===== 編集機能 =====
function editOrder(id) {
    const orders = getOrders();
    const order = orders.find(o => o.id === id);
    if (!order) return;

    // 編集モードに設定
    editingOrderId = id;

    // 入力タブに切り替え
    navTabs.forEach(t => t.classList.remove('active'));
    document.querySelector('[data-tab="input"]').classList.add('active');
    tabContents.forEach(c => c.classList.remove('active'));
    document.getElementById('input-tab').classList.add('active');

    // フォームにデータを読み込む
    document.getElementById('reception-date').value = order.receptionDate || '';
    document.querySelector(`input[name="receptionMethod"][value="${order.receptionMethod}"]`).checked = true;
    document.getElementById('staff-name').value = order.staffName || '';
    document.getElementById('order-datetime').value = order.orderDatetime || '';
    document.querySelector(`input[name="deliveryMethod"][value="${order.deliveryMethod}"]`).checked = true;
    document.getElementById('customer-name').value = order.customerName || '';
    document.getElementById('phone-number').value = order.phoneNumber || '';
    document.getElementById('delivery-address').value = order.deliveryAddress || '';
    document.querySelector(`input[name="taxType"][value="${order.taxType}"]`).checked = true;
    document.getElementById('notes').value = order.notes || '';
    // 新しい代金・納品請求書フォームに対応
    document.getElementById('payment-type').value = order.paymentType || order.paymentMethod || '';
    document.getElementById('invoice-required').checked = order.invoiceRequired || false;
    document.getElementById('billing-name').value = order.billingName || '';

    // 部門チェックボックス
    document.querySelectorAll('input[name="departments"]').forEach(cb => {
        cb.checked = order.departments && order.departments.includes(cb.value);
    });

    // 商品リスト
    productsContainer.innerHTML = '';
    if (order.products && order.products.length > 0) {
        order.products.forEach(p => {
            const row = createProductRow();
            row.querySelector('.product-name').value = p.name || '';
            row.querySelector('.product-quantity').value = p.quantity || 1;
            row.querySelector('.product-price').value = p.price || 0;
            productsContainer.appendChild(row);
        });
    } else {
        addProductRow();
    }
    updateTotal();

    alert('編集モードです。変更後「保存」ボタンを押してください。');
}

function showPrintPreview(id) {
    const orders = getOrders();
    const order = orders.find(o => o.id === id);
    if (!order) return;
    currentOrderId = id;

    // 印刷用HTMLを生成
    const printHtml = generatePrintHtml(order);

    // プレビューモーダルに表示
    printContent.innerHTML = printHtml;
    printModal.classList.add('active');
}

// 印刷実行（新しいウィンドウで開く方式）
function executePrint() {
    const orders = getOrders();
    const order = orders.find(o => o.id === currentOrderId);
    if (!order) return;

    const printHtml = generatePrintHtml(order);

    // 印刷用の完全なHTMLページを作成
    const fullHtml = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>注文書印刷</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Hiragino Kaku Gothic ProN', sans-serif; padding: 15mm; background: white; color: black; position: relative; min-height: 100vh; }
        .print-wrapper { padding-bottom: 60px; }
        .print-title { text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 15px; letter-spacing: 2px; }
        .print-form { border: 2px solid #333; width: 100%; table-layout: fixed; }
        .print-row { display: flex; border-bottom: 1px solid #333; }
        .print-row:last-child { border-bottom: none; }
        .print-cell { padding: 8px 10px; border-right: 1px solid #333; min-height: 36px; display: flex; align-items: center; font-size: 12px; }
        .print-cell:last-child { border-right: none; }
        .print-cell.header { background: #f5f5f5; font-weight: bold; font-size: 11px; width: 90px; flex-shrink: 0; justify-content: center; text-align: center; }
        .print-cell.content { flex: 1; font-size: 13px; }
        .print-cell.small { width: 60px; text-align: center; justify-content: center; flex-shrink: 0; }
        .print-notes { min-height: 80px; align-items: flex-start; }
        .print-products { flex-direction: column; padding: 0; }
        .print-product-header { display: grid; grid-template-columns: 1fr 50px 70px 80px; border-bottom: 1px solid #333; background: #f5f5f5; font-weight: bold; font-size: 10px; }
        .print-product-header > div { padding: 6px; border-right: 1px solid #333; text-align: center; }
        .print-product-header > div:last-child { border-right: none; }
        .print-product-item { display: grid; grid-template-columns: 1fr 50px 70px 80px; border-bottom: 1px solid #ddd; }
        .print-product-item:last-child { border-bottom: none; }
        .print-product-item > div { padding: 6px; border-right: 1px solid #333; font-size: 11px; }
        .print-product-item > div:last-child { border-right: none; text-align: right; }
        .print-product-item > div:nth-child(2), .print-product-item > div:nth-child(3) { text-align: center; }
        .print-checkbox-group { display: flex; gap: 12px; flex-wrap: wrap; }
        .print-checkbox { display: flex; align-items: center; gap: 4px; }
        .print-checkbox-box { width: 14px; height: 14px; border: 1px solid #333; display: flex; align-items: center; justify-content: center; font-size: 10px; }
        .print-total { font-weight: bold; font-size: 14px; text-align: right; padding-right: 10px; }
        .print-store-info { position: absolute; bottom: 15mm; right: 15mm; text-align: right; font-size: 12px; line-height: 1.6; }
        @media print {
            body { padding: 0; }
            @page { size: A4; margin: 15mm; }
            .print-store-info { position: fixed; bottom: 15mm; right: 15mm; }
        }
    </style>
</head>
<body>
    <div class="print-wrapper">
    ${printHtml}
    </div>
    <div class="print-store-info">
        <div>スーパーマーケット玉木屋</div>
        <div>0193-63-2711</div>
    </div>
    <script>
        window.onload = function() {
            window.print();
        };
    </script>
</body>
</html>`;

    // 新しいウィンドウで開く
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(fullHtml);
        printWindow.document.close();
    } else {
        alert('ポップアップがブロックされました。ブラウザの設定でポップアップを許可してください。');
    }
}

function generatePrintHtml(order) {
    // データの安全なアクセス
    const products = order.products || [];
    const departments = order.departments || [];

    // ①商品欄：商品名・個数・単価・合計金額の4列で表示
    const productsHtml = products.length > 0
        ? products.map(p => `<div class="print-product-item"><div>${escapeHtml(p.name || '')}</div><div>${p.quantity || 0}</div><div>¥${(p.price || 0).toLocaleString()}</div><div>¥${((p.quantity || 0) * (p.price || 0)).toLocaleString()}</div></div>`).join('')
        : '<div class="print-product-item"><div>（商品なし）</div><div>-</div><div>-</div><div>-</div></div>';

    // ④代金：代スミ/未収/売掛/代引からの選択を表示
    const paymentType = order.paymentType || order.paymentMethod || '';
    const paymentOptions = ['代スミ', '未収', '売掛', '代引'];
    const paymentHtml = paymentOptions.map(m => `<span class="print-checkbox"><span class="print-checkbox-box">${paymentType === m ? '✓' : ''}</span><span>${m}</span></span>`).join('');

    // ④納品請求書：要チェックボックス
    const invoiceHtml = `<span class="print-checkbox"><span class="print-checkbox-box">${order.invoiceRequired ? '✓' : ''}</span><span>要</span></span>`;

    const deptList = ['青果', '精肉', '鮮魚', '惣菜', '日配'];
    const departmentsHtml = deptList.map(d => `<span class="print-checkbox"><span class="print-checkbox-box">${departments.includes(d) ? '✓' : ''}</span><span>${d}</span></span>`).join('');

    // ③タイトル追加、②お願い文言を削除、⑤店舗情報はCSS側で配置
    return `
        <h2 class="print-title">ご注文承り書（お客様控え）</h2>
        <div class="print-form">
            <div class="print-row"><div class="print-cell header">受付日</div><div class="print-cell content">${formatDate(order.receptionDate)}</div><div class="print-cell header small">${order.receptionMethod === '来店' ? '✓' : ''}来店</div><div class="print-cell header small">${order.receptionMethod === '電話' ? '✓' : ''}電話</div><div class="print-cell header">受注者</div><div class="print-cell content">${escapeHtml(order.staffName || '')}</div></div>
            <div class="print-row"><div class="print-cell header">ご注文日時</div><div class="print-cell content">${order.orderDatetime ? formatDateTime(order.orderDatetime) : ''}</div><div class="print-cell header small">${order.deliveryMethod === '配達' ? '✓' : ''}配達</div><div class="print-cell header small">${order.deliveryMethod === '来店' ? '✓' : ''}来店</div></div>
            <div class="print-row"><div class="print-cell header">お客さま氏名</div><div class="print-cell content">${escapeHtml(order.customerName || '')}</div></div>
            <div class="print-row"><div class="print-cell header">お電話番号</div><div class="print-cell content">${escapeHtml(order.phoneNumber || '')}</div></div>
            <div class="print-row"><div class="print-cell header">ご注文品</div><div class="print-cell content print-products"><div class="print-product-header"><div>商品名</div><div>個数</div><div>単価</div><div>合計金額</div></div>${productsHtml}</div><div class="print-total-area"><div class="print-total-label">(${order.taxType || '税込'})</div><div class="print-total">合計<br>¥${(order.totalAmount || 0).toLocaleString()}</div></div></div>
            <div class="print-row"><div class="print-cell header">詳細・備考</div><div class="print-cell content print-notes">${escapeHtml(order.notes || '').replace(/\n/g, '<br>')}</div></div>
            <div class="print-row"><div class="print-cell header">配達先住所</div><div class="print-cell content">${escapeHtml(order.deliveryAddress || '')}</div></div>
            <div class="print-row"><div class="print-cell header">代金</div><div class="print-cell content"><div class="print-checkbox-group">${paymentHtml}</div></div></div>
            <div class="print-row"><div class="print-cell header">納品請求書</div><div class="print-cell content"><div class="print-checkbox-group">${invoiceHtml}</div></div></div>
            <div class="print-row"><div class="print-cell header">ご請求先<br>領収書宛名</div><div class="print-cell content">${escapeHtml(order.billingName || '')}</div></div>
            <div class="print-row"><div class="print-cell header">部門</div><div class="print-cell content"><div class="print-checkbox-group">${departmentsHtml}</div></div></div>
        </div>
    `;
}

document.getElementById('print-btn').addEventListener('click', () => executePrint());

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
