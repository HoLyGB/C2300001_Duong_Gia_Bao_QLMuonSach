<template>

 <h4><i class="fas fa-user-plus"></i></h4>
 <h4><i class="fas fa-user-plus"></i></h4>
    <div>
      <NhanVienForm 
        :nhanVien="nhanVien" 
        @submit:nhanVien="createNhanVien" 
        ref="nhanVienForm" 
      />
      <p>{{ message }}</p>
    </div>

</template>

<script>
// Nhớ đảm bảo bạn đã tạo file NhanVienForm.vue
import NhanVienForm from "@/components/NhanVienForm.vue"; 
import NhanVienService from "@/services/nhanvien.service";

export default {
  components: {
    NhanVienForm,
  },
  data() {
    return {
      // Khởi tạo object nhân viên theo đúng yêu cầu
      nhanVien: {
        maNV: "",
        hoTen: "",
        chucVu: "",
        email:"",
        soDienThoai: "",
        gioiTinh: "",
        diaChi: "",
      },
      message: "",
    };
  },
  methods: {
    // Hàm này nhận data từ NhanVienForm gửi lên
    async createNhanVien(data) {
      try {

        data.matKhau = data.maNV;
        await NhanVienService.create(data);
        
        alert("Nhân viên được thêm mới thành công!");
        
        // Chuyển hướng về trang danh sách nhân viên
        this.$router.push({ name: "nhanvienindex" });
        
      } catch (error) {
        console.log(error);
                if (error.response && error.response.status === 409) {
            alert("Mã nhân viên hoặc thông tin đã tồn tại!");
        } else {
            this.message = "Có lỗi xảy ra khi thêm mới nhân viên.";
        }
      }
    },
  },
};
</script>