



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
 <!-- <div class="mt-3 row justify-content-around align-items-center">
        <button class="btn btn-sm btn-primary" @click="refreshList">
          <i class="fas fa-redo"></i> Làm mới
        </button>
        <button class="btn btn-sm btn-success" @click="goToAddContact">
          <i class="fas fa-plus"></i> Thêm mới
        </button>
        <button class="btn btn-sm btn-danger" @click="removeAllContacts">
          <i class="fas fa-trash"></i> Xóa tất cả
        </button>
      </div> -->
 <div>
  <NXBList

    :nhaxuatban="filteredContacts"
    v-model:activeIndex="activeIndex"
    @delete:nxb="handleDelete"
  />

</div>
  
  
    </div>


  </div> </template>

<script>
import InputSearch from "@/components/InputSearch.vue";
import NXBList from "@/components/NXBList.vue";
import nxb from "@/services/nhaxuatban.service";

export default {
  
  components: {
    InputSearch,
    NXBList,
  },
  data() {
    return {
      nhaxuatban: [],
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
      return this.nhaxuatban.map((c) => {
        const { tenNXB, diaChi} = c;
        return [tenNXB, diaChi].join("").toLowerCase();
      });
    },
    filteredContacts() {
      if (!this.searchText) return this.nhaxuatban;
      return this.nhaxuatban.filter((_c, i) =>
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
        // 1. Gọi service để XÓA thật từ Cơ sở dữ liệu
        // await NXBService.delete(id);
       await nxb.delete(id);
        this.refreshList(); 

      } catch (error) {
        console.log(error);
        alert("Có lỗi xảy ra khi xóa nhà xuất bản.");
      }
    },
  



    async retrieveContacts() {
      try {
        this.nhaxuatban = await nxb.getAll();
      } catch (err) {
        console.error(err);
      }
    },
    refreshList() {
      this.retrieveContacts();
      this.activeIndex = -1;
    },
    // async removeAllContacts() {
    //   if (confirm("Bạn muốn xóa tất cả Liên hệ?")) {
    //     try {
    //       await nxb.deleteAll();
    //       this.refreshList();
    //     } catch (err) {
    //       console.error(err);
    //     }
    //   }
    // },
    goToAddContact() {
      this.$router.push({ name: "nhaxuatban.add" });
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
.empty-message {
  text-align: center; /* Căn chữ ra giữa */
  color: #888;         /* Cho chữ màu xám (tùy chọn) */
  margin-top: 20px;   /* Thêm chút khoảng cách bên trên (tùy chọn) */
  font-style: italic; /* In nghiêng (tùy chọn) */
}
</style>






 