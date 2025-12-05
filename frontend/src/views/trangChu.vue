<template>
  <div class="home-page">
    <section>
      <div class="banner">
        <div class="owl-carousel owl-theme" ref="mainBanner"></div>
      </div> 
	  <img src="@/assets/img/banner.jpg" alt="" style="width: 100%;">
      <br>

      <div class="companyMenu group flexContain">
        <div v-for="company in companies" :key="company.name" class="company-item">
           <img :src="company.image" :alt="company.name">
        </div>
      </div>

      

      <div class="choosedFilter flexContain" v-if="selectedFilters.length > 0">
        <a id="deleteAllFilter" @click="clearAllFilters"><h3>Xóa bộ lọc</h3></a>
      </div>
      <hr>

      <div class="contain-products" v-show="isShowProductSection"> 
        <div class="filterName">
          <input type="text" placeholder="Lọc trong trang theo tên..." v-model="searchQuery" @input="handleSearch">
        </div>

        <div v-if="loading" style="text-align: center; margin: 20px;">
            <i class="fa fa-spinner fa-spin"></i> Đang tải dữ liệu...
        </div>

<ul id="products" class="homeproduct"> 
    <li v-for="product in paginatedData" :key="product._id" class="product-item">
        <div class="item-img">
            <img v-if="product.hinhAnh" :src="'http://localhost:3000/uploads/' + product.hinhAnh" alt="Book" />
            <img v-else src="https://via.placeholder.com/300x300" alt="No Image" />
        </div>

        <div class="item-info">
            <h3>{{ product.tenSach }}</h3>
            <div class="author" v-if="product.tacGia">{{ product.tacGia }}</div>
            
            <div class="price">{{ formatPrice(product.donGia) }}</div>
            
            </div>

        <button 
            v-if="product.soQuyen > 0" 
            class="btn-add-cart" 
            @click="addToCart(product)">
            <i class="fa fa-cart-plus"></i> Thêm giỏ
        </button>

        <button 
            v-else 
            class="btn-add-cart btn-sold-out" 
            disabled>
            <i class="fa fa-ban"></i> Hết hàng
        </button>
        </li>
</ul>

        <div class="pagination-container" v-if="totalPages > 1">
            <ul class="pagination">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <a class="page-link" @click.prevent="changePage(currentPage - 1)">Trước</a>
                </li>
                
                <li class="page-item" v-for="(page, index) in pageNumbers" :key="index"
                    :class="{ active: page === currentPage, disabled: page === '...' }">
                    <a class="page-link" @click.prevent="changePage(page)">{{ page }}</a>
                </li>

                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                    <a class="page-link" @click.prevent="changePage(currentPage + 1)">Sau</a>
                </li>
            </ul>
        </div>

      </div>
    </section>

    <TheFooter />
    <i class="fa fa-arrow-up" id="goto-top-page" @click="scrollToTop" v-show="showScrollButton"></i>
  </div>
</template>

