<script>
import Swal from 'sweetalert2';
import axios from 'axios';

export default {
  name: "LoginPage",
  data() {
    return {
      isRegister: false,
      maDG: "", 
      password: "",
      confirmPassword: "", 
      
      hoLot: "",
      ten: "",
      email: "",
      ngaySinh: "",
      gioiTinh: "Nam", 
      diaChi: "",
      soDienThoai: "",

      isPasswordVisible: false,
    };
  },
  mounted() {
    this.checkRouteQuery();
  },
  // 2. Theo dõi sự thay đổi URL (phòng trường hợp đang ở trang login bấm vào nút đăng ký trên header)
  watch: {
    '$route.query.view'(newView) {
      if (newView === 'register') {
        this.isRegister = true;
      } else {
        this.isRegister = false;
      }
    }
  },
  methods: {
    checkRouteQuery() {
      if (this.$route.query.view === 'register') {
        this.isRegister = true;
      } else {
        this.isRegister = false;
      }
    },

    // Sửa lại hàm toggleMode để cập nhật luôn URL cho đồng bộ (UX tốt hơn)
    toggleMode() {
      this.isRegister = !this.isRegister;
      
      // Reset form
      this.maDG = ""; this.password = ""; this.confirmPassword = ""; 
      this.hoLot = ""; this.ten = ""; this.email = ""; 
      this.ngaySinh = ""; this.diaChi = ""; this.soDienThoai = "";

      // Cập nhật URL mà không reload trang
      const query = this.isRegister ? { view: 'register' } : {};
      this.$router.replace({ query: query }).catch(() => {}); 
    },
    togglePassword() {
      this.isPasswordVisible = !this.isPasswordVisible;
    },
    
    toggleMode() {
      this.isRegister = !this.isRegister;
      // Reset form
      this.maDG = ""; this.password = ""; this.confirmPassword = ""; 
      this.hoLot = ""; this.ten = ""; this.email = ""; 
      this.ngaySinh = ""; this.diaChi = ""; this.soDienThoai = "";
    },

    handleSubmit() {
      if (this.isRegister) {
        this.handleRegister();
      } else {
        this.handleLogin();
      }
    },

    async handleLogin() {
  // 1. Sửa lỗi console.log: this.user không tồn tại, sửa thành in trực tiếp biến
  

  if (!this.maDG || !this.password) {
    Swal.fire({ icon: 'warning', title: 'Thiếu thông tin', text: 'Vui lòng nhập Mã độc giả và Mật khẩu!' });
    return;
  }

  try {
    // 2. QUAN TRỌNG: Kiểm tra lại Backend của bạn yêu cầu 'username' hay 'maDG'?
    // Nếu bảng độc giả dùng cột 'maDG', khả năng cao Backend cần nhận key là 'maDG'.
    // Mình sửa thành 'maDG' để đồng bộ với lúc Đăng Ký.
    const res = await axios.post('http://localhost:3000/api/taikhoan/login', {
      maDG: this.maDG,    // <--- Đã sửa từ 'username' thành 'maDG'
      password: this.password
    });

    console.log("Kết quả đăng nhập:", res.data);
    const { token, role, hoTen, maDG ,_id} = res.data; 

    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('user_name', hoTen);
    localStorage.setItem('maDG', maDG);
    localStorage.setItem('user_id', _id);

    Swal.fire({
      icon: 'success',
      title: 'Đăng nhập thành công',
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
      this.$router.push(role === 'docgia' ? '/trangchu' : '/trangchuadmin'); 
    });

  } catch (error) {
    console.error("Chi tiết lỗi:", error);
    
    // Hiển thị thông báo lỗi chính xác từ Server trả về
    Swal.fire({
      icon: 'error',
      title: 'Đăng nhập thất bại',
      text: error.response?.data?.message || "Sai tài khoản hoặc mật khẩu!",
    });
  }
},

    async handleRegister() {
      if (!this.maDG || !this.password || !this.confirmPassword || !this.ten || !this.email) {
        Swal.fire({ icon: 'warning', title: 'Thiếu thông tin', text: 'Vui lòng điền đầy đủ các trường bắt buộc!' });
        return;
      }

      if (this.password !== this.confirmPassword) {
        Swal.fire({ 
            icon: 'error', 
            title: 'Mật khẩu không khớp', 
            text: 'Mật khẩu và xác nhận mật khẩu phải giống nhau!' 
        });
        return;
      }

      try {
        const payload = {
          maDG: this.maDG,
          password: this.password,
          hoLot: this.hoLot,
          ten: this.ten,
          ngaySinh: this.ngaySinh,
          gioiTinh: this.gioiTinh === 'Nam',
          diaChi: this.diaChi,
          soDienThoai: this.soDienThoai,
          email: this.email,
          vaiTro: 'docgia'
        };

        await axios.post('http://localhost:3000/api/docgia', payload);

        Swal.fire({
          icon: 'success',
          title: 'Đăng ký thành công',
          text: 'Tài khoản đã được tạo. Vui lòng đăng nhập!',
          confirmButtonColor: '#d35400'
        }).then(() => {
          this.toggleMode();
        });

      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi đăng ký',
          text: error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.",
        });
      }
    }
  }
};
</script>

