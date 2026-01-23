// api-config.js - Supabase API 配置
// 用于从数据库动态获取店铺、商品、服务数据

const SUPABASE_URL = 'https://mfeboXhispfjyvssupjl.supabase.co';
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
    return await supabaseQuery('store_products', `?store_id=eq.${storeId}&status=eq.active&select=*&order=created_at.desc`);
}

// 获取商品详情
async function getProductById(productId) {
    const data = await supabaseQuery('store_products', `?id=eq.${productId}&select=*,stores(id,name,logo_url,owner_id)`);
    return data[0] || null;
}

// 获取服务详情
async function getServiceById(serviceId) {
    const data = await supabaseQuery('services', `?id=eq.${serviceId}&select=*,users:provider_id(id,nickname,avatar_url)`);
    return data[0] || null;
}

// 获取卖家信息（汇总所有店铺和服务）
async function getSellerInfo(userId) {
    const [user, stores, services] = await Promise.all([
        supabaseQuery('users', `?id=eq.${userId}&select=id,nickname,avatar_url,bio,created_at`),
        supabaseQuery('stores', `?owner_id=eq.${userId}&status=eq.active&select=*`),
        supabaseQuery('services', `?provider_id=eq.${userId}&status=eq.active&select=*`)
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

// 默认图片 - 使用 data URI 避免外部请求失败
const DEFAULT_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNFNUU3RUIiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjM2IiByPSIxOCIgZmlsbD0iIzlDQTNBRiIvPjxwYXRoIGQ9Ik0yMCA4NUMyMCA2OC40MzE1IDMzLjQzMTUgNTUgNTAgNTVDNjYuNTY4NSA1NSA4MCA2OC40MzE1IDgwIDg1VjEwMEgyMFY4NVoiIGZpbGw9IiM5Q0EzQUYiLz48L3N2Zz4=';
const DEFAULT_PRODUCT_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNGM0Y0RjYiLz48cGF0aCBkPSJNMTYwIDEyMEgxODBWMTQwSDE2MFYxMjBaIiBmaWxsPSIjOUNBM0FGIi8+PHBhdGggZD0iTTE0MCAxNDBIMjYwVjE4MEgxNDBWMTQwWiIgZmlsbD0iIzlDQTNBRiIvPjx0ZXh0IHg9IjIwMCIgeT0iMjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUNBM0FGIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
const DEFAULT_STORE_LOGO = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiM2MzY2RjEiLz48cGF0aCBkPSJNNjAgODBIMTQwVjE0MEg2MFY4MFoiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMyIvPjxwYXRoIGQ9Ik03MCA3MEgxMzBWOTBINzBWNzBaIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjQiLz48dGV4dCB4PSIxMDAiIHk9IjE2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0Ij5TdG9yZTwvdGV4dD48L3N2Zz4=';

// 生成公开链接
function generatePublicUrl(type, id) {
    return `${BASE_URL}/${type}.html?id=${id}`;
}

// ==================== 侠客市集（二手商品）====================

// 获取二手商品详情
async function getMarketplaceItemById(itemId) {
    const data = await supabaseQuery('marketplace_items', `?id=eq.${itemId}&select=*,users!marketplace_items_user_id_fkey(id,nickname,avatar_url)`);
    return data[0] || null;
}

// 获取用户发布的二手商品数量
async function getUserMarketplaceItemCount(userId) {
    const data = await supabaseQuery('marketplace_items', `?user_id=eq.${userId}&select=id`);
    return data?.length || 0;
}

// ==================== 江湖食肆（餐厅）====================

// 获取餐厅详情
async function getRestaurantById(restaurantId) {
    const data = await supabaseQuery('restaurants', `?id=eq.${restaurantId}&select=*,users!restaurants_user_id_fkey(id,nickname,avatar_url)`);
    return data[0] || null;
}

// ==================== 客栈驿站（房源）====================

// 获取房源详情
async function getAccommodationById(accommodationId) {
    const data = await supabaseQuery('accommodations', `?id=eq.${accommodationId}&select=*,users!accommodations_user_id_fkey(id,nickname,avatar_url)`);
    return data[0] || null;
}

// ==================== 江湖问答 ====================

// 获取问题详情
async function getQuestionById(questionId) {
    const data = await supabaseQuery('questions', `?id=eq.${questionId}&select=*,users!questions_user_id_fkey(id,nickname,avatar_url)`);
    return data[0] || null;
}

// 获取问题的回答列表
async function getQuestionAnswers(questionId) {
    const data = await supabaseQuery('answers', `?question_id=eq.${questionId}&select=*,users!answers_user_id_fkey(id,nickname,avatar_url)&order=is_accepted.desc,like_count.desc,created_at.asc`);
    return data || [];
}

// ==================== 英雄结义（俱乐部+同乡会）====================

// 获取俱乐部详情
async function getClubById(clubId) {
    const data = await supabaseQuery('clubs', `?id=eq.${clubId}&select=*,users!clubs_creator_id_fkey(id,nickname,avatar_url)`);
    return data[0] || null;
}

// 获取同乡会详情
async function getHometownById(hometownId) {
    const data = await supabaseQuery('hometown_associations', `?id=eq.${hometownId}&select=*,users!hometown_associations_creator_id_fkey(id,nickname,avatar_url)`);
    return data[0] || null;
}

// ==================== 列表查询函数 ====================

// 获取店铺列表
async function getStoreList(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    return await supabaseQuery('stores', `?status=eq.active&select=*,users!stores_owner_id_fkey(id,nickname,avatar_url)&order=created_at.desc&limit=${limit}&offset=${offset}`);
}

// 获取商品列表
async function getProductList(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    return await supabaseQuery('store_products', `?status=eq.active&select=*,stores(id,name,logo_url)&order=created_at.desc&limit=${limit}&offset=${offset}`);
}

// 获取二手商品列表
async function getMarketplaceList(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    return await supabaseQuery('marketplace_items', `?status=eq.available&select=*,users!marketplace_items_user_id_fkey(id,nickname,avatar_url)&order=created_at.desc&limit=${limit}&offset=${offset}`);
}

// 获取服务列表
async function getServiceList(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    return await supabaseQuery('services', `?status=eq.active&select=*,users:provider_id(id,nickname,avatar_url)&order=created_at.desc&limit=${limit}&offset=${offset}`);
}

// 获取餐厅列表
async function getRestaurantList(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    return await supabaseQuery('restaurants', `?status=eq.active&select=*,users!restaurants_user_id_fkey(id,nickname,avatar_url)&order=created_at.desc&limit=${limit}&offset=${offset}`);
}

// 获取房源列表
async function getAccommodationList(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    return await supabaseQuery('accommodations', `?status=eq.active&select=*,users!accommodations_user_id_fkey(id,nickname,avatar_url)&order=created_at.desc&limit=${limit}&offset=${offset}`);
}

// 获取问答列表
async function getQuestionList(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    return await supabaseQuery('questions', `?select=*,users!questions_user_id_fkey(id,nickname,avatar_url)&order=created_at.desc&limit=${limit}&offset=${offset}`);
}

// 获取俱乐部列表
async function getClubList(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    return await supabaseQuery('clubs', `?select=*,users!clubs_creator_id_fkey(id,nickname,avatar_url)&order=member_count.desc,created_at.desc&limit=${limit}&offset=${offset}`);
}

// 获取同乡会列表
async function getHometownList(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    return await supabaseQuery('hometown_associations', `?select=*,users!hometown_associations_creator_id_fkey(id,nickname,avatar_url)&order=member_count.desc,created_at.desc&limit=${limit}&offset=${offset}`);
}

// ==================== 公开链接生成工具 ====================

// 根据模块类型生成公开链接
function generateModulePublicUrl(module, id, subType) {
    const urlMap = {
        'store': `${BASE_URL}/store.html?id=${id}`,
        'product': `${BASE_URL}/product.html?id=${id}`,
        'service': `${BASE_URL}/service.html?id=${id}`,
        'seller': `${BASE_URL}/seller.html?id=${id}`,
        'marketplace': `${BASE_URL}/marketplace.html?id=${id}`,
        'restaurant': `${BASE_URL}/restaurant.html?id=${id}`,
        'accommodation': `${BASE_URL}/accommodation.html?id=${id}`,
        'question': `${BASE_URL}/question.html?id=${id}`,
        'club': `${BASE_URL}/community.html?type=club&id=${id}`,
        'hometown': `${BASE_URL}/community.html?type=hometown&id=${id}`
    };
    return urlMap[module] || `${BASE_URL}/${module}.html?id=${id}`;
}
