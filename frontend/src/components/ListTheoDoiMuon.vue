<script>
import Swal from 'sweetalert2';
import TheoDoiMuonService from "@/services/theodoimuon.service";
import SachService from "@/services/sach.service";
import DocGiaService from "@/services/docgia.service"; // 1. Import Service Độc giả
export default {
  props: {
    theoDoiMuon: { type: Array, default: () => [] }, // Đổi tên prop đầu vào
    activeIndex: { type: Number, default: -1 },
  },
  data() {
    return {
      currentPage: 1,
      pageSize: 10,
    };
  },
  computed: {
    // Tính tổng số trang
    totalPages() {
      if (!this.theoDoiMuon || this.theoDoiMuon.length === 0) return 0;
      return Math.ceil(this.theoDoiMuon.length / this.pageSize);
    },

    // "Cắt" mảng theoDoiMuon để lấy dữ liệu cho trang hiện tại
paginatedData() {
      if (!this.theoDoiMuon || this.theoDoiMuon.length === 0) return [];

      // BƯỚC 1: Tạo bản sao và sắp xếp (Tránh sửa trực tiếp vào props)
      const sortedList = [...this.theoDoiMuon].sort((a, b) => {
        // Chuyển đổi sang Date để so sánh
        const dateA = new Date(a.ngayMuon);
        const dateB = new Date(b.ngayMuon);
        
        // Lấy Ngày B trừ Ngày A => Ra số dương thì B đứng trước A (Giảm dần)
        return dateB - dateA;
      });

      // BƯỚC 2: Cắt trang trên danh sách đã sắp xếp
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return sortedList.slice(start, end);
    },

    // Tạo một mảng các số trang [1, 2, 3...] để vẽ nút
    pageNumbers() {
      const total = this.totalPages;
      const current = this.currentPage;

      // Số lượng nút số tối đa
      const maxVisibleButtons = 3;

      if (total <= maxVisibleButtons + 2) {
        return Array.from({ length: total }, (_, i) => i + 1);
      }

      let start = Math.max(2, current - Math.floor(maxVisibleButtons / 2));
      let end = Math.min(total - 1, current + Math.floor(maxVisibleButtons / 2));

      if (current <= Math.ceil(maxVisibleButtons / 2) + 1) {
        start = 2;
        end = maxVisibleButtons + 1;
      }

      if (current >= total - Math.floor(maxVisibleButtons / 2) - 1) {
        start = total - maxVisibleButtons;
        end = total - 1;
      }

      const pages = [];
      pages.push(1);

      if (start > 2) {
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < total - 1) {
        pages.push("...");
      }

      pages.push(total);

      return pages;
    },
    pageInfo() {
      const total = this.theoDoiMuon.length;

      if (!this.theoDoiMuon || this.theoDoiMuon.length === 0) {
        return "Không có dữ liệu mượn trả";
      }

      const start = (this.currentPage - 1) * this.pageSize + 1;
      const end = start + this.paginatedData.length - 1;

      return `Hiển thị ${start} đến ${end} trong tổng số ${total} phiếu mượn.`;
    },
  },
  emits: ["update:activeIndex", "delete:theodoimuon"], // Cập nhật tên event emit
  methods: {
    async xacNhanTraSach(phieuMuon) {
        const result = await Swal.fire({
            title: 'Xác nhận trả sách?',
            text: "Sách sẽ được hoàn lại vào kho và trạng thái chuyển thành 'Đã trả'.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#28a745', // Màu xanh lá
            confirmButtonText: 'Xác nhận đã trả',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            try {
                // 1. Cập nhật trạng thái phiếu mượn -> "Đã trả"
                // (Có thể cập nhật thêm ngày trả thực tế là hôm nay nếu muốn)
                await TheoDoiMuonService.update(phieuMuon._id, { 
                    trangThai: "Đã trả",
                    ngayTra: new Date() // Cập nhật ngày trả là thời điểm hiện tại
                });

                // 2. Lấy ID sách để cộng lại số lượng
                const bookId = phieuMuon.maSach._id ? phieuMuon.maSach._id : phieuMuon.maSach;

                // 3. Lấy thông tin sách hiện tại
                const sachHienTai = await SachService.get(bookId);
                
                // 4. Cộng lại số lượng (+1) vào kho
                const dataHoiPhuc = {
                    ...sachHienTai, 
                    soQuyen: sachHienTai.soQuyen + 1 
                };
                delete dataHoiPhuc._id; // Xóa ID trước khi update

                await SachService.update(bookId, dataHoiPhuc);

                Swal.fire('Thành công', 'Đã cập nhật trả sách và kho hàng.', 'success');
                
                // 5. Load lại danh sách
                this.$emit("refresh:list");

            } catch (error) {
                Swal.fire('Lỗi', 'Có lỗi xảy ra khi cập nhật.', 'error');
                console.log(error);
            }
        }
    },
async fetchAllDocGia() {
        try {
            this.danhSachDocGia = await DocGiaService.getAll();
        } catch (error) {
            console.log("Lỗi lấy danh sách độc giả: " + error);
        }
    },

    // 4. Hàm tra cứu tên từ mã (Quan trọng)
    getTenDocGia(maDocGiaString) {
        if (!maDocGiaString) return "Chưa có thông tin";
        
        // Tìm trong danh sách độc giả, người nào có mã khớp với chuỗi này
        // Giả sử trong collection Độc Giả cũng có trường tên là 'maDocGia'
        const docGia = this.danhSachDocGia.find(dg => dg.maDG === maDocGiaString);
        
        if (docGia) {
            return `${docGia.hoLot} ${docGia.ten}`;
        }
        // Nếu không tìm thấy (do bị xóa hoặc mã sai), hiển thị chính mã đó
        return maDocGiaString; 
    },
    async duyetDon(phieuMuon) {
      try {
        // Cập nhật trạng thái thành "Đang mượn"
        await TheoDoiMuonService.update(phieuMuon._id, { 
            trangThai: "Đang mượn" 
        });
        
        Swal.fire('Thành công', 'Đã duyệt phiếu mượn!', 'success');
        
        // Báo cho component cha load lại danh sách
        this.$emit("refresh:list"); 
      } catch (error) {
        console.log(error);
        Swal.fire('Lỗi', 'Không thể duyệt đơn này.', 'error');
      }
    },

    // --- HÀM MỚI: TỪ CHỐI ĐƠN (HOÀN TRẢ SÁCH) ---
    async tuChoiDon(phieuMuon) {
        const result = await Swal.fire({
            title: 'Từ chối yêu cầu?',
            text: "Sách sẽ được hoàn lại vào kho và đơn bị hủy.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Đồng ý từ chối',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            try {
                // 1. Cập nhật trạng thái phiếu mượn
                await TheoDoiMuonService.update(phieuMuon._id, { 
                    trangThai: "Đã từ chối" 
                });

                // 2. Lấy ID sách (xử lý trường hợp maSach là object hoặc string)
                const bookId = phieuMuon.maSach._id ? phieuMuon.maSach._id : phieuMuon.maSach;

                // 3. Lấy thông tin sách hiện tại để biết số lượng cũ
                const sachHienTai = await SachService.get(bookId);
                
                // 4. Cộng lại số lượng (+1)
                const dataHoiPhuc = {
                    ...sachHienTai, 
                    soQuyen: sachHienTai.soQuyen + 1 
                };
                delete dataHoiPhuc._id; // Xóa ID trước khi update

                await SachService.update(bookId, dataHoiPhuc);

                Swal.fire('Đã từ chối', 'Đơn đã hủy và sách đã hoàn về kho.', 'success');
                
                // Báo cho cha load lại danh sách
                this.$emit("refresh:list");

            } catch (error) {
                Swal.fire('Lỗi', 'Có lỗi xảy ra khi xử lý.', 'error');
                console.log(error);
            }
        }
    },
    async autoCheckQuaHan() {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Đưa về đầu ngày để so sánh chính xác

        let coThayDoi = false;

        // Duyệt qua toàn bộ danh sách (props)
        for (const phieu of this.theoDoiMuon) {
            const ngayTra = new Date(phieu.ngayTra);
            
            // Logic: Nếu (Ngày trả < Hôm nay) VÀ (Trạng thái là "Đang mượn")
            if (ngayTra < today && phieu.trangThai === 'Đang mượn') {
                try {
                    // Gọi API cập nhật âm thầm
                    await TheoDoiMuonService.update(phieu._id, { 
                        trangThai: 'Quá hạn' 
                    });
                    coThayDoi = true;
                    // Cập nhật tạm thời trên giao diện ngay lập tức
                    phieu.trangThai = 'Quá hạn'; 
                } catch (error) {
                    console.error(`Lỗi cập nhật quá hạn đơn ${phieu._id}:`, error);
                }
            }
        }

        // Nếu có ít nhất 1 đơn thay đổi, báo component cha load lại cho chắc ăn
        if (coThayDoi) {
             this.$emit("refresh:list");
        }
    },
    changePage(page) {
      if (page < 1) page = 1;
      if (page > this.totalPages) page = this.totalPages;
      this.currentPage = page;
    },

    updateActiveIndex(index) {
      this.$emit("update:activeIndex", index);
    },

    goToAddTheoDoiMuon() {
      // Chuyển hướng đến trang thêm phiếu mượn (đảm bảo route này tồn tại)
      this.$router.push({ name: "theodoimuon.add" });
    },

    deleteTheoDoiMuon(id) {
      if (confirm("Bạn muốn xóa phiếu mượn này?")) {
        this.$emit("delete:theodoimuon", id);
      }
    },
    
    // Hàm phụ trợ để format ngày tháng (nếu cần)
    formatDate(dateString) {
      if (!dateString) return "";
      const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      return new Date(dateString).toLocaleDateString('vi-VN', options);
    }
  },
  watch: {
    // Khi danh sách thay đổi, quay về trang 1
    theoDoiMuon() {
      this.currentPage = 1;
    },
    immediate: true 
  },
  mounted() {
      // 5. Gọi hàm lấy độc giả ngay khi trang tải
      this.fetchAllDocGia();
  }
};
</script>

<template>
  <main class="app-content">
    <div class="app-title">
      <ul class="app-breadcrumb breadcrumb side">
        <li class="breadcrumb-item active">
          <a href="#"><b>Danh sách Theo Dõi Mượn Sách</b></a>
        </li>
      </ul>
      <div id="clock"></div>
    </div>

    <div class="row">
      <div class="col-md-12">
        <div class="tile">
          <div class="tile-body">
            <div class="row element-button">
              <div class="col-sm-2">
                
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-md-2 col-sm-4">
                <label for="pageSizeSelect" class="col-form-label-sm"
                  >Hiển thị:</label
                >
                <select
                  v-model="pageSize"
                  class="form-control form-control-sm"
                  id="pageSizeSelect"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>
            <table
              class="table table-hover table-bordered js-copytextarea"
              cellpadding="0"
              cellspacing="0"
              border="0"
              id="sampleTable"
            >
              <thead>
                <tr>
                  <th width="10">STT</th>
                  <th>Mã Độc giả</th>
                  <th>Tên đọc giả</th>
                  <th>Sách</th>
                  <th>Ngày mượn</th>
                  <th>Ngày trả</th>
                  <th>Trạng thái</th>
                  <th width="165">Tính năng</th>
                </tr>
              </thead>

    <tbody>
  <tr
    v-for="(muonSach, index) in paginatedData"
    :key="muonSach._id"
    :class="{ active: (currentPage - 1) * pageSize + index === activeIndex }"
    @click="updateActiveIndex((currentPage - 1) * pageSize + index)"
  >
    <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
     <td>
       {{ muonSach.maDocGia }}
    </td> 
    <td>
       {{ getTenDocGia(muonSach.maDocGia) }}
    </td> 
  
    <td>
        {{ 
            muonSach.maSach?.tenSach 
            ? muonSach.maSach.tenSach 
            : (muonSach.maSach?._id || muonSach.maSach || 'Sách đã bị xóa') 
        }}
    </td>

    <td>{{ formatDate(muonSach.ngayMuon) }}</td>
    <td>{{ formatDate(muonSach.ngayTra) }}</td>
    
    <td>
      <span :class="{
          'badge badge-success': muonSach.trangThai === 'Đã trả',
          'badge badge-warning': muonSach.trangThai === 'Đang mượn',
          'badge badge-primary': muonSach.trangThai === 'Chờ duyệt',
          'badge badge-danger': muonSach.trangThai === 'Quá hạn' || muonSach.trangThai === 'Đã từ chối' || muonSach.trangThai === 'Đã hủy'
      }">
          {{ muonSach.trangThai }}
      </span>
    </td>