<template>
  <div class="limiter">
    <div class="container-login100">
      <div class="wrap-login100">
        
        <div class="login100-pic js-tilt" v-if="!isRegister">
         <img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="IMG"> 
        </div>

        <form class="login100-form" :class="{ 'form-register-mode': isRegister }" @submit.prevent="handleSubmit">
          
          <div class="title-box">
            <span class="login100-form-title">
              {{ isRegister ? 'Đăng Ký Tài Khoản' : 'Đăng Nhập' }}
            </span>
            <div class="sub-title">Dành cho Độc giả SechVN</div>
            <div class="line-break"></div>
          </div>

          <div class="input-fields-grid">
            
            <div class="wrap-input100" style="grid-column: 1 / -1;">
              <input class="input100" type="text" placeholder="Mã độc giả (Tên đăng nhập)" v-model="maDG">
              <span class="focus-input100"></span>
              <span class="symbol-input100"><i class='bx bx-user-circle'></i></span>
            </div>

            <div class="wrap-input100">
              <input class="input100" :type="isPasswordVisible ? 'text' : 'password'" placeholder="Mật khẩu" v-model="password">
              <span class="focus-input100"></span>
              <span class="symbol-input100"><i class='bx bx-key'></i></span>
              <span class="btn-show-pass" @click="togglePassword">
                <i class='bx' :class="isPasswordVisible ? 'bx-show' : 'bx-hide'"></i>
              </span>
            </div>

            <div class="wrap-input100" v-if="isRegister">
              <input class="input100" :type="isPasswordVisible ? 'text' : 'password'" placeholder="Nhập lại mật khẩu" v-model="confirmPassword">
              <span class="focus-input100"></span>
              <span class="symbol-input100"><i class='bx bx-check-double'></i></span>
            </div>

            <template v-if="isRegister">
                
                <div style="grid-column: 1 / -1; height: 1px; background: #eee; margin: 10px 0 20px 0;"></div>

                <div class="wrap-input100">
                  <input class="input100" type="text" placeholder="Họ lót" v-model="hoLot">
                  <span class="focus-input100"></span>
                  <span class="symbol-input100"><i class='bx bx-user'></i></span>
                </div>
                
                <div class="wrap-input100">
                  <input class="input100" type="text" placeholder="Tên" v-model="ten">
                  <span class="focus-input100"></span>
                  <span class="symbol-input100"><i class='bx bx-id-card'></i></span>
                </div>

                <div class="wrap-input100">
                  <input class="input100" type="email" placeholder="Email" v-model="email">
                  <span class="focus-input100"></span>
                  <span class="symbol-input100"><i class='bx bx-envelope'></i></span>
                </div>

                <div class="wrap-input100">
                    <input class="input100" type="text" placeholder="Số điện thoại" v-model="soDienThoai">
                    <span class="focus-input100"></span>
                    <span class="symbol-input100"><i class='bx bx-phone'></i></span>
                </div>

                <div class="wrap-input100">
                    <input class="input100" type="date" placeholder="Ngày sinh" v-model="ngaySinh" style="padding-top: 15px;">
                    <span class="focus-input100"></span>
                    <span class="symbol-input100"><i class='bx bx-calendar'></i></span>
                </div>

                <div class="wrap-input100">
                    <select class="input100" v-model="gioiTinh" style="padding-top:0; padding-bottom:0; cursor: pointer;">
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                    </select>
                    <span class="focus-input100"></span>
                    <span class="symbol-input100"><i class='bx bx-male-female'></i></span>
                </div>
                 
                 <div class="wrap-input100" style="grid-column: 1 / -1;">
                    <input class="input100" type="text" placeholder="Địa chỉ" v-model="diaChi">
                    <span class="focus-input100"></span>
                    <span class="symbol-input100"><i class='bx bx-map'></i></span>
                </div>
            </template>

          </div>

          <div class="container-login100-form-btn">
            <button class="login100-form-btn">
              {{ isRegister ? 'ĐĂNG KÝ' : 'ĐĂNG NHẬP' }}
            </button>
          </div>

          <div class="text-center footer-text">
            <span v-if="!isRegister">
              Chưa có tài khoản? 
              <a href="#" @click.prevent="toggleMode" style="color: #d35400; font-weight: bold;">Đăng ký ngay</a>
            </span>
            <span v-else>
              Đã có tài khoản? 
              <a href="#" @click.prevent="toggleMode" style="color: #d35400; font-weight: bold;">Quay lại Đăng nhập</a>
            </span>
          </div>
        </form>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* CSS GIỮ NGUYÊN */