<script>
import TheHeader from '@/components/DocGia/Header.vue';
import TheFooter from '@/components/DocGia/Footer.vue';
import axios from 'axios'; 
import Swal from 'sweetalert2';
export default {
  name: 'HomeView',
  components: { TheHeader, TheFooter },
  data() {
    return {
      products: [], 
      loading: false,
      
      // LOGIC PHÂN TRANG (Giống ListSach)
      currentPage: 1, 
      pageSize: 12, // Trang chủ nên để 8 hoặc 12 sản phẩm cho đẹp lưới

      companies: [], 
      searchQuery: '',
      isShowProductSection: true,
      selectedFilters: [],
      showScrollButton: false,
      filters: {
        prices: [ { label: 'Dưới 50k', max: 50000 }, { label: '50k - 200k', min: 50000, max: 200000 } ],
        promos: ['Giảm giá', 'Mới ra mắt']
      }
    };
  },
  computed: {
    // 1. Lọc dữ liệu trước (Tìm kiếm & Bộ lọc)
    filteredProducts() {
      if (!this.searchQuery) return this.products;
      return this.products.filter(p => 
        p.tenSach.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },

    // 2. Tính toán phân trang dựa trên kết quả đã lọc
    totalPages() {
      if (!this.filteredProducts.length) return 0;
      return Math.ceil(this.filteredProducts.length / this.pageSize);
    },

    // 3. Cắt dữ liệu để hiển thị (Giống ListSach)
    paginatedData() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredProducts.slice(start, end);
    },

    // 4. Tạo mảng nút trang [1, 2, ..., 5] (Copy y nguyên logic ListSach)
    pageNumbers() {
      const total = this.totalPages;
      const current = this.currentPage;
      const maxVisibleButtons = 3; 

      if (total <= maxVisibleButtons + 2) return Array.from({ length: total }, (_, i) => i + 1);

      let start = Math.max(2, current - Math.floor(maxVisibleButtons / 2));
      let end = Math.min(total - 1, current + Math.floor(maxVisibleButtons / 2));
      
      if (current <= Math.ceil(maxVisibleButtons / 2) + 1) { start = 2; end = maxVisibleButtons + 1; }
      if (current >= total - Math.floor(maxVisibleButtons / 2) - 1) { start = total - maxVisibleButtons; end = total - 1; }

      const pages = [];
      pages.push(1); 
      if (start > 2) pages.push('...'); 
      for (let i = start; i <= end; i++) pages.push(i); 
      if (end < total - 1) pages.push('...');
      pages.push(total); 

      return pages;
    }
  },
  watch: {
      searchQuery() {
      this.currentPage = 1;
    },
'$route.query.search': {
      immediate: true, // Chạy ngay lập tức khi trang vừa load
      handler(newVal) {
        // Nếu trên URL có từ khóa (?search=abc) -> Gán vào biến searchQuery
        if (newVal) {
          this.searchQuery = newVal;
        } else {
          // Nếu không có (người dùng xóa trên URL) -> Để trống
          this.searchQuery = '';
        }}},
    
  },
  mounted() {
    this.fetchProducts(); 
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  },
  methods: {
  addToCart(sach) {
    // 1. KIỂM TRA ĐĂNG NHẬP TRƯỚC
    const token = localStorage.getItem('token');

    if (!token) {
        Swal.fire({
            title: 'Chưa đăng nhập',
            text: "Bạn cần đăng nhập để thêm vào giỏ mượn!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Đăng nhập ngay',
            cancelButtonText: 'Để sau'
        }).then((result) => {
            if (result.isConfirmed) {
                this.$router.push('/dangnhap');
            }
        });
        return; 
    }

 // 2. TẠO KEY ĐỘNG THEO USER (Quan trọng)
    const maDG = localStorage.getItem('maDG');
    // Nếu có mã độc giả thì dùng key riêng, không thì dùng key khách
    const cartKey = maDG ? `cart_${maDG}` : 'cart'; 

    // 3. LẤY GIỎ HÀNG TỪ KEY ĐÓ
    let cart = localStorage.getItem(cartKey) ? JSON.parse(localStorage.getItem(cartKey)) : [];
    
    // Kiểm tra trùng
    const existItem = cart.find(item => item._id === sach._id);
    if (existItem) {
        Swal.fire({ icon: 'info', title: 'Sách đã có trong giỏ', text: 'Mỗi loại chỉ được mượn 1 cuốn!' });
        return;
    }
    
    if (existItem) {
        // --- THAY ĐỔI Ở ĐÂY: KHÔNG TĂNG SỐ LƯỢNG NỮA ---
        Swal.fire({
            icon: 'info',
            title: 'Sách đã có trong giỏ',
            text: 'Bạn chỉ được mượn 1 cuốn cho mỗi đầu sách!',
            showConfirmButton: true
        });
        return; // Dừng hàm tại đây, không thêm gì cả
    } 
    
    // Nếu chưa có thì thêm mới
    cart.push({
        _id: sach._id,
        maSach: sach.maSach,
        tenSach: sach.tenSach,
        donGia: sach.donGia,
        hinhAnh: sach.hinhAnh, 
        tacGia: sach.tacGia,
        soQuyen: sach.soQuyen,
        namXuatBan: sach.namXuatBan,
        quantity: 1 // Vẫn giữ thuộc tính này để code cũ không bị lỗi, nhưng luôn là 1
    });
    
    // Lưu lại và thông báo thành công
    localStorage.setItem(cartKey, JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));

    Swal.fire({
        icon: 'success',
        title: 'Đã thêm vào giỏ!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500
    });},

    async fetchProducts() {
        this.loading = true;
        try {
            // Đổi URL này thành API của bạn
            const response = await axios.get('http://localhost:3000/api/sach');
            this.products = response.data;
        } catch (error) {
            console.error("Lỗi:", error);
        } finally {
            this.loading = false;
        }
    },
    changePage(page) {
      if (page === '...') return;
      if (page < 1) page = 1;
      if (page > this.totalPages) page = this.totalPages;
      this.currentPage = page;
      // Cuộn lên đầu danh sách sản phẩm khi chuyển trang
      window.scrollTo({ top: 500, behavior: 'smooth' }); 
    },
    formatPrice(value) {
        if (!value) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    },
    handleImageError(e) { e.target.src = 'https://via.placeholder.com/300x300?text=No+Image'; },
    handleSearch() { /*...*/ },
    filterByPrice(price) { /*...*/ },
    filterByPromo(promo) { /*...*/ },
    filterByStar(star) { /*...*/ },
    sortProducts(type) { /*...*/ },
    scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); },
    handleScroll() { this.showScrollButton = window.scrollY > 300; },
    clearAllFilters() { this.selectedFilters = []; this.searchQuery = ''; }
  }
};
</script>

<style scoped>
 @import '@/assets/css/style.css';
/* @import '@/assets/css/header.css';  */
@import '@/assets/css/banner.css';
@import '@/assets/css/trangchu.css';
/* --- CSS GRID MỚI (Copy đoạn này vào cuối thẻ style) --- */
/* Thêm đoạn này vào trong thẻ <style scoped> */

