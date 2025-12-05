import { createWebHistory, createRouter } from "vue-router";
import Swal from 'sweetalert2'; 
import NXBIndex from "@/views/NXBIndex.vue";
import SachIndex from "@/views/SachIndex.vue";
import NhanVienIndex from "@/views/NhanVienIndex.vue";
import DocGiaIndex from "@/views/DocGiaIndex.vue";
import TheoDoiMuonIndex from "@/views/TheoDoiMuonIndex.vue";
import TrangChu from "@/views/trangChu.vue";
import DangNhap from "@/views/DangNhap.vue";
import GioMuon from "@/views/GioMuon.vue";
import LichSuMuon from "@/views/LichSuMuon.vue"; 
import TrangNguoiDung from "@/views/SuaThongTin.vue"; 
import TrangChuAdmin from "@/views/TrangChuAdmin.vue"; 

const routes = [
  {
    path: "/",
    name: "index",
    component: () => import("@/views/trangChu.vue"),
  },
  {
    path: "/trangnguoidung",
    name: "TrangNguoiDung",
    component: TrangNguoiDung,
  },
  {
    path: "/lichsumuon",
    name: "LichSuMuon",
    component: LichSuMuon,
  },
  {
    path: "/dangnhap",
    name: "dangnhap",
    component: DangNhap,
  },
  {
    path: '/giomuon',
    name: 'giomuon',
    component: GioMuon,
    meta: { requiresAuth: true } 
  },
  {
    path: "/trangchu",
    name: "trangchu",
    component: TrangChu,
  },

  // --- CÁC TRANG QUẢN TRỊ (ADMIN PANEL) ---
  
  // 1. Nhà xuất bản (Chỉ Admin)
  {
    path: "/nhaxuatban",
    name: "nxbindex",
    component: NXBIndex,
    meta: { requiresAuth: true, isAdmin: true }
  },
  {
    path: "/nhaxuatban/add",
    name: "nhaxuatban.add",
    component: () => import("@/views/NXBAdd.vue"),
    meta: { requiresAuth: true, isAdmin: true }
  },
  {
    path: "/nhaxuatban/:id",
    name: "nhaxuatban.edit",
    component: () => import("@/views/NXBEdit.vue"),
    props: true,
    meta: { requiresAuth: true, isAdmin: true }
  },

  // 2. Sách (Chỉ Admin)
  {
    path: "/sach",
    name: "sachindex",
    component: SachIndex,
    meta: { requiresAuth: true, isAdmin: true }
  },
  {
    path: "/sach/add",
    name: "sach.add",
    component: () => import("@/views/AddSach.vue"),
    meta: { requiresAuth: true, isAdmin: true }
  },
  {
    path: "/sach/:id",
    name: "sach.edit",
    component: () => import("@/views/EditSach.vue"),
    props: true,
    meta: { requiresAuth: true, isAdmin: true }
  },

  // 3. Nhân viên (Chỉ Admin)
  {
    path: "/nhanvien",
    name: "nhanvienindex",
    component: NhanVienIndex,
    meta: { requiresAuth: true, isAdmin: true }
  },
  {
    path: "/nhanvien/add",
    name: "nhanvien.add",
    component: () => import("@/views/AddNhanVien.vue"),
    meta: { requiresAuth: true, isAdmin: true }
  },
  {
    path: "/nhanvien/:id",
    name: "nhanvien.edit",
    component: () => import("@/views/EditNhanVien.vue"),
    props: true,
    meta: { requiresAuth: true, isAdmin: true }
  },

  // 4. Độc giả (Chỉ Admin)
  {
    path: "/docgia",
    name: "docgiaindex",
    component: DocGiaIndex,
    meta: { requiresAuth: true, isAdmin: true }
  },
  {
    path: "/docgia/add",
    name: "docgia.add",
    component: () => import("@/views/DocGiaAdd.vue"),
    meta: { requiresAuth: true, isAdmin: true }
  },
  {
    path: "/docgia/:id",
    name: "docgia.edit",
    component: () => import("@/views/EditDocGia.vue"),
    props: true,
    meta: { requiresAuth: true, isAdmin: true }
  },

  // 5. Theo dõi mượn sách (Admin VÀ Nhân viên đều vào được)
  {
    path: "/theodoimuon",
    name: "theodoimuonindex",
    component: TheoDoiMuonIndex,
    // Vẫn giữ isAdmin: true để chặn người dùng thường (độc giả)
    meta: { requiresAuth: true, isAdmin: true } 
  },

  // Trang chủ Admin
  {
    path: "/trangchuadmin",
    name: "trangchuadmin",
    component: TrangChuAdmin,
    meta: { requiresAuth: true, isAdmin: true }
  },

  {
    path: "/:pathMatch(.*)*",
    name: "notfound",
    component: () => import("@/views/NotFound.vue"),
    meta: { requiresAuth: true }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// --- CẤU HÌNH PHÂN QUYỀN (QUAN TRỌNG) ---
// ... (Các phần import và routes giữ nguyên như code của bạn)

// --- CẤU HÌNH PHÂN QUYỀN NÂNG CAO ---
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role'); // Ví dụ: 'admin', 'muontra', 'khosach', 'thuthu'

  // 1. KIỂM TRA ĐĂNG NHẬP (Chặn khách vãng lai)
  if (to.matched.some(record => record.meta.requiresAuth) && !token) {
      Swal.fire({
        icon: 'warning',
        title: 'Yêu cầu đăng nhập',
        text: 'Bạn cần đăng nhập để truy cập!',
        confirmButtonText: 'Đăng nhập',
        confirmButtonColor: '#d35400',
        allowOutsideClick: false
      }).then((result) => {
         next({ path: '/dangnhap', query: { redirect: to.fullPath } });
      });
      return;
  }

  // 2. KIỂM TRA QUYỀN VÀO TRANG QUẢN TRỊ (Admin Panel)
  // Chỉ xử lý khi route có meta: { isAdmin: true }
  if (to.matched.some(record => record.meta.isAdmin)) {
      
      // --- TRƯỜNG HỢP 1: ADMIN (Toàn quyền) ---
      if (role === 'admin') { 
          next(); 
          return;
      }

      // --- TRƯỜNG HỢP 2: NHÂN VIÊN MƯỢN TRẢ ('muontra') ---
      // Chỉ được vào: Theo dõi mượn sách
      if (role === 'muontra') {
          if (to.path.includes('/theodoimuon')) {
              next();
              return;
          } else {
              baoLoiTruyCap('Chức vụ Mượn Trả chỉ được truy cập Theo dõi mượn sách!');
             return next({ path: '/theodoimuon' });
          }
      }

      // --- TRƯỜNG HỢP 3: QUẢN LÝ KHO SÁCH ('khosach') ---
      // Chỉ được vào: Quản lý sách
      if (role === 'khosach') {
          if (to.path.includes('/sach')) {
              next();
              return;
          } else {
              baoLoiTruyCap('Chức vụ Kho Sách chỉ được truy cập Quản lý Sách!');
               return next({ path: '/sach' });
          }
      }

      // --- TRƯỜNG HỢP 4: THỦ THƯ ('thuthu') ---
      // Được vào tất cả TRỪ: Nhân viên, Độc giả, Nhà xuất bản
      if (role === 'thuthu') {
          // Danh sách các trang BỊ CẤM
          const trangCam = ['/nhanvien', '/docgia', '/nhaxuatban'];
          
          // Kiểm tra xem đường dẫn muốn vào có nằm trong danh sách cấm không
          const dangVaoTrangCam = trangCam.some(path => to.path.includes(path));

          if (dangVaoTrangCam) {
              baoLoiTruyCap('Thủ thư không được phép quản lý Nhân sự, Độc giả hoặc NXB!');
               return next({ path: '/sach' });
          } else {
              // Nếu không phải trang cấm (Ví dụ vào /sach, /theodoimuon, /trangchuadmin) -> Cho qua
              next();
              return;
          }
      }

      // --- TRƯỜNG HỢP 5: KHÔNG CÓ QUYỀN (Role lạ hoặc User thường) ---
      baoLoiTruyCap('Bạn không có quyền truy cập trang quản trị!');
      return next({ path: '/trangchu' });
  }

 
  next();
});

// Hàm hiển thị thông báo lỗi (Viết tách ra cho gọn code)
function baoLoiTruyCap(message) {
    Swal.fire({
        icon: 'error',
        title: 'Truy cập bị từ chối',
        text: message,
    });
}



export default router;