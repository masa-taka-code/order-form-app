// ===== Order Form App =====
const STORAGE_KEY = 'orderFormAppData';

// localStorageへの保存。容量超過などで失敗した場合は、
// 保存できなかったことをユーザーに伝えたうえで呼び出し元に例外を投げ直す
// （黙って失敗すると、保存できたと誤解したまま作業が進むため）。
function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        const isQuotaError = error instanceof DOMException &&
            (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED');
        alert(isQuotaError
            ? '保存できませんでした。ブラウザの保存容量が上限に達しています。\n不要な注文データを削除するか、設定画面のQRコード画像を小さいものに差し替えてください。'
            : `保存できませんでした：${error.message}`);
        throw error;
    }
}

function getOrders() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveOrders(orders) {
    saveToStorage(STORAGE_KEY, orders);
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

// ===== 店舗情報設定 =====
const SETTINGS_KEY = 'orderFormAppSettings';
const DEFAULT_STORE_NAME = 'スーパーマーケット玉木屋';
const DEFAULT_STORE_PHONE = '0193-63-2711';

function getSettings() {
    const data = localStorage.getItem(SETTINGS_KEY);
    const settings = data ? JSON.parse(data) : {};
    return {
        storeName: settings.storeName || DEFAULT_STORE_NAME,
        storePhone: settings.storePhone || DEFAULT_STORE_PHONE,
        instagramQrImage: settings.instagramQrImage || ''
    };
}

function saveSettings(settings) {
    saveToStorage(SETTINGS_KEY, settings);
}

// ===== お客様データ管理 =====
const CUSTOMER_STORAGE_KEY = 'customerListData';

function getCustomers() {
    const data = localStorage.getItem(CUSTOMER_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveCustomers(customers) {
    saveToStorage(CUSTOMER_STORAGE_KEY, customers);
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
const filterPrint = document.getElementById('filter-print');
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
        // 編集中に入力タブ以外へ移動した場合は編集をやめる（未保存の編集内容は破棄）
        if (editingOrderId && tabName !== 'input') cancelEditMode();
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
            <option value="8" selected>8%</option>
        </select>
        <span class="product-subtotal">¥0</span>
        <button type="button" class="remove-product-btn">×</button>
    `;
    const updateRowSubtotal = () => {
        const quantity = parseInt(row.querySelector('.product-quantity').value) || 0;
        const price = parseInt(row.querySelector('.product-price').value) || 0;
        const taxType = row.querySelector('.product-tax-type').value;

        // 税額は税率ごとに合計欄で一括して端数処理するため、
        // 行の小計は税を加算しない金額（印刷物の「合計金額」列と同じ）を表示する。
        // 行ごとに切り捨てると、合算方式で計算する合計と1円ずれるため。
        const subtotal = quantity * price;
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

// 端末のローカル日付をYYYY-MM-DDで返す（toISOStringはUTC基準で日本の午前9時前に前日になるため）
function getLocalDateString(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function initForm() {
    document.getElementById('reception-date').value = getLocalDateString();
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

// 編集中バナー（入力フォームの上に表示）
const editBanner = document.createElement('div');
editBanner.className = 'edit-banner';
editBanner.hidden = true;
const editBannerText = document.createElement('span');
editBannerText.className = 'edit-banner-text';
const editBannerCancelBtn = document.createElement('button');
editBannerCancelBtn.type = 'button';
editBannerCancelBtn.className = 'btn btn-secondary edit-banner-btn';
editBannerCancelBtn.textContent = '編集をやめる';
editBanner.appendChild(editBannerText);
editBanner.appendChild(editBannerCancelBtn);
orderForm.parentNode.insertBefore(editBanner, orderForm);
editBannerCancelBtn.addEventListener('click', () => cancelEditMode());

function showEditBanner(customerName) {
    editBannerText.textContent = `✏️ 編集中：${customerName || ''} の注文`;
    editBanner.hidden = false;
}

function hideEditBanner() {
    editBanner.hidden = true;
    editBannerText.textContent = '';
}

// 編集モードを解除してフォームを新規入力の状態に戻す
function cancelEditMode() {
    editingOrderId = null;
    orderForm.reset();
    initForm();
    hideEditBanner();
}

orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = getFormData();
    if (!data.customerName) { alert('お客様氏名を入力してください'); return; }
    if (data.products.length === 0 || !data.products.some(p => p.name)) { alert('商品を1つ以上入力してください'); return; }

    if (editingOrderId) {
        // 編集モード：既存の注文を更新
        const stored = getOrders().find(o => o.id === editingOrderId);
        const update = { ...data };
        let message = '注文を更新しました！';
        if (stored && stored.isPrinted) {
            // 印刷物の内容が変わっていたら「未印刷」に戻す（印刷済みの紙と内容がずれるため）。
            // 保存データの項目同士を比べると、古い形式で保存された注文で
            // 何も変えていなくても「変更あり」と誤判定するため、印刷物そのものを比べる
            const updated = { ...stored, ...update };
            const printedPaper = o => generateCustomerCopyHtml(o) + generatePrintHtmlForPaper(o) + generatePrintHtmlForPaper(o, '部門控え');
            const changed = printedPaper(stored) !== printedPaper(updated);
            if (changed) {
                update.isPrinted = false;
                message = '注文を更新しました！\n内容が変わったため「未印刷」に戻しました。再印刷してください。';
            }
        }
        updateOrder(editingOrderId, update);
        alert(message);
        editingOrderId = null;
        hideEditBanner();
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
        cancelEditMode();
    }
});

function renderOrdersList() {
    const orders = getOrders();
    const searchTerm = searchInput.value.toLowerCase();
    const statusFilter = filterStatus.value;
    const printFilter = filterPrint.value;
    let filtered = orders;
    if (searchTerm) filtered = filtered.filter(o => o.customerName?.toLowerCase().includes(searchTerm) || o.phoneNumber?.includes(searchTerm));
    if (statusFilter !== 'all') filtered = filtered.filter(o => o.status === statusFilter);
    if (printFilter === 'printed') filtered = filtered.filter(o => o.isPrinted);
    if (printFilter === 'unprinted') filtered = filtered.filter(o => !o.isPrinted);

    if (filtered.length === 0) {
        ordersList.innerHTML = `<div class="empty-list"><div class="empty-list-icon">📋</div><p>注文データがありません</p></div>`;
        return;
    }

    ordersList.innerHTML = filtered.map(order => `
        <div class="order-card ${order.status === '処理済み' ? 'processed' : ''}" data-id="${escapeHtml(String(order.id))}">
            <div class="order-card-header">
                <div><div class="order-card-title">${escapeHtml(order.customerName)}</div><div class="order-card-date">${formatDate(order.receptionDate)}</div></div>
                <span class="order-card-status ${order.status === '処理済み' ? 'completed' : 'pending'}">${escapeHtml(order.status)}</span>
            </div>
            <div class="order-card-body">
                <div class="order-card-info">${order.isPrinted ? '🖨️ 印刷済み' : '📄 未印刷'}</div>
                <div class="order-card-info">📞 ${escapeHtml(order.phoneNumber || '未登録')}</div>
                <div class="order-card-info">🚚 ${escapeHtml(order.deliveryMethod || '未設定')}</div>
                <div class="order-card-amount">合計: ¥${(order.totalAmount || 0).toLocaleString()}</div>
            </div>
            <div class="order-card-actions">
                <button class="btn btn-secondary view-btn" data-id="${escapeHtml(String(order.id))}">詳細</button>
                <button class="btn btn-secondary edit-btn" data-id="${escapeHtml(String(order.id))}">編集</button>
                <button class="btn btn-secondary print-preview-btn" data-id="${escapeHtml(String(order.id))}">印刷</button>
                <button class="btn btn-primary toggle-status-btn" data-id="${escapeHtml(String(order.id))}">${order.status === '処理済み' ? '未処理に戻す' : '処理済みにする'}</button>
                <button class="btn btn-danger delete-btn" data-id="${escapeHtml(String(order.id))}">削除</button>
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
            <div class="summary-item" data-id="${escapeHtml(String(order.id))}">
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
filterPrint.addEventListener('change', renderOrdersList);

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
        <div class="detail-section"><h3>受付情報</h3><p>受付日: ${formatDate(order.receptionDate)}</p><p>お受け取り日時: ${order.orderDatetime ? formatDateTime(order.orderDatetime) : '未設定'}</p><p>受付方法: ${escapeHtml(order.receptionMethod || '未設定')}</p><p>受注者: ${escapeHtml(order.staffName || '未登録')}</p><p>受け取り方法: ${escapeHtml(order.deliveryMethod || '未設定')}</p></div>
        <div class="detail-section"><h3>お客様情報</h3><p>氏名: ${escapeHtml(order.customerName || '')}</p><p>電話番号: ${escapeHtml(order.phoneNumber || '未登録')}</p><p>配達先: ${escapeHtml(order.deliveryAddress || '未登録')}</p></div>
        <div class="detail-section"><h3>注文商品</h3><div class="detail-products">${(order.products || []).map(p => { const q = p.quantity || 0; const pr = p.price || 0; return `<div class="detail-product-item"><span>${escapeHtml(p.name || '')}${p.taxType ? `（${escapeHtml(p.taxType)}${p.taxRate ? p.taxRate + '%' : ''}）` : ''}</span><span>${q}個 × ¥${pr.toLocaleString()} = ¥${(q * pr).toLocaleString()}</span></div>`; }).join('')}<div class="detail-product-item" style="font-weight: bold; border-top: 2px solid var(--border-color);"><span>合計</span><span>¥${(order.totalAmount || 0).toLocaleString()}</span></div></div></div>
        <div class="detail-section"><h3>備考</h3><p>${escapeHtml(order.notes || 'なし')}</p></div>
        <div class="detail-section"><h3>支払い・その他</h3><p>代金: ${escapeHtml(order.paymentType || order.paymentMethod || '未選択')}</p><p>納品請求書: ${order.invoiceRequired ? '要' : '不要'}</p><p>請求先: ${escapeHtml(order.billingName || '未登録')}</p><p>部門: ${(order.departments || []).length > 0 ? escapeHtml(order.departments.join(', ')) : '未選択'}</p></div>
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

        // 編集モードに設定
        editingOrderId = id;

        // 入力タブに切り替え
        navTabs.forEach(t => t.classList.remove('active'));
        document.querySelector('[data-tab="input"]').classList.add('active');
        tabContents.forEach(c => c.classList.remove('active'));
        document.getElementById('input-tab').classList.add('active');

        // 前回の入力値が残らないよう、フォームを初期状態に戻してから読み込む
        orderForm.reset();
        document.getElementById('order-date').value = '';
        showEditBanner(order.customerName);

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
                if (orderMinuteEl) orderMinuteEl.value = timeParts[1];
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

    // お客様控え・店舗控え・部門控えを生成
    const customerCopyHtml = generateCustomerCopyHtml(order);
    const storeCopyHtml = generatePrintHtmlForPaper(order);
    const departmentCopyHtml = generatePrintHtmlForPaper(order, '部門控え');

    // プレビュー用スタイル
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

            /* === ページ区切り（プレビュー用） === */
            .print-preview-a4 .preview-page-divider {
                border: none;
                border-top: 3px dashed #ccc;
                margin: 10mm 0;
            }

            .print-preview-a4 .preview-page-label {
                text-align: center;
                color: #999;
                font-size: 10pt;
                margin: 5mm 0;
            }
        </style>
    `;

    printContent.innerHTML = `
        ${printStyles}
        <div class="print-preview-a4">
            <p class="preview-page-label">【1ページ目：お客様控え】</p>
            ${customerCopyHtml}
            <hr class="preview-page-divider">
            <p class="preview-page-label">【2ページ目：店舗控え】</p>
            ${storeCopyHtml}
            <hr class="preview-page-divider">
            <p class="preview-page-label">【3ページ目：部門控え】</p>
            ${departmentCopyHtml}
        </div>
    `;
    printModal.classList.add('active');
}

// 注文データを受け取って直接印刷を実行（お客様控え＋店舗控え＋部門控えの3ページ一括）
// iPad Safari対策：新規ウィンドウを使わず、現在のページ内の #print-area を印刷する。
// window.print() はクリック操作と同じ呼び出しスタック内で同期的に呼ぶ。
// onAfterPrint: 印刷ダイアログ終了後（afterprint）に呼ばれるコールバック（任意）
function executePrintForOrder(order, onAfterPrint) {
    const customerCopyHtml = generateCustomerCopyHtml(order);
    const storeCopyHtml = generatePrintHtmlForPaper(order);
    const departmentCopyHtml = generatePrintHtmlForPaper(order, '部門控え');

    // 既存の印刷領域があれば削除
    const oldArea = document.getElementById('print-area');
    if (oldArea) oldArea.remove();

    // 印刷専用CSS（画面表示に影響しないよう全て @media print 内に限定）
    const printCss = `
        /* 画面上では印刷領域を非表示 */
        #print-area { display: none; }

        @media print {
            /* 印刷領域以外を非表示 */
            body > *:not(#print-area) { display: none !important; }
            #print-area { display: block !important; }


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

        /* === 改ページ用 === */
        .page-break {
            page-break-after: always;
            break-after: page;
        }
        
        /* === 印刷時のスタイル === */
        @media print {
            html, body {
                width: 210mm;
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

        }
    `;

    // 印刷時の最終オーバーライド。各控えのHTML内の <style>（@page margin:0 など）より
    // 後ろに置かないと負けるため、必ず本文の後に挿入する
    const printOverrideCss = `
        @media print {
            .paper {
                min-height: auto !important;
                padding: 0 !important;
                margin: 0 !important;
                width: 100% !important;
            }
            /* style.css の .total-details { padding: 5px } が混入しないよう打ち消す */
            #print-area .total-details {
                padding: 0;
            }
            @page {
                size: A4 portrait;
                margin: 15mm;
            }
        }
    `;

    // 印刷領域を作成（3ページ：お客様控え→店舗控え→部門控え）
    const printArea = document.createElement('div');
    printArea.id = 'print-area';
    printArea.innerHTML = `<style>${printCss}</style>
    <!-- 1ページ目：お客様控え -->
    <div class="page-break">
        ${customerCopyHtml}
    </div>
    <!-- 2ページ目：店舗控え -->
    <div class="page-break">
        ${storeCopyHtml}
    </div>
    <!-- 3ページ目：部門控え -->
    <div>
        ${departmentCopyHtml}
    </div>
    <style>${printOverrideCss}</style>`;
    document.body.appendChild(printArea);

    // 印刷後に印刷領域を削除（一度だけ実行）
    const handleAfterPrint = () => {
        window.removeEventListener('afterprint', handleAfterPrint);
        const area = document.getElementById('print-area');
        if (area) area.remove();
        if (typeof onAfterPrint === 'function') onAfterPrint();
    };
    window.addEventListener('afterprint', handleAfterPrint);

    // ユーザー操作と同じ呼び出しスタック内で同期的に印刷
    window.print();
}

// 印刷専用HTML生成（table構造で印刷に強いレイアウト）
function generatePrintHtmlForPaper(order, titleLabel = '店舗控え') {
    const products = order.products || [];
    const departments = order.departments || [];
    const settings = getSettings();

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
            .product-table th, .product-table td:nth-child(2), .product-table td:nth-child(3), .product-table td:nth-child(4) { white-space: nowrap; }
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
    <h1 class="paper-title">ご注文承り書（${titleLabel}）</h1>
    
    <table class="paper-table" style="table-layout: fixed; width: 100%;">
        <colgroup>
            <col style="width: 14.5%;">
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
            <th style="background: #f0f0f0;">お受け取り<br>日時</th>
            <td colspan="3" style="background: #fffde7; font-size: 1.2em; line-height: 1.2;">${order.orderDatetime ? formatDateTime(order.orderDatetime) : ''}</td>
            <td style="text-align: center; font-size: 1.2em !important;">${checkbox(order.deliveryMethod === '配達')}配達</td>
            <td style="text-align: center; font-size: 1.2em !important;">${checkbox(order.deliveryMethod === '店頭')}店頭</td>
        </tr>

        <tr>
            <th>お客様氏名</th>
            <td colspan="5" style="font-size: 1.1em;">${escapeHtml(order.customerName || '')}</td>
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
                                <tr><th style="width: 34%;">商品名</th><th style="width: 13%;">個数</th><th style="width: 25%;">単価</th><th style="width: 28%;">合計金額</th></tr>
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
        <div>${escapeHtml(settings.storeName)}</div>
        <div>${escapeHtml(settings.storePhone)}</div>
    </div>
</div>
    `;
}

// お客様控え用HTML生成（代金・納品請求書・請求先・部門を省略）
function generateCustomerCopyHtml(order) {
    const products = order.products || [];
    const settings = getSettings();

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

    // スタイルブロックはgeneratePrintHtmlForPaperと同じものを使用
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
                padding: 15mm;
                background: white;
                box-sizing: border-box;
                font-family: sans-serif;
                position: relative;
            }
            .paper-title { font-size: 24px; font-weight: bold; text-align: center; margin-bottom: 20px; letter-spacing: 2px; }
            .paper-table { width: 100%; border-collapse: collapse; table-layout: fixed; border: 2px solid #000; margin-bottom: 20px; }
            .paper-table th, .paper-table td { border: 1px solid #000; padding: 6px; font-size: 11pt; vertical-align: middle; word-break: break-all; }
            .paper-table th { background-color: #f0f0f0; text-align: center; font-weight: bold; }
            .product-table { width: 100%; border-collapse: collapse; table-layout: fixed; border: none; margin: -1px; width: calc(100% + 2px); }
            .product-table th, .product-table td { border: 1px solid #000; padding: 4px; font-size: 10pt; }
            .product-table th { background-color: transparent; }
            .product-table th, .product-table td:nth-child(2), .product-table td:nth-child(3), .product-table td:nth-child(4) { white-space: nowrap; }
            .total-main { font-size: 16pt; font-weight: bold; border-top: 2px solid #000; border-bottom: 2px solid #000; margin: 5px 0; padding: 5px 0; }
            .total-details { text-align: right; font-size: 10pt; line-height: 1.4; }
            .check-box { display: inline-block; width: 14px; height: 14px; border: 1px solid #000; text-align: center; line-height: 12px; font-size: 12px; margin-right: 2px; }
            .check-item { margin-right: 12px; display: inline-block; }
        </style>
    `;

    return styleBlock + `
<div class="paper">
    <h1 class="paper-title">ご注文承り書（お客様控え）</h1>
    
    <table class="paper-table" style="table-layout: fixed; width: 100%;">
        <colgroup>
            <col style="width: 14.5%;">
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
            <th style="background: #f0f0f0;">お受け取り<br>日時</th>
            <td colspan="3" style="background: #fffde7; font-size: 1.2em; line-height: 1.2;">${order.orderDatetime ? formatDateTime(order.orderDatetime) : ''}</td>
            <td style="text-align: center; font-size: 1.2em !important;">${checkbox(order.deliveryMethod === '配達')}配達</td>
            <td style="text-align: center; font-size: 1.2em !important;">${checkbox(order.deliveryMethod === '店頭')}店頭</td>
        </tr>

        <tr>
            <th>お客様氏名</th>
            <td colspan="5" style="font-size: 1.1em;">${escapeHtml(order.customerName || '')}</td>
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
                                <tr><th style="width: 34%;">商品名</th><th style="width: 13%;">個数</th><th style="width: 25%;">単価</th><th style="width: 28%;">合計金額</th></tr>
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
    </table>

    <div class="store-info">
        <div>${escapeHtml(settings.storeName)}</div>
        <div>${escapeHtml(settings.storePhone)}</div>
        ${settings.instagramQrImage ? `<img src="${settings.instagramQrImage}" alt="Instagram QRコード" style="width:47.52mm; height:47.52mm; margin:2mm 0 0 auto; background:#fff; display:block; box-sizing:content-box; image-rendering:pixelated;">` : ''}
    </div>
</div>
    `;
}

// PDFダウンロード（印刷ダイアログを開いてPDF保存を促す）
document.getElementById('download-pdf-btn').addEventListener('click', () => {
    const orders = getOrders();
    const order = orders.find(o => o.id === currentOrderId);
    if (!order) return;

    // 現在のページ内で印刷（印刷ダイアログを開いてPDF保存も可能）
    // 印刷済みの記録は、印刷ダイアログが閉じた後（afterprint）に行う
    executePrintForOrder(order, () => {
        // プレビューモーダルを閉じる
        printModal.classList.remove('active');

        updateOrder(order.id, { isPrinted: true });
        renderOrdersList();
    });
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

const settingStoreNameInput = document.getElementById('setting-store-name');
const settingStorePhoneInput = document.getElementById('setting-store-phone');
const settingInstagramQrInput = document.getElementById('setting-instagram-qr');
const settingInstagramQrPreview = document.getElementById('setting-instagram-qr-preview');
const clearInstagramQrBtn = document.getElementById('clear-instagram-qr-btn');
const saveSettingsBtn = document.getElementById('save-settings-btn');

// 保存ボタンを押すまでの一時的な選択状態（undefined: 変更なし、''：削除、それ以外：新しい画像）
let pendingQrImage;

function updateQrPreview(dataUrl) {
    if (dataUrl) {
        settingInstagramQrPreview.src = dataUrl;
        settingInstagramQrPreview.style.display = '';
    } else {
        settingInstagramQrPreview.src = '';
        settingInstagramQrPreview.style.display = 'none';
    }
}

function loadSettingsForm() {
    const settings = getSettings();
    settingStoreNameInput.value = settings.storeName;
    settingStorePhoneInput.value = settings.storePhone;
    settingInstagramQrInput.value = '';
    pendingQrImage = undefined;
    updateQrPreview(settings.instagramQrImage);
}
loadSettingsForm();

settingInstagramQrInput.addEventListener('change', () => {
    const file = settingInstagramQrInput.files[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
        alert('画像サイズが大きすぎます（500KB以下にしてください）');
        settingInstagramQrInput.value = '';
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        pendingQrImage = e.target.result;
        updateQrPreview(pendingQrImage);
    };
    reader.readAsDataURL(file);
});

clearInstagramQrBtn.addEventListener('click', () => {
    pendingQrImage = '';
    settingInstagramQrInput.value = '';
    updateQrPreview('');
});

saveSettingsBtn.addEventListener('click', () => {
    const currentSettings = getSettings();
    saveSettings({
        storeName: settingStoreNameInput.value.trim() || DEFAULT_STORE_NAME,
        storePhone: settingStorePhoneInput.value.trim() || DEFAULT_STORE_PHONE,
        instagramQrImage: pendingQrImage !== undefined ? pendingQrImage : currentSettings.instagramQrImage
    });
    loadSettingsForm();
    alert('店舗情報を保存しました');
});

exportBtn.addEventListener('click', () => {
    let settings = null;
    try {
        const rawSettings = localStorage.getItem(SETTINGS_KEY);
        settings = rawSettings ? JSON.parse(rawSettings) : null;
    } catch (e) { settings = null; }
    const backup = {
        app: 'order-form-app',
        version: 2,
        exportedAt: new Date().toISOString(),
        orders: getOrders(),
        settings: settings,
        customers: getCustomers()
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `order-backup-${getLocalDateString()}.json`;
    a.click();
    alert('データをエクスポートしました');
});

importFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        const invalidMsg = 'このファイルは注文データのバックアップではありません';
        try {
            const data = JSON.parse(event.target.result);
            // 旧形式（注文の配列のみ）と新形式（オブジェクト）の両方を受け付ける
            const isNewFormat = data !== null && typeof data === 'object' && !Array.isArray(data);
            const orders = Array.isArray(data) ? data : (isNewFormat ? data.orders : null);
            const validOrders = Array.isArray(orders) && orders.every(o =>
                o !== null && typeof o === 'object' && !Array.isArray(o) &&
                (typeof o.id === 'string' || typeof o.id === 'number'));
            if (!validOrders) { alert(invalidMsg); return; }

            const hasSettings = isNewFormat && data.settings !== null && typeof data.settings === 'object' && !Array.isArray(data.settings);
            const hasCustomers = isNewFormat && Array.isArray(data.customers);
            let message = `注文${orders.length}件を読み込みます。現在の注文${getOrders().length}件は上書きされます。`;
            if (hasSettings) message += '店舗情報の設定も上書きされます。';
            message += 'よろしいですか？';
            if (!confirm(message)) return;

            saveOrders(orders);
            if (hasSettings) {
                saveToStorage(SETTINGS_KEY, data.settings);
                loadSettingsForm();
            }
            if (hasCustomers) saveCustomers(data.customers);
            alert('データをインポートしました');
            renderOrdersList();
        } catch (err) { alert('ファイルの読み込みに失敗しました'); }
    };
    reader.readAsText(file);
    e.target.value = '';
});

function escapeHtml(str) {
    if (str === null || str === undefined || str === '') return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// 日付として解釈できない値は空文字を返す。
// 印刷物に「NaN年NaN月NaN日」と出るのを防ぐため、未入力と同じ扱いにする。
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return '';
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return '';
    const date = new Date(dateTimeStr);
    if (Number.isNaN(date.getTime())) return '';
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
}

document.addEventListener('DOMContentLoaded', () => {
    // ブラウザにデータの永続保存を依頼（結果は使わない）
    try {
        if (navigator.storage && navigator.storage.persist) {
            navigator.storage.persist().catch(() => {});
        }
    } catch (e) { /* 未対応・失敗は無視 */ }
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

function setupCustomerEvents() {
    if (customerSearchInput) {
        customerSearchInput.addEventListener('input', renderCustomersList);
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
                <button class="btn btn-primary use-customer-btn" data-name="${escapeHtml(customer.name || '')}">注文に使用</button>
            </div>
        </div>
    `).join('');

    customersList.querySelectorAll('.use-customer-btn').forEach(btn =>
        btn.addEventListener('click', () => useCustomerForOrderByName(btn.dataset.name))
    );
}

// 名前でお客様情報を検索してフォームに入力
function useCustomerForOrderByName(name) {
    // 注文データから該当お客様の最新情報を取得
    const orders = getOrders();
    const customerOrder = orders.find(o => o.customerName === name);
    if (!customerOrder) return;

    // 編集中だった場合は編集をやめて、必ず新規注文として開始する
    if (editingOrderId) cancelEditMode();

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
