<template>
  <div class="page">
    <div class="tile">
        <h3 class="tile-title">Thêm mới Độc giả</h3>
    </div>

    <div>
      <DocGiaForm 
        :docGia="docGia" 
        @submit:docGia="createDocGia" 
        ref="docGiaForm" 
      />
      <p class="text-danger mt-2">{{ message }}</p>
    </div>
  </div>
</template>

<script>
// Import Form và Service Độc giả
// LƯU Ý: Kiểm tra lại đường dẫn import file DocGiaForm.vue cho đúng với dự án của bạn
import DocGiaForm from "@/components/DocGiaForm.vue"; 
import DocGiaService from "@/services/docgia.service";

export default {
  components: {
    DocGiaForm,
  },
  data() {
    return {
      // Khởi tạo object Độc giả rỗng theo cấu trúc chuẩn
      docGia: {
        maDG: "",
        hoLot: "",
        ten: "",
        ngaySinh: "",
        gioiTinh: false, // Mặc định Nam
        diaChi: "",
        soDienThoai: "",
        email: "",
        password: "",    // Form nhập liệu sẽ điền vào đây
        vaiTro: "docgia"
      },
      message: "",
    };
  },
  methods: {
    // Hàm này nhận data từ DocGiaForm gửi lên (payload)
    async createDocGia(data) {
      try {
        console.log("Dữ liệu Độc giả gửi đi:", data); // <--- XEM KỸ DÒNG NÀY TRONG F12
        // Gọi Service để tạo mới
        await DocGiaService.create(data);
        
        alert("Độc giả được thêm mới thành công!");
        
        // Chuyển hướng về trang danh sách độc giả
        this.$router.push({ name: "docgiaindex" });
        
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
  },
};
</script>

<style scoped>
/* Style tùy chỉnh nếu cần */
.page {
    max-width: 100%;
}
</style>