<template>
  <section>
    <h1 class="text-xl font-bold mb-6">Danh sách sản phẩm</h1>

    <div class="filter-panel">
      <h2 class="text-lg font-semibold text-gray-700 mb-4">Bộ lọc sản phẩm</h2>

      <div class="flex gap-6 mb-6">
        <input
          v-model="filters.keyword"
          type="text"
          class="input-box-2 flex-1 px-5 py-3 w-[300px]"
          placeholder="Từ khóa"
        />

        <input
          v-model.number="filters.minPrice"
          type="number"
          min="0"
          class="input-box min-w-[160px] px-5 py-3"
          placeholder="Giá min"
        />

        <input
          v-model.number="filters.maxPrice"
          type="number"
          min="0"
          class="input-box min-w-[160px] px-5 py-3"
          placeholder="Giá max"
        />

        <input
          v-model.number="filters.minDiscount"
          type="number"
          min="0"
          max="100"
          class="input-box w-[200px] px-5 py-3"
          placeholder="Giảm giá tối thiểu (đ)"
        />

        <input
          v-model.number="filters.minRating"
          type="number"
          step="0.1"
          min="0"
          max="5"
          class="input-box w-[160px] px-5 py-3"
          placeholder="Đánh giá tối thiểu"
        />
      </div>
    </div>

    <!-- Button -->
    <div class="flex justify-end gap-3 mb-6">
      <button @click="clearFilters" class="btn-clear">Xóa bộ lọc</button>
      <button @click="applyFilters" class="btn-apply">Áp dụng</button>
    </div>

    <!-- Product List -->
    <div v-if="pending" class="text-center my-6">Đang tải...</div>
    <div v-else class="product-grid">
      <div v-for="item in products" :key="item.id" class="product-card">
        <div v-if="getDiscountRate(item) > 0" class="discount-badge">
          -{{ getDiscountRate(item) }}%
        </div>

        <div class="image-box">
          <img :src="item.image" :alt="item.name" />
        </div>

        <p class="product-name">{{ item.name }}</p>

        <div class="price-row">
          <span class="price">₫{{ formatPrice(item.price) }}</span>
          <span v-if="item.price_original" class="price-original">
            ₫{{ formatPrice(item.price_original) }}
          </span>
        </div>

        <p
          v-if="item.price_original && item.price_original > item.price"
          class="saving-text"
        >
          Tiết kiệm tới
          <strong>₫{{ formatPrice(item.price_original - item.price) }}</strong>
        </p>

        <div class="meta-row">
          <span class="sold">Đã bán {{ item.sold || 0 }}</span>
          <span class="rating">⭐ {{ (item.rating_average ?? 0).toFixed(1) }}</span>
        </div>
      </div>
    </div>
    
    <!-- Pagination -->
    <div class="flex justify-center mt-6">
      <UPagination
        v-model:page="page"
        :total="totalItems"
        :page-size="pageSize"
        :show-ellipsis="true"
        @update:page="handlePageChange"
        class="bg-primary rounded-lg px-2 py-1 text-white"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ProductService } from "~/composables/ProductService";
import debounce from "lodash/debounce";

const { getProducts, searchProducts } = ProductService();

const page = ref(1);
const products = ref<any[]>([]);
const pending = ref(true);
const totalItems = ref(0);
const pageSize = 20;

const filters = ref({
  keyword: "",
  minPrice: undefined as number | undefined,
  maxPrice: undefined as number | undefined,
  minDiscount: undefined as number | undefined,
  minRating: undefined as number | undefined,
});

function getPayload() {
  const f = filters.value;
  const payload: any = { page: page.value, limit: pageSize };
  if (f.keyword) payload.keyword = f.keyword;
  if (typeof f.minPrice === "number") payload.minPrice = f.minPrice;
  if (typeof f.maxPrice === "number") payload.maxPrice = f.maxPrice;
  if (typeof f.minDiscount === "number") payload.minDiscount = f.minDiscount;
  if (typeof f.minRating === "number") payload.minRating = f.minRating;
  return payload;
}

