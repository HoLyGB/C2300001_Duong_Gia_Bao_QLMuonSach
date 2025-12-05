<template>
  <div class="history-page-wrapper">
    <div class="banner-section">
      <div class="container text-center py-5">
        <h2 class="text-white">Lịch Sử Mượn Sách</h2>
      </div>
    </div>

    <div class="container mt-4 mb-5">
      <div class="tile p-4 shadow-sm bg-white rounded">
        <h4 class="tile-title mb-4 border-bottom pb-2">
          <i class="fa fa-list-alt"></i> Danh sách phiếu mượn của bạn
        </h4>

        <div class="table-responsive">
          <table class="table table-hover table-bordered">
            <thead class="thead-light">
              <tr>
                <th>STT</th>
                <th>Sách</th>
                <th>Ngày mượn</th>
                <th>Ngày trả dự kiến</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in sortedLichSu" :key="item._id">
                <td>{{ index + 1 }}</td>
                
                <td>
                  <div class="d-flex align-items-center">
                    <img 
                      v-if="item.maSach?.hinhAnh"
                      :src="'http://localhost:3000/uploads/' + item.maSach.hinhAnh" 
                      class="img-book mr-3"
                    >
                    <div>
                      <span class="font-weight-bold d-block">
                        {{ item.maSach?.tenSach || 'Sách đã bị xóa' }}
                      </span>
                      <small class="text-muted" v-if="item.maSach?.tacGia">
                        {{ item.maSach.tacGia }}
                      </small>
                    </div>
                  </div>
                </td>

                <td>{{ formatDate(item.ngayMuon) }}</td>
                <td>{{ formatDate(item.ngayTra) }}</td>

                <td>
                  <span :class="getStatusClass(item.trangThai)">
                    {{ item.trangThai }}
                  </span>
                </td>

                <td>
                  <button 
                    v-if="item.trangThai === 'Chờ duyệt'"
                    class="btn btn-outline-danger btn-sm"
                    @click="huyYeuCau(item)"
                  >
                    <i class="fa fa-times"></i> Hủy đơn
                  </button>
                  
                  <span v-else class="text-muted small">
                    {{ getActionMessage(item.trangThai) }}
                  </span>
                </td>
              </tr>

              <tr v-if="lichSu.length === 0">
                <td colspan="6" class="text-center py-4">
                  <i class="fa fa-inbox fa-3x text-muted mb-3"></i>
                  <p>Bạn chưa mượn cuốn sách nào.</p>
                  <router-link to="/trangchu" class="btn btn-primary btn-sm">
                    Đi mượn sách ngay
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2';
import TheoDoiMuonService from "@/services/theodoimuon.service";
import SachService from "@/services/sach.service";

