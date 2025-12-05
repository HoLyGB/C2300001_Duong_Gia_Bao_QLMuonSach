<script>
export default {
  
  props: {
    nhaxuatban: { type: Array, default: () => [] },
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
       if (!this.nhaxuatban || this.nhaxuatban.length === 0) return 0;
      return Math.ceil(this.nhaxuatban.length / this.pageSize);
    },
    
    // "Cắt" mảng nhaxuatban để lấy dữ liệu cho trang hiện tại
    paginatedData() {
      if (!this.nhaxuatban || this.nhaxuatban.length === 0) return [];
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.nhaxuatban.slice(start, end);
    },
    
    // Tạo một mảng các số trang [1, 2, 3...] để vẽ nút
   pageNumbers() {
      const total = this.totalPages;
      const current = this.currentPage;
      
      // Số lượng nút số tối đa (ví dụ: 5 nút, nên là số lẻ)
      const maxVisibleButtons = 3; 


      if (total <= maxVisibleButtons + 2) {
        return Array.from({ length: total }, (_, i) => i + 1);
      }

      // 2. Tính toán cửa sổ trượt (cho 3 nút ở giữa)
      let start = Math.max(2, current - Math.floor(maxVisibleButtons / 2));
      let end = Math.min(total - 1, current + Math.floor(maxVisibleButtons / 2));
      
      // 3. Điều chỉnh cửa sổ nếu nó ở gần đầu
      // (ví dụ: current=3, [1, (2, 3, 4), ..., 20])
      if (current <= Math.ceil(maxVisibleButtons / 2) + 1) {
         start = 2;
         end = maxVisibleButtons + 1;
      }
      
      // 4. Điều chỉnh cửa sổ nếu nó ở gần cuối
      // (ví dụ: current=18, [1, ..., (16, 17, 18), 19, 20])
       if (current >= total - Math.floor(maxVisibleButtons / 2) - 1) {
         start = total - maxVisibleButtons;
         end = total - 1;
      }

      // 5. Xây dựng mảng kết quả
      const pages = [];

      // Luôn thêm trang 1
      pages.push(1); 
      
      // Thêm '...' nếu cần (sau trang 1)
      if (start > 2) {
        pages.push('...'); 
      }

      // Thêm các trang trong cửa sổ
      for (let i = start; i <= end; i++) {
        pages.push(i); 
      }

      // Thêm '...' nếu cần (trước trang cuối)
      if (end < total - 1) {
        pages.push('...');
      }

      // Luôn thêm trang cuối
      pages.push(total); 

      return pages;
    
  },
    pageInfo() {
      // Lấy tổng số phần tử từ danh sách gốc
      const total = this.nhaxuatban.length;
      
      // Nếu không có gì, trả về thông báo rỗng
     if (!this.nhaxuatban || this.nhaxuatban.length === 0) {
        return "Không có phần tử nào";
      }
      
      const start = (this.currentPage - 1) * this.pageSize + 1;
      
      const end = start + this.paginatedData.length - 1;
      
      // Trả về chuỗi kết quả
      return `Hiển thị ${start} đến ${end} trong tổng số ${total} phần tử.`;
    }
  
  },
  emits: ["update:activeIndex","delete:nxb"],
  methods: {
    changePage(page) {
      // Đảm bảo trang không đi ra ngoài giới hạn
      if (page < 1) page = 1;
      if (page > this.totalPages) page = this.totalPages;
      this.currentPage = page;
    },
  
    updateActiveIndex(index) {
      this.$emit("update:activeIndex", index);
    },
    goToAddNXB() {
      this.$router.push({ name: "nhaxuatban.add" });
    },
    deleteNXB(id) {
      // Hỏi xác nhận trước khi phát tín hiệu
      if (confirm("Bạn muốn xóa nhà xuất bản này?")) {
        this.$emit("delete:nxb", id); // Chỉ phát tín hiệu với ID
      }},
  },
  watch: {
    // Khi danh sách NXB (prop) thay đổi, quay về trang 1
    nhaxuatban() {
      this.currentPage = 1;
    },
  },
};
  </script>

