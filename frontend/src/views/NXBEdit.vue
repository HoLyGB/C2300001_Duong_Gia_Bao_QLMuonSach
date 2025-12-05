<template>
    <h4><i class="fas fa-address-book"></i></h4>
    <h4><i class="fas fa-address-book"></i></h4>
             
<div v-if="nxb" >
    <NXBForm
      :nxb="nxb"
      :id="id"  @submit:nxb="updateNXB"
      @delete:nxb="deleteNXB"
    />
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
  props: {
    id: { type: String, required: true },
  },
  data() {
    return {
      nxb: null,
      message: "",
    };
  },
  methods: {
    async getNXB(id) {
      try {
        this.nxb = await NXBService.get(id);
      } catch (error) {
        console.log(error);
        // Nếu không tìm thấy, điều hướng về trang 404
        this.$router.push({
          name: "notfound",
          params: { pathMatch: this.$route.path.split("/").slice(1) },
          query: this.$route.query,
          hash: this.$route.hash,
        });
      }
    },
    async updateNXB(data) {
      try {
        await NXBService.update(this.nxb._id, data);
        alert("Nhà xuất bản được cập nhật thành công.");
        this.$router.push({ name: "nxbindex" });
      } catch (error) {
       
              console.log(error.response); // Quan trọng: Xem log này trong F12 Console

    // Thử dùng alert trực tiếp để test
    if (error.response && error.response.status === 409) {
        alert("Tên nhà xuất bản đã tồn tại!"); 
    }
            // TRƯỜNG HỢP 3: Các lỗi khác (Lỗi server, mất mạng...)
            else {
                this.message = "Có lỗi xảy ra khi cậpn nhật nhà xuất bản. Vui lòng thử lại.";
            }
      }
    },
    async deleteNXB() {
      if (confirm("Bạn muốn xóa nhà xuất bản này?")) {
        try {
          await NXBService.delete(this.nxb._id);
          this.$router.push({ name: "nxbindex" });
        } catch (error) {
          console.log(error);
          this.message = "Có lỗi xảy ra khi xóa nhà xuất bản.";
        }
      }
    },
  },
  created() {
    this.getNXB(this.id);
  },
};
</script>

<style scoped>
 @import "@/assets/form.css";
    @import "@/assets/main.css";
</style>