<td>
       <div v-if="muonSach.trangThai === 'Chờ duyệt'" class="btn-group">
           <button class="btn btn-success btn-sm" title="Duyệt đơn" @click.stop="duyetDon(muonSach)">
               <i class="fas fa-check"></i> Duyệt
           </button> 
           <button class="btn btn-warning btn-sm" title="Từ chối" @click.stop="tuChoiDon(muonSach)">
               <i class="fas fa-times"></i> Từ chối
           </button>
       </div>

       <div v-else class="btn-group">
           
           <button 
               v-if="muonSach.trangThai === 'Quá hạn' || muonSach.trangThai === 'Đang mượn'"
               class="btn btn-primary btn-sm" 
               style="margin-right: 5px;"
               title="Xác nhận trả sách"
               @click.stop="xacNhanTraSach(muonSach)"
           >
               <i class="fas fa-undo"></i> Trả sách
           </button>

           <button class="btn btn-danger btn-sm" title="Xóa phiếu" @click.stop="deleteTheoDoiMuon(muonSach._id)">
               <i class="fas fa-trash"></i> Xóa
           </button>
       </div>
    </td>
  </tr>
  
  <tr v-if="!paginatedData || paginatedData.length === 0">
    <td colspan="7" class="text-center">
      Không có dữ liệu phiếu mượn
    </td>
  </tr>
