<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const userName = ref("Người dùng");
const userRole = ref(""); // 1. Thêm biến để lưu chức vụ

onMounted(() => {
  // Lấy tên người dùng
  const savedName = localStorage.getItem('user_name');
  if (savedName) {
    userName.value = savedName;
  }

  // 2. Lấy chức vụ từ LocalStorage
  const savedRole = localStorage.getItem('role');
  if (savedRole) {
    userRole.value = savedRole; // Ví dụ: 'admin', 'thuthu', 'khosach', 'muontra'
  }
});

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('user_name');
  router.push('/dangnhap');
};

// 3. Hàm tiện ích để kiểm tra quyền (giúp code html gọn hơn)
// Ví dụ: checkRole(['admin', 'thuthu']) -> Trả về true nếu user là admin hoặc thuthu
const checkRole = (roles) => {
    return roles.includes(userRole.value);
};
</script>

<template>
  <header class="app-header">
    <a class="app-sidebar__toggle" href="#" data-toggle="sidebar" aria-label="Hide Sidebar"></a>
    
    <ul class="app-nav">
      <li>
        <a class="app-nav__item" href="#" @click.prevent="logout" title="Đăng xuất">
            <i class='bx bx-log-out bx-rotate-180'></i>
        </a>
      </li>
    </ul>
  </header>

  <aside class="app-sidebar">
    <div class="app-sidebar__user">
      <div style="padding-left: 10px;">
        <p class="app-sidebar__user-name"><b>{{ userName }}</b></p>
        <p class="app-sidebar__user-designation">
            <span v-if="userRole === 'admin'">Quản trị viên</span>
            <span v-else-if="userRole === 'thuthu'">Thủ thư</span>
            <span v-else-if="userRole === 'khosach'">Quản lý kho</span>
            <span v-else-if="userRole === 'muontra'">Nhân viên mượn trả</span>
            <span v-else>Nhân viên</span>
        </p>
      </div>
    </div>
    <hr>
    
    <ul class="app-menu">
      
      <li v-if="checkRole(['admin'])">
        <router-link to="/trangchuadmin" class="app-menu__item" active-class="active">
          <i class='app-menu__icon bx bx-home'></i>
          <span class="app-menu__label">Trang chủ Admin</span>
        </router-link>
      </li>

      <li v-if="checkRole(['admin'])">
        <router-link to="/nhanvien" class="app-menu__item" active-class="active">
          <i class='app-menu__icon bx bx-id-card'></i>
          <span class="app-menu__label">Quản lý nhân viên</span>
        </router-link>
      </li>

      <li v-if="checkRole(['admin'])">
        <router-link to="/docgia" class="app-menu__item" active-class="active">
          <i class='app-menu__icon bx bx-user-voice'></i>
          <span class="app-menu__label">Quản lý người đọc</span>
        </router-link>
      </li>

      <li v-if="checkRole(['admin'])">
        <router-link to="/nhaxuatban" class="app-menu__item" active-class="active">
          <i class='app-menu__icon bx bx-buildings'></i>
          <span class="app-menu__label">Quản lý NXB</span>
        </router-link>
      </li>

      <li v-if="checkRole(['admin', 'khosach', 'thuthu'])">
        <router-link to="/sach" class="app-menu__item" active-class="active">
          <i class='app-menu__icon bx bx-book'></i>
          <span class="app-menu__label">Quản lý sách</span>
        </router-link>
      </li>

      <li v-if="checkRole(['admin', 'muontra', 'thuthu'])">
        <router-link to="/theodoimuon" class="app-menu__item" active-class="active">
          <i class='app-menu__icon bx bx-clipboard'></i>
          <span class="app-menu__label">Theo dõi mượn sách</span>
        </router-link>
      </li>

    </ul>
  </aside>
</template>

<style scoped>
  @import "@/assets/form.css";
  @import "@/assets/main.css";
  
  .app-menu__item.active {
      background: #009688;
      color: #fff;
  }
  .app-sidebar__user {
    display: flex;
    align-items: center;
    padding: 15px;
  }
  .app-sidebar__user-name {
    margin-bottom: 5px;
    font-size: 16px;
    white-space: nowrap;
  }
  .app-sidebar__user-designation {
      font-size: 12px;
      color: #ccc;
  }
</style>