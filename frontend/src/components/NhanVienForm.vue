<template>
  <main class="app-content">
    <div class="app-title">
      <ul class="app-breadcrumb breadcrumb">
        <li class="breadcrumb-item">Danh sách nhân viên</li>
        <li class="breadcrumb-item"><a href="#">{{ id ? "Chỉnh sửa nhân viên" : "Thêm nhân viên" }}</a></li>
      </ul>
    </div>
    <div class="row">
      <div class="col-md-12">
        <div class="tile">
          <h3 class="tile-title">
            {{ nhanVienLocal._id ? "Chỉnh sửa nhân viên" : "Tạo mới nhân viên" }}
          </h3>
          <div class="tile-body">
            <div class="row element-button">
              <div class="col-sm-2">
                <button class="btn btn-sm btn-info" @click="cancel">
                  <i class="fas fa-list"></i> Danh sách nhân viên
                </button>
              </div>
            </div>

            <Form ref="veeForm" @submit="submitNhanVien" :validation-schema="nhanVienFormSchema" class="row">

              <div class="form-group col-md-6">
                <label class="control-label font-weight-bold">Mã nhân viên <span class="text-danger">*</span></label>
                <!-- Trường hợp Thêm mới: Cho nhập -->
                <Field v-if="!nhanVienLocal._id"
                    name="maNV" 
                    type="text" 
                    class="form-control" 
                    v-model="nhanVienLocal.maNV" 
                    placeholder="Nhập mã (VD: NV001)" 
                />
                <!-- Trường hợp Edit: Chỉ đọc -->
                <Field v-else
                    name="maNV" 
                    type="text" 
                    class="form-control" 
                    v-model="nhanVienLocal.maNV" 
                    readonly
                    disabled
                    style="background-color: #e9ecef; cursor: not-allowed;"
                />
                <ErrorMessage name="maNV" class="error-feedback text-danger" />
                <small v-if="nhanVienLocal._id" class="text-muted font-italic">Mã nhân viên không thể thay đổi.</small>
              </div>

              <div class="form-group col-md-6">
                <label class="control-label font-weight-bold">Họ và tên</label>
                <Field 
                    name="hoTen" 
                    type="text" 
                    class="form-control" 
                    v-model="nhanVienLocal.hoTen" 
                    placeholder="Nhập họ tên nhân viên"
                />
                <ErrorMessage name="hoTen" class="error-feedback text-danger" />
              </div>

              <div class="form-group col-md-6">
                <label class="control-label font-weight-bold">Giới tính</label>
                <Field 
                    name="gioiTinh" 
                    as="select" 
                    class="form-control" 
                    v-model="nhanVienLocal.gioiTinh"
                >
                    <option value="" disabled>-- Chọn giới tính --</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                </Field>
                <ErrorMessage name="gioiTinh" class="error-feedback text-danger" />
              </div>

              <div class="form-group col-md-6">
                  <label class="control-label font-weight-bold">Chức vụ</label>
                  <Field 
                      name="chucVu" 
                      as="select" 
                      class="form-control" 
                      v-model="nhanVienLocal.chucVu"
                  >
                      <option value="" disabled>-- Chọn chức vụ --</option>
                      <option value="Thủ thư">Thủ thư</option>
                      <option value="Nhân viên kho sách">Nhân viên kho sách</option>
                      <option value="Nhân viên mượn trả">Nhân viên mượn trả</option>
                      <option value="Quản lý thư viện">Quản lý thư viện</option>
              
                  </Field>
                  <ErrorMessage name="chucVu" class="error-feedback text-danger" />
              </div>

              <div class="form-group col-md-6">
                <label class="control-label font-weight-bold">Email</label>
                <Field 
                    name="email" 
                    type="email" 
                    class="form-control" 
                    v-model="nhanVienLocal.email" 
                    placeholder="Nhập địa chỉ email"
                />
                <ErrorMessage name="email" class="error-feedback text-danger" />
              </div>

              <div class="form-group col-md-6">
                <label class="control-label font-weight-bold">Số điện thoại</label>
                <Field 
                    name="soDienThoai" 
                    type="text" 
                    class="form-control" 
                    v-model="nhanVienLocal.soDienThoai" 
                    placeholder="Nhập số điện thoại"
                />
                <ErrorMessage name="soDienThoai" class="error-feedback text-danger" />
              </div>

              <div class="form-group col-md-12">
                <label class="control-label font-weight-bold">Địa chỉ</label>
                <Field 
                    name="diaChi" 
                    type="text" 
                    class="form-control" 
                    v-model="nhanVienLocal.diaChi" 
                    placeholder="Nhập địa chỉ liên hệ"
                />
                <ErrorMessage name="diaChi" class="error-feedback text-danger" />
              </div>

              <div class="form-group col-12 text-center mt-3">
                <button class="btn btn-primary" type="submit">
                  <i class="fas fa-save"></i> Lưu nhân viên
                </button>

                <button v-if="nhanVienLocal._id" type="button" class="ml-2 btn btn-danger" @click="deleteNhanVien">
                  <i class="fas fa-trash"></i> Xóa
                </button>

                <button v-if="!nhanVienLocal._id" type="button" class="ml-2 btn btn-secondary" @click="resetForm">
                  <i class="fas fa-redo"></i> Làm lại
                </button>
                
                <button type="button" class="ml-2 btn btn-warning" @click="cancel">
                    <i class="fas fa-sign-out-alt"></i> Thoát
                </button>
              </div>

            </Form>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import * as yup from "yup";
