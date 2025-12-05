<template>

   <main class="app-content">
    <div class="app-title">
      <ul class="app-breadcrumb breadcrumb">
        <li class="breadcrumb-item">Danh sách của sách</li>
        <li class="breadcrumb-item"><a href="#">{{ id ? "Chỉnh sửa sách" : "Thêm sách" }}</a></li>
      </ul>
    </div>
    <div class="row">
      <div class="col-md-12">

        <div class="tile">

    <h3 class="tile-title">
  {{ sachLocal._id ? "Chỉnh sửa sách" : "Tạo mới sách" }}
</h3>
          <div class="tile-body">
            <div class="row element-button">
              <div class="col-sm-2">
                    <button class="btn btn-sm btn-info" @click="cancel">
        <i class="fas fa-list"></i> Danh sách của sách
    </button>
              </div>

            </div>
             
          <Form ref="veeForm" @submit="submitSach" :validation-schema="sachFormSchema" class="row">

    <div class="form-group col-md-12">
        <label class="control-label font-weight-bold">Tên sách</label>
        <Field name="tenSach" type="text" class="form-control" v-model="sachLocal.tenSach" placeholder="Nhập tên sách" />
        <ErrorMessage name="tenSach" class="error-feedback text-danger" />
    </div>

    <div class="form-group col-md-6">
        <label class="control-label font-weight-bold">Tác giả</label>
        <Field name="tacGia" type="text" class="form-control" v-model="sachLocal.tacGia" />
        <ErrorMessage name="tacGia" class="error-feedback text-danger" />
    </div>

    <div class="form-group col-md-6">
        <label class="control-label font-weight-bold">Năm xuất bản</label>
        <Field name="namXuatBan" type="number" class="form-control" v-model="sachLocal.namXuatBan" />
        <ErrorMessage name="namXuatBan" class="error-feedback text-danger" />
    </div>

    <div class="form-group col-md-6">
        <label class="control-label font-weight-bold">Đơn giá</label>
        <Field name="donGia" type="number" class="form-control" v-model="sachLocal.donGia" />
        <ErrorMessage name="donGia" class="error-feedback text-danger" />
    </div>

    <div class="form-group col-md-6">
        <label class="control-label font-weight-bold">Số quyển</label>
        <Field name="soQuyen" type="number" class="form-control" v-model="sachLocal.soQuyen" />
        <ErrorMessage name="soQuyen" class="error-feedback text-danger" />
    </div>
<div class="form-group col-md-6">
    <label class="control-label font-weight-bold">Nhà xuất bản</label>
    
    <Field 
        name="maNXB" 
        as="select" 
        class="form-control" 
        v-model="sachLocal.maNXB"
    >
        <option value="" disabled>-- Chọn nhà xuất bản --</option>
        
        <option 
            v-for="nxb in danhSachNXB" 
            :key="nxb._id" 
            :value="nxb._id"
        >
            {{ nxb.tenNXB }}
        </option>
    </Field>
    
    <ErrorMessage name="maNXB" class="error-feedback text-danger" />
