// ===== Order Form App =====

// アプリのバージョン（設定画面の一番下に表示。更新するたびに書き換える）
// 不具合修正: 末尾を上げる（1.1.0 → 1.1.1）／機能追加: 真ん中を上げる（1.1.0 → 1.2.0）
const APP_VERSION = '1.11.1';
const APP_UPDATED = '2026-11-28';

// シンプルな線アイコン。形は Lucide（https://lucide.dev, v0.460.0）の公式アイコンをそのまま使用。
// 外部読み込みなしでオフラインでも表示できるよう、ここに直接書き込んでいる。
// Lucide: ISC License — Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT).
// All other copyright (c) for Lucide are held by Lucide Contributors 2022.
const ICON_PATHS = {
    calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    package: '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7"/><path d="m7.5 4.27 9 5.15"/>',
    tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
    truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
    store: '<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    printer: '<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/>',
    file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
    clipboard: '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    mapPin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    arrowUp: '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',
};
function icon(name, extraClass = '') {
    return `<svg class="icon ${extraClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICON_PATHS[name]}</svg>`;
}

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
// 店舗名・電話番号はコードに書かず、設定画面で保存した値（この端末の中）だけを使う

function getSettings() {
    const data = localStorage.getItem(SETTINGS_KEY);
    const settings = data ? JSON.parse(data) : {};
    return {
        storeName: settings.storeName || '',
        storePhone: settings.storePhone || '',
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

// タブごとのスクロール位置（タブ切替時に記憶・復元する。保存データには影響しない）
const tabScrollPositions = {};

// タブ切替の共通処理
// scroll: 'restore' = そのタブで最後に見ていた位置へ / 'top' = 先頭へ
function switchTab(tabName, { scroll = 'restore' } = {}) {
    // 切替前のタブのスクロール位置を記憶
    const currentContent = Array.from(tabContents).find(c => c.classList.contains('active'));
    if (currentContent) tabScrollPositions[currentContent.id.replace(/-tab$/, '')] = getPageScrollY();

    navTabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
    tabContents.forEach(content => content.classList.toggle('active', content.id === `${tabName}-tab`));
    if (tabName === 'list') renderOrdersList();
    if (tabName === 'summary') renderSummaryList();
    if (tabName === 'customers') renderCustomersList();

    // 描画後にレイアウトが確定してからスクロールする
    const y = scroll === 'top' ? 0 : (tabScrollPositions[tabName] || 0);
    requestAnimationFrame(() => window.scrollTo(0, y));
}

// Tab switching
navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        // 編集中に入力タブ以外へ移動した場合は編集をやめる（未保存の編集内容は破棄）
        if (editingOrderId && tabName !== 'input') cancelEditMode();
        switchTab(tabName);
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
// 編集画面を開いた直後のフォーム内容（変更の有無の判定用）
let editBaselineJson = null;

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

// 編集中バナーを上部のタブ（sticky）の真下に固定するため、タブの下端位置をCSS変数に反映する
// （タブの高さは画面幅で変わるため、実測して追従させる）
let updateStickyOffsets = () => {};
(() => {
    const nav = document.querySelector('.nav-tabs');
    if (!nav) return;
    const update = () => {
        const top = parseFloat(getComputedStyle(nav).top) || 0;
        const navBottom = top + nav.offsetHeight;
        document.documentElement.style.setProperty('--nav-sticky-bottom', `${navBottom + 8}px`);
        // フォーカス／検証エラーの項目が固定ヘッダー（タブ＋編集バナー）に隠れないよう余白を確保
        const bannerH = editBanner.hidden ? 0 : editBanner.offsetHeight + 8;
        document.documentElement.style.scrollPaddingTop = `${navBottom + bannerH + 8}px`;
    };
    updateStickyOffsets = update;
    update();
    if (window.ResizeObserver) {
        const ro = new ResizeObserver(update);
        ro.observe(nav);
        ro.observe(editBanner);
    }
    window.addEventListener('resize', update);
})();

function showEditBanner(customerName) {
    editBannerText.innerHTML = `${icon('pencil')} 編集中：${escapeHtml(customerName || '')} の注文`;
    editBanner.hidden = false;
    updateStickyOffsets();
}

function hideEditBanner() {
    editBanner.hidden = true;
    editBannerText.textContent = '';
    updateStickyOffsets();
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
    if (!data.customerName) {
        alert('お客様氏名を入力してください');
        customerNameInput.scrollIntoView({ block: 'start', behavior: 'smooth' });
        customerNameInput.focus({ preventScroll: true });
        return;
    }
    if (data.products.length === 0 || !data.products.some(p => p.name)) {
        alert('商品を1つ以上入力してください');
        // 最初の商品名欄へスクロールしてフォーカス
        const el = productsContainer.querySelector('.product-name');
        if (el) {
            el.scrollIntoView({ block: 'start', behavior: 'smooth' });
            el.focus({ preventScroll: true });
        }
        return;
    }

    let savedId = null;
    if (editingOrderId) {
        // 編集モード：既存の注文を更新
        savedId = editingOrderId;
        const stored = getOrders().find(o => o.id === editingOrderId);
        const update = { ...data };
        let message = '注文を更新しました！';
        if (stored && stored.isPrinted) {
            // 編集画面で内容が変更されていたら「未印刷」に戻す（印刷済みの紙と内容がずれるため）。
            // 保存データと直接比べると、古い形式の注文はフォームに読み込んだ時点で
            // 初期値（税区分など）が補われ、何も変えていなくても「変更あり」になるため、
            // 編集画面を開いた直後のフォームの状態と比べる
            const changed = JSON.stringify(data) !== editBaselineJson;
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
        const added = addOrder(data);
        savedId = added && added.id;
        alert('注文を保存しました！');
    }
    orderForm.reset();
    initForm();
    // 保存後は「詳細」タブへ移り、保存した注文のカードを表示してハイライトする
    showSavedOrderInList(savedId);
});

// 保存した注文を「詳細」タブで見える位置に出してハイライトする（画面の状態のみ変更。保存データは触らない）
function showSavedOrderInList(id) {
    const findCard = () => id == null ? null :
        Array.from(ordersList.querySelectorAll('.order-card')).find(c => c.dataset.id === String(id));
    switchTab('list', { scroll: 'top' });
    if (!findCard()) {
        // 検索・絞り込みで隠れている場合は、画面上の絞り込みだけ解除して描画し直す
        searchInput.value = '';
        filterStatus.value = 'all';
        filterPrint.value = 'all';
        renderOrdersList();
    }
    // 新規入力タブに戻ったとき、空のフォームの先頭が見えるようにする
    tabScrollPositions.input = 0;
    requestAnimationFrame(() => requestAnimationFrame(() => {
        const card = findCard();
        if (!card) { window.scrollTo(0, 0); return; }
        const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        card.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
        card.classList.add('just-saved');
        card.setAttribute('tabindex', '-1');
        card.focus({ preventScroll: true });
        setTimeout(() => card.classList.remove('just-saved'), 4000);
    }));
}

// ブラウザ標準の検証（required）で止まった場合も、固定ヘッダーに隠れない位置へスクロール
customerNameInput.addEventListener('invalid', (e) => {
    const el = e.target;
    Promise.resolve().then(() => el.scrollIntoView({ block: 'start' }));
});

clearFormBtn.addEventListener('click', () => {
    if (confirm('入力内容をクリアしますか？')) {
        cancelEditMode();
    }
});

function renderOrdersList() {
    const orders = getOrders();
    const searchTerm = normalizeForSearch(searchInput.value);
    const phoneTerm = searchInput.value.replace(/[-\s]/g, '');
    const statusFilter = filterStatus.value;
    const printFilter = filterPrint.value;
    let filtered = orders;
    if (searchTerm) filtered = filtered.filter(o => normalizeForSearch(o.customerName).includes(searchTerm) || (phoneTerm !== '' && String(o.phoneNumber || '').replace(/[-\s]/g, '').includes(phoneTerm)));
    if (statusFilter !== 'all') filtered = filtered.filter(o => (o.status || '未処理') === statusFilter);
    if (printFilter === 'printed') filtered = filtered.filter(o => o.isPrinted);
    if (printFilter === 'unprinted') filtered = filtered.filter(o => !o.isPrinted);

    if (filtered.length === 0) {
        ordersList.innerHTML = `<div class="empty-list"><div class="empty-list-icon">${icon('clipboard')}</div><p>注文データがありません</p></div>`;
        return;
    }

    const nowForCards = new Date();
    const todayStr = getLocalDateString(nowForCards);
    const tomorrowDate = new Date(nowForCards);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowStr = getLocalDateString(tomorrowDate);

    ordersList.innerHTML = filtered.map(order => {
        const processed = order.status === '処理済み';
        const idAttr = escapeHtml(String(order.id));
        const pickup = order.orderDatetime ? new Date(order.orderDatetime) : null;
        const pickupValid = !!pickup && !isNaN(pickup.getTime());
        const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
        const pickupLine = pickupValid
            ? `<div class="order-card-pickup">${icon('calendar')} ${pickup.getMonth() + 1}/${pickup.getDate()}(${weekdays[pickup.getDay()]}) ${pickup.getHours()}:${String(pickup.getMinutes()).padStart(2, '0')} <span class="order-card-pickup-label">受け取り</span></div>`
            : `<div class="order-card-pickup order-card-pickup-unset">${icon('calendar')} 受け取り日時 未設定</div>`;

        let dueBadge = '';
        if (!processed && pickupValid) {
            const pickupDateStr = getLocalDateString(pickup);
            if (pickup < nowForCards) dueBadge = '<span class="order-card-due due-overdue">過ぎています</span>';
            else if (pickupDateStr === todayStr) dueBadge = '<span class="order-card-due due-today">今日</span>';
            else if (pickupDateStr === tomorrowStr) dueBadge = '<span class="order-card-due due-tomorrow">明日</span>';
        }

        const products = Array.isArray(order.products) ? order.products.filter(p => p && p.name) : [];
        const productsText = products.length
            ? products.map(p => `${escapeHtml(p.name)}${p.quantity ? ` ×${escapeHtml(String(p.quantity))}` : ''}`).join('、')
            : '（商品なし）';
        const depts = Array.isArray(order.departments) ? order.departments.filter(Boolean) : [];
        let deliveryLine = '';
        if (order.deliveryMethod === '配達') deliveryLine = `${icon('truck')} 配達：${escapeHtml(order.deliveryAddress || '住所未登録')}`;
        else if (order.deliveryMethod === '店頭') deliveryLine = `${icon('store')} 店頭受け取り`;
        const notes = String(order.notes || '').replace(/[\r\n]+/g, ' ').trim();
        const payment = order.paymentType || order.paymentMethod;
        let receptionShort = '未設定';
        const rm = /^(\d{4})-(\d{2})-(\d{2})/.exec(order.receptionDate || '');
        if (rm) receptionShort = `${Number(rm[2])}/${Number(rm[3])}`;

        return `
        <div class="order-card ${processed ? 'processed' : ''}" data-id="${idAttr}">
            <div class="order-card-header">
                <div class="order-card-header-main">
                    ${pickupLine}
                    <div class="order-card-nameline"><div class="order-card-title">${escapeHtml(order.customerName)}</div>${order.phoneNumber ? `<span class="order-card-phone">${icon('phone')} ${escapeHtml(order.phoneNumber)}</span>` : ''}</div>
                </div>
                <div class="order-card-badges">
                    ${dueBadge}
                    <span class="order-card-status ${processed ? 'completed' : 'pending'}">${processed ? `${icon('check')} 処理済み` : escapeHtml(order.status || '未処理')}</span>
                </div>
            </div>
            <div class="order-card-body">
                <div class="order-card-products">${icon('package')} ${productsText}</div>
                ${depts.length ? `<div class="order-card-depts">${icon('tag')} ${escapeHtml(depts.join('・'))}</div>` : ''}
                ${deliveryLine ? `<div class="order-card-info">${deliveryLine}</div>` : ''}
                ${notes ? `<div class="order-card-notes">${icon('alert', 'icon-warn')} ${escapeHtml(notes)}</div>` : ''}
                ${processed ? `<div class="order-card-info order-card-processed-at">${icon('checkCircle')} 処理日時：${(order.processedAt && formatDateTime(order.processedAt)) || '記録なし'}</div>` : ''}
            </div>
            <div class="order-card-meta">
                <span class="order-card-amount">合計 ¥${(order.totalAmount || 0).toLocaleString()}${payment ? `（${escapeHtml(payment)}）` : ''}</span>
                <span>${order.isPrinted ? `${icon('printer')} 印刷済み` : `${icon('file', 'icon-muted')} 未印刷`}</span>
                <span>受付日 ${receptionShort}</span>
            </div>
            <div class="order-card-actions">
                <button class="btn btn-secondary view-btn" data-id="${idAttr}">詳細</button>
                <button class="btn btn-secondary edit-btn" data-id="${idAttr}">編集</button>
                <button class="btn btn-secondary print-preview-btn" data-id="${idAttr}">印刷</button>
                <button class="btn btn-secondary toggle-print-btn" data-id="${idAttr}">${order.isPrinted ? '未印刷に戻す' : '印刷済みにする'}</button>
                <button class="btn btn-primary toggle-status-btn" data-id="${idAttr}">${processed ? '未処理に戻す' : '処理済みにする'}</button>
                <button class="btn btn-danger delete-btn" data-id="${idAttr}">削除</button>
            </div>
        </div>
    `;
    }).join('');

    ordersList.querySelectorAll('.view-btn').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); showOrderDetail(btn.dataset.id); }));
    ordersList.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); editOrder(btn.dataset.id); }));
    ordersList.querySelectorAll('.print-preview-btn').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); showPrintPreview(btn.dataset.id); }));
    ordersList.querySelectorAll('.toggle-print-btn').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); toggleOrderPrinted(btn.dataset.id); }));
    ordersList.querySelectorAll('.toggle-status-btn').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); toggleOrderStatus(btn.dataset.id); }));
    ordersList.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); handleDeleteOrder(btn.dataset.id); }));
    ordersList.querySelectorAll('.order-card').forEach(card => card.addEventListener('click', () => showOrderDetail(card.dataset.id)));
}

