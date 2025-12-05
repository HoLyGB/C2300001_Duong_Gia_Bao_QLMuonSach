<template>
  <footer>
    <!-- ============== Alert Box ============= -->
    <!-- Sử dụng v-if để ẩn hiện alert khi bấm nút đóng -->
    <div id="alert" v-if="isAlertOpen">
      <span id="closebtn" @click="closeAlert">&otimes;</span>
      <p>Chào mừng bạn đến với SechVN!</p> <!-- Thêm nội dung mẫu cho alert -->
    </div>

    <!-- ============== Footer ============= -->
    <div class="copy-right">
      <p>
        <!-- Đổi a href="index.html" thành router-link -->
        <router-link :to="{ name: 'trangchu' }">
          SechVN
        </router-link> 
        - All rights reserved © 2021 - Designed by
        <span style="color: #eee; font-weight: bold">group 15th</span>
      </p>
    </div>
  </footer>
</template>

<script>
export default {
  name: "TheFooter",
  data() {
    return {
      isAlertOpen: true // Mặc định hiển thị Alert khi vào trang
    };
  },
  methods: {
    closeAlert() {
      this.isAlertOpen = false;
    }
  }
};
</script>

<style scoped>
/* Import CSS Footer cũ */
@import "@/assets/css/footer.css";

/* CSS bổ sung cho Alert nếu file cũ chưa có hoặc bị vỡ layout */
#alert {
  padding: 20px;
  background-color: #f44336; /* Màu đỏ */
  color: white;
  position: fixed;
  bottom: 0; /* Hiện ở góc dưới màn hình */
  right: 0;
  z-index: 999;
  border-radius: 5px;
  margin: 10px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

#closebtn {
  margin-left: 15px;
  color: white;
  font-weight: bold;
  float: right;
  font-size: 22px;
  line-height: 20px;
  cursor: pointer;
  transition: 0.3s;
}

#closebtn:hover {
  color: black;
}
</style>