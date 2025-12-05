<template>
  <div v-if="sach" >
     <h4><i class="fas fa-address-book"></i></h4>
    <h4><i class="fas fa-address-book"></i></h4>
    
    <SachForm
      :sach="sach"
      @submit:sach="updateSach"
      @delete:sach="deleteSach"
    />
    
    <p>{{ message }}</p>
  </div>
</template>

<script>
import SachForm from "@/components/SachForm.vue"; // Nhớ đảm bảo file này đúng tên
import SachService from "@/services/sach.service";

export default {
  components: {
    SachForm,
  },
  props: {
    id: { type: String, required: true },
  },
  data() {
    return {
      sach: null, 
      message: "",
    };
  },
  methods: {
    // 1. Lấy thông tin sách
    async getSach(id) {
      try {
        this.sach = await SachService.get(id);
      } catch (error) {
        console.log(error);
       
        this.$router.push({
          name: "notfound",
          params: { pathMatch: this.$route.path.split("/").slice(1) },
          query: this.$route.query,
          hash: this.$route.hash,
        });
      }
    },

    // 2. Cập nhật sách (Quan trọng: Dùng FormData để gửi cả ảnh)
    async updateSach(data, file) {
      try {
        const formData = new FormData();
        
        // Đóng gói dữ liệu chữ
        formData.append("tenSach", data.tenSach);
        formData.append("donGia", data.donGia);
        formData.append("soQuyen", data.soQuyen);
        formData.append("namXuatBan", data.namXuatBan);
        formData.append("tacGia", data.tacGia);
        formData.append("maNXB", data.maNXB);

        // Chỉ gửi ảnh nếu người dùng có chọn file mới
        if (file) {
            formData.append("hinhAnh", file);
        }

        // Gọi API update
        await SachService.update(this.sach._id, formData);
        
        alert("Sách được cập nhật thành công.");
        this.$router.push({ name: "sachindex" }); // Quay về trang danh sách
 
      } catch (error) {
        console.log(error);
            if (error.response && error.response.status === 409) {
        alert("Tên sách đã tồn tại!"); 
    }
            // TRƯỜNG HỢP 3: Các lỗi khác (Lỗi server, mất mạng...)
            else {
                // this.message = "Có lỗi xảy ra khi thêm mới sách. Vui lòng thử lại.";
            }
      }
    },

    // 3. Xóa sách
    async deleteSach() {
      if (confirm("Bạn muốn xóa cuốn sách này?")) {
        try {
          await SachService.delete(this.sach._id);
          this.$router.push({ name: "sachindex" });
        } catch (error) {
          console.log(error);
          this.message = "Có lỗi xảy ra khi xóa sách.";
        }
      }
    },
  },
  created() {
    this.getSach(this.id);
    this.message = "";
  },
};
</script>

<style scoped>
  @import "@/assets/form.css";
  @import "@/assets/main.css";
</style>