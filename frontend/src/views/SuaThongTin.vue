<template>
  <div class="profile-wrapper">
    <div class="container mt-5 mb-5">
      <h4><i class="fas fa-address-book"></i> Hồ sơ cá nhân</h4>
      
      <div class="row">
        <div class="col-md-4 mb-3">
             <div class="card shadow-sm h-100">
                <div class="card-body text-center">
                  <img 
                    :src="currentUser.gioiTinh 
                      ? 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' 
                      : 'https://cdn-icons-png.flaticon.com/512/3135/3135768.png'" 
                    alt="Avatar" 
                    class="rounded-circle img-thumbnail mb-3" 
                    width="150"
                  >
                  <h4 class="font-weight-bold">{{ currentUser.hoLot }} {{ currentUser.ten }}</h4>
                  <p class="text-muted">{{ currentUser.email }}</p>
                  <div class="mt-4 text-left px-4">
                    <p><i class="fa fa-id-card text-primary mr-2"></i> <strong>Mã ĐG:</strong> {{ currentUser.maDG }}</p>
                    <p><i class="fa fa-user-tag text-info mr-2"></i> <strong>Vai trò:</strong> {{ currentUser.vaiTro }}</p>
                  </div>
                </div>
              </div>
        </div>

        <div class="col-md-8">
          
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-white border-bottom">
              <h5 class="mb-0 text-primary"><i class="fa fa-user-edit"></i> Chỉnh sửa thông tin</h5>
            </div>
            <div class="card-body">
                 <form @submit.prevent="updateProfile">
                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label>Họ lót <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" v-model="currentUser.hoLot" required>
                        </div>
                        <div class="form-group col-md-6">
                            <label>Tên <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" v-model="currentUser.ten" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Số điện thoại <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" v-model="currentUser.soDienThoai" required>
                    </div>
                     <div class="form-group">
                        <label>Email <span class="text-danger">*</span></label>
                        <input type="email" class="form-control" v-model="currentUser.email" required>
                    </div>
                    <div class="form-group">
                        <label>Địa chỉ</label>
                        <input type="text" class="form-control" v-model="currentUser.diaChi">
                    </div>

                    <div class="d-flex justify-content-end">
                        <button type="submit" class="btn btn-primary px-4">
                            <i class="fa fa-save"></i> Lưu thông tin
                        </button>
                    </div>
                 </form>
            </div>
          </div>

          <div class="card shadow-sm">
            <div class="card-header bg-white border-bottom">
              <h5 class="mb-0 text-danger"><i class="fa fa-key"></i> Đổi mật khẩu</h5>
            </div>
            <div class="card-body">
              <form @submit.prevent="submitChangePassword">
                <div class="form-group">
                  <label>Mật khẩu hiện tại</label>
                  <input type="password" class="form-control" v-model="passwordData.current" required>
                </div>
                
                <div class="form-row">
                  <div class="form-group col-md-6">
                    <label>Mật khẩu mới</label>
                    <input type="password" class="form-control" v-model="passwordData.new" required>
                  </div>
                  <div class="form-group col-md-6">
                    <label>Xác nhận mật khẩu mới</label>
                    <input type="password" class="form-control" v-model="passwordData.confirm" required>
                  </div>
                </div>

                <div class="d-flex justify-content-end">
                  <button type="submit" class="btn btn-danger px-4">
                    <i class="fa fa-lock"></i> Đổi mật khẩu
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from "sweetalert2";
import DocGiaService from "@/services/docgia.service";