@import url('https://unpkg.com/boxicons@latest/css/boxicons.min.css');
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Roboto:wght@400;500;700&display=swap');

.limiter { width: 100%; margin: 0 auto; font-family: 'Roboto', sans-serif; }
.container-login100 {
  width: 100%;  
  min-height: 100vh;
  display: flex; flex-wrap: wrap; justify-content: center; align-items: center; padding: 15px;
  background-image: url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80');
  background-repeat: no-repeat; background-position: center; background-size: cover;
}
.wrap-login100 {
  width: 900px; background: rgba(255, 255, 255, 0.25); 
  backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.4); border-radius: 20px;
  overflow: hidden; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center;
  padding: 60px 100px 60px 80px; box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
  transition: all 0.3s ease;
}
.login100-pic { width: 40%; display: flex; justify-content: center; align-items: center; }
.login100-pic img { width: 100%; border-radius: 10px; box-shadow: 0 10px 20px rgba(0,0,0,0.3); transition: transform 0.3s; }
.login100-pic img:hover { transform: scale(1.05); }
.login100-form { width: 50%; transition: all 0.3s ease; }
.title-box { text-align: center; margin-bottom: 40px; }
.login100-form-title {
  font-family: 'Playfair Display', serif; font-size: 40px; line-height: 1.2; font-weight: 700;
  background: -webkit-linear-gradient(45deg, #d35400, #2c3e50); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  display: block; padding-bottom: 5px;
}
.sub-title { font-family: 'Roboto', sans-serif; color: #555; font-size: 14px; letter-spacing: 1px; text-transform: uppercase; font-weight: 500; }
.line-break { width: 50px; height: 4px; background: #d35400; margin: 15px auto 0; border-radius: 2px; }
.wrap-input100 { position: relative; width: 100%; z-index: 1; margin-bottom: 20px; }
.input100 {
  font-size: 15px; color: #333; line-height: 1.2; display: block; width: 100%;
  background: #fdfdfd; height: 55px; border-radius: 30px; padding: 0 30px 0 60px;
  border: 2px solid transparent; outline: none; box-shadow: 0 3px 6px rgba(0,0,0,0.05); transition: all 0.3s;
}
.input100:focus { border-color: #d35400; box-shadow: 0 3px 10px rgba(211, 84, 0, 0.2); }
.symbol-input100 { font-size: 18px; display: flex; align-items: center; position: absolute; border-radius: 25px; bottom: 0; left: 0; width: 100%; height: 100%; padding-left: 25px; pointer-events: none; color: #888; transition: all 0.4s; }
.input100:focus + .focus-input100 + .symbol-input100 { color: #d35400; }
.btn-show-pass { font-size: 20px; color: #aaa; display: flex; align-items: center; position: absolute; height: 100%; top: 0; right: 20px; cursor: pointer; transition: all 0.3s; }
.btn-show-pass:hover { color: #d35400; }
.container-login100-form-btn { width: 100%; display: flex; flex-wrap: wrap; justify-content: center; padding-top: 10px; }
.login100-form-btn {
  font-size: 16px; color: #fff; line-height: 1.2; text-transform: uppercase; width: 100%; height: 55px; border-radius: 30px;
  background: linear-gradient(to right, #e67e22, #d35400); display: flex; justify-content: center; align-items: center; padding: 0 25px; transition: all 0.4s; border: none; cursor: pointer; font-weight: 700; box-shadow: 0 5px 15px rgba(211, 84, 0, 0.4);
}
.login100-form-btn:hover { background: linear-gradient(to right, #d35400, #b04100); transform: translateY(-2px); box-shadow: 0 8px 20px rgba(211, 84, 0, 0.6); }
.footer-text { margin-top: 50px; text-align: center; font-size: 14px; color: #444; font-weight: 500; }

.login100-form.form-register-mode { width: 100%; }
.login100-form.form-register-mode .input-fields-grid {
    display: grid;
    grid-template-columns: 1fr 1fr; 
    column-gap: 30px; 
}
@media (max-width: 992px) {
  .wrap-login100 { padding: 50px; width: 80%; }
  .login100-pic { width: 100%; margin-bottom: 30px; } 
  .login100-form { width: 100%; }
  .login100-form.form-register-mode .input-fields-grid {
      grid-template-columns: 1fr; 
  }
}
@media (max-width: 768px) {
    .login100-pic { display: none !important; }
    .login100-form { width: 100% !important; }
}
@media (max-width: 576px) {
  .wrap-login100 { padding: 30px 20px; }
}
</style>