async function fetchData() {
  pending.value = true;
  try {
    const payload = getPayload();
    const hasFilter = Object.values(payload).some(
      (v) => v !== undefined && v !== null && v !== ""
    );
    const res: any = hasFilter
      ? await searchProducts(payload)
      : await getProducts(page.value);
    products.value = res.data ?? [];
    totalItems.value = res.pagination.total ?? 0;
  } finally {
    pending.value = false;
  }
}

function handlePageChange(newPage: number) {
  const maxPage = Math.max(1, Math.ceil(totalItems.value / pageSize));
  if (newPage > maxPage) {
    page.value = maxPage;
  } else {
    page.value = newPage;
  }
  fetchData();
}

function clearFilters() {
  filters.value = {
    keyword: "",
    minPrice: undefined,
    maxPrice: undefined,
    minDiscount: undefined,
    minRating: undefined,
  };
  page.value = 1;
  fetchData();
}

function applyFilters() {
  page.value = 1;
  fetchData();
}

const debouncedFetch = debounce(() => {
  page.value = 1;
  fetchData();
}, 300);

watch(filters, debouncedFetch, { deep: true });

fetchData();

function formatPrice(val: number) {
  if (val == null) return "0";
  return Math.round(val).toLocaleString("vi-VN");
}
function getDiscountRate(item: any): number {
  const apiRate = Number(item?.discount_rate ?? 0);
  if (apiRate > 0) return apiRate;
  const pOrig = Number(item?.price_original ?? 0);
  const p = Number(item?.price ?? 0);
  if (pOrig > 0 && pOrig > p) return Math.round(((pOrig - p) / pOrig) * 100);
  return 0;
}
</script>

<style scoped>
.filter-panel {
  backdrop-filter: blur(6px);
}

.input-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}

.input-box {
  padding: 10px 14px;
  width: 180px;
  margin: 5px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 14px;
  background-color: #fafafa;
  transition: all 0.2s ease;
}

.input-box-2 {
  padding: 10px 14px;
  margin: 5px;
  width: 280px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 14px;
  background-color: #fafafa;
  transition: all 0.2s ease;
}

.input-box:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
  background-color: #fff;
}

.btn-clear {
  padding: 10px 18px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  background: #f9fafb;
  color: #374151;
  font-weight: 600;
  transition: all 0.2s;
}
.btn-clear:hover {
  background: #e5e7eb;
}

.btn-apply {
  padding: 10px 18px;
  border-radius: 12px;
  background: #3b82f6;
  color: #fff;
  font-weight: 600;
  transition: all 0.2s;
}
.btn-apply:hover {
  background: #2563eb;
}
</style>

<style scoped>
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  max-width: 1200px;
  margin: 16px auto;
  padding: 0 12px;
}

.saving-text {
  color: #dc2626;
  font-size: 15px;
  margin-top: 6px;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  font-size: 13px;
  color: #4b5563;
}

.meta-row .sold {
  color: #6b7280;
  font-size: 15px;
}

.meta-row .rating {
  color: #f59e0b;
  font-weight: 600;
  font-size: 15px;
}

/* Card */
.product-card {
  position: relative;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 12px;
  background: #fff;
  display: flex;
  flex-direction: column;
  min-height: 360px;
  transition: box-shadow 0.18s;
}
.product-card:hover {
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
}

.discount-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(180deg, #ff4d4f, #d9363e);
  color: #fff;
  padding: 6px 10px;
  font-weight: 800;
  font-size: 15px;
  border-radius: 8px;
  z-index: 10;
  box-shadow: 0 4px 10px rgba(217, 48, 37, 0.2);
}

.image-box {
  width: 100%;
  padding-top: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 6px;
  background: #fafafa;
}
.image-box img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-name {
  font-weight: 700;
  margin: 10px 0 6px;
  font-size: 14px;
  line-height: 1.3em;
  height: 2.6em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.price {
  color: #e53935;
  font-weight: 800;
  font-size: 18px;
}
.price-original {
  color: #8a8a8a;
  text-decoration: line-through;
  font-size: 13px;
}

section {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}
</style>