// 注文一覧（受け取り予定表）: 受け取り日ごとにグループ化して表示（表示のみ・保存データは変更しない）
function renderSummaryList() {
    const search = normalizeForSearch(summarySearchInput?.value);
    let orders = getOrders().slice();

    if (search) {
        orders = orders.filter(o => normalizeForSearch(o.customerName).includes(search));
    }

    if (orders.length === 0) {
        summaryList.innerHTML = `<div class="empty-list"><div class="empty-list-icon">${icon('clipboard')}</div><p>注文データがありません</p></div>`;
        return;
    }

    const now = new Date();
    const todayStr = getLocalDateString(now);
    const tomorrowStr = getLocalDateString(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
    const nowKey = `${todayStr}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const dtRe = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;

    const parsePickup = (o) => {
        const m = typeof o.orderDatetime === 'string' ? o.orderDatetime.match(dtRe) : null;
        if (!m) return null;
        const y = +m[1], mo = +m[2], d = +m[3], h = +m[4], mi = +m[5];
        const dt = new Date(y, mo - 1, d, h, mi);
        if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d || h > 23 || mi > 59) return null;
        return { date: `${m[1]}-${m[2]}-${m[3]}`, key: `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}`, y, mo, d, h, mi: m[5] };
    };

    const dated = [];
    const unset = [];
    orders.forEach(o => {
        const p = parsePickup(o);
        if (p) dated.push({ o, p }); else unset.push(o);
    });

    const isDone = (o) => o.status === '処理済み';
    const byTime = (a, b) => a.p.key.localeCompare(b.p.key);
    const upcoming = dated.filter(x => x.p.date >= todayStr).sort(byTime);
    const pastAll = dated.filter(x => x.p.date < todayStr).sort(byTime);
    // 受け取り日を過ぎた未処理は常時表示、処理済みのみ折りたたみ
    const overduePast = pastAll.filter(x => !isDone(x.o));
    const past = pastAll.filter(x => isDone(x.o));

    const groupByDate = (list, desc) => {
        const map = new Map();
        list.forEach(x => {
            if (!map.has(x.p.date)) map.set(x.p.date, []);
            map.get(x.p.date).push(x);
        });
        const dates = Array.from(map.keys()).sort();
        if (desc) dates.reverse();
        return dates.map(date => ({ date, items: map.get(date) }));
    };

    const countText = (items, getOrder) => {
        const u = items.filter(x => !isDone(getOrder(x))).length;
        return `${items.length}件${u > 0 ? `（未処理 ${u}）` : ''}`;
    };

    const renderRow = (o, p, stacked) => {
        const done = isDone(o);
        let time = p ? `${p.h}:${p.mi}` : '--';
        if (stacked && p) {
            const wdp = weekdays[new Date(p.y, p.mo - 1, p.d).getDay()];
            time = `<span class="summary-date">${p.mo}/${p.d}(${wdp})</span><span>${time}</span>`;
        }
        const overdue = p && !done && (stacked || (p.date === todayStr && p.key < nowKey));
        const name = o.customerName || '（名前なし）';
        const prods = Array.isArray(o.products) ? o.products.filter(Boolean) : [];
        let prodText = '（商品なし）';
        if (prods.length > 0) {
            const f = prods[0];
            const hasQty = f.quantity !== undefined && f.quantity !== null && f.quantity !== '';
            prodText = `${f.name || ''}${hasQty ? ` ×${f.quantity}` : ''}`;
            if (prods.length > 1) prodText += ` ほか${prods.length - 1}点`;
        }
        const noteMark = (typeof o.notes === 'string' ? o.notes.trim() : o.notes) ? ` <span title="備考あり" aria-label="備考あり">${icon('alert', 'icon-warn')}</span>` : '';
        let method = '';
        if (o.deliveryMethod === '店頭') method = `<span title="店頭受け取り" aria-label="店頭受け取り">${icon('store')}</span>`;
        else if (o.deliveryMethod === '配達') method = `<span title="配達" aria-label="配達">${icon('truck')}</span>`;
        const pill = done
            ? `<span class="summary-pill done">${icon('check')} 処理済み</span>`
            : '<span class="summary-pill pending">未処理</span>';
        const printIcon = o.isPrinted
            ? `<span title="印刷済み" aria-label="印刷済み">${icon('printer')}</span>`
            : `<span title="未印刷" aria-label="未印刷">${icon('file', 'icon-muted')}</span>`;
        return `
            <div class="summary-row ${done ? 'is-done' : ''}" data-id="${escapeHtml(String(o.id))}">
                <div class="summary-time">${time}</div>
                <div class="summary-name">${escapeHtml(name)}</div>
                <div class="summary-products">${escapeHtml(prodText)}${noteMark}</div>
                <div class="summary-method">${method}</div>
                <div class="summary-status">${overdue ? '<span class="summary-overdue">過ぎています</span>' : pill}${printIcon}</div>
            </div>`;
    };

    const dateHeader = (date, items) => {
        const [y, m, d] = date.split('-').map(Number);
        const wd = weekdays[new Date(y, m - 1, d).getDay()];
        let tag = '';
        if (date === todayStr) tag = ' <span class="summary-day-tag is-today">今日</span>';
        else if (date === tomorrowStr) tag = ' <span class="summary-day-tag is-tomorrow">明日</span>';
        return `<div class="summary-group-header">${m}/${d}(${wd})${tag} ・ ${countText(items, x => x.o)}</div>`;
    };

    const renderDateGroup = (g) => dateHeader(g.date, g.items) + g.items.map(x => renderRow(x.o, x.p)).join('');

    let html = '';
    if (overduePast.length > 0) {
        html += `<div class="summary-group-header summary-group-overdue">${icon('alert')} 受け取り日を過ぎた未処理 ・ ${overduePast.length}件</div>`
            + overduePast.map(x => renderRow(x.o, x.p, true)).join('');
    }
    html += groupByDate(upcoming, false).map(renderDateGroup).join('');

    if (unset.length > 0) {
        unset.sort((a, b) => {
            const ca = a.createdAt ? new Date(a.createdAt).getTime() : NaN;
            const cb = b.createdAt ? new Date(b.createdAt).getTime() : NaN;
            if (!isNaN(ca) && !isNaN(cb) && ca !== cb) return cb - ca;
            if (!isNaN(ca) !== !isNaN(cb)) return isNaN(ca) ? 1 : -1;
            return String(b.id).localeCompare(String(a.id), undefined, { numeric: true });
        });
        html += `<div class="summary-group-header">受け取り日時 未設定 ・ ${countText(unset, x => x)}</div>`
            + unset.map(o => renderRow(o, null)).join('');
    }

    if (past.length > 0) {
        html += `<details class="summary-past"><summary>過去の処理済み（${past.length}件）</summary>`
            + groupByDate(past, true).map(renderDateGroup).join('')
            + `</details>`;
    }

    summaryList.innerHTML = html;

    // クリックで詳細表示
    summaryList.querySelectorAll('.summary-row').forEach(row => {
        row.addEventListener('click', () => showOrderDetail(row.dataset.id));
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

// 検索用の正規化（ひらがな→カタカナ、小文字化、空白除去）
function normalizeForSearch(s) { return toKatakana(String(s || '')).toLowerCase().replace(/\s+/g, ''); }

// モーダル表示中は body が position:fixed のため window.scrollY が 0 になる。実位置を返す
function getPageScrollY() { const b = document.body; if (b.classList.contains('modal-open')) { const t = parseFloat(b.style.top) || 0; return -t; } return window.scrollY; }

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
        if (order.status === '処理済み') {
            if (!confirm('「未処理」に戻しますか？\n記録されている処理日時は消えます。')) return;
            updateOrder(id, { status: '未処理', processedAt: null });
        } else {
            updateOrder(id, { status: '処理済み', processedAt: new Date().toISOString() });
        }
        renderOrdersList();
    }
}

function toggleOrderPrinted(id) {
    const order = getOrders().find(o => o.id === id);
    if (!order) return;
    const y = getPageScrollY();
    updateOrder(id, { isPrinted: !order.isPrinted });
    renderOrdersList();
    window.scrollTo(0, y);
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
        <div class="detail-section"><h3>受付情報</h3><p>状態: ${escapeHtml(order.status || '未処理')}</p>${order.status === '処理済み' ? `<p>処理日時: ${(order.processedAt && formatDateTime(order.processedAt)) || '記録なし'}</p>` : ''}<p>受付日: ${formatDate(order.receptionDate)}</p><p>お受け取り日時: ${order.orderDatetime ? formatDateTime(order.orderDatetime) : '未設定'}</p><p>受付方法: ${escapeHtml(order.receptionMethod || '未設定')}</p><p>受注者: ${escapeHtml(order.staffName || '未登録')}</p><p>受け取り方法: ${escapeHtml(order.deliveryMethod || '未設定')}</p></div>
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
        switchTab('input', { scroll: 'top' });

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
        // 変更の有無を判定するため、読み込み直後のフォームの状態を記録
        editBaselineJson = JSON.stringify(getFormData());
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

    // 店舗名・電話番号が未設定なら気づけるようにする（プレビュー画面のみ。印刷物には出ない）
    const storeSettings = getSettings();
    const storeNotice = (!storeSettings.storeName || !storeSettings.storePhone)
        ? `<div class="store-unset-notice">${icon('alert', 'icon-warn')} 店舗名または電話番号が未設定のため、印刷物の右下が空欄になります。「設定」で入力して保存してください。</div>`
        : '';

    printContent.innerHTML = `
        ${storeNotice}
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
    startSharePdfPreparationIfStandalone(order);
}

