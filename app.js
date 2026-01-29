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

// ===== お客様データ管理 =====
const CUSTOMER_STORAGE_KEY = 'customerListData';

function getCustomers() {
    const data = localStorage.getItem(CUSTOMER_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveCustomers(customers) {
    localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customers));
}

function addCustomer(customer) {
    const customers = getCustomers();
    customer.id = Date.now().toString();
    customer.createdAt = new Date().toISOString();
    customers.unshift(customer);
    saveCustomers(customers);
    return customer;
}

function updateCustomer(id, updatedData) {
    const customers = getCustomers();
    const index = customers.findIndex(c => c.id === id);
    if (index !== -1) {
        customers[index] = { ...customers[index], ...updatedData };
        saveCustomers(customers);
        return customers[index];
    }
    return null;
}

function deleteCustomer(id) {
    const customers = getCustomers();
    const filtered = customers.filter(c => c.id !== id);
    saveCustomers(filtered);
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
        if (tabName === 'customers') renderCustomersList();
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
        <div class="product-price-wrapper">
            <input type="number" placeholder="単価" min="0" class="product-price">
            <span class="product-tax-label">(税込)</span>
        </div>
        <input type="number" placeholder="個数" min="1" value="1" class="product-quantity">
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
    // 税率別の対象額を集計（一括計算方式）
    let subtotal = 0;
    let taxExcluded8Total = 0;
    let taxExcluded10Total = 0;

    productsContainer.querySelectorAll('.product-row').forEach(row => {
        const name = row.querySelector('.product-name').value;
        const quantity = parseInt(row.querySelector('.product-quantity').value) || 0;
        const price = parseInt(row.querySelector('.product-price').value) || 0;
        const taxType = row.querySelector('.product-tax-type').value;
        const taxRate = parseInt(row.querySelector('.product-tax-rate').value);

        if (name && (quantity > 0 || price > 0)) {
            const baseAmount = quantity * price;

            if (taxType === '税抜') {
                // 外税：対象額を税率別に集計
                if (taxRate === 8) {
                    taxExcluded8Total += baseAmount;
                } else if (taxRate === 10) {
                    taxExcluded10Total += baseAmount;
                }
                subtotal += baseAmount;
            } else {
                // 税込：そのまま小計に加算
                subtotal += baseAmount;
            }
        }
    });

    // 税額を一括計算（対象額合計 × 税率、端数切り捨て）
    const tax8Amount = Math.floor(taxExcluded8Total * 8 / 100);
    const tax10Amount = Math.floor(taxExcluded10Total * 10 / 100);

    // 合計 = 小計 + 外税額
    const total = subtotal + tax8Amount + tax10Amount;

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

    // ご注文日時を新形式で組み立て（日付＋時間セレクト＋分セレクト）
    const orderDate = formData.get('orderDate') || '';
    const orderHour = formData.get('orderHour') || '';
    const orderMinute = formData.get('orderMinute') || '00';
    let orderDatetime = '';
    if (orderDate) {
        // 時間がある場合は時間も含める
        if (orderHour) {
            orderDatetime = `${orderDate}T${orderHour}:${orderMinute}`;
        } else {
            orderDatetime = `${orderDate}T00:${orderMinute}`;
        }
    }

    const data = {
        receptionDate: formData.get('receptionDate'),
        receptionMethod: formData.get('receptionMethod'),
        staffName: formData.get('staffName'),
        orderDatetime: orderDatetime,
        deliveryMethod: formData.get('deliveryMethod'),
        customerName: formData.get('customerName'),
        phoneNumber: formData.get('phoneNumber'),
        deliveryAddress: formData.get('deliveryAddress'),
        notes: formData.get('notes'),
        paymentType: formData.get('paymentType'),
        invoiceRequired: formData.get('invoiceRequired') === '要',
        billingName: formData.get('billingName'),
        departments: formData.getAll('departments'),
        products: [],
        // 詳細な税計算情報（レシート方式：一括計算）
        subtotal: 0,           // 小計（商品金額の合計）
        taxExcluded8Total: 0,  // 外税8%対象額（税抜）
        taxExcluded10Total: 0, // 外税10%対象額（税抜）
        tax8Amount: 0,         // 外税額8%（一括計算）
        tax10Amount: 0,        // 外税額10%（一括計算）
        itemCount: 0,          // 買上点数
        totalAmount: 0,        // 合計（税込）
        innerTaxTotal: 0       // 内消費税等（= 外税額8% + 外税額10%）
    };

    // まず商品をすべて処理して、税率別の対象額を集計
    productsContainer.querySelectorAll('.product-row').forEach(row => {
        const name = row.querySelector('.product-name').value;
        const quantity = parseInt(row.querySelector('.product-quantity').value) || 0;
        const price = parseInt(row.querySelector('.product-price').value) || 0;
        const taxType = row.querySelector('.product-tax-type').value;
        const taxRate = parseInt(row.querySelector('.product-tax-rate').value);

        if (name && (quantity > 0 || price > 0)) {
            const baseAmount = quantity * price;

            if (taxType === '税抜') {
                // 外税：対象額を税率別に集計（税額は後で一括計算）
                if (taxRate === 8) {
                    data.taxExcluded8Total += baseAmount;
                } else if (taxRate === 10) {
                    data.taxExcluded10Total += baseAmount;
                }
                data.subtotal += baseAmount;
            } else {
                // 税込：そのまま小計に加算
                data.subtotal += baseAmount;
            }

            data.products.push({
                name,
                quantity,
                price,
                taxType,
                taxRate,
                baseAmount
            });
            data.itemCount += quantity;
        }
    });

    // 税額を一括計算（対象額合計 × 税率、端数切り捨て）
    data.tax8Amount = Math.floor(data.taxExcluded8Total * 8 / 100);
    data.tax10Amount = Math.floor(data.taxExcluded10Total * 10 / 100);

    // 内消費税等 = 外税額の合計（レシート方式）
    data.innerTaxTotal = data.tax8Amount + data.tax10Amount;

    // 合計 = 小計 + 外税額
    data.totalAmount = data.subtotal + data.tax8Amount + data.tax10Amount;

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

// ひらがなをカタカナに変換する関数
function toKatakana(str) {
    if (!str) return '';
    let result = '';
    for (const char of str) {
        const code = char.charCodeAt(0);
        // ひらがな範囲（ぁ-ゖ: U+3041-U+3096）をカタカナに変換
        if (code >= 0x3041 && code <= 0x3096) {
            result += String.fromCharCode(code + 0x60);
        } else {
            result += char;
        }
    }
    return result;
}

// お客様氏名にカタカナ変換と「様」を自動付与（IME対応版）
if (customerNameInput) {
    let isComposing = false;
    let processed = false;

    // IME変換中フラグ
    customerNameInput.addEventListener('compositionstart', () => { isComposing = true; });
    customerNameInput.addEventListener('compositionend', () => { isComposing = false; });

    // フォーカスが外れた時に一度だけ変換
    customerNameInput.addEventListener('blur', () => {
        if (isComposing) return; // IME変換中は何もしない

        const originalValue = customerNameInput.value.trim();
        if (!originalValue) return;
        if (originalValue.endsWith('様')) return; // 既に変換済み

        // カタカナに変換して「様」を追加
        const converted = toKatakana(originalValue) + ' 様';
        customerNameInput.value = converted;
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
        <div class="detail-section"><h3>受付情報</h3><p>受付日: ${formatDate(order.receptionDate)}</p><p>お受け取り日時: ${order.orderDatetime ? formatDateTime(order.orderDatetime) : '未設定'}</p><p>受付方法: ${order.receptionMethod}</p><p>受注者: ${escapeHtml(order.staffName || '未登録')}</p><p>受け取り方法: ${order.deliveryMethod}</p></div>
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
    try {
        const orders = getOrders();
        const order = orders.find(o => o.id === id);
        if (!order) {
            alert('注文が見つかりませんでした。');
            return;
        }

        console.log('編集対象の注文:', order); // デバッグ用

        // 編集モードに設定
        editingOrderId = id;

        // 入力タブに切り替え
        navTabs.forEach(t => t.classList.remove('active'));
        document.querySelector('[data-tab="input"]').classList.add('active');
        tabContents.forEach(c => c.classList.remove('active'));
        document.getElementById('input-tab').classList.add('active');

        // フォームにデータを読み込む（安全にチェック）
        const setValueSafe = (elId, value) => {
            const el = document.getElementById(elId);
            if (el) el.value = value || '';
        };

        const setCheckedSafe = (elId, checked) => {
            const el = document.getElementById(elId);
            if (el) el.checked = !!checked;
        };

        setValueSafe('reception-date', order.receptionDate);

        // 受付方法（安全に選択）
        const receptionMethodRadio = document.querySelector(`input[name="receptionMethod"][value="${order.receptionMethod}"]`);
        if (receptionMethodRadio) receptionMethodRadio.checked = true;

        setValueSafe('staff-name', order.staffName);

        // ご注文日時を新形式で読み込む（日付＋時間セレクト＋分セレクト）
        if (order.orderDatetime) {
            const dt = order.orderDatetime.split('T');
            setValueSafe('order-date', dt[0]);
            if (dt[1]) {
                const timeParts = dt[1].split(':');
                setValueSafe('order-hour', timeParts[0]);
                const orderMinuteEl = document.getElementById('order-minute');
                if (orderMinuteEl) orderMinuteEl.value = timeParts[1] === '30' ? '30' : '00';
            }
        }

        // 受け取り方法（安全に選択）
        const deliveryMethodRadio = document.querySelector(`input[name="deliveryMethod"][value="${order.deliveryMethod}"]`);
        if (deliveryMethodRadio) deliveryMethodRadio.checked = true;

        setValueSafe('customer-name', order.customerName);
        setValueSafe('phone-number', order.phoneNumber);
        setValueSafe('delivery-address', order.deliveryAddress);
        setValueSafe('notes', order.notes);
        setValueSafe('payment-type', order.paymentType || order.paymentMethod);
        setCheckedSafe('invoice-required', order.invoiceRequired);
        setValueSafe('billing-name', order.billingName);

        // 部門チェックボックス
        document.querySelectorAll('input[name="departments"]').forEach(cb => {
            cb.checked = order.departments && order.departments.includes(cb.value);
        });

        // 商品リスト（税設定も含めて読み込む）
        productsContainer.innerHTML = '';
        if (order.products && order.products.length > 0) {
            order.products.forEach(p => {
                const row = createProductRow();
                row.querySelector('.product-name').value = p.name || '';
                row.querySelector('.product-quantity').value = p.quantity || 1;
                row.querySelector('.product-price').value = p.price || 0;
                // 商品ごとの税設定を反映
                const taxTypeEl = row.querySelector('.product-tax-type');
                const taxRateEl = row.querySelector('.product-tax-rate');
                if (taxTypeEl && p.taxType) taxTypeEl.value = p.taxType;
                if (taxRateEl && p.taxRate) taxRateEl.value = p.taxRate;
                productsContainer.appendChild(row);
                // 小計を更新するためにinputイベントをトリガー
                row.querySelector('.product-price').dispatchEvent(new Event('input'));
            });
        } else {
            addProductRow();
        }
        updateTotal();

        alert('編集モードです。変更後「保存」ボタンを押してください。');
    } catch (error) {
        console.error('編集エラー:', error);
        alert('編集中にエラーが発生しました。コンソールを確認してください。');
    }
}

function showPrintPreview(id) {
    const orders = getOrders();
    const order = orders.find(o => o.id === id);
    if (!order) return;
    currentOrderId = id;

    // PDF印刷と同じHTMLを生成
    const printHtml = generatePrintHtmlForPaper(order);

    // PDF印刷と同じスタイルを埋め込む（完全一致）
    const printStyles = `
        <style>
            /* === リセット === */
            .print-preview-a4 * { margin: 0; padding: 0; box-sizing: border-box; }
            
            /* === 紙コンテナ === */
            .print-preview-a4 .paper {
                width: 210mm;
                min-height: 297mm;
                padding: 15mm;
                margin: 0 auto;
                background: white;
                color: black;
                font-family: 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif;
                font-size: 11pt;
                line-height: 1.5;
                position: relative;
            }
            
            /* === タイトル === */
            .print-preview-a4 .paper-title {
                text-align: center;
                font-size: 18pt;
                font-weight: bold;
                letter-spacing: 2pt;
                margin-bottom: 8mm;
            }
            
            /* === メインテーブル === */
            .print-preview-a4 .paper-table {
                width: 100%;
                border-collapse: collapse;
                border: 1px solid #000;
            }
            
            .print-preview-a4 .paper-table th,
            .print-preview-a4 .paper-table td {
                border: 1px solid #000;
                padding: 2mm 3mm;
                vertical-align: middle;
                font-size: 10.5pt;
            }
            
            .print-preview-a4 .paper-table th {
                background: #f0f0f0;
                font-weight: bold;
                text-align: center;
                width: 25mm;
            }
            
            .print-preview-a4 .paper-table td {
                text-align: left;
            }
            
            /* === 商品テーブル === */
            .print-preview-a4 .product-table {
                width: 100%;
                border-collapse: collapse;
            }
            
            .print-preview-a4 .product-table th,
            .print-preview-a4 .product-table td {
                border: 1px solid #000;
                padding: 1.5mm 2mm;
                font-size: 10pt;
            }
            
            .print-preview-a4 .product-table th {
                background: #f5f5f5;
                font-weight: bold;
                text-align: center;
            }
            
            .print-preview-a4 .product-table td {
                text-align: center;
            }
            
            .print-preview-a4 .product-table td:first-child {
                text-align: left;
            }
            
            .print-preview-a4 .product-table td:last-child {
                text-align: right;
            }
            
            /* === 合計エリア === */
            .print-preview-a4 .total-cell {
                text-align: right !important;
                font-weight: bold;
                font-size: 10.5pt;
                padding: 2mm !important;
                vertical-align: top !important;
                width: 50mm;
            }
            
            .print-preview-a4 .total-details {
                text-align: right;
            }
            
            .print-preview-a4 .total-detail-item {
                font-size: 9pt;
                line-height: 1.4;
                white-space: nowrap;
            }
            
            .print-preview-a4 .total-detail-item.total-main {
                font-size: 12pt;
                font-weight: bold;
                border-top: 1px solid #000;
                padding-top: 1mm;
                margin-top: 1mm;
            }
            
            /* === チェックボックス === */
            .print-preview-a4 .check-group {
                display: inline;
            }
            
            .print-preview-a4 .check-item {
                display: inline-block;
                margin-right: 4mm;
                font-size: 10.5pt;
            }
            
            .print-preview-a4 .check-box {
                display: inline-block;
                width: 4mm;
                height: 4mm;
                border: 1px solid #000;
                text-align: center;
                line-height: 4mm;
                font-size: 9pt;
                margin-right: 1mm;
                vertical-align: middle;
            }
            
            /* === 店舗情報 === */
            .print-preview-a4 .store-info {
                text-align: right;
                font-size: 11pt;
                line-height: 1.6;
                margin-top: 5mm;
                padding-right: 5mm;
            }
        </style>
    `;

    printContent.innerHTML = `
        ${printStyles}
        <div class="print-preview-a4">
            ${printHtml}
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
            font-size: 11pt;
            line-height: 1.5;
            position: relative;
        }
        
        /* === タイトル === */
        .paper-title {
            text-align: center;
            font-size: 18pt;
            font-weight: bold;
            letter-spacing: 2pt;
            margin-bottom: 8mm;
        }
        
        /* === メインテーブル === */
        .paper-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #000;
        }
        
        .paper-table th,
        .paper-table td {
            border: 1px solid #000;
            padding: 2mm 3mm;
            vertical-align: middle;
            font-size: 10.5pt;
        }
        
        .paper-table th {
            background: #f0f0f0;
            font-weight: bold;
            text-align: center;
            width: 25mm;
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
            border: 1px solid #000;
            padding: 1.5mm 2mm;
            font-size: 10pt;
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
        /* === 合計エリア === */
        .total-cell {
            text-align: right !important;
            font-weight: bold;
            font-size: 10.5pt;
            padding: 2mm !important;
            vertical-align: top !important;
            width: 50mm;
        }
        
        .total-details {
            text-align: right;
        }
        
        .total-detail-item {
            font-size: 9pt;
            line-height: 1.4;
            white-space: nowrap;
        }
        
        .total-detail-item.total-main {
            font-size: 12pt;
            font-weight: bold;
            border-top: 1px solid #000;
            padding-top: 1mm;
            margin-top: 1mm;
        }
        
        /* === チェックボックス風 === */
        .check-group {
            display: inline;
        }
        
        .check-item {
            display: inline-block;
            margin-right: 4mm;
            font-size: 10.5pt;
        }
        
        .check-box {
            display: inline-block;
            width: 4mm;
            height: 4mm;
            border: 1px solid #000;
            text-align: center;
            line-height: 4mm;
            font-size: 9pt;
            margin-right: 1mm;
            vertical-align: middle;
        }
        
        /* === 店舗情報（表の下に相対配置） === */
        .store-info {
            text-align: right;
            font-size: 11pt;
            line-height: 1.6;
            margin-top: 5mm;
            padding-right: 5mm;
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
                position: relative;
                margin-top: 10mm;
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
    // 画面表示用も印刷用（紙、Tableレイアウト）に統一する
    return generatePrintHtmlForPaper(order);
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
            const priceDisplay = `¥${(p.price || 0).toLocaleString()}<br><span style="font-size: 0.85em;">(${taxLabel}${taxRateLabel})</span>`;
            const subtotal = p.subtotal || (p.quantity || 0) * (p.price || 0);
            return `<tr><td>${escapeHtml(p.name || '')}</td><td>${p.quantity || 0}</td><td>${priceDisplay}</td><td>¥${subtotal.toLocaleString()}</td></tr>`;
        }).join('')
        : '<tr><td colspan="4">（商品なし）</td></tr>';

    // チェックボックス生成ヘルパー
    const checkbox = (checked) => `<span class="check-box">${checked ? '✓' : ''}</span>`;

    // 代金オプション（未収を削除）
    const paymentType = order.paymentType || order.paymentMethod || '';
    const paymentOptions = ['代スミ', '売掛', '代引'];
    const paymentChecks = paymentOptions.map(m =>
        `<span class="check-item">${checkbox(paymentType === m)}${m}</span>`
    ).join('');

    // 部門チェック（食品を追加、日配と酒の間）
    const deptList = ['青果', '精肉', '鮮魚', '惣菜', '日配', '食品', '酒', '菓子', '雑貨'];
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


    // 埋め込みスタイル（外部CSSに依存せず確実に反映させる）
    const styleBlock = `
        <style>
            @media print {
                @page { size: A4; margin: 0; }
                body { margin: 0; width: 100%; height: 100%; -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
                .app-container, .nav-tabs, .modal-header, .modal-actions { display: none !important; }
            }
            .paper {
                width: 210mm;
                min-height: 297mm;
                margin: 0 auto;
                padding: 15mm; /* 余白確保 */
                background: white;
                box-sizing: border-box;
                font-family: sans-serif;
                position: relative;
            }
            .paper-title { font-size: 24px; font-weight: bold; text-align: center; margin-bottom: 20px; letter-spacing: 2px; }
            .paper-table { width: 100%; border-collapse: collapse; table-layout: fixed; border: 2px solid #000; margin-bottom: 20px; }
            .paper-table th, .paper-table td { border: 1px solid #000; padding: 6px; font-size: 11pt; vertical-align: middle; word-break: break-all; }
            .paper-table th { background-color: #f0f0f0; text-align: center; font-weight: bold; }
            /* 商品テーブル */
            .product-table { width: 100%; border-collapse: collapse; table-layout: fixed; border: none; margin: -1px; width: calc(100% + 2px); }
            .product-table th, .product-table td { border: 1px solid #000; padding: 4px; font-size: 10pt; }
            .product-table th { background-color: transparent; }
            /* 合計 */
            .total-main { font-size: 16pt; font-weight: bold; border-top: 2px solid #000; border-bottom: 2px solid #000; margin: 5px 0; padding: 5px 0; }
            .total-details { text-align: right; font-size: 10pt; line-height: 1.4; }
            /* チェックボックス */
            .check-box { display: inline-block; width: 14px; height: 14px; border: 1px solid #000; text-align: center; line-height: 12px; font-size: 12px; margin-right: 2px; }
            .check-item { margin-right: 12px; display: inline-block; }
        </style>
    `;

    return styleBlock + `
<div class="paper">
    <h1 class="paper-title">ご注文承り書（お客様控え）</h1>
    
    <table class="paper-table" style="table-layout: fixed; width: 100%;">
        <colgroup>
            <col style="width: 15%;">
            <col style="width: auto;">
            <col style="width: 13%;">
            <col style="width: 13%;">
            <col style="width: 35mm;">
            <col style="width: 35mm;">
        </colgroup>
        <tr>
            <th>受付日</th>
            <td>${formatDate(order.receptionDate)}</td>
            <td style="text-align: center;">${checkbox(order.receptionMethod === '来店')}来店</td>
            <td style="text-align: center;">${checkbox(order.receptionMethod === '電話')}電話</td>
            <th style="font-size: 0.85em;">受注者</th>
            <td style="font-size: 0.85em;">${escapeHtml(order.staffName || '')}</td>
        </tr>
        <tr style="font-weight: bold;">
            <th style="background: #f0f0f0;">お受け取り日時</th>
            <td colspan="3" style="background: #fffde7; font-size: 1.2em; line-height: 1.2;">${order.orderDatetime ? formatDateTime(order.orderDatetime) : ''}</td>
            <td style="text-align: center; font-size: 1.2em !important;">${checkbox(order.deliveryMethod === '配達')}配達</td>
            <td style="text-align: center; font-size: 1.2em !important;">${checkbox(order.deliveryMethod === '店頭')}店頭</td>
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
            <td colspan="5" style="padding: 0; vertical-align: top;">
                <div style="display: flex; width: 100%;">
                    <div style="flex: 1; border-right: 1px solid #000;">
                        <table class="product-table">
                            <thead>
                                <tr><th style="width: 50%;">商品名</th><th style="width: 10%;">個数</th><th style="width: 25%;">単価</th><th style="width: 15%;">合計金額</th></tr>
                            </thead>
                            <tbody>
                                ${productsRows}
                            </tbody>
                        </table>
                    </div>
                    <div class="total-cell" style="width: 55mm; flex: none;">
                        <div class="total-details">${totalDetailsHtml}</div>
                    </div>
                </div>
            </td>
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

    // お客様一覧のイベントハンドラ設定
    setupCustomerEvents();
});

// ===== お客様一覧機能 =====
const customersList = document.getElementById('customers-list');
const customerSearchInput = document.getElementById('customer-search-input');
const addCustomerBtn = document.getElementById('add-customer-btn');

function setupCustomerEvents() {
    if (customerSearchInput) {
        customerSearchInput.addEventListener('input', renderCustomersList);
    }
    if (addCustomerBtn) {
        addCustomerBtn.addEventListener('click', showAddCustomerModal);
    }
    // ソートセレクトボックスのイベントリスナー
    const sortType = document.getElementById('customer-sort-type');
    const sortOrder = document.getElementById('customer-sort-order');
    if (sortType) {
        sortType.addEventListener('change', renderCustomersList);
    }
    if (sortOrder) {
        sortOrder.addEventListener('change', renderCustomersList);
    }
}

function renderCustomersList() {
    if (!customersList) return;

    // 注文データからお客様情報を抽出（重複排除）
    const orders = getOrders();
    const customerMap = new Map();

    orders.forEach(order => {
        const name = order.customerName || '';
        if (name && !customerMap.has(name)) {
            customerMap.set(name, {
                name: name,
                phone: order.phoneNumber || '',
                address: order.deliveryAddress || '',
                lastOrderDate: order.createdAt
            });
        }
    });

    let customers = Array.from(customerMap.values());
    const searchTerm = customerSearchInput ? customerSearchInput.value.toLowerCase() : '';

    // 検索フィルター
    let filtered = customers.filter(c => {
        const name = (c.name || '').toLowerCase();
        return name.includes(searchTerm);
    });

    // ソート処理
    const sortType = document.getElementById('customer-sort-type')?.value || 'name';
    const sortOrder = document.getElementById('customer-sort-order')?.value || 'asc';

    filtered.sort((a, b) => {
        let comparison = 0;
        if (sortType === 'name') {
            // 五十音順（localeCompare使用）
            comparison = (a.name || '').localeCompare(b.name || '', 'ja');
        } else {
            // 登録順（日付順）
            comparison = new Date(a.lastOrderDate) - new Date(b.lastOrderDate);
        }
        return sortOrder === 'asc' ? comparison : -comparison;
    });

    if (filtered.length === 0) {
        customersList.innerHTML = `
            <div class="empty-list">
                <div class="empty-list-icon">👥</div>
                <p>${searchTerm ? '該当するお客様が見つかりません' : '注文履歴がありません'}</p>
            </div>
        `;
        return;
    }

    customersList.innerHTML = filtered.map(customer => `
        <div class="order-card">
            <div class="order-card-header">
                <div class="order-card-title">${escapeHtml(customer.name || '名前なし')}</div>
                <div class="order-card-date">最終注文: ${formatDate(customer.lastOrderDate)}</div>
            </div>
            <div class="order-card-body">
                <div class="order-card-info">📞 ${escapeHtml(customer.phone || '未登録')}</div>
                <div class="order-card-info">📍 ${escapeHtml(customer.address || '未登録')}</div>
            </div>
            <div class="order-card-actions">
                <button class="btn btn-primary" onclick="useCustomerForOrderByName('${escapeHtml(customer.name)}')">注文に使用</button>
            </div>
        </div>
    `).join('');
}

function showAddCustomerModal() {
    const name = prompt('お客様氏名を入力してください：');
    if (!name) return;

    const phone = prompt('電話番号を入力してください（任意）：') || '';
    const address = prompt('住所を入力してください（任意）：') || '';

    addCustomer({
        name: name,
        phone: phone,
        address: address
    });

    renderCustomersList();
    alert('お客様を登録しました。');
}

function editCustomer(id) {
    const customers = getCustomers();
    const customer = customers.find(c => c.id === id);
    if (!customer) return;

    const name = prompt('お客様氏名を入力してください：', customer.name);
    if (name === null) return; // キャンセル

    const phone = prompt('電話番号を入力してください：', customer.phone || '');
    const address = prompt('住所を入力してください：', customer.address || '');

    updateCustomer(id, {
        name: name || customer.name,
        phone: phone,
        address: address
    });

    renderCustomersList();
    alert('お客様情報を更新しました。');
}

function handleDeleteCustomer(id) {
    const customers = getCustomers();
    const customer = customers.find(c => c.id === id);
    if (!customer) return;

    if (confirm(`「${customer.name}」さんを削除しますか？\nこの操作は取り消せません。`)) {
        deleteCustomer(id);
        renderCustomersList();
    }
}

function useCustomerForOrder(id) {
    const customers = getCustomers();
    const customer = customers.find(c => c.id === id);
    if (!customer) return;

    // 新規入力タブに切り替え
    navTabs.forEach(t => t.classList.remove('active'));
    document.querySelector('[data-tab="input"]').classList.add('active');
    tabContents.forEach(content => content.classList.remove('active'));
    document.getElementById('input-tab').classList.add('active');

    // お客様情報をフォームに入力
    const customerNameInput = document.getElementById('customer-name');
    const phoneInput = document.getElementById('phone-number');
    const addressInput = document.getElementById('delivery-address');

    if (customerNameInput) customerNameInput.value = customer.name || '';
    if (phoneInput) phoneInput.value = customer.phone || '';
    if (addressInput) addressInput.value = customer.address || '';

    alert('お客様情報を注文フォームに入力しました。');
}

// 名前でお客様情報を検索してフォームに入力
function useCustomerForOrderByName(name) {
    // 注文データから該当お客様の最新情報を取得
    const orders = getOrders();
    const customerOrder = orders.find(o => o.customerName === name);
    if (!customerOrder) return;

    // 新規入力タブに切り替え
    navTabs.forEach(t => t.classList.remove('active'));
    document.querySelector('[data-tab="input"]').classList.add('active');
    tabContents.forEach(content => content.classList.remove('active'));
    document.getElementById('input-tab').classList.add('active');

    // お客様情報をフォームに入力
    const customerNameInput = document.getElementById('customer-name');
    const phoneInput = document.getElementById('phone-number');
    const addressInput = document.getElementById('delivery-address');

    if (customerNameInput) customerNameInput.value = customerOrder.customerName || '';
    if (phoneInput) phoneInput.value = customerOrder.phoneNumber || '';
    if (addressInput) addressInput.value = customerOrder.deliveryAddress || '';

    alert('お客様情報を注文フォームに入力しました。');
}