<template>
    <main class="app-content">
    <div class="app-title">
      <ul class="app-breadcrumb breadcrumb side">
        <li class="breadcrumb-item active"><a href="#"><b>Danh sách nhà xuất bản</b></a></li>
      </ul>
      <div id="clock"></div>
    </div>

    <div class="row">
      <div class="col-md-12">
        <div class="tile">
          <div class="tile-body">

            <div class="row element-button">
              <div class="col-sm-2">

                  <button class="btn btn-sm btn-success" @click="goToAddNXB">
          <i class="fas fa-plus"></i> Thêm mới nhà xuất bản
        </button>
              </div>
             
            </div>
            <div class="row mb-3">
              <div class="col-md-2 col-sm-4">
                <label for="pageSizeSelect" class="col-form-label-sm">Hiển thị:</label>
                <select v-model="pageSize" class="form-control form-control-sm" id="pageSizeSelect">
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>
       <table class="table table-hover table-bordered js-copytextarea" cellpadding="0" cellspacing="0" border="0"
    id="sampleTable">
    <thead>
        <tr>
            <th width="10">STT</th>
            <th width="300">ID Nhà xuất bản</th>
            <th width="200">Tên nhà xuất bản</th>
            <th>Địa chỉ</th>
            <th width="165">Tính năng</th>
        </tr>
    </thead>

<tbody>
    <tr 
        v-for="(nxb, index) in paginatedData" 
        :key="nxb._id" 
        
        :class="{ active: ((currentPage - 1) * pageSize) + index === activeIndex }"
        
        @click="updateActiveIndex(((currentPage - 1) * pageSize) + index)"
    >
      
        <td>{{ ((currentPage - 1) * pageSize) + index + 1 }}</td>
        
        <td>{{ nxb._id }}</td> 
        <td>{{ nxb.tenNXB }}</td> 
        <td>{{ nxb.diaChi }}</td> 
           <td>
    <router-link
      :to="{ name: 'nhaxuatban.edit', params: { id: nxb._id } }"
      class="btn btn-primary btn-sm"
      @click.stop 
    >
        <i class="fas fa-edit"></i> Sửa
    </router-link>

    <button 
      class="btn btn-danger btn-sm ml-2" 
      @click.stop="deleteNXB(nxb._id)"
    >
        <i class="fas fa-trash"></i> Xóa
    </button>
</td>
    </tr>
    
     <tr v-if="!paginatedData || paginatedData.length === 0">
    <td colspan="9" class="text-center">Không có dữ liệu</td>
</tr>
</tbody>
  </table>
  <div class="row justify-content-between align-items-center" v-if="totalPages > 0">
                
                <div class="col-md-6 col-sm-12">
                    <span class="text-muted">{{ pageInfo }}</span>
                </div>
                
                <div class="col-md-6 col-sm-12">
          <nav aria-label="Page navigation" v-if="totalPages > 1">
  <ul class="pagination justify-content-center justify-content-md-end">
    
    <li class="page-item" :class="{ disabled: currentPage === 1 }">
      <a class="page-link" href="#" @click.prevent="changePage(1)">Trang đầu</a>
    </li>

    <li class="page-item" :class="{ disabled: currentPage === 1 }">
      <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">Trước</a>
    </li>
    
  <li
                  class="page-item"
                  v-for="(page, index) in pageNumbers"
                  :key="index"
                  :class="{ 
                    active: page === currentPage, 
                    disabled: page === '...'  // Vô hiệu hóa nút '...'
                  }"
                >
                  <span v-if="page === '...'" class="page-link">...</span>
                  
                  <a v-else class="page-link" href="#" @click.prevent="changePage(page)">
                    {{ page }}
                  </a>
                </li>
              

    <li class="page-item" :class="{ disabled: currentPage === totalPages }">
      <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">Sau</a>
    </li>

    <li class="page-item" :class="{ disabled: currentPage === totalPages }">
      <a class="page-link" href="#" @click.prevent="changePage(totalPages)">Trang cuối</a>
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