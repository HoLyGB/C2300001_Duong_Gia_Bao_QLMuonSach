<script>
import AppHeader from "@/components/AppHeader.vue";
import Header from "@/components/DocGia/Header.vue";

export default {
  components: { 
    AppHeader, 
    Header 
  },
  computed: {
    layout() {
      const path = this.$route.path;


      if (path.includes('dangnhap') || path.includes('dangky')) {
        return 'none'; 
      }

      // 2. Kiểm tra trang Độc giả
      if (path.includes('nhanvien')|| path.includes('docgia') || path.includes('nhaxuatban') 
      || path.includes('sach')|| path.includes('theodoimuon')|| path.includes('trangchuadmin'))  {
        return 'admin';
      }

      
      return 'docgia';
    }
  }
};
</script>

<template>
  <div id="app">
    
    <Header v-if="layout === 'docgia'" />

    <AppHeader v-else-if="layout === 'admin'" />

    <div>
      <router-view />
    </div>

  </div>
</template>

<style>
.page {
  max-width: 400px;
  margin: auto;
}
</style>