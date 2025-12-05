<template>
  <div class="row">
    <div class="col-md-12">
        <h4><i class="fas fa-address-book"></i></h4>
        <h4><i class="fas fa-address-book"></i></h4>
  

      <div class="row justify-content-center mb-3">
        <div class="col-md-4">
          <InputSearch v-model="searchText" />
        </div>
      </div>

      <div>
        <DocGiaList 
          :docGia="filteredDocGia"
          v-model:activeIndex="activeIndex"
          @delete:docgia="handleDelete"
        />
      </div>

    </div>
  </div>
</template>

<script>
import InputSearch from "@/components/InputSearch.vue";
import DocGiaList from "@/components/ListDocGia.vue"; 
import DocGiaService from "@/services/docgia.service";

export default {
  components: {
    InputSearch,
    DocGiaList, 
  },
  data() {
    return {
      docGia: [], 
      activeIndex: -1,
      searchText: "",
    };
  },
  watch: {
    searchText() {
      this.activeIndex = -1;
    },
  },
  computed: {
    // Map dữ liệu độc giả thành chuỗi để phục vụ tìm kiếm
    docGiaStrings() {
      return this.docGia.map((dg) => { 
        // 1. Destructuring đầy đủ các thuộc tính (trừ passwordHash vì bảo mật)
        const { 
          maDG, 
          hoLot, 
          ten, 
          email, 
          soDienThoai, 
          diaChi, 
          gioiTinh, 
          ngaySinh, 
          vaiTro 
        } = dg; 

        // 2. Xử lý dữ liệu đặc biệt để tìm kiếm được thuận tiện hơn
        
        // Chuyển đổi Giới tính (boolean) thành chữ "Nam" hoặc "Nữ" để tìm kiếm
        const gioiTinhStr = gioiTinh ? "nữ" : "nam";

        // Chuyển đổi Ngày sinh thành dạng chuỗi DD/MM/YYYY (nếu có)
        const ngaySinhStr = ngaySinh ? new Date(ngaySinh).toLocaleDateString('vi-VN') : "";

        // 3. Gom tất cả vào một mảng và nối lại thành chuỗi thường
        return [
          maDG, 
          hoLot, 
          ten, 
          email, 
          soDienThoai, 
          diaChi, 
          gioiTinhStr, 
          ngaySinhStr, 
          vaiTro
        ].join(" - ").toLowerCase(); // Thêm dấu gạch nối để tránh dính chữ
      });
    },
    
    // Lọc danh sách hiển thị dựa trên ô tìm kiếm
    filteredDocGia() {
      if (!this.searchText) return this.docGia; 
      return this.docGia.filter((_dg, index) =>
        this.docGiaStrings[index].includes(this.searchText.toLowerCase())
      );
    },
    
    filteredDocGiaCount() {
      return this.filteredDocGia.length;
    },
  },
  methods: {
    async retrieveDocGia() {
      try {
        this.docGia = await DocGiaService.getAll(); 
      } catch (err) {
        console.error(err);
      }
    },

    refreshList() {
      this.retrieveDocGia();
      this.activeIndex = -1;
    },

    async handleDelete(id) {
      try {
        await DocGiaService.delete(id);
        this.refreshList(); 
        alert("Xóa độc giả thành công!");
      } catch (error) {
        console.log(error);
        alert("Có lỗi xảy ra khi xóa độc giả."); 
      }
    },
  },
  mounted() {
    this.refreshList();
  },
};
</script>

<style scoped>
.page {
  text-align: left;
  max-width: 750px;
}
</style>