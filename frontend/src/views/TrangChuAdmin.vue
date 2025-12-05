<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h2>Tổng quan</h2>
      <p class="text-muted">Chào mừng trở lại, Administrator!</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card blue">
        <div class="stat-icon">📚</div>
        <div class="stat-info">
          <h3>{{ tongSoSach }}</h3>
          <p>Sách</p>
        </div>
      </div>

      <div class="stat-card green">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <h3>{{ tongDocGia }}</h3>
          <p>Độc giả</p>
        </div>
      </div>

      <div class="stat-card orange">
        <div class="stat-icon">🔄</div>
        <div class="stat-info">
          <h3>{{ soDangMuon }}</h3>
          <p>Đang mượn</p>
        </div>
      </div>

      <div class="stat-card red">
        <div class="stat-icon">⚠️</div>
        <div class="stat-info">
          <h3>{{ soQuaHan }}</h3> <p>Quá hạn</p>
        </div>
      </div>
    </div>

    <div class="content-grid">
      
      <div class="recent-loans card-panel">
        <div class="card-header">
          <h3>Mượn gần đây</h3>
          <button class="btn-link" @click="$router.push('/theodoimuon')">Xem hết</button>
        </div>
        
        <table class="styled-table">
          <thead>
            <tr>
              <th>Độc giả</th>
              <th>Sách</th>
              <th>Ngày mượn</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(loan, index) in recentLoans" :key="index">
              <td class="td-name" style="color: #009688; font-weight: bold;">
                 {{ loan.tenDocGiaHienThi }}
              </td>
              
              <td class="td-book">
                {{ loan.tenSachHienThi }}
              </td>
              
              <td>{{ formatDate(loan.ngayMuon) }}</td>
              
              <td>
                <span :class="['status-badge', getStatusClass(loan.trangThai)]">
                  {{ loan.trangThai }}
                </span>
              </td>
            </tr>
            
            <tr v-if="recentLoans.length === 0">
                <td colspan="4" style="text-align: center;">Chưa có dữ liệu mượn sách</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="quick-actions card-panel">
        <h3>Tác vụ</h3>
        <div class="action-buttons">
          <button class="btn-action" @click="$router.push('/sach')">
            <span class="icon">+</span> Thêm sách
          </button>
          <button class="btn-action" @click="$router.push('/docgia')">
            <span class="icon">+</span> Thêm độc giả
          </button>
          <button class="btn-action" @click="$router.push('/theodoimuon')">
            <span class="icon">📝</span> Quản lý mượn trả
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SachService from "@/services/sach.service";
import DocGiaService from "@/services/docgia.service";
import TheoDoiMuonService from "@/services/theodoimuon.service";

export default {
  name: "TrangChuAdmin",
  data() {
    return {
      tongSoSach: 0,
      tongDocGia: 0,
      soDangMuon: 0,
      soQuaHan: 0,
      recentLoans: [], // Mảng chứa 5 phiếu mượn mới nhất
    };
  },
  methods: {
    // 1. Hàm chính: Lấy dữ liệu và Xử lý logic
    async getDashboardStats() {
      try {
        // --- Gọi song song các API ---
        const [books, readers, loans] = await Promise.all([
            SachService.getAll(),
            DocGiaService.getAll(),
            TheoDoiMuonService.getAll()
        ]);

        // --- LOGIC QUAN TRỌNG: Tự động kiểm tra Quá hạn ---
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Đưa về đầu ngày để so sánh chính xác

        // Duyệt qua danh sách phiếu mượn để xử lý dữ liệu mới nhất
        const processedLoans = loans.map(loan => {
            const ngayTra = new Date(loan.ngayTra);
            
            // Nếu đang mượn MÀ ngày trả nhỏ hơn hôm nay => QUÁ HẠN
            if (loan.trangThai === 'Đang mượn' && ngayTra < today) {
                // 1. Cập nhật hiển thị tạm thời trên giao diện
                loan.trangThai = 'Quá hạn';
                
                // 2. Gọi API cập nhật ngầm vào Database (để lần sau vào vẫn đúng)
                TheoDoiMuonService.update(loan._id, { trangThai: 'Quá hạn' })
                    .catch(err => console.log("Lỗi update ngầm: ", err));
            }
            return loan;
        });

        // --- Cập nhật Thống kê (Dựa trên danh sách đã xử lý) ---
        this.tongSoSach = books.length;
        this.tongDocGia = readers.length;
        
        // Đếm lại số lượng dựa trên trạng thái mới nhất
        this.soDangMuon = processedLoans.filter(l => l.trangThai === 'Đang mượn').length;
        this.soQuaHan = processedLoans.filter(l => l.trangThai === 'Quá hạn').length;

        // --- Xử lý Bảng "Mượn gần đây" ---
        // B1: Sắp xếp theo ngày mượn (Mới nhất lên đầu)
        const sortedLoans = processedLoans.sort((a, b) => new Date(b.ngayMuon) - new Date(a.ngayMuon));
        
        // B2: Lấy 5 phần tử đầu tiên
        const top5Loans = sortedLoans.slice(0, 5);

        // B3: Map dữ liệu để hiển thị tên (Lookup)
        this.recentLoans = top5Loans.map(loan => {
            // Tìm tên độc giả từ mã (xử lý trường hợp maDocGia là string)
            const reader = readers.find(r => r.maDG === loan.maDocGia || r.maDocGia === loan.maDocGia); 
            // Lưu ý: kiểm tra kỹ bên DB bạn đặt tên trường là maDG hay maDocGia
            
            const readerName = reader ? `${reader.hoLot} ${reader.ten}` : loan.maDocGia;

            // Tìm tên sách (Xử lý trường hợp maSach là object hoặc string)
            const bookId = loan.maSach?._id || loan.maSach;
            const book = books.find(b => b._id === bookId);
            const bookName = book ? book.tenSach : 'Sách đã xóa';

            return {
                ...loan,
                tenDocGiaHienThi: readerName,
                tenSachHienThi: bookName
            };
        });

      } catch (error) {
        console.log("Lỗi tải dữ liệu Dashboard: ", error);
      }
    },

    // 2. Hàm format ngày
    formatDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    },

    // 3. Hàm tạo class màu sắc cho trạng thái
    getStatusClass(status) {
        switch (status) {
            case 'Đang mượn': return 'borrowing';
            case 'Đã trả': return 'returned';
            case 'Quá hạn': return 'overdue'; // Màu đỏ
            case 'Đã hủy': return 'overdue';
            case 'Đã từ chối': return 'overdue'; 
            case 'Chờ duyệt': return 'pending';
            default: return '';
        }
    }
    },
  mounted() {
    this.getDashboardStats();
  },
};
</script>

