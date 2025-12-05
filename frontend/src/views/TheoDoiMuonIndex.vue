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
        <TheoDoiMuonList
          :theoDoiMuon="filteredTheoDoiMuon"
          v-model:activeIndex="activeIndex"
          @delete:theodoimuon="handleDelete"
          @refresh:list="retrieveTheoDoiMuon"
        />
      </div>
    </div>
  </div>
</template>

<script>
import InputSearch from "@/components/InputSearch.vue";
// Import component hiển thị danh sách (file bạn làm ở bước trước)
import TheoDoiMuonList from "@/components/ListTheoDoiMuon.vue"; 
// Import service tương ứng
import TheoDoiMuonService from "@/services/theodoimuon.service"; 

export default {
  components: {
    InputSearch,
    TheoDoiMuonList, 
  },
  data() {
    return {
      theoDoiMuon: [], // Đổi tên biến chứa dữ liệu
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
    // Tạo chuỗi tìm kiếm từ dữ liệu mượn trả
    theoDoiMuonStrings() {
      return this.theoDoiMuon.map((phieu) => { 
        // Lấy các trường cần tìm kiếm: Mã ĐG, Mã Sách, Trạng thái
        // Lưu ý: Nếu maDocGia là object (populate), bạn cần sửa thành phieu.maDocGia.hoTen ...
        const { maDocGia, maSach, trangThai } = phieu; 
        return [maDocGia, maSach, trangThai].join("").toLowerCase();
      });
    },
    
    // Lọc danh sách dựa trên từ khóa tìm kiếm
    filteredTheoDoiMuon() {
      if (!this.searchText) return this.theoDoiMuon; 
      return this.theoDoiMuon.filter((_phieu, index) =>
        this.theoDoiMuonStrings[index].includes(this.searchText.toLowerCase())
      );
    },

    filteredCount() {
      return this.filteredTheoDoiMuon.length;
    },
  },
  methods: {
    async handleDelete(id) {
      try {
        // Gọi service xóa phiếu mượn
        await TheoDoiMuonService.delete(id);
        this.refreshList(); 
        // Có thể thêm thông báo xóa thành công ở đây (alert hoặc toast)
      } catch (error) {
        console.log(error);
        alert("Có lỗi xảy ra khi xóa phiếu mượn."); 
      }
    },
  
    async retrieveTheoDoiMuon() {
      try {
        // Lấy tất cả phiếu mượn từ server
        this.theoDoiMuon = await TheoDoiMuonService.getAll(); 
      } catch (err) {
        console.error(err);
      }
    },

    refreshList() {
      this.retrieveTheoDoiMuon();
      this.activeIndex = -1;
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