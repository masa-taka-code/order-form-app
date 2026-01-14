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
const summaryList = document.getElementById('summary-list');
const searchInput = document.getElementById('search-input');
const summarySearchInput = document.getElementById('summary-search-input');
const filterStatus = document.getElementById('filter-status');
const exportBtn = document.getElementById('export-btn');
const importFile = document.getElementById('import-file');
const backToListBtn = document.getElementById('back-to-list-btn');
const printModal = document.getElementById('print-modal');
const editModal = document.getElementById('edit-modal');
const detailModal = document.getElementById('detail-modal');
const printContent = document.getElementById('print-content');
const detailContent = document.getElementById('detail-content');
const customerNameInput = document.getElementById('customer-name');

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
        if (tabName === 'summary') renderSummaryList();
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
        <div class="product-price-wrapper">
            <input type="number" placeholder="単価" min="0" class="product-price">
            <span class="product-tax-label">(税込)</span>
        </div>
        <select class="product-tax-type">
            <option value="税込">税込</option>
            <option value="税抜">税抜</option>
        </select>
        <select class="product-tax-rate">
            <option value="10">10%</option>
            <option value="8">8%</option>
        </select>
        <span class="product-subtotal">¥0</span>
        <button type="button" class="remove-product-btn">×</button>
    `;
    const updateRowSubtotal = () => {
        const quantity = parseInt(row.querySelector('.product-quantity').value) || 0;
        const price = parseInt(row.querySelector('.product-price').value) || 0;
        const taxType = row.querySelector('.product-tax-type').value;
        const taxRate = parseInt(row.querySelector('.product-tax-rate').value) / 100;

        let subtotal = quantity * price;
        if (taxType === '税抜') {
            subtotal = Math.floor(subtotal * (1 + taxRate));
        }
        row.querySelector('.product-subtotal').textContent = `¥${subtotal.toLocaleString()}`;

        // 単価欄のラベル更新
        row.querySelector('.product-tax-label').textContent = `(${taxType})`;

        updateTotal();
    };
    row.querySelector('.product-price').addEventListener('input', updateRowSubtotal);
    row.querySelector('.product-quantity').addEventListener('input', updateRowSubtotal);
    row.querySelector('.product-tax-type').addEventListener('change', updateRowSubtotal);
    row.querySelector('.product-tax-rate').addEventListener('change', updateRowSubtotal);
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
        const taxType = row.querySelector('.product-tax-type').value;
        const taxRate = parseInt(row.querySelector('.product-tax-rate').value) / 100;

        let subtotal = quantity * price;
        if (taxType === '税抜') {
            subtotal = Math.floor(subtotal * (1 + taxRate));
        }
        total += subtotal;
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
        // 詳細な税計算情報
        subtotal: 0,           // 小計（税抜合計）
        taxExcluded8Total: 0,  // 外税8%対象額
        taxExcluded10Total: 0, // 外税10%対象額
        tax8Amount: 0,         // 外税額8%
        tax10Amount: 0,        // 外税額10%
        itemCount: 0,          // 買上点数
        totalAmount: 0,        // 合計（税込）
        innerTaxTotal: 0       // 内消費税等
    };

    productsContainer.querySelectorAll('.product-row').forEach(row => {
        const name = row.querySelector('.product-name').value;
        const quantity = parseInt(row.querySelector('.product-quantity').value) || 0;
        const price = parseInt(row.querySelector('.product-price').value) || 0;
        const taxType = row.querySelector('.product-tax-type').value;
        const taxRate = parseInt(row.querySelector('.product-tax-rate').value);

        if (name || quantity || price) {
            const baseAmount = quantity * price;
            let subtotal = baseAmount;
            let taxAmount = 0;

            if (taxType === '税抜') {
                // 外税：税抜価格から税額を計算
                taxAmount = Math.floor(baseAmount * taxRate / 100);
                subtotal = baseAmount + taxAmount;

                if (taxRate === 8) {
                    data.taxExcluded8Total += baseAmount;
                    data.tax8Amount += taxAmount;
                } else if (taxRate === 10) {
                    data.taxExcluded10Total += baseAmount;
                    data.tax10Amount += taxAmount;
                }
            } else {
                // 税込：内税を逆算
                const innerTax = Math.floor(baseAmount * taxRate / (100 + taxRate));
                data.innerTaxTotal += innerTax;
            }

            data.products.push({ name, quantity, price, taxType, taxRate, subtotal, taxAmount });
            data.subtotal += baseAmount;
            data.totalAmount += subtotal;
            data.itemCount += quantity;
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

// サマリーリスト（注文日、名前、商品名のみ表示）
function renderSummaryList() {
    const search = summarySearchInput?.value?.toLowerCase() || '';
    let orders = getOrders();

    if (search) {
        orders = orders.filter(o => o.customerName?.toLowerCase().includes(search));
    }

    // 日付の新しい順にソート
    orders.sort((a, b) => new Date(b.receptionDate) - new Date(a.receptionDate));

    if (orders.length === 0) {
        summaryList.innerHTML = `<div class="empty-list"><div class="empty-list-icon">📋</div><p>注文データがありません</p></div>`;
        return;
    }

    summaryList.innerHTML = orders.map(order => {
        const date = formatDate(order.receptionDate);
        const name = order.customerName || '（名前なし）';
        const products = order.products?.map(p => p.name).join(', ') || '（商品なし）';

        return `
            <div class="summary-item" data-id="${order.id}">
                <span class="summary-item-date">${date}</span>
                <span class="summary-item-name">${escapeHtml(name)}</span>
                <span class="summary-item-products">${escapeHtml(products)}</span>
            </div>
        `;
    }).join('');

    // クリックで詳細表示
    summaryList.querySelectorAll('.summary-item').forEach(item => {
        item.addEventListener('click', () => showOrderDetail(item.dataset.id));
    });
}

// サマリー検索
if (summarySearchInput) {
    summarySearchInput.addEventListener('input', renderSummaryList);
}

// お客様氏名に「様」を自動付与
if (customerNameInput) {
    customerNameInput.addEventListener('blur', () => {
        let name = customerNameInput.value.trim();
        if (name && !name.endsWith('様')) {
            customerNameInput.value = name + ' 様';
        }
    });
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

    // 印刷用HTMLを生成（A4サイズ、店舗情報付き）
    const printHtml = generatePrintHtml(order);

    printContent.innerHTML = `
        <div class="print-preview-a4">
            ${printHtml}
            <div class="print-preview-store-info">
                <div>スーパーマーケット玉木屋</div>
                <div>0193-63-2711</div>
            </div>
        </div>
    `;
    printModal.classList.add('active');
}

// 注文データを受け取って直接印刷を実行
function executePrintForOrder(order) {
    const printHtml = generatePrintHtmlForPaper(order);

    // 印刷専用HTML+CSS（紙として成立するレイアウト）
    const fullHtml = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>注文書印刷</title>
    <style>
        /* === リセット === */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        /* === 紙コンテナ（A4基準） === */
        .paper {
            width: 210mm;
            min-height: 297mm;
            padding: 15mm;
            margin: 0 auto;
            background: white;
            color: black;
            font-family: 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif;
            font-size: 15pt;
            line-height: 1.5;
            position: relative;
        }
        
        /* === タイトル === */
        .paper-title {
            text-align: center;
            font-size: 22pt;
            font-weight: bold;
            letter-spacing: 4pt;
            margin-bottom: 10mm;
        }
        
        /* === メインテーブル（印刷に強いtable構造） === */
        .paper-table {
            width: 100%;
            border-collapse: collapse;
            border: 0.5mm solid #000;
        }
        
        .paper-table th,
        .paper-table td {
            border: 0.3mm solid #000;
            padding: 2.5mm 3.5mm;
            vertical-align: middle;
            font-size: 14pt;
        }
        
        .paper-table th {
            background: #f0f0f0;
            font-weight: bold;
            text-align: center;
            width: 28mm;
        }
        
        .paper-table td {
            text-align: left;
        }
        
        /* === 商品テーブル（入れ子） === */
        .product-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .product-table th,
        .product-table td {
            border: 0.2mm solid #000;
            padding: 2mm 2.5mm;
            font-size: 13pt;
        }
        
        .product-table th {
            background: #f5f5f5;
            font-weight: bold;
            text-align: center;
        }
        
        .product-table td {
            text-align: center;
        }
        
        .product-table td:first-child {
            text-align: left;
        }
        
        .product-table td:last-child {
            text-align: right;
        }
        
        /* === 合計エリア === */
        .total-cell {
            text-align: right !important;
            font-weight: bold;
            font-size: 11pt;
            padding: 3mm !important;
            vertical-align: top !important;
            width: 45mm;
        }
        
        .total-details {
            text-align: right;
        }
        
        .total-detail-item {
            font-size: 10pt;
            line-height: 1.4;
            white-space: nowrap;
        }
        
        .total-detail-item.total-main {
            font-size: 13pt;
            font-weight: bold;
            border-top: 0.3mm solid #000;
            padding-top: 2mm;
            margin-top: 2mm;
        }
        
        /* === チェックボックス風 === */
        .check-group {
            display: inline;
        }
        
        .check-item {
            display: inline-block;
            margin-right: 5mm;
            font-size: 14pt;
        }
        
        .check-box {
            display: inline-block;
            width: 5mm;
            height: 5mm;
            border: 0.3mm solid #000;
            text-align: center;
            line-height: 5mm;
            font-size: 11pt;
            margin-right: 1.5mm;
            vertical-align: middle;
        }
        
        /* === 店舗情報（紙の右下、左寄せ調整） === */
        .store-info {
            position: absolute;
            bottom: 15mm;
            right: 25mm;
            text-align: right;
            font-size: 10pt;
            line-height: 1.6;
        }
        
        /* === 印刷時のスタイル === */
        @media print {
            html, body {
                width: 210mm;
                height: 297mm;
                margin: 0;
                padding: 0;
            }
            
            .paper {
                width: 100%;
                min-height: auto;
                padding: 0;
                margin: 0;
            }
            
            /* @page は補助扱い（Safari対策） */
            @page {
                size: A4 portrait;
                margin: 15mm;
            }
            
            .store-info {
                position: fixed;
                bottom: 0;
                right: 0;
            }
        }
        
        /* === 画面表示時（プレビュー用） === */
        @media screen {
            body {
                background: #888;
                padding: 20px;
            }
            
            .paper {
                box-shadow: 0 0 20px rgba(0,0,0,0.3);
            }
        }
    </style>
</head>
<body>
    ${printHtml}
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

// 印刷実行（プレビューモーダル用・旧方式）
function executePrint() {
    const orders = getOrders();
    const order = orders.find(o => o.id === currentOrderId);
    if (!order) return;
    executePrintForOrder(order);
}

function generatePrintHtml(order) {
    // データの安全なアクセス
    const products = order.products || [];
    const departments = order.departments || [];

    // 商品欄：商品名・個数・単価（税込/税抜表示）・合計金額の4列で表示
    const productsHtml = products.length > 0
        ? products.map(p => {
            const taxLabel = p.taxType || '税込';
            const taxRateLabel = p.taxRate ? `${p.taxRate}%` : '';
            const priceDisplay = `¥${(p.price || 0).toLocaleString()}(${taxLabel}${taxRateLabel})`;
            const subtotal = p.subtotal || (p.quantity || 0) * (p.price || 0);
            return `<div class="print-product-item"><div>${escapeHtml(p.name || '')}</div><div>${p.quantity || 0}</div><div>${priceDisplay}</div><div>¥${subtotal.toLocaleString()}</div></div>`;
        }).join('')
        : '<div class="print-product-item"><div>（商品なし）</div><div>-</div><div>-</div><div>-</div></div>';

    // 代金：代スミ/未収/売掛/代引からの選択を表示
    const paymentType = order.paymentType || order.paymentMethod || '';
    const paymentOptions = ['代スミ', '未収', '売掛', '代引'];
    const paymentHtml = paymentOptions.map(m => `<span class="print-checkbox"><span class="print-checkbox-box">${paymentType === m ? '✓' : ''}</span><span>${m}</span></span>`).join('');

    // 納品請求書：要チェックボックス
    const invoiceHtml = `<span class="print-checkbox"><span class="print-checkbox-box">${order.invoiceRequired ? '✓' : ''}</span><span>要</span></span>`;

    const deptList = ['青果', '精肉', '鮮魚', '惣菜', '日配'];
    const departmentsHtml = deptList.map(d => `<span class="print-checkbox"><span class="print-checkbox-box">${departments.includes(d) ? '✓' : ''}</span><span>${d}</span></span>`).join('');

    // 合計金額表示（税込合計のみ）
    const totalAmount = order.totalAmount || 0;
    const totalHtml = `
        <div class="print-total">合計（税込）<br>¥${totalAmount.toLocaleString()}</div>
    `;

    // ③タイトル追加、②お願い文言を削除、⑤店舗情報はCSS側で配置
    return `
        <h2 class="print-title">ご注文承り書（お客様控え）</h2>
        <div class="print-form">
            <div class="print-row"><div class="print-cell header">受付日</div><div class="print-cell content">${formatDate(order.receptionDate)}</div><div class="print-cell header small">${order.receptionMethod === '来店' ? '✓' : ''}来店</div><div class="print-cell header small">${order.receptionMethod === '電話' ? '✓' : ''}電話</div><div class="print-cell header">受注者</div><div class="print-cell content">${escapeHtml(order.staffName || '')}</div></div>
            <div class="print-row"><div class="print-cell header">ご注文日時</div><div class="print-cell content">${order.orderDatetime ? formatDateTime(order.orderDatetime) : ''}</div><div class="print-cell header small">${order.deliveryMethod === '配達' ? '✓' : ''}配達</div><div class="print-cell header small">${order.deliveryMethod === '来店' ? '✓' : ''}来店</div></div>
            <div class="print-row"><div class="print-cell header">お客様氏名</div><div class="print-cell content">${escapeHtml(order.customerName || '')}</div></div>
            <div class="print-row"><div class="print-cell header">お電話番号</div><div class="print-cell content">${escapeHtml(order.phoneNumber || '')}</div></div>
            <div class="print-row"><div class="print-cell header">ご注文品</div><div class="print-cell content print-products"><div class="print-product-header"><div>商品名</div><div>個数</div><div>単価</div><div>合計金額</div></div>${productsHtml}</div><div class="print-total-area">${totalHtml}</div></div>
            <div class="print-row"><div class="print-cell header">詳細・備考</div><div class="print-cell content print-notes">${escapeHtml(order.notes || '').replace(/\n/g, '<br>')}</div></div>
            <div class="print-row"><div class="print-cell header">配達先住所</div><div class="print-cell content">${escapeHtml(order.deliveryAddress || '')}</div></div>
            <div class="print-row"><div class="print-cell header">代金</div><div class="print-cell content"><div class="print-checkbox-group">${paymentHtml}</div></div></div>
            <div class="print-row"><div class="print-cell header">納品請求書</div><div class="print-cell content"><div class="print-checkbox-group">${invoiceHtml}</div></div></div>
            <div class="print-row"><div class="print-cell header">ご請求先<br>領収書宛名</div><div class="print-cell content">${escapeHtml(order.billingName || '')}</div></div>
            <div class="print-row"><div class="print-cell header">部門</div><div class="print-cell content"><div class="print-checkbox-group">${departmentsHtml}</div></div></div>
        </div>
    `;
}

// 印刷専用HTML生成（table構造で印刷に強いレイアウト）
function generatePrintHtmlForPaper(order) {
    const products = order.products || [];
    const departments = order.departments || [];

    // 商品行を生成
    const productsRows = products.length > 0
        ? products.map(p => {
            const taxLabel = p.taxType || '税込';
            const taxRateLabel = p.taxRate ? `${p.taxRate}%` : '';
            const priceDisplay = `¥${(p.price || 0).toLocaleString()}(${taxLabel}${taxRateLabel})`;
            const subtotal = p.subtotal || (p.quantity || 0) * (p.price || 0);
            return `<tr><td>${escapeHtml(p.name || '')}</td><td>${p.quantity || 0}</td><td>${priceDisplay}</td><td>¥${subtotal.toLocaleString()}</td></tr>`;
        }).join('')
        : '<tr><td colspan="4">（商品なし）</td></tr>';

    // チェックボックス生成ヘルパー
    const checkbox = (checked) => `<span class="check-box">${checked ? '✓' : ''}</span>`;

    // 代金オプション
    const paymentType = order.paymentType || order.paymentMethod || '';
    const paymentOptions = ['代スミ', '未収', '売掛', '代引'];
    const paymentChecks = paymentOptions.map(m =>
        `<span class="check-item">${checkbox(paymentType === m)}${m}</span>`
    ).join('');

    // 部門チェック
    const deptList = ['青果', '精肉', '鮮魚', '惣菜', '日配', '酒', '菓子', '雑貨'];
    const deptChecks = deptList.map(d =>
        `<span class="check-item">${checkbox(departments.includes(d))}${d}</span>`
    ).join('');

    // 詳細な合計計算情報
    const subtotal = order.subtotal || 0;
    const taxExcluded8Total = order.taxExcluded8Total || 0;
    const tax8Amount = order.tax8Amount || 0;
    const taxExcluded10Total = order.taxExcluded10Total || 0;
    const tax10Amount = order.tax10Amount || 0;
    const itemCount = order.itemCount || 0;
    const totalAmount = order.totalAmount || 0;
    const innerTaxTotal = order.innerTaxTotal || 0;

    // 合計明細を生成
    let totalDetailsHtml = `<div class="total-detail-item">小計　¥${subtotal.toLocaleString()}</div>`;

    if (taxExcluded8Total > 0) {
        totalDetailsHtml += `<div class="total-detail-item">（外税8%対象額　¥${taxExcluded8Total.toLocaleString()}）</div>`;
        totalDetailsHtml += `<div class="total-detail-item">外税額　8%　¥${tax8Amount.toLocaleString()}</div>`;
    }

    if (taxExcluded10Total > 0) {
        totalDetailsHtml += `<div class="total-detail-item">（外税10%対象額　¥${taxExcluded10Total.toLocaleString()}）</div>`;
        totalDetailsHtml += `<div class="total-detail-item">外税額　10%　¥${tax10Amount.toLocaleString()}</div>`;
    }

    totalDetailsHtml += `<div class="total-detail-item">買上点数　${itemCount}点</div>`;
    totalDetailsHtml += `<div class="total-detail-item total-main">合計　¥${totalAmount.toLocaleString()}</div>`;

    if (innerTaxTotal > 0) {
        totalDetailsHtml += `<div class="total-detail-item">（内消費税等　¥${innerTaxTotal.toLocaleString()}）</div>`;
    }

    return `