</div>
    <div class="form-group col-md-6">
        <label class="control-label font-weight-bold">Ảnh bìa sách</label>
        <input type="file" class="form-control-file" @change="handleFileUpload" accept="image/*" />
        
        <div class="mt-3" v-if="previewImage || sachLocal.hinhAnh">
            <p>Xem trước:</p>
            <img 
                :src="previewImage || 'http://localhost:3000/uploads/' + sachLocal.hinhAnh" 
                alt="Ảnh sách" 
                style="max-width: 200px; border: 1px solid #ccc; border-radius: 5px;"
            >
        </div>
    </div>

    <div class="form-group col-12 text-center mt-3">
         <button class="btn btn-primary" type="submit">
                  <i class="fas fa-save"></i> Lưu sách
                </button>

        <button v-if="sachLocal._id" type="button" class="ml-2 btn btn-danger" @click="deleteSach">
            <i class="fas fa-trash"></i> Xóa
        </button>

     <button v-if="!sachLocal._id" type="button" class="ml-2 btn btn-secondary" @click="resetForm">
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
// ... Phần script của bạn đã chính xác, giữ nguyên ...
import * as yup from "yup";
import { Form, Field, ErrorMessage } from "vee-validate";
import NXBService from "@/services/nhaxuatban.service";
export default {
  components: {
    Form,
    Field,
    ErrorMessage,
  },
  emits: ["submit:sach", "delete:sach"],
  props: {
   id: { type: String, default: null },
    sach: { type: Object, required: true },
  },
data() {
    // Định nghĩa luật kiểm tra dữ liệu (Validation)
    const sachFormSchema = yup.object().shape({
        
        // 1. Tên sách (Chuỗi)
        tenSach: yup
            .string()
            .required("Tên sách không được để trống.")
            .min(2, "Tên sách phải ít nhất 2 ký tự.")
            .max(100, "Tên sách tối đa 100 ký tự."),

        // 2. Đơn giá (Số)
        donGia: yup
            .number()
            .typeError("Đơn giá phải là một số.") // Bắt lỗi nếu người dùng nhập chữ
            .required("Đơn giá không được để trống.")
            .min(1000, "Đơn giá tối thiểu phải là 1.000 đồng."),

        // 3. Số quyển (Số nguyên)
        soQuyen: yup
            .number()
            .typeError("Số quyển phải là một số.")
            .required("Số quyển không được để trống.")
            .min(1, "Số quyển phải lớn hơn 0.")
            .integer("Số quyển phải là số nguyên."),

        // 4. Năm xuất bản (Số - Không được lớn hơn năm hiện tại)
        namXuatBan: yup
            .number()
            .typeError("Năm xuất bản phải là số.")
            .required("Năm xuất bản không được để trống.")
            .max(new Date().getFullYear(), "Năm xuất bản không được lớn hơn năm hiện tại."),

        // 5. Tác giả (Chuỗi)
        tacGia: yup
            .string()
            .required("Tác giả không được để trống.")
            .max(50, "Tên tác giả tối đa 50 ký tự."),

        // 6. Mã NXB (Bắt buộc chọn Dropdown)
        maNXB: yup
            .string()
            .required("Vui lòng chọn một nhà xuất bản."),
    });

    return {
        // Khởi tạo object chứa dữ liệu form
        // Nếu có prop 'sach' (lúc sửa) thì copy vào, không thì để rỗng (lúc thêm)
        sachLocal: this.sach ? { ...this.sach } : {
            tenSach: "",
            donGia: 0,
            soQuyen: 0,
            namXuatBan: "",
            tacGia: "",
            maNXB: "", // Mặc định rỗng để dropdown hiện "Chọn NXB"
            hinhAnh: "",
        },
        sachFormSchema,
        
        // Các biến phục vụ chức năng khác
        danhSachNXB: [],   // Chứa danh sách NXB đổ vào dropdown
        previewImage: null, // Link ảnh xem trước
        selectedFile: null, // File ảnh thực tế để upload
    };
},
 methods: {
    // 1. Hàm xử lý chọn ảnh (BẮT BUỘC PHẢI CÓ)
    handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
            // Tạo link ảnh giả để xem trước
            this.previewImage = URL.createObjectURL(file);
        }
    },

    // 2. Sửa lại hàm Submit để gửi cả FILE ảnh sang component cha
    submitSach() {
      console.log("1. Dữ liệu Sách:", this.sachLocal);
    console.log("2. File ảnh đã chọn:", this.selectedFile);
      // Gửi 2 tham số: Dữ liệu sách (JSON) và File ảnh (File Object)
      this.$emit("submit:sach", this.sachLocal, this.selectedFile);
    },

    // 3. Sửa lại hàm Reset cho đúng các trường của SÁCH
    resetForm() {
      this.sachLocal = { 
          tenSach: "", 
          donGia: 0, 
          soQuyen: 0, 
          namXuatBan: "", 
          tacGia: "",
          maNXB: "",
          hinhAnh: ""
      };
      this.selectedFile = null;
      this.previewImage = null;
      
          this.$refs.veeForm.resetForm();
    },

    deleteSach() {
      this.$emit("delete:sach", this.sachLocal._id);
    },

    cancel() {
      // Bạn nên dùng confirm hoặc bỏ qua nếu muốn thao tác nhanh
    //   const reply = window.confirm("Bạn có chắc muốn thoát mà không lưu?");
    //   if (!reply) return;

      // Đảm bảo tên route 'sach.list' hoặc 'sachindex' đúng với router.js của bạn
      this.$router.push({ name: "sachindex" }); 
    },

    async retrieveNXB() {
        try {
            this.danhSachNXB = await NXBService.getAll();
        } catch (error) {
            console.log(error);
            // Có thể gán mảng rỗng để tránh lỗi
            this.danhSachNXB = [];
        }
    },
  },

  // --- QUAN TRỌNG: mounted phải nằm NGOÀI methods ---
  mounted() {
    this.retrieveNXB(); 
  },
      watch: {
    // Theo dõi prop 'sach'
    sach(newVal) {
      // Khi 'sach' thay đổi, cập nhật 'sachLocal'
      this.sachLocal = { ...newVal }; 
    }},
};
</script>


<style scoped>
 @import "@/assets/form.css";
    @import "@/assets/main.css";
</style>