export default {
  name: "LichSuMuon",
  data() {
    return {
      lichSu: [],
      maDG: localStorage.getItem('maDG'),
    };
  },
  computed: {
    // Sắp xếp ngày mới nhất lên đầu
    sortedLichSu() {
      return [...this.lichSu].sort((a, b) => {
        return new Date(b.ngayMuon) - new Date(a.ngayMuon);
      });
    }
  },
  mounted() {
    this.fetchHistory();
    window.scrollTo(0, 0);
  },
  methods: {
    async fetchHistory() {
      if (!this.maDG) {
        // Chưa đăng nhập thì đá về login
        this.$router.push('/dangnhap');
        return;
      }

      try {
        // Gọi API lấy danh sách theo Mã Độc Giả
        // Lưu ý: Backend phải dùng hàm find() mà mình đã sửa (có populate) thì mới hiện tên sách
        const response = await TheoDoiMuonService.getAll(); 
        
        // Lọc lại ở Frontend cho chắc chắn chỉ lấy của người này 
        // (Hoặc tốt nhất là gọi API riêng: TheoDoiMuonService.findByMaDocGia(this.maDG))
        this.lichSu = response.filter(item => {
            // Xử lý so sánh ID an toàn (vì có thể là Object hoặc String)
            const idDocGiaItem = item.maDocGia?._id || item.maDocGia;
            return idDocGiaItem === this.maDG;
        });

      } catch (error) {
        console.error(error);
        // Swal.fire('Lỗi', 'Không thể tải lịch sử.', 'error');
      }
    },

    // --- LOGIC HỦY YÊU CẦU ---
    async huyYeuCau(item) {
      const result = await Swal.fire({
        title: 'Hủy yêu cầu mượn?',
        text: `Bạn muốn hủy mượn cuốn "${item.maSach?.tenSach || 'này'}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Đồng ý hủy',
        cancelButtonText: 'Giữ lại'
      });

      if (result.isConfirmed) {
        try {
          // 1. Cập nhật trạng thái phiếu mượn thành "Đã hủy"
          // Lưu ý: Cần gửi đủ thông tin để tránh bị null ngày tháng (như mình đã fix ở bài trước)
          const updatePayload = {
            ...item, // Copy lại dữ liệu cũ
            trangThai: "Đã hủy"
          };
          // Xóa _id và object maSach/maDocGia để tránh lỗi khi gửi lên (chỉ giữ lại ID string nếu cần)
          // Nhưng với hàm extractTheoDoiData thông minh đã sửa, ta chỉ cần gửi cái cần thiết:
          await TheoDoiMuonService.update(item._id, { trangThai: "Đã hủy" });

          // 2. HOÀN TRẢ SỐ LƯỢNG SÁCH (+1)
          // Kiểm tra xem sách còn tồn tại không
          if (item.maSach && item.maSach._id) {
             const bookId = item.maSach._id;
             
             // Lấy thông tin sách mới nhất từ DB
             const sachHienTai = await SachService.get(bookId);
             
             // Cộng số lượng
             const dataHoiPhuc = {
                 ...sachHienTai,
                 soQuyen: (sachHienTai.soQuyen || 0) + 1
             };
             delete dataHoiPhuc._id; // Nhớ xóa ID

             await SachService.update(bookId, dataHoiPhuc);
          }

          Swal.fire('Đã hủy!', 'Yêu cầu mượn sách đã được hủy.', 'success');
          
          // Tải lại danh sách
          this.fetchHistory();

        } catch (error) {
          console.error(error);
          Swal.fire('Lỗi', 'Không thể hủy yêu cầu lúc này.', 'error');
        }
      }
    },

    // --- HÀM PHỤ TRỢ GIAO DIỆN ---
    formatDate(dateString) {
      if (!dateString) return "---";
      return new Date(dateString).toLocaleDateString('vi-VN');
    },
    
    getStatusClass(status) {
      switch (status) {
        case 'Đang mượn': return 'badge badge-warning p-2';
        case 'Đã trả': return 'badge badge-success p-2';
        case 'Chờ duyệt': return 'badge badge-primary p-2'; // Màu xanh dương
        case 'Đã hủy': return 'badge badge-secondary p-2'; // Màu xám
        case 'Đã từ chối': return 'badge badge-danger p-2';
        default: return 'badge badge-dark p-2';
      }
    },

    getActionMessage(status) {
      if (status === 'Đang mượn') return 'Đang đọc sách';
      if (status === 'Đã trả') return 'Hoàn tất';
      if (status === 'Đã hủy') return 'Bạn đã hủy';
      if (status === 'Đã từ chối') return 'Admin từ chối';
      return '';
    }
  }
};
</script>

<style scoped>
.history-page-wrapper {
  background-color: #f5f5fa;
  min-height: 100vh;
}
.banner-section {
  background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%); /* Màu banner xanh mát */
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tile {
  border-top: 3px solid #007bff; /* Viền xanh trên cùng */
}
.img-book {
  width: 50px;
  height: 70px;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.badge {
  font-size: 0.9rem;
}
</style>