import { Form, Field, ErrorMessage } from "vee-validate";

export default {
  components: {
    Form,
    Field,
    ErrorMessage,
  },
  emits: ["submit:nhanVien", "delete:nhanVien"],
  props: {
    id: { type: String, default: null },
    nhanVien: { type: Object, required: true },
  },
  data() {
    // Định nghĩa luật kiểm tra dữ liệu (Validation) cho Nhân Viên
    const nhanVienFormSchema = yup.object().shape({
      maNV: yup
        .string()
        .required("Mã nhân viên không được để trống.")
        .min(2, "Mã nhân viên phải có ít nhất 2 ký tự.")
        .max(20, "Mã nhân viên tối đa 20 ký tự."),

      hoTen: yup
        .string()
        .required("Họ tên không được để trống.")
        .min(2, "Tên phải ít nhất 2 ký tự.")
        .max(100, "Tên tối đa 100 ký tự."),

      // Validation cho Giới tính
      gioiTinh: yup
        .string()
        .required("Vui lòng chọn giới tính."),

      chucVu: yup
        .string()
        .required("Chức vụ không được để trống."),
      
      // Validation cho Email
      email: yup
        .string()
        .required("Email không được để trống.")
        .email("Email không đúng định dạng."),

      soDienThoai: yup
        .string()
        .matches(/((09|03|07|08|05)+([0-9]{8})\b)/g, "Số điện thoại không hợp lệ (VN).")
        .required("Số điện thoại không được để trống."),

      diaChi: yup
        .string()
        .required("Địa chỉ không được để trống.")
        .max(200, "Địa chỉ tối đa 200 ký tự."),
    });

    return {
      // Khởi tạo object chứa dữ liệu form
      nhanVienLocal: this.nhanVien ? { ...this.nhanVien } : {
        maNV: "",
        hoTen: "",
        gioiTinh: "", 
        chucVu: "",
        email: "",    
        soDienThoai: "",
        diaChi: "",
      },
      nhanVienFormSchema,
    };
  },
  methods: {
    submitNhanVien() {
      // Gửi dữ liệu JSON thuần (không gửi file)
      this.$emit("submit:nhanVien", this.nhanVienLocal);
    },

    resetForm() {
      this.nhanVienLocal = {
        maNV: "",
        hoTen: "",
        gioiTinh: "",
        chucVu: "",
        email: "",
        soDienThoai: "",
        diaChi: "",
      };
      this.$refs.veeForm.resetForm();
    },

    deleteNhanVien() {
      this.$emit("delete:nhanVien", this.nhanVienLocal._id);
    },

    cancel() {
      // Quay về trang danh sách nhân viên
      this.$router.push({ name: "nhanvienindex" });
    },
  },
  watch: {
    // Theo dõi prop 'nhanVien' để cập nhật form khi sửa
    nhanVien(newVal) {
      this.nhanVienLocal = { ...newVal };
    },
  },
};
</script>

<style scoped>
 @import "@/assets/form.css";
 @import "@/assets/main.css";
</style>