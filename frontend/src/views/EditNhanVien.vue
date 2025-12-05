<template>
  <div v-if="nhanVien" >
       <h4><i class="fas fa-address-book"></i></h4>
    <h4><i class="fas fa-address-book"></i></h4>
    <NhanVienForm
      :nhanVien="nhanVien"
      @submit:nhanVien="updateNhanVien"
      @delete:nhanVien="deleteNhanVien"
    />
    
    <p>{{ message }}</p>
  </div>
</template>

<script>
import NhanVienForm from "@/components/NhanVienForm.vue";
import NhanVienService from "@/services/nhanvien.service";

export default {
  components: {
    NhanVienForm,
  },
  props: {
    id: { type: String, required: true },
  },
  data() {
    return {
      nhanVien: null, // Đổi sach thành nhanVien
      message: "",
    };
  },
  methods: {
    // 1. Lấy thông tin nhân viên từ Server
    async getNhanVien(id) {
      try {
        this.nhanVien = await NhanVienService.get(id);
      } catch (error) {
        console.log(error);
        // Chuyển hướng về trang 404 nếu không tìm thấy
        this.$router.push({
          name: "notfound",
          params: { pathMatch: this.$route.path.split("/").slice(1) },
          query: this.$route.query,
          hash: this.$route.hash,
        });
      }
    },

    // 2. Cập nhật nhân viên
    async updateNhanVien(data) {
      try {

        await NhanVienService.update(this.nhanVien._id, data);
        
        alert("Thông tin nhân viên được cập nhật thành công.");
        this.$router.push({ name: "nhanvienindex" }); // Quay về trang danh sách
 
      } catch (error) {
        console.log(error);
        // Xử lý lỗi trùng lặp (ví dụ trùng Mã NV hoặc Email)
    if (error.response) {
        // Trường hợp lỗi trùng lặp (409)
        if (error.response.status === 409) {
            // Lấy message từ Backend gửi về (error.response.data.message)
            const msg = error.response.data.message;
            alert(msg || "Email hoặc số điện thoại đã tồn tại!");
        } 
        // Trường hợp lỗi dữ liệu (400) hoặc lỗi Server (500)
        else {
             this.message = error.response.data.message || "Có lỗi xảy ra khi cập nhật.";
        }
    } else {
        this.message = "Không thể kết nối đến Server.";
    }}
    },

    // 3. Xóa nhân viên
    async deleteNhanVien() {
      if (confirm("Bạn muốn xóa nhân viên này?")) {
        try {
          await NhanVienService.delete(this.nhanVien._id);
          this.$router.push({ name: "nhanvienindex" });
        } catch (error) {
          console.log(error);
          this.message = "Có lỗi xảy ra khi xóa nhân viên.";
        }
      }
    },
  },
  created() {
    this.getNhanVien(this.id);
    this.message = "";
  },
};
</script>

<style scoped>
  @import "@/assets/form.css";
  @import "@/assets/main.css";
</style>