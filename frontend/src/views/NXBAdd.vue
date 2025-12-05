<template>
   <h4>
       <i class="fas fa-address-book"></i>
      </h4>
<h4>
        <i class="fas fa-address-book"></i>
      </h4>
  <div >
    <NXBForm :nxb="nxb" @submit:nxb="createNXB" ref="nxbForm" />
    <p>{{ message }}</p>
  </div>
</template>

<script>
import NXBForm from "@/components/NXBForm.vue";
import NXBService from "@/services/nhaxuatban.service";

export default {

  components: {
    NXBForm,
  },
  data() {
    return {
      nxb: {
        tenNXB: "",
        diaChi: ""
      },
      message: "",
    };
  },
methods: {
    async createNXB(data) {
        try {
            await NXBService.create(data);
            alert("Nhà xuất bản được thêm mới thành công.");
            this.$router.push({ name: "nxbindex" });
            // this.$refs.nxbForm.resetForm();
            // Xóa thông báo lỗi cũ nếu có
            this.message = ""; 

        } catch (error) {
         console.log(error.response); 

    // Thử dùng alert trực tiếp để test
    if (error.response && error.response.status === 409) {
        alert("Tên nhà xuất bản đã tồn tại!"); 
    }
            // TRƯỜNG HỢP 3: Các lỗi khác (Lỗi server, mất mạng...)
            else {
                this.message = "Có lỗi xảy ra khi thêm mới nhà xuất bản. Vui lòng thử lại.";
            }
        }
    },
},
};
</script>