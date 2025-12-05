<template>
   <h4>
       <i class="fas fa-address-book"></i>
      </h4>
<h4>
        <i class="fas fa-address-book"></i>
      </h4>
      
  <div >
    <SachForm :sach="sach" @submit:sach="createSach" ref="sachForm" />
    <p>{{ message }}</p>
  </div>
</template>

<script>
import SachForm from "@/components/SachForm.vue";
import SachService from "@/services/sach.service";

export default {

  components: {
    SachForm,
  },
  data() {
    return {
      sach: {
        tenSach: "",
        donGia: "",
        soQuyen: "",
        namXuatBan: "",
        tacGia: "",
        hinhAnh: "",
        maNXB: ""
        
      },
      message: "",
    };
  },
methods: {
    async createSach(data, file) {
        try {
            // 1. Tạo đối tượng FormData
            const formData = new FormData();

            // 2. Đóng gói từng trường dữ liệu chữ vào FormData
            formData.append("tenSach", data.tenSach);
            formData.append("donGia", data.donGia);
            formData.append("soQuyen", data.soQuyen);
            formData.append("namXuatBan", data.namXuatBan);
            formData.append("tacGia", data.tacGia);
            formData.append("maNXB", data.maNXB); // Quan trọng: ID của NXB

            // 3. Đóng gói file ảnh (nếu có)
            if (file) {
                // 'hinhAnh' là tên trường mà Backend (Multer) đang chờ
                formData.append("hinhAnh", file); 
            }

            // 4. Gọi API với formData (chứ không phải data thường)
            await SachService.create(formData);
            alert("Sách được thêm mới thành công!");
            this.$router.push({ name: "sachindex" });
            // this.$refs.sachForm.resetForm();
            this.message = ""; 
        } catch (error) {
            console.log(error);
            if (error.response && error.response.status === 409) {
        alert("Tên sách đã tồn tại!"); 
    }
            // TRƯỜNG HỢP 3: Các lỗi khác (Lỗi server, mất mạng...)
            else {
                this.message = "Có lỗi xảy ra khi thêm mới sách. Vui lòng thử lại.";
            }
        }
    },
}
};
</script>