// 印刷用の紙面CSS（executePrintForOrder の @media print 内にそのまま埋め込まれる。PDF生成でも共用）
const PAPER_BASE_CSS = `        /* === リセット === */
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
        }`;

// 注文データを受け取って直接印刷を実行（お客様控え＋店舗控え＋部門控えの3ページ一括）
// iPad Safari対策：新規ウィンドウを使わず、現在のページ内の #print-area を印刷する。
// window.print() はクリック操作と同じ呼び出しスタック内で同期的に呼ぶ。
// 印刷領域のCSS（実際の印刷と、ホーム画面アプリ用のPDF作成で同じものを使う）
const PRINT_AREA_CSS = `
        /* 画面上では印刷領域を非表示 */
        #print-area { display: none; }

        @media print {
            /* 印刷領域以外を非表示 */
            body > *:not(#print-area) { display: none !important; }
            #print-area { display: block !important; }


${PAPER_BASE_CSS}
        
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

// 印刷時の最終オーバーライド（本文の後ろに置く）
const PRINT_OVERRIDE_CSS = `
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

// onAfterPrint: 印刷ダイアログ終了後（afterprint）に呼ばれるコールバック（任意）
function executePrintForOrder(order, onAfterPrint) {
    const customerCopyHtml = generateCustomerCopyHtml(order);
    const storeCopyHtml = generatePrintHtmlForPaper(order);
    const departmentCopyHtml = generatePrintHtmlForPaper(order, '部門控え');

    // 既存の印刷領域があれば削除
    const oldArea = document.getElementById('print-area');
    if (oldArea) oldArea.remove();

    // 印刷専用CSS（画面表示に影響しないよう全て @media print 内に限定）
    const printCss = PRINT_AREA_CSS;

    // 印刷時の最終オーバーライド。各控えのHTML内の <style>（@page margin:0 など）より
    // 後ろに置かないと負けるため、必ず本文の後に挿入する
    const printOverrideCss = PRINT_OVERRIDE_CSS;

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

    // 印刷後の処理（一度だけ実行）
    // 印刷領域はここでは削除しない。iPad の Safari は window.print() の完了を待たずに
    // 処理を進め、afterprint が印刷プレビューの生成より先に届くことがあるため、
    // ここで消すと白紙になったり印刷画面が出なかったりする。
    // 印刷領域は画面上は非表示で、次回の印刷時に新しい内容へ置き換える。
    const handleAfterPrint = () => {
        window.removeEventListener('afterprint', handleAfterPrint);
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

    // ホーム画面アプリ：window.print() が動かないため、共有メニュー経由のみ（印刷へは切り替えない）
    if (isStandaloneApp()) {
        handleStandalonePrintClick(order);
        return;
    }

    // 現在のページ内で印刷（印刷ダイアログを開いてPDF保存も可能）
    // 印刷済みの記録は、印刷ダイアログが閉じた後（afterprint）に行う
    executePrintForOrder(order, () => {
        // プレビューモーダルを閉じる
        printModal.classList.remove('active');

        updateOrder(order.id, { isPrinted: true });
        renderOrdersList();
    });
});

