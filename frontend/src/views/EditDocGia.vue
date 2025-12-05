<template>
  <div v-if="docGia" >

   <h4><i class="fas fa-address-book"></i></h4>
    <h4><i class="fas fa-address-book"></i></h4>

        <DocGiaForm
            :docGia="docGia"
            @submit:docGia="updateDocGia"
            @delete:docGia="deleteDocGia"
        />
        <p class="text-danger mt-2">{{ message }}</p>
 
  </div>
</template>

<script>
import DocGiaForm from "@/components/DocGiaForm.vue"; 
import DocGiaService from "@/services/docgia.service";

export default {
  components: {
    DocGiaForm,
  },
  props: {
    id: { type: String, required: true },
  },
  data() {
    return {
      docGia: null, // Chứa dữ liệu độc giả lấy từ Server
      message: "",
    };
  },
  methods: {
    // 1. Lấy thông tin độc giả từ Server khi vào trang
    async getDocGia(id) {
      try {
        this.docGia = await DocGiaService.get(id);
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

    // 2. Cập nhật độc giả (Nhận data từ Form)
    async updateDocGia(data) {
      try {
        // Gọi API update
        await DocGiaService.update(this.docGia._id, data);
        
        alert("Thông tin độc giả được cập nhật thành công.");
        
        // Quay về trang danh sách
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

    // 3. Xóa độc giả
    async deleteDocGia() {
      if (confirm("Bạn muốn xóa độc giả này? Hành động này không thể hoàn tác.")) {
        try {
          await DocGiaService.delete(this.docGia._id);
          // Quay về trang danh sách sau khi xóa
          this.$router.push({ name: "docgiaindex" });
        } catch (error) {
          console.log(error);
          this.message = "Có lỗi xảy ra khi xóa độc giả.";
        }
      }
    },
  },
  created() {
    // Gọi hàm lấy dữ liệu ngay khi trang được tạo
    this.getDocGia(this.id);
    this.message = "";
  },
};
</script>

<style scoped>
  @import "@/assets/form.css";
  @import "@/assets/main.css";
  
  .page {
    max-width: 100%;
  }
</style>