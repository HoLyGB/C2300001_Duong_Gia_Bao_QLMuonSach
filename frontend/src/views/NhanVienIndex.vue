<template>
  <div class="row">

    <div class="col-md-12">
      <h4>
       <i class="fas fa-address-book"></i>
      </h4>
<h4>
        <i class="fas fa-address-book"></i>
      </h4>
      <div class="row justify-content-center mb-10">
        <div class="col-md-4">
          <InputSearch v-model="searchText" />
        </div>
      </div>
 <div>
  <NhanVienList 

    :nhanVien="filteredContacts"
    v-model:activeIndex="activeIndex"
    @delete:nhanVien="handleDelete"
  />
  

</div>
  
  
    </div>


  </div> </template>

<script>
import InputSearch from "@/components/InputSearch.vue";
import NhanVienList from "@/components/ListNhanVien.vue"; 
import NhanVienService from "@/services/nhanvien.service"; 

export default {
  
  components: {
    InputSearch,
    NhanVienList, 
  },
  data() {
    return {
      nhanVien: [], 
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
    contactStrings() {
      // Lấy dữ liệu từ mảng 'nhanVien'
      return this.nhanVien.map((c) => { 
        // Thay đổi các trường tìm kiếm phù hợp với đối tượng Nhân viên (ví dụ)
        const {maNV, hoTen , chucVu, email, soDienThoai, gioiTinh, diaChi} = c; 
        return [maNV, hoTen, chucVu, email, soDienThoai, gioiTinh, diaChi].join("").toLowerCase();
      });
    },
    filteredContacts() {
      // Lọc dữ liệu từ mảng 'nhanVien'
      if (!this.searchText) return this.nhanVien; 
      return this.nhanVien.filter((_c, i) =>
        this.contactStrings[i].includes(this.searchText.toLowerCase())
      );
    },

    filteredContactsCount() {
      return this.filteredContacts.length;
    },
  },
  methods: {

    async handleDelete(id) {
      try {
        // 1. Gọi service NhanVienService để XÓA thật từ Cơ sở dữ liệu
        await NhanVienService.delete(id);
        this.refreshList(); 

      } catch (error) {
        console.log(error);
        // Đổi thông báo lỗi
        alert("Có lỗi xảy ra khi xóa nhân viên."); 
      }
    },
  

    // Đổi tên hàm
    async retrieveContacts() {
      try {
        // Gọi service NhanVienService và gán kết quả vào biến 'nhanVien'
        this.nhanVien = await NhanVienService.getAll(); 
      } catch (err) {
        console.error(err);
      }
    },
    refreshList() {
      this.retrieveContacts();
      this.activeIndex = -1;
    },
    // Các hàm khác bị comment, giữ nguyên
    // async removeAllContacts() { ... }
    // goToAddContact() { ... }
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
.empty-message {
  text-align: center; 
  color: #888;         
  margin-top: 20px;  
  font-style: italic; 
}
</style>