</tbody>
            </table>
            <div
              class="row justify-content-between align-items-center"
              v-if="totalPages > 0"
            >
              <div class="col-md-6 col-sm-12">
                <span class="text-muted">{{ pageInfo }}</span>
              </div>

              <div class="col-md-6 col-sm-12">
                <nav aria-label="Page navigation" v-if="totalPages > 1">
                  <ul
                    class="pagination justify-content-center justify-content-md-end"
                  >
                    <li
                      class="page-item"
                      :class="{ disabled: currentPage === 1 }"
                    >
                      <a
                        class="page-link"
                        href="#"
                        @click.prevent="changePage(1)"
                        >Trang đầu</a
                      >
                    </li>

                    <li
                      class="page-item"
                      :class="{ disabled: currentPage === 1 }"
                    >
                      <a
                        class="page-link"
                        href="#"
                        @click.prevent="changePage(currentPage - 1)"
                        >Trước</a
                      >
                    </li>

                    <li
                      class="page-item"
                      v-for="(page, index) in pageNumbers"
                      :key="index"
                      :class="{
                        active: page === currentPage,
                        disabled: page === '...',
                      }"
                    >
                      <span v-if="page === '...'" class="page-link">...</span>

                      <a
                        v-else
                        class="page-link"
                        href="#"
                        @click.prevent="changePage(page)"
                      >
                        {{ page }}
                      </a>
                    </li>

                    <li
                      class="page-item"
                      :class="{ disabled: currentPage === totalPages }"
                    >
                      <a
                        class="page-link"
                        href="#"
                        @click.prevent="changePage(currentPage + 1)"
                        >Sau</a
                      >
                    </li>

                    <li
                      class="page-item"
                      :class="{ disabled: currentPage === totalPages }"
                    >
                      <a
                        class="page-link"
                        href="#"
                        @click.prevent="changePage(totalPages)"
                        >Trang cuối</a
                      >
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
@import "@/assets/form.css";
@import "@/assets/main.css";
</style>