<style scoped>
/* --- GIỮ NGUYÊN CSS CŨ CỦA BẠN --- */
/* Tôi thêm class pending cho trạng thái Chờ duyệt */

.dashboard-container {
  margin-left: 230px; 
  padding-top: 70px; 
  padding-left: 30px; 
  padding-right: 30px;
  padding-bottom: 30px;
  background-color: #f5f6fa;
  min-height: 100vh; 
  font-family: 'Segoe UI', sans-serif;
}

@media (max-width: 768px) {
  .dashboard-container {
    margin-left: 0;
    padding-left: 15px;
    padding-right: 15px;
  }
}

.dashboard-header { margin-bottom: 15px; }
.dashboard-header h2 { font-size: 1.2rem; margin-bottom: 2px; color: #2c3e50; }
.text-muted { font-size: 0.85rem; color: #7f8c8d; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 40px; height: 40px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem; margin-right: 12px;
}
.stat-card.blue .stat-icon { background: #e3f2fd; color: #1e88e5; }
.stat-card.green .stat-icon { background: #e8f5e9; color: #43a047; }
.stat-card.orange .stat-icon { background: #fff3e0; color: #fb8c00; }
.stat-card.red .stat-icon { background: #ffebee; color: #e53935; }

.stat-info h3 { margin: 0; font-size: 1.2rem; font-weight: 700; color: #2c3e50; }
.stat-info p { margin: 0; color: #7f8c8d; font-size: 0.8rem; }

.content-grid {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 15px;
}

.card-panel {
  background: white; border-radius: 8px; padding: 15px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.card-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;
}
.card-header h3 { margin: 0; font-size: 1rem; color: #2c3e50; }
.btn-link { font-size: 0.8rem; color: #3498db; border: none; background: none; cursor: pointer; }

/* TABLE STYLE */
.styled-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.styled-table th, .styled-table td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; }
.styled-table th { background-color: #f8f9fa; color: #2c3e50; font-weight: 600; }
.td-name { font-weight: 500; }
.td-book { color: #555; }

/* BADGES */
.status-badge { padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
.status-badge.borrowing { background: #e3f2fd; color: #1565c0; }
.status-badge.returned { background: #e8f5e9; color: #2e7d32; }
.status-badge.overdue { background: #ffebee; color: #c62828; }
.status-badge.pending { background: #fff3e0; color: #fb8c00; } /* Màu cam nhạt cho chờ duyệt */

/* ACTION BUTTONS */
.quick-actions h3 { font-size: 1rem; margin-top: 0; margin-bottom: 15px; }
.action-buttons { display: flex; flex-direction: column; gap: 8px; }
.btn-action {
  padding: 10px; font-size: 0.9rem; border: 1px dashed #bdc3c7;
  background: #fbfbfb; border-radius: 6px; cursor: pointer;
  display: flex; align-items: center; transition: 0.2s;
}
.btn-action:hover { background: #f0f8ff; border-color: #3498db; color: #3498db; }
.btn-action .icon { margin-right: 8px; font-weight: bold; }

@media (max-width: 900px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .content-grid { grid-template-columns: 1fr; }
}
</style>