<template>
  <div class="header group">
    <div class="logo">
      <router-link :to="{ name: 'trangchu' }">
        <img src="@/assets/img/logo.png" alt="Trang chủ Smartphone Store" title="Trang chủ Smartphone Store">
      </router-link>
    </div>

    <div class="content">
      <div class="search-header">
        <form class="input-search" @submit.prevent="handleSearch">
          <div class="autocomplete">
            <input 
              id="search-box" 
              name="search" 
              autocomplete="off" 
              type="text" 
              placeholder="Nhập từ khóa tìm kiếm..."
              v-model="searchQuery"
            >
            <button type="submit">
              <i class="fa fa-search"></i> Tìm kiếm
            </button>
          </div>
        </form>
      </div>

      <div class="tools-member">
        <div class="member">
          <a @click="toggleMemberMenu">
            <i class="fa fa-user"></i>
            <span>{{ isLoggedIn ? userName : 'Tài khoản' }}</span>
          </a>

          <div class="menuMember" v-show="isMemberMenuOpen">
            <template v-if="isLoggedIn">
              <router-link to="/trangnguoidung">Trang người dùng</router-link>
              <router-link to="/lichsumuon">Lịch sử mượn sách</router-link>
              <a @click="handleLogout">Đăng xuất</a>
            </template>
            
            <template v-else>
              <router-link :to="{ path: '/dangnhap' }">Đăng nhập</router-link>
              <router-link :to="{ path: '/dangnhap', query: { view: 'register' } }">Đăng ký</router-link>
            </template>
          </div>
        </div>

        <div class="cart">
          <router-link to="/giomuon">
            <i class="fa fa-shopping-cart"></i>
            <span>Giỏ mượn</span>
            <span class="cart-number">({{ totalCartQuantity }})</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TheHeader",
  data() {
    return {
      searchQuery: "",
      isMemberMenuOpen: false,
      
      // THAY ĐỔI: Dùng userName và trạng thái đăng nhập thay vì object currentUser
      userName: "Người dùng", 
      isLoggedIn: false,

      cartItems: []
    };
  },
  computed: {
  totalCartQuantity() {
        if (!Array.isArray(this.cartItems)) return 0;

        return this.cartItems.length;
    }
  },
  watch: {

    $route() {
      this.isMemberMenuOpen = false;
      this.checkLoginStatus();
      this.loadCart();
    }
  },
    methods: {
// --- 1. HÀM LẤY KEY GIỎ HÀNG ĐỘNG (QUAN TRỌNG) ---
    getCartKey() {
        const maDG = localStorage.getItem('maDG');
        // Nếu có mã độc giả -> cart_maDG, nếu không -> cart
        return maDG ? `cart_${maDG}` : 'cart';
    },
    handleSearch() {
      if (this.searchQuery.trim()) {
        this.$router.push({ 
            name: 'trangchu', 
            query: { search: this.searchQuery.trim() } 
        });
      }
    },
    toggleMemberMenu(event) {
      event.stopPropagation();
      this.isMemberMenuOpen = !this.isMemberMenuOpen;
    },
    closeMenuOnClickOutside(event) {
      const memberDiv = this.$el.querySelector('.member');
      if (memberDiv && !memberDiv.contains(event.target)) {
        this.isMemberMenuOpen = false;
      }
    },

    // --- CẬP NHẬT LOGIC LẤY THÔNG TIN USER (Giống AppHeader.vue) ---
    checkLoginStatus() {
      const token = localStorage.getItem('token');
      const savedName = localStorage.getItem('user_name');

      // Nếu có token thì coi như đã đăng nhập
      if (token) {
        this.isLoggedIn = true;
        this.userName = savedName || "Người dùng"; // Fallback nếu không có tên
      } else {
        this.isLoggedIn = false;
        this.userName = "";
      }
    },

    loadCart() {
      try {
        const key = this.getCartKey(); // Lấy key đúng của user hiện tại
        const list = localStorage.getItem(key);
        if (list) {
          this.cartItems = JSON.parse(list);
        } else {
            this.cartItems = [];
        }
      } catch (e) {
        console.error("Lỗi parse giỏ hàng:", e);
        this.cartItems = [];
      }
    },

    // --- CẬP NHẬT LOGIC ĐĂNG XUẤT (Giống AppHeader.vue) ---
    handleLogout() {
      if (confirm('Xác nhận đăng xuất?')) {
        // 1. Xóa đúng các key mà AppHeader sử dụng
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('user_name');
        localStorage.removeItem('maDG');

        // 2. Cập nhật lại state
        this.isLoggedIn = false;
        this.userName = "";
        this.isMemberMenuOpen = false;
        
        // 3. Chuyển hướng
        this.$router.push('/dangnhap').then(() => {
             // Có thể reset giỏ hàng nếu muốn
             // this.cartItems = [];
        });
      }
    },

    handleStorageChange(event) {
        // Lắng nghe sự thay đổi của token hoặc user_name
        if (event.key === 'token' || event.key === 'user_name') {
            this.checkLoginStatus();
            this.loadCart();
        }
        const currentKey = this.getCartKey();
      if (event.key === 'cart' || !event.key) {
            this.loadCart();
        }
    }
  },
  mounted() {
 
    this.checkLoginStatus();
    this.loadCart();
    document.addEventListener('click', this.closeMenuOnClickOutside);
    window.addEventListener('storage', this.handleStorageChange);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeMenuOnClickOutside);
    window.removeEventListener('storage', this.handleStorageChange);
  },

}
</script>

<style scoped>
@import "@/assets/css/header.css";

.content {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between; 
}

.search-header {
  margin: 0 auto;
  margin-top: 15px;
  flex-grow: 1; 
  max-width: 500px; 
}

.member {
  position: relative; 
  cursor: pointer;
}

.menuMember {
  position: absolute;
  top: 100%; 
  right: 0; 
  background-color: white;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  border-radius: 4px;
  z-index: 999;
  min-width: 180px;
  overflow: hidden;
  margin-top: 10px; 
}

.menuMember::before {
    content: "";
    position: absolute;
    top: -8px;
    right: 20px;
    border-width: 0 8px 8px 8px;
    border-style: solid;
    border-color: transparent transparent white transparent;
}

.menuMember a {
  display: block;
  padding: 12px 20px;
  text-decoration: none;
  color: #333;
  font-size: 14px;
  border-bottom: 1px solid #eee;
  transition: background 0.3s;
}

.menuMember a:last-child {
  border-bottom: none;
}

.menuMember a:hover {
  background-color: #f5f5f5;
  color: #d70018; 
}

.tools-member {
    display: flex;
    align-items: center;
    gap: 20px; 
}
</style>