export default {
  name: "UserProfile",
  data() {
    return {
      currentUser: {
        _id: "",
        maDG: "",
        hoLot: "",
        ten: "",
        ngaySinh: "",
        gioiTinh: true,
        diaChi: "",
        soDienThoai: "",
        email: "",
        vaiTro: ""
      },
      passwordData: {
        current: "",
        new: "",
        confirm: ""
      }
    };
  },
  mounted() {
    this.fetchUserInfo();
  },
  methods: {
    async fetchUserInfo() {
      const id = localStorage.getItem("user_id"); 
      
      if (!id) {
        this.$router.push("/dangnhap");
        return;
      }

      try {
        const data = await DocGiaService.get(id);
        console.log("Dữ liệu Server trả về:", data);
        if (data.ngaySinh) {
            data.ngaySinh = new Date(data.ngaySinh).toISOString().split('T')[0];
        }

        this.currentUser = data;

        if (!this.currentUser.maDG) this.currentUser.maDG = localStorage.getItem("maDG");

      } catch (error) {
        console.log(error);
        Swal.fire("Lỗi", "Không thể tải thông tin người dùng", "error");
      }
    },

    async updateProfile() {
      // 1. KIỂM TRA DỮ LIỆU RỖNG (Bao gồm cả Email)
      if (!this.currentUser.hoLot || !this.currentUser.ten || !this.currentUser.soDienThoai || !this.currentUser.email) {
          Swal.fire({
            icon: 'warning',
            title: 'Thiếu thông tin',
            text: 'Vui lòng điền đầy đủ Họ tên, Số điện thoại và Email!'
          });
          return;
      }

      // 2. KIỂM TRA ĐỊNH DẠNG EMAIL
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.currentUser.email)) {
          Swal.fire({
            icon: 'warning',
            title: 'Email không hợp lệ',
            text: 'Vui lòng nhập đúng định dạng email (ví dụ: abc@gmail.com)!'
          });
          return;
      }

      // 3. KIỂM TRA ĐỊNH DẠNG SỐ ĐIỆN THOẠI
      const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
      if (!phoneRegex.test(this.currentUser.soDienThoai)) {
          Swal.fire({
            icon: 'warning',
            title: 'SĐT không hợp lệ',
            text: 'Số điện thoại phải là số Việt Nam (10 số)!'
          });
          return;
      }

      try {
        const dataUpdate = {
            hoLot: this.currentUser.hoLot,
            ten: this.currentUser.ten,
            ngaySinh: this.currentUser.ngaySinh,
            gioiTinh: this.currentUser.gioiTinh,
            diaChi: this.currentUser.diaChi,
            soDienThoai: this.currentUser.soDienThoai,
            email: this.currentUser.email // <--- Gửi thêm Email lên Server
        };

        await DocGiaService.update(this.currentUser._id, dataUpdate);

        Swal.fire({
          icon: "success",
          title: "Thành công",
          text: "Thông tin đã được cập nhật!",
          timer: 1500,
          showConfirmButton: false
        });

      } catch (error) {
        console.log(error);
        
        // 4. BẮT LỖI TRÙNG LẶP TỪ BACKEND (Email hoặc SĐT đã tồn tại)
        if (error.response) {
            if (error.response.status === 409) {
                // Backend nên trả về message cụ thể là trùng cái gì
                const msg = error.response.data.message || "Email hoặc Số điện thoại đã được sử dụng bởi tài khoản khác!";
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi trùng lặp',
                    text: msg
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Thất bại',
                    text: error.response.data.message || "Lỗi cập nhật thông tin."
                });
            }
        } else {
             Swal.fire("Lỗi", "Không thể kết nối đến Server.", "error");
        }
      }
    },
    async submitChangePassword() {
        // 1. Validate mật khẩu mới
        if (this.passwordData.new.length < 6) {
             Swal.fire("Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự!", "warning");
             return;
        }

        if (this.passwordData.new !== this.passwordData.confirm) {
             Swal.fire("Lỗi", "Mật khẩu xác nhận không khớp!", "error");
             return;
        }

        try {
            // Gọi API đổi mật khẩu
            await DocGiaService.changePassword(this.currentUser._id, {
                matKhauCu: this.passwordData.current,
                matKhauMoi: this.passwordData.new
            });

            // Thành công -> Reset form
            Swal.fire("Thành công", "Đổi mật khẩu thành công!", "success");
            this.passwordData = { current: "", new: "", confirm: "" };

        } catch (error) {
            console.log(error);
            if (error.response && error.response.status === 401) {
                Swal.fire("Thất bại", "Mật khẩu hiện tại không đúng!", "error");
            } else {
                Swal.fire("Lỗi", error.response?.data?.message || "Lỗi khi đổi mật khẩu", "error");
            }
          
  }
} }
};  
</script>

<style scoped>
.profile-wrapper {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding-bottom: 20px;
}
.card {
  border: none;
  border-radius: 10px;
}
.form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}
</style>