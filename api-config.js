// api-config.js - Supabase API 配置
// 用于从数据库动态获取店铺、商品、服务数据

const SUPABASE_URL = 'https://mfeboXhispfjyvssupjl.supabase.co'.toLowerCase();
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mZWJveGhpc3Bmanl2c3N1cGpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NzMyMTAsImV4cCI6MjA3NDI0OTIxMH0.5T3igmyx0bwkf6JaiVnyNPzAn_Wtr0-_5MHv6cSN-Yw';

// 基础域名
const BASE_URL = 'https://dongyingyouxia.com';

// API 请求封装
async function supabaseQuery(table, query = '') {
    const url = `${SUPABASE_URL}/rest/v1/${table}${query}`;
    const response = await fetch(url, {
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
}

// 获取店铺详情
async function getStoreById(storeId) {
    const data = await supabaseQuery('stores', `?id=eq.${storeId}&select=*,users!stores_owner_id_fkey(id,nickname,avatar_url)`);
    return data[0] || null;
}

// 获取店铺商品列表
async function getStoreProducts(storeId) {
    return await supabaseQuery('store_products', `?store_id=eq.${storeId}&audit_status=eq.active&select=*&order=created_at.desc`);
}

// 获取商品详情
async function getProductById(productId) {
    const data = await supabaseQuery('store_products', `?id=eq.${productId}&select=*,stores(id,name,logo_url,owner_id)`);
    return data[0] || null;
}

// 获取服务详情
async function getServiceById(serviceId) {
    const data = await supabaseQuery('services', `?id=eq.${serviceId}&select=*,users!services_user_id_fkey(id,nickname,avatar_url,phone)`);
    return data[0] || null;
}

// 获取卖家信息（汇总所有店铺和服务）
async function getSellerInfo(userId) {
    const [user, stores, services] = await Promise.all([
        supabaseQuery('users', `?id=eq.${userId}&select=id,nickname,avatar_url,bio,created_at`),
        supabaseQuery('stores', `?owner_id=eq.${userId}&audit_status=eq.active&select=*`),
        supabaseQuery('services', `?user_id=eq.${userId}&audit_status=eq.active&select=*`)
    ]);

    return {
        user: user[0] || null,
        stores: stores || [],
        services: services || []
    };
}

// 获取URL参数
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// 格式化价格（日元）
function formatPrice(price) {
    if (price === null || price === undefined) return '面议';
    return '¥' + Number(price).toLocaleString();
}

// 格式化日期
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

// 默认图片
const DEFAULT_AVATAR = 'https://mfeboXhispfjyvssupjl.supabase.co/storage/v1/object/public/avatars/default-avatar.png'.toLowerCase();
const DEFAULT_PRODUCT_IMAGE = 'https://via.placeholder.com/400x300?text=No+Image';
const DEFAULT_STORE_LOGO = 'https://via.placeholder.com/200x200?text=Store';

// 生成公开链接
function generatePublicUrl(type, id) {
    return `${BASE_URL}/${type}.html?id=${id}`;
}