<div class="paper">
    <h1 class="paper-title">ご注文承り書（お客様控え）</h1>
    
    <table class="paper-table">
        <tr>
            <th>受付日</th>
            <td>${formatDate(order.receptionDate)}</td>
            <td style="width: 20mm; text-align: center;">${checkbox(order.receptionMethod === '来店')}来店</td>
            <td style="width: 20mm; text-align: center;">${checkbox(order.receptionMethod === '電話')}電話</td>
            <th>受注者</th>
            <td>${escapeHtml(order.staffName || '')}</td>
        </tr>
        <tr>
            <th>ご注文日時</th>
            <td colspan="3">${order.orderDatetime ? formatDateTime(order.orderDatetime) : ''}</td>
            <td style="width: 20mm; text-align: center;">${checkbox(order.deliveryMethod === '配達')}配達</td>
            <td style="width: 20mm; text-align: center;">${checkbox(order.deliveryMethod === '来店')}来店</td>
        </tr>
        <tr>
            <th>お客様氏名</th>
            <td colspan="5">${escapeHtml(order.customerName || '')}</td>
        </tr>
        <tr>
            <th>お電話番号</th>
            <td colspan="5">${escapeHtml(order.phoneNumber || '')}</td>
        </tr>
        <tr>
            <th>ご注文品</th>
            <td colspan="4" style="padding: 0;">
                <table class="product-table">
                    <thead>
                        <tr><th style="width: 45%;">商品名</th><th style="width: 12%;">個数</th><th style="width: 23%;">単価</th><th style="width: 20%;">合計金額</th></tr>
                    </thead>
                    <tbody>
                        ${productsRows}
                    </tbody>
                </table>
            </td>
            <td class="total-cell"><div class="total-details">${totalDetailsHtml}</div></td>
        </tr>
        <tr>
            <th>詳細・備考</th>
            <td colspan="5" style="min-height: 20mm;">${escapeHtml(order.notes || '').replace(/\n/g, '<br>')}</td>
        </tr>
        <tr>
            <th>配達先住所</th>
            <td colspan="5">${escapeHtml(order.deliveryAddress || '')}</td>
        </tr>
        <tr>
            <th>代金</th>
            <td colspan="5"><span class="check-group">${paymentChecks}</span></td>
        </tr>
        <tr>
            <th>納品請求書</th>
            <td colspan="5"><span class="check-item">${checkbox(order.invoiceRequired)}要</span></td>
        </tr>
        <tr>
            <th>ご請求先<br>領収書宛名</th>
            <td colspan="5">${escapeHtml(order.billingName || '')}</td>
        </tr>
        <tr>
            <th>部門</th>
            <td colspan="5"><span class="check-group">${deptChecks}</span></td>
        </tr>
    </table>
    
    <div class="store-info">
        <div>スーパーマーケット玉木屋</div>
        <div>0193-63-2711</div>
    </div>
</div>
    `;
}

// PDFダウンロード（印刷ダイアログを開いてPDF保存を促す）
document.getElementById('download-pdf-btn').addEventListener('click', () => {
    const orders = getOrders();
    const order = orders.find(o => o.id === currentOrderId);
    if (!order) return;

    // 新しいウィンドウで印刷用ページを開き、PDFとして保存を促す
    executePrintForOrder(order);

    // プレビューモーダルを閉じる
    printModal.classList.remove('active');
});

// 一覧に戻るボタン
backToListBtn.addEventListener('click', () => {
    printModal.classList.remove('active');
    // 一覧タブに切り替え
    navTabs.forEach(t => t.classList.remove('active'));
    document.querySelector('[data-tab="list"]').classList.add('active');
    tabContents.forEach(c => c.classList.remove('active'));
    document.getElementById('list-tab').classList.add('active');
    renderOrdersList();
});

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

document.addEventListener('DOMContentLoaded', () => {
    initForm();
    renderOrdersList();
    // 税込/税抜切り替え時に合計を再計算
    document.querySelectorAll('input[name="taxType"]').forEach(radio => {
        radio.addEventListener('change', updateTotal);
    });
});