.author {
    font-size: 13px;      /* Cỡ chữ nhỏ (bạn có thể chỉnh xuống 12px nếu muốn nhỏ hơn) */
    color: #888;          /* Màu xám nhạt */
    font-weight: 400;     /* Nét chữ mảnh, không in đậm */
    margin-bottom: 8px;   /* Khoảng cách tách biệt với giá tiền bên dưới */
    
    /* Tùy chọn: Thêm in nghiêng nhìn cho nghệ thuật hơn */
    /* font-style: italic; */ 
}
.homeproduct {
    display: grid !important;
    /* THAY ĐỔI DÒNG NÀY: Số 4 nghĩa là 4 cột đều nhau */
    grid-template-columns: repeat(4, 1fr); 
    gap: 20px; /* Khoảng cách giữa các sách */
    list-style: none !important;
    padding: 0;
    margin: 0;
}

.product-item {
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 10px;
    display: flex;       /* Để căn chỉnh nội dung bên trong thẻ dọc */
    flex-direction: column;
    align-items: center; /* Căn giữa ảnh và chữ */
    text-align: center;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    height: 100%;        /* Để các thẻ cao bằng nhau */
}

/* Chỉnh ảnh không bị to quá khổ */
.item-img {
    width: 100%;
    height: 200px; /* Chiều cao cố định cho vùng ảnh */
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 10px;
}

.item-img img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain; /* Giữ tỉ lệ ảnh */
}

.product-item h3 {
    font-size: 16px;
    margin: 10px 0;
    min-height: 40px; /* Giữ chỗ cho tên sách 2 dòng */
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.price {
    color: #d0011b; /* Màu đỏ giá tiền */
    font-weight: bold;
    font-size: 18px;
    margin-top: auto; /* Đẩy giá tiền xuống đáy */
}
.pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 30px;
}
.pagination {
    display: flex;
    list-style: none;
    padding: 0;
}
.page-item {
    margin: 0 5px;
}
.page-link {
    display: block;
    padding: 8px 16px;
    background: #fff;
    border: 1px solid #ddd;
    color: #333;
    cursor: pointer;
    border-radius: 4px;
    user-select: none;
}
.page-item.active .page-link {
    background-color: #ff9c00; /* Màu cam chủ đạo */
    color: white;
    border-color: #ff9c00;
}
.page-item.disabled .page-link {
    background-color: #eee;
    color: #aaa;
    cursor: not-allowed;
}
#goto-top-page {
  cursor: pointer;
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #333;
  color: white;
  padding: 10px;
  border-radius: 5px;
  z-index: 999;
}
.product-item {
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    height: 100%;
    
    /* QUAN TRỌNG: Để định vị nút tuyệt đối bên trong */
    position: relative; 
    overflow: hidden; /* Ẩn nút khi nó trượt ra ngoài */
    transition: all 0.3s ease;
}

/* Hiệu ứng khi di chuột vào thẻ sách: Nổi lên một chút */
.product-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.15);
    border-color: #ff9c00;
}

/* Style cho Nút bấm */
.btn-add-cart {
    position: absolute; /* Nổi lên trên */
    bottom: 10px;       /* Cách đáy 10px */
    left: 50%;
    transform: translateX(-50%) translateY(50px); /* Ban đầu đẩy xuống dưới để ẩn */
    
    background: linear-gradient(to right, #ff9c00, #ff6a00); /* Màu chuyển sắc đẹp hơn */
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 25px; /* Bo tròn hình viên thuốc */
    font-weight: bold;
    font-size: 14px;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(255, 156, 0, 0.4);
    white-space: nowrap;
    opacity: 0; /* Ban đầu trong suốt */
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); /* Hiệu ứng nảy nhẹ */
    z-index: 10;
}

/* KHI HOVER VÀO SÁCH THÌ NÚT HIỆN RA */
.product-item:hover .btn-add-cart {
    opacity: 1;
    transform: translateX(-50%) translateY(0); /* Trượt lên vị trí gốc */
}

.btn-add-cart:hover {
    background: linear-gradient(to right, #e68a00, #e65c00);
    box-shadow: 0 6px 15px rgba(255, 156, 0, 0.6);
    transform: translateX(-50%) scale(1.05) !important; /* Phóng to nhẹ khi hover vào nút */
}

/* Chỉnh lại item-info để chừa chỗ cho hiệu ứng */
.item-info {
    width: 100%;
    padding-bottom: 10px; /* Tạo khoảng trống để nút không che chữ khi hiện lên */
}
/* Style riêng cho nút Hết hàng */
.btn-sold-out {
    background: #95a5a6 !important; /* Màu xám */
    cursor: not-allowed !important; /* Con trỏ chuột báo cấm */
    box-shadow: none !important;
}

/* Khi hover vào nút hết hàng thì không phóng to như nút thường */
.btn-sold-out:hover {
    background: #7f8c8d !important;
    transform: translateX(-50%) translateY(0) !important; /* Giữ nguyên vị trí, không scale */
}
</style>