<script>
export default {
  props: {
    docGia: { type: Array, default: () => [] }, // Đổi tên props thành docGia
    activeIndex: { type: Number, default: -1 },
  },
  emits: ["update:activeIndex", "delete:docgia"],
  data() {
    return {
      currentPage: 1,
      pageSize: 10,
    };
  },
  watch: {
    docGia() {
      this.currentPage = 1;
    },
  },
  computed: {
    totalPages() {
      if (!this.docGia || this.docGia.length === 0) return 0;
      return Math.ceil(this.docGia.length / this.pageSize);
    },
    paginatedData() {
      if (!this.docGia || this.docGia.length === 0) return [];
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.docGia.slice(start, end);
    },
    pageInfo() {
      if (!this.docGia || this.docGia.length === 0) return "Không có dữ liệu";
      const total = this.docGia.length;
      const start = (this.currentPage - 1) * this.pageSize + 1;
      const end = Math.min(start + this.pageSize - 1, total);
      return `Hiển thị ${start} đến ${end} trong tổng số ${total} phần tử.`;
    },
    pageNumbers() {
      const total = this.totalPages;
      const current = this.currentPage;
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

      const pages = [1];
      if (start > 2) pages.push("...");
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (end < total - 1) pages.push("...");
      pages.push(total);

      return pages;
    },
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return "";
      return new Date(dateString).toLocaleDateString("vi-VN");
    },
    changePage(page) {
      if (page === "..." || page < 1 || page > this.totalPages) return;
      this.currentPage = page;
    },
    updateActiveIndex(index) {
      this.$emit("update:activeIndex", index);
    },
    goToAddDocGia() {
      this.$router.push({ name: "docgia.add" });
    },
    deleteDocGia(id) {
      if (confirm("Bạn có chắc chắn muốn xóa độc giả này không?")) {
        this.$emit("delete:docgia", id);
      }
    },
  },
};
</script>

<template>
  <main class="app-content">
    <div class="app-title">
      <ul class="app-breadcrumb breadcrumb side">
        <li class="breadcrumb-item active">
          <a href="#"><b>Danh sách Độc giả</b></a>
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
                <button class="btn btn-sm btn-success" @click="goToAddDocGia">
                  <i class="fas fa-plus"></i> Thêm mới độc giả
                </button>
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-md-2 col-sm-4">
                <label for="pageSizeSelect" class="col-form-label-sm">Hiển thị:</label>
                <select v-model="pageSize" class="form-control form-control-sm" id="pageSizeSelect">
                  <option :value="5">5</option>
                  <option :value="10">10</option>
                  <option :value="20">20</option>
                  <option :value="50">50</option>
                </select>
              </div>
            </div>

            <table class="table table-hover table-bordered js-copytextarea" id="sampleTable">
              <thead>
                <tr>
                  <th width="10">STT</th>
                  <th width="100">Mã ĐG</th>
                  <th width="180">Họ và Tên</th>
                  <th>Giới tính</th>
                  <th>Ngày sinh</th>
                  <th>Email</th>
                  <th>SĐT</th>
                  <th>Địa chỉ</th>
                  <th width="100">Tính năng</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(dg, index) in paginatedData"
                  :key="dg._id"
                  :class="{ active: (currentPage - 1) * pageSize + index === activeIndex }"
                  @click="updateActiveIndex((currentPage - 1) * pageSize + index)"
                >
                  <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
                  <td>{{ dg.maDG }}</td>
                  <td>{{ dg.hoLot }} {{ dg.ten }}</td> 
                  <td>{{ dg.gioiTinh ? 'Nữ' : 'Nam' }}</td>
                  <td>{{ formatDate(dg.ngaySinh) }}</td>
                  <td>{{ dg.email }}</td>
                  <td>{{ dg.soDienThoai }}</td>
                  <td>{{ dg.diaChi }}</td>
                  <td>
                    <div class="btn-group">
                      <router-link
                        :to="{ name: 'docgia.edit', params: { id: dg._id } }"
                        class="btn btn-primary btn-sm"
                        title="Sửa"
                      >
                        <i class="fas fa-edit"></i>Sửa
                      </router-link>
                      <button
                        class="btn btn-danger btn-sm ml-2"
                        @click.stop="deleteDocGia(dg._id)"
                        title="Xóa"
                      >
                        <i class="fas fa-trash"></i>Xóa
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="!paginatedData.length">
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
                      :class="{ active: page === currentPage, disabled: page === '...' }"
                    >
                      <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
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
.btn-group { display: flex; }
.ml-1 { margin-left: 4px; }
</style>