// ===== ホーム画面アプリ（全画面モード）向け：PDFを作って共有メニューからプリント =====
// ホーム画面から起動した場合 window.print() が動かないため、プレビューを開いた時点でPDFを作っておき、
// 印刷ボタンで共有メニュー（navigator.share）を開く。通常のSafariでは何も読み込まず従来どおり。
function isStandaloneApp() {
    // iOS / iPadOS のホーム画面アプリのみ（他のOSのインストール型アプリは対象外）
    const nav = window.navigator;
    return nav.standalone === true ||
        (!!window.matchMedia && window.matchMedia('(display-mode: standalone)').matches &&
            (/iP(hone|ad|od)/.test(nav.userAgent) || (nav.platform === 'MacIntel' && nav.maxTouchPoints > 1)));
}

// 画面表示待ちが止まらないよう、待ち時間に上限を付けた Promise（時間切れでも reject せず続行する）
function waitOrContinue(promise, ms) {
    let timer;
    const t = new Promise(resolve => { timer = setTimeout(resolve, ms); });
    return Promise.race([promise, t]).catch(() => {}).finally(() => clearTimeout(timer));
}

// PDFファイルを共有メニューで渡せる端末か
function canSharePdfFiles() {
    try {
        return !!(navigator.share && navigator.canShare &&
            navigator.canShare({ files: [new File([''], 'check.pdf', { type: 'application/pdf' })] }));
    } catch (e) {
        return false;
    }
}

const scriptLoadPromises = {};
function loadScriptOnce(src) {
    if (!scriptLoadPromises[src]) {
        scriptLoadPromises[src] = new Promise((resolve, reject) => {
            const el = document.createElement('script');
            el.src = src;
            el.onload = () => resolve();
            el.onerror = () => { delete scriptLoadPromises[src]; reject(new Error('読み込みに失敗: ' + src)); };
            document.head.appendChild(el);
        });
    }
    return scriptLoadPromises[src];
}

function loadPdfLibs() {
    return Promise.all([
        loadScriptOnce('vendor/html2canvas-1.4.1.min.js'),
        loadScriptOnce('vendor/jspdf-2.5.2.umd.min.js')
    ]);
}

// 印刷時（executePrintForOrder）と同じ見た目になるよう、紙面CSSを #pdf-render-root 配下に限定して画面に適用する
// 実際の印刷用CSSを、PDF作成用（画面上での描画）に変換する。
// - @media print の中身は有効にし、@media screen と @page は除く
// - 印刷領域の表示切替（body > * / #print-area 単体）の指定は除く
// - セレクタの先頭に :where(#pdf-render-root) を付ける。:where は優先度を上げないため、
//   各控えのHTML内の <style> が後から上書きする関係が実際の印刷と同じになる
function toPdfRenderCss(css) {
    const src = css.replace(/\/\*[\s\S]*?\*\//g, '');
    let out = '';
    let i = 0;
    while (i < src.length) {
        const open = src.indexOf('{', i);
        if (open === -1) break;
        const head = src.slice(i, open).trim();
        // 対応する閉じ括弧を探す（入れ子に対応）
        let depth = 1, j = open + 1;
        while (j < src.length && depth > 0) {
            if (src[j] === '{') depth++;
            else if (src[j] === '}') depth--;
            j++;
        }
        const body = src.slice(open + 1, j - 1);
        i = j;
        if (/^@media\b/.test(head)) {
            if (/\bprint\b/.test(head) && !/\bnot\b/.test(head)) out += toPdfRenderCss(body);
            continue; // @media screen や not print など、印刷以外は使わない
        }
        if (/^@supports\b/.test(head)) { out += toPdfRenderCss(body); continue; } // 中身は print と同様に残す
        if (/^@/.test(head)) continue; // @page など
        const selectors = head.split(',').map(x => x.trim()).filter(Boolean)
            .filter(x => !/^(html|body)\b/.test(x) && x !== '#print-area')
            .map(x => ':where(#pdf-render-root) ' + x.replace(/^#print-area\s+/, ''));
        if (selectors.length) out += selectors.join(', ') + ' {' + body + '}\n';
    }
    return out;
}

function makeStaleError() {
    const e = new Error('stale');
    e.name = 'StalePdfJob';
    return e;
}

function pdfFileNameForOrder(order) {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec((order && order.receptionDate) || '');
    let ymd;
    if (m && !isNaN(new Date(+m[1], +m[2] - 1, +m[3]).getTime())) {
        ymd = m[1] + m[2] + m[3];
    } else {
        const d = new Date();
        ymd = String(d.getFullYear()) + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
    }
    return 'ご注文承り書_' + ymd + '.pdf';
}

// 改ページ候補（ページ要素の上端からの CSS px）：行（tr）・店舗情報の下端と要素全体の高さ
function collectPdfBreakPositions(pageEl) {
    const top = pageEl.getBoundingClientRect().top;
    const set = new Set();
    pageEl.querySelectorAll('tr, .store-info').forEach(el => {
        const bottom = el.getBoundingClientRect().bottom - top;
        if (bottom > 0) set.add(Math.round(bottom * 100) / 100);
    });
    set.add(pageEl.offsetHeight);
    return Array.from(set).sort((x, y) => x - y);
}

let pdfJobChain = Promise.resolve();

async function buildOrderPdfFile(order, isStale) {
    const checkStale = () => { if (isStale && isStale()) throw makeStaleError(); };
    // アプリ全体の CSS（style.css）の影響を受けないよう、独立した小さなページ（iframe）で描画する。
    // 印刷では画面幅に応じた文字サイズ等が用紙幅で決まるため、アプリ画面の中で描くと見た目がずれる。
    // 実際の印刷では紙面を用紙幅（210mm ≒ 794px）で組み、余白 15mm を除いた 180mm に縮小して印刷される。
    // PDF も同じく 794px 幅で描いてから 180mm 幅に縮めて配置し、見た目を合わせる。
    const htmls = [
        generateCustomerCopyHtml(order),
        generatePrintHtmlForPaper(order),
        generatePrintHtmlForPaper(order, '部門控え')
    ];
    const doc = '<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8">'
        + '<style>' + toPdfRenderCss(PRINT_AREA_CSS) + '</style></head>'
        + '<body style="margin:0;background:#fff;"><div id="pdf-render-root">'
        + htmls.map(h => '<div class="pdf-page" style="background:#fff;">' + h + '</div>').join('')
        // 印刷時の最終オーバーライドは本文の後ろに置く（実際の印刷と同じ順番）
        + '<style>' + toPdfRenderCss(PRINT_OVERRIDE_CSS) + '</style>'
        + '</div></body></html>';

    const frame = document.createElement('iframe');
    frame.setAttribute('aria-hidden', 'true');
    frame.tabIndex = -1;
    frame.style.cssText = 'position: fixed; left: -10000px; top: 0; width: 794px; height: 4000px; border: 0; visibility: hidden; pointer-events: none;';
    const loaded = withTimeout(new Promise(resolve => frame.addEventListener('load', resolve, { once: true })), 10000);
    frame.srcdoc = doc;
    document.body.appendChild(frame);
    try {
        await loaded;
        checkStale();
        const fdoc = frame.contentDocument;
        if (fdoc.fonts && fdoc.fonts.ready) await waitOrContinue(fdoc.fonts.ready, 5000);
        await Promise.all(Array.from(fdoc.querySelectorAll('img')).map(img =>
            img.complete ? Promise.resolve() : waitOrContinue(new Promise(resolve => {
                img.addEventListener('load', resolve, { once: true });
                img.addEventListener('error', resolve, { once: true });
            }), 5000)
        ));
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        checkStale();
        // 内容の高さに合わせる（固定の高さに頼らない）
        frame.style.height = Math.max(fdoc.documentElement.scrollHeight, fdoc.body.scrollHeight) + 'px';
        await new Promise(r => requestAnimationFrame(r));
        checkStale();

        const origImgs = Array.from(fdoc.querySelectorAll('img'));
        // html2canvas は image-rendering: pixelated を無視するため、QRコードは描画用の複製の中だけ
        // 補間なしで拡大した画像に差し替える（設定データには触れない）
        const onclone = (clonedDoc) => {
            const clonedImgs = Array.from(clonedDoc.querySelectorAll('img'));
            clonedImgs.forEach((cimg, idx) => {
                const orig = origImgs[idx];
                if (!orig || !/^data:image/.test(orig.getAttribute('src') || '')) return;
                const rect = orig.getBoundingClientRect();
                if (rect.width < 40 || rect.height < 40 || !orig.naturalWidth) return;
                try {
                    const c = document.createElement('canvas');
                    c.width = Math.round(rect.width * 2);
                    c.height = Math.round(rect.height * 2);
                    const ctx = c.getContext('2d');
                    ctx.imageSmoothingEnabled = false;
                    ctx.drawImage(orig, 0, 0, c.width, c.height);
                    cimg.src = c.toDataURL('image/png');
                    cimg.style.width = rect.width + 'px';
                    cimg.style.height = rect.height + 'px';
                    c.width = c.height = 0;
                } catch (e) { /* 差し替えできなければそのまま */ }
            });
        };

        const pages = Array.from(fdoc.querySelectorAll('.pdf-page'));
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        let firstPdfPage = true;
        for (let i = 0; i < pages.length; i++) {
            checkStale();
            const pageEl = pages[i];
            const breaks = collectPdfBreakPositions(pageEl);
            const elH = pageEl.offsetHeight;
            // iOS のキャンバス面積の上限（約1677万px）を超えないよう倍率を下げる
            const h = pageEl.offsetHeight;
            const scale = Math.max(1, Math.min(2, Math.floor(Math.sqrt(16000000 / (794 * Math.max(h, 1))) * 100) / 100));
            const renderPage = sc => html2canvas(pageEl, { scale: sc, backgroundColor: '#ffffff', useCORS: true, logging: false, windowWidth: 794, onclone });
            let canvas = await renderPage(scale);
            if (!canvas.width || !canvas.height) {
                canvas.width = canvas.height = 0;
                canvas = await renderPage(1);
                if (!canvas.width || !canvas.height) throw new Error('キャンバスの作成に失敗しました');
            }
            try {
                checkStale();
                const pageHeightPx = Math.floor(canvas.width * 267 / 180);
                if (canvas.height <= pageHeightPx) {
                    // 1ページに収まる：縮めずそのまま配置
                    const h = 180 * canvas.height / canvas.width;
                    if (!firstPdfPage) pdf.addPage();
                    firstPdfPage = false;
                    pdf.addImage(canvas, 'PNG', 15, 15, 180, h, undefined, 'FAST'); // 劣化しない形式（JPEGだと白地に圧縮ムラが出る）
                } else {
                    // 長い場合は縮めずに、行の切れ目で縦に分けて複数ページにする
                    const ratio = canvas.height / (elH || canvas.height);
                    let start = 0;
                    while (start < canvas.height) {
                        let end = start + pageHeightPx;
                        if (end >= canvas.height) {
                            end = canvas.height;
                        } else {
                            let best = -1;
                            for (const b of breaks) {
                                const bp = b * ratio;
                                if (bp - start <= pageHeightPx && bp > start + 1) best = bp;
                            }
                            if (best > 0) end = Math.min(Math.round(best), canvas.height);
                            if (end <= start + 1) end = start + pageHeightPx;
                        }
                        const sliceH = Math.min(end, canvas.height) - start;
                        if (sliceH < 4) break;
                        const slice = document.createElement('canvas');
                        slice.width = canvas.width;
                        slice.height = sliceH;
                        const ctx = slice.getContext('2d');
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, slice.width, slice.height);
                        ctx.drawImage(canvas, 0, start, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
                        if (!firstPdfPage) pdf.addPage();
                        firstPdfPage = false;
                        pdf.addImage(slice, 'PNG', 15, 15, 180, 180 * sliceH / canvas.width, undefined, 'FAST');
                        slice.width = slice.height = 0;
                        start += sliceH;
                    }
                }
            } finally {
                canvas.width = canvas.height = 0;
            }
        }
        checkStale();
        return new File([pdf.output('blob')], pdfFileNameForOrder(order), { type: 'application/pdf' });
    } finally {
        frame.remove();
    }
}

let preparedSharePdf = null; // { orderId, file }
let sharePdfToken = 0;
let standalonePrintState = '';
let lastShareAt = 0;        // 直前に共有画面を開こうとした時刻（同じタップでの二重呼び出し防止）
let sharingStartedAt = 0;   // sharing 状態になった時刻
let shareAttempt = 0;       // 共有の試行番号（リセットされた試行の遅い結果を無視するため）

const PRINT_HELP_MESSAGES = {
    'preparing': '準備しています。少しお待ちください…',
    'ready': '次に出る一覧から「プリント」（プリンターの絵）を押してください。見つからないときは、一覧を指で上にずらしてください。',
    'cancelled': 'プリントを中止しました。もう一度「プリントする」を押すとやり直せます。',
    'share-error': 'プリントの画面を開けませんでした。もう一度「プリントする」を押してください。',
    'prepare-error': 'プリントの準備ができませんでした。「もう一度ためす」を押してください。何度もできないときは、アプリを閉じて開き直してから、もう一度お試しください。',
    // ホーム画面アプリと Safari は保存データが別のため、「Safari で開く」は案内しない（注文が見つからない）
    'unsupported': 'このiPadでは、ホーム画面のアプリから直接プリントできません。iPadの「設定」→「一般」→「ソフトウェアアップデート」で、iPadOSを最新にしてください。'
};

// ホーム画面アプリ用：ボタンと案内文の状態を切り替える（ボタンの文言は prepare-error のときだけ変わる）
function setStandalonePrintState(state, message) {
    const btn = document.getElementById('download-pdf-btn');
    const help = document.getElementById('print-help');
    const labelEl = btn.querySelector('.btn-label');
    standalonePrintState = state;
    // sharing 中も押せるままにする（共有画面が閉じた通知が来ない場合に備える）
    btn.disabled = (state === 'preparing' || state === 'unsupported');
    if (labelEl) labelEl.textContent = state === 'prepare-error' ? 'もう一度ためす' : 'プリントする';
    if (!help) return;
    // sharing は直前の案内文をそのまま残す
    if (state !== 'sharing') {
        const text = message || PRINT_HELP_MESSAGES[state] || '';
        help.textContent = '';
        if (state === 'preparing') {
            const spinner = document.createElement('span');
            spinner.className = 'print-help-spinner';
            spinner.setAttribute('aria-hidden', 'true');
            help.appendChild(spinner);
        }
        help.appendChild(document.createTextNode(text));
    }
    help.hidden = false;
}

// 通常表示（Safari・PC）用：従来どおりのボタン表示に戻す
function resetPrintButtonForBrowser() {
    const btn = document.getElementById('download-pdf-btn');
    const help = document.getElementById('print-help');
    const labelEl = btn.querySelector('.btn-label');
    standalonePrintState = '';
    btn.disabled = false;
    if (labelEl) labelEl.textContent = '印刷';
    if (help) { help.hidden = true; help.textContent = ''; }
}

function showToast(message) {
    const old = document.querySelector('.app-toast');
    if (old) old.remove();
    const el = document.createElement('div');
    el.className = 'app-toast';
    el.setAttribute('role', 'status');
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
}

function withTimeout(promise, ms) {
    let timer;
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('timeout')), ms);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function prepareSharePdf(order, token) {
    try {
        // PDFを共有できない端末では、ライブラリも読み込まずに案内だけ出す
        if (!canSharePdfFiles()) {
            preparedSharePdf = null;
            setStandalonePrintState('unsupported');
            return;
        }
        const isStale = () => token !== sharePdfToken;
        // 同時に1つだけ作る（古いものは最初の確認で素早く中止される）
        const job = pdfJobChain.catch(() => {}).then(async () => {
            if (isStale()) throw makeStaleError();
            await loadPdfLibs();
            return buildOrderPdfFile(order, isStale);
        });
        // 時間切れでも後続の作成が止まらないよう、タイムアウト付きの Promise を連鎖させる
        const timed = withTimeout(job, 60000);
        pdfJobChain = timed.catch(() => {});
        const file = await timed;
        if (token !== sharePdfToken) return;
        if (!navigator.share || !navigator.canShare || !navigator.canShare({ files: [file] })) {
            throw new Error('このアプリではPDFを共有できません');
        }
        preparedSharePdf = { orderId: order.id, file };
        setStandalonePrintState('ready');
    } catch (err) {
        if (err && err.name === 'StalePdfJob') return;
        if (token !== sharePdfToken) return;
        console.warn('PDFの準備に失敗しました', err);
        preparedSharePdf = null;
        setStandalonePrintState('prepare-error');
    }
}

function startSharePdfPreparationIfStandalone(order) {
    const token = ++sharePdfToken;
    preparedSharePdf = null;
    lastShareAt = 0;
    shareAttempt++;
    if (!isStandaloneApp()) {
        resetPrintButtonForBrowser();
        return;
    }
    setStandalonePrintState('preparing');
    prepareSharePdf(order, token);
}

// ホーム画面アプリでの「プリントする」ボタン
function handleStandalonePrintClick(order) {
    if (standalonePrintState === 'prepare-error') {
        startSharePdfPreparationIfStandalone(order);
        return;
    }
    if (!preparedSharePdf || preparedSharePdf.orderId !== order.id) return; // 準備中などは何もしない
    const now = Date.now();
    if (now - lastShareAt < 800) return; // 同じタップでの二重呼び出しを防ぐ
    lastShareAt = now;
    const token = sharePdfToken;
    const attempt = shareAttempt;
    if (standalonePrintState !== 'sharing') sharingStartedAt = now;
    setStandalonePrintState('sharing');
    // navigator.share は、タップの処理の中で同期的に呼ぶ必要がある
    const onSuccess = () => {
        if (attempt !== shareAttempt) return; // すでに状態を戻した試行の遅い結果は無視する
        let recorded = true;
        try {
            updateOrder(order.id, { isPrinted: true });
            renderOrdersList();
        } catch (e) {
            recorded = false;
            console.warn('印刷済みの記録に失敗しました', e);
        }
        printModal.classList.remove('active');
        showToast(recorded ? '印刷済みにしました（印刷しなかったときは一覧の「未印刷に戻す」で戻せます）' : 'プリントの画面を開きました（印刷済みの記録はできませんでした）');
    };
    const onError = err => {
        // プレビューが閉じられた・別の注文に変わった場合は、新しい画面の状態に触れない
        if (token !== sharePdfToken || attempt !== shareAttempt || !printModal.classList.contains('active')) return;
        if (err && err.name === 'AbortError') setStandalonePrintState('cancelled');
        else if (err && err.name === 'InvalidStateError') setStandalonePrintState('ready'); // すでに共有画面が開いている
        else setStandalonePrintState('share-error');
    };
    let sharePromise;
    try {
        sharePromise = navigator.share({ files: [preparedSharePdf.file] });
    } catch (err) {
        sharePromise = Promise.reject(err);
    }
    sharePromise.then(onSuccess, onError);
}

// 共有画面を閉じたのに結果が届かない場合（一部のiOS）に備え、画面に戻ったとき 3 秒以上 sharing なら ready に戻す
function recoverFromStuckSharing() {
    if (standalonePrintState !== 'sharing') return;
    if (Date.now() - sharingStartedAt <= 3000) return;
    if (!printModal.classList.contains('active')) return;
    shareAttempt++; // 以前の共有の遅い結果を無視する
    setStandalonePrintState('ready');
}
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') recoverFromStuckSharing();
});
window.addEventListener('focus', recoverFromStuckSharing);

// プレビューが閉じられたら準備済みPDFを破棄し、ボタンと案内文も戻す（どの閉じ方でも）
new MutationObserver(() => {
    if (!printModal.classList.contains('active')) {
        sharePdfToken++;
        preparedSharePdf = null;
        lastShareAt = 0;
        shareAttempt++;
        const help = document.getElementById('print-help');
        if (help) { help.hidden = true; help.textContent = ''; }
        const btn = document.getElementById('download-pdf-btn');
        const labelEl = btn.querySelector('.btn-label');
        btn.disabled = false;
        standalonePrintState = '';
        if (labelEl) labelEl.textContent = isStandaloneApp() ? 'プリントする' : '印刷';
    }
}).observe(printModal, { attributes: true, attributeFilter: ['class'] });

// 一覧に戻るボタン
backToListBtn.addEventListener('click', () => {
    printModal.classList.remove('active');
    // 一覧タブに切り替え
    switchTab('list');
});

document.querySelectorAll('.close-modal').forEach(btn => btn.addEventListener('click', () => btn.closest('.modal').classList.remove('active')));
document.querySelectorAll('.modal').forEach(modal => modal.addEventListener('click', (e) => { if (e.target === modal && modal.id !== 'print-modal') modal.classList.remove('active'); }));

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
    const unsetNote = document.getElementById('store-unset-note');
    if (unsetNote) unsetNote.hidden = !!(settings.storeName && settings.storePhone);
    settingInstagramQrInput.value = '';
    pendingQrImage = undefined;
    updateQrPreview(settings.instagramQrImage);
}
loadSettingsForm();

// 設定画面の一番下にバージョンを表示（iPadで最新版が読み込まれているかの確認にも使う）
(() => {
    const el = document.getElementById('app-version');
    if (el) el.textContent = `バージョン ${APP_VERSION}（${formatDate(APP_UPDATED)} 更新）` + (isStandaloneApp() ? '・ホーム画面アプリ' : '');
})();

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
        storeName: settingStoreNameInput.value.trim(),
        storePhone: settingStorePhoneInput.value.trim(),
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
        appVersion: APP_VERSION,
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
    // index.html の data-icon 指定の場所に線アイコンを差し込む
    document.querySelectorAll('[data-icon]').forEach(el => { el.outerHTML = icon(el.dataset.icon); });
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
    const searchTerm = customerSearchInput ? normalizeForSearch(customerSearchInput.value) : '';

    // 検索フィルター
    let filtered = customers.filter(c => {
        return normalizeForSearch(c.name).includes(searchTerm);
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
                <div class="empty-list-icon">${icon('users')}</div>
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
                <div class="order-card-info">${icon('phone')} ${escapeHtml(customer.phone || '未登録')}</div>
                <div class="order-card-info">${icon('mapPin')} ${escapeHtml(customer.address || '未登録')}</div>
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
    switchTab('input', { scroll: 'top' });

    // お客様情報をフォームに入力
    const customerNameInput = document.getElementById('customer-name');
    const phoneInput = document.getElementById('phone-number');
    const addressInput = document.getElementById('delivery-address');

    if (customerNameInput) customerNameInput.value = customerOrder.customerName || '';
    if (phoneInput) phoneInput.value = customerOrder.phoneNumber || '';
    if (addressInput) addressInput.value = customerOrder.deliveryAddress || '';

    alert('お客様情報を注文フォームに入力しました。');
}

// ===== モーダル表示中は背景のスクロールを固定（iOS Safari対策で position:fixed 方式） =====
(() => {
    const modals = document.querySelectorAll('.modal');
    let locked = false;
    let lockedY = 0;
    const sync = () => {
        const anyOpen = Array.from(modals).some(m => m.classList.contains('active'));
        if (anyOpen === locked) return;
        const b = document.body;
        if (anyOpen) {
            lockedY = window.scrollY;
            b.classList.add('modal-open');
            b.style.position = 'fixed';
            b.style.top = `-${lockedY}px`;
            b.style.left = '0';
            b.style.right = '0';
            b.style.width = '100%';
        } else {
            b.classList.remove('modal-open');
            b.style.position = '';
            b.style.top = '';
            b.style.left = '';
            b.style.right = '';
            b.style.width = '';
            window.scrollTo(0, lockedY);
        }
        locked = anyOpen;
        updateToTop();
    };
    const observer = new MutationObserver(sync);
    modals.forEach(m => observer.observe(m, { attributes: true, attributeFilter: ['class'] }));

    // ===== 「▲ 上へ」ボタン（一定量スクロールしたときだけ表示） =====
    const toTopBtn = document.createElement('button');
    toTopBtn.type = 'button';
    toTopBtn.className = 'scroll-top-btn';
    toTopBtn.hidden = true;
    toTopBtn.setAttribute('aria-label', 'ページの上へ戻る');
    toTopBtn.innerHTML = `${icon('arrowUp')} 上へ`;
    document.body.appendChild(toTopBtn);
    toTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    function updateToTop() {
        // モーダル表示中は隠す（固定中は scrollY が 0 になるため判定もここで）
        toTopBtn.hidden = locked || window.scrollY <= 600;
    }
    window.addEventListener('scroll', updateToTop, { passive: true });
    updateToTop();
})();

// ===== 日付依存ラベルの自動更新（iPadを開きっぱなしでも最新に） =====
function refreshTimeSensitiveViews() {
    if (document.querySelector('.modal.active')) return;
    const active = Array.from(tabContents).find(c => c.classList.contains('active'));
    if (!active) return;
    const tab = active.id.replace(/-tab$/, '');
    if (tab !== 'summary' && tab !== 'list') return;
    const ae = document.activeElement;
    if (ae && ['INPUT', 'TEXTAREA', 'SELECT'].includes(ae.tagName) && active.contains(ae)) return;
    const y = getPageScrollY();
    if (tab === 'summary') {
        const wasOpen = document.querySelector('details.summary-past')?.open || false;
        renderSummaryList();
        const d = document.querySelector('details.summary-past');
        if (d && wasOpen) d.open = true;
    } else {
        renderOrdersList();
    }
    window.scrollTo(0, y);
}
(() => {
    const minuteKey = () => {
        const n = new Date();
        const p = (v) => String(v).padStart(2, '0');
        return `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())}T${p(n.getHours())}:${p(n.getMinutes())}`;
    };
    let lastRenderMinuteKey = minuteKey();
    const refresh = () => { refreshTimeSensitiveViews(); lastRenderMinuteKey = minuteKey(); };
    setInterval(() => { if (minuteKey() !== lastRenderMinuteKey) refresh(); }, 30000);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') refresh(); });
    window.addEventListener('focus', refresh);
})();
