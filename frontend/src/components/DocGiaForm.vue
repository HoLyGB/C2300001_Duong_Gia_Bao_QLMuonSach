<template>
  <main class="app-content">
    <div class="app-title">
      <ul class="app-breadcrumb breadcrumb">
        <li class="breadcrumb-item">Danh sách độc giả</li>
        <li class="breadcrumb-item"><a href="#">{{ id ? "Chỉnh sửa độc giả" : "Thêm độc giả" }}</a></li>
      </ul>
    </div>
    <div class="row">
      <div class="col-md-12">
        <div class="tile">
          <h3 class="tile-title">
            {{ docGiaLocal._id ? "Chỉnh sửa độc giả" : "Tạo mới độc giả" }}
          </h3>
          <div class="tile-body">
            <div class="row element-button">
              <div class="col-sm-2">
                <button class="btn btn-sm btn-info" @click="cancel">
                  <i class="fas fa-list"></i> Danh sách độc giả
                </button>
              </div>
            </div>

            <Form ref="veeForm" @submit="submitDocGia" :validation-schema="docGiaFormSchema" class="row">

              <!-- MÃ ĐỘC GIẢ -->
              <div class="form-group col-md-4">
                <label class="control-label font-weight-bold">Mã độc giả <span class="text-danger">*</span></label>
                <!-- Trường hợp Thêm mới: Cho nhập -->
                <Field v-if="!docGiaLocal._id"
                    name="maDG" 
                    type="text" 
                    class="form-control" 
                    v-model="docGiaLocal.maDG" 
                    placeholder="Nhập mã (VD: DG001)" 
                />
                <!-- Trường hợp Edit: Chỉ đọc -->
                <Field v-else
                    name="maDG" 
                    type="text" 
                    class="form-control" 
                    v-model="docGiaLocal.maDG" 
                    readonly
                    disabled
                    style="background-color: #e9ecef; cursor: not-allowed;"
                />
                <ErrorMessage name="maDG" class="error-feedback text-danger" />
                <small v-if="docGiaLocal._id" class="text-muted font-italic">Mã độc giả không thể thay đổi.</small>
              </div>

              <!-- EMAIL -->
              <div class="form-group col-md-4">
                <label class="control-label font-weight-bold">Email <span class="text-danger">*</span></label>
                <Field 
                    name="email" 
                    type="email" 
                    class="form-control" 
                    v-model="docGiaLocal.email" 
                    placeholder="Nhập địa chỉ email"
                />
                <ErrorMessage name="email" class="error-feedback text-danger" />
              </div>

               <!-- SỐ ĐIỆN THOẠI -->
              <div class="form-group col-md-4">
                <label class="control-label font-weight-bold">Số điện thoại <span class="text-danger">*</span></label>
                <Field 
                    name="soDienThoai" 
                    type="text" 
                    class="form-control" 
                    v-model="docGiaLocal.soDienThoai" 
                    placeholder="Nhập số điện thoại"
                />
                <ErrorMessage name="soDienThoai" class="error-feedback text-danger" />
              </div>

              <!-- HỌ LÓT -->
              <div class="form-group col-md-4">
                <label class="control-label font-weight-bold">Họ lót <span class="text-danger">*</span></label>
                <Field 
                    name="hoLot" 
                    type="text" 
                    class="form-control" 
                    v-model="docGiaLocal.hoLot" 
                    placeholder="Nhập họ lót (VD: Nguyễn Văn)"
                />
                <ErrorMessage name="hoLot" class="error-feedback text-danger" />
              </div>

              <!-- TÊN -->
              <div class="form-group col-md-4">
                <label class="control-label font-weight-bold">Tên <span class="text-danger">*</span></label>
                <Field 
                    name="ten" 
                    type="text" 
                    class="form-control" 
                    v-model="docGiaLocal.ten" 
                    placeholder="Nhập tên (VD: An)"
                />
                <ErrorMessage name="ten" class="error-feedback text-danger" />
              </div>

               <!-- GIỚI TÍNH -->
               <div class="form-group col-md-4">
                <label class="control-label font-weight-bold">Giới tính</label>
                <Field 
                    name="gioiTinh" 
                    as="select" 
                    class="form-control" 
                    v-model="docGiaLocal.gioiTinh"
                >
                    <!-- Lưu ý: Giá trị boolean cần binding đúng -->
                    <option :value="false">Nam</option>
                    <option :value="true">Nữ</option>
                </Field>
                <ErrorMessage name="gioiTinh" class="error-feedback text-danger" />
              </div>

              <!-- NGÀY SINH -->
              <div class="form-group col-md-6">
                <label class="control-label font-weight-bold">Ngày sinh</label>
                <Field 
                    name="ngaySinh" 
                    type="date" 
                    class="form-control" 
                    v-model="docGiaLocal.ngaySinh" 
                />
                <ErrorMessage name="ngaySinh" class="error-feedback text-danger" />
              </div>

              <!-- MẬT KHẨU -->
             <div class="form-group col-md-6">
    <label class="control-label font-weight-bold">
        {{ docGiaLocal._id ? "Mật khẩu" : "Mật khẩu" }}
        <span v-if="!docGiaLocal._id" class="text-danger">*</span>
    </label>
    <Field 
        name="password" 
        type="password" 
        class="form-control" 
        v-model="docGiaLocal.password" 
        :placeholder="docGiaLocal._id ? 'Không thể thay đổi khi chỉnh sửa' : 'Nhập mật khẩu khởi tạo'"
        :disabled="docGiaLocal._id"
        :rules="passwordRules"
    />
    <ErrorMessage name="password" class="error-feedback text-danger" />
</div>

              <!-- ĐỊA CHỈ -->
              <div class="form-group col-md-12">
                <label class="control-label font-weight-bold">Địa chỉ</label>
                <Field 
                    name="diaChi" 
                    type="text" 
                    class="form-control" 
                    v-model="docGiaLocal.diaChi" 
                    placeholder="Nhập địa chỉ liên hệ"
                />
                <ErrorMessage name="diaChi" class="error-feedback text-danger" />
              </div>

              <!-- BUTTONS -->
              <div class="form-group col-12 text-center mt-3">
                <button class="btn btn-primary" type="submit">
                  <i class="fas fa-save"></i> Lưu độc giả
                </button>

                <button v-if="docGiaLocal._id" type="button" class="ml-2 btn btn-danger" @click="deleteDocGia">
                  <i class="fas fa-trash"></i> Xóa
                </button>

                <button v-if="!docGiaLocal._id" type="button" class="ml-2 btn btn-secondary" @click="resetForm">
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
  emits: ["submit:docGia", "delete:docGia"], // Sửa tên event
  props: {
    id: { type: String, default: null },
    docGia: { type: Object, required: true }, // Sửa tên prop
  },
  computed: {
    passwordRules() {
      // Nếu đang ở chế độ Edit (có _id), không bắt buộc nhập mật khẩu
      if (this.docGiaLocal._id) {
        return '';
      }
      // Nếu đang ở chế độ Thêm mới, mật khẩu là bắt buộc và tối thiểu 6 ký tự
      return 'required|min:6';
    }
  },
  data() {
    
    // Định nghĩa luật kiểm tra dữ liệu (Validation) cho Độc Giả
    const docGiaFormSchema = yup.object().shape({
      maDG: yup
        .string()
        .required("Mã độc giả không được để trống.")
        .min(2, "Mã phải có ít nhất 2 ký tự.")
        .max(20, "Mã tối đa 20 ký tự."),

      hoLot: yup
        .string()
        .required("Họ lót không được để trống.")
        .max(50, "Họ lót tối đa 50 ký tự."),

      ten: yup
        .string()
        .required("Tên không được để trống.")
        .max(20, "Tên tối đa 20 ký tự."),

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

      gioiTinh: yup
        .boolean() // Dùng boolean cho giới tính (true/false)
        .required("Vui lòng chọn giới tính."),

      ngaySinh: yup
        .date()
        .max(new Date(), "Ngày sinh không được lớn hơn ngày hiện tại.")
        .nullable(),
      
      // Validate mật khẩu: Chỉ bắt buộc khi tạo mới (Logic này xử lý bên dưới hoặc dùng when)
      // Ở đây mình để string bình thường, sẽ check required bằng logic HTML hoặc Vue
      // password: yup
      //   .string()
      //   // Thêm rule có điều kiện
      //   .when('docGiaLocal._id', {
      //       // Nếu docGiaLocal._id KHÔNG tồn tại (chế độ Thêm mới)
      //       is: (id) => !id, 
      //       then: (schema) => schema
      //           .required('Mật khẩu là bắt buộc.') // Yêu cầu phải nhập
      //           .min(6, 'Mật khẩu phải có ít nhất 6 ký tự.'), // Yêu cầu tối thiểu 6 ký tự
      //       // Nếu docGiaLocal._id TỒN TẠI (chế độ Chỉnh sửa)
      //       otherwise: (schema) => schema
      //           // Cho phép nó là rỗng (vì không muốn đổi mật khẩu)
      //           .nullable() 
      //           // Nếu người dùng có nhập, nó vẫn phải >= 6 ký tự (nếu bạn muốn kiểm tra)
      //           .notRequired() 
      //   }),
    });
    

    // Xử lý dữ liệu đầu vào (nhất là ngày tháng)
    let initData = {
        maDG: "",
        hoLot: "",
        ten: "",
        ngaySinh: "",
        gioiTinh: false, // Mặc định là Nam
        password: "",
        email: "",
        soDienThoai: "",
        diaChi: "",
        vaiTro: "docgia"
    };

    // Nếu là Edit Mode (có dữ liệu prop docGia)
    if (this.docGia && this.docGia._id) {
        initData = { ...this.docGia };
        // 1. Xóa passwordHash để tránh gửi ngược lên
        initData.password = "";
        
        // 2. Format ngày sinh từ ISO (yyyy-MM-ddTHH:mm...) về yyyy-MM-dd để hiện lên input date
        if (initData.ngaySinh) {
            initData.ngaySinh = new Date(initData.ngaySinh).toISOString().split('T')[0];
        }
    }

    return {
      docGiaLocal: initData,
      docGiaFormSchema,
    };
  },
  methods: {
    submitDocGia() {
        // Kiểm tra mật khẩu khi tạo mới
        if (!this.docGiaLocal._id && !this.docGiaLocal.password) {
            alert("Vui lòng nhập mật khẩu cho độc giả mới!");
            return;
        }

        // Tạo bản sao để gửi đi
        const payload = { ...this.docGiaLocal };
        
        // Xóa passwordHash thừa (nếu có)
        delete payload.passwordHash;

        // Nếu đang Edit và không nhập password -> Xóa field password khỏi payload
        if (this.docGiaLocal._id && !this.docGiaLocal.password) {
            delete payload.password;
        }

        this.$emit("submit:docGia", payload);
    },

    resetForm() {
      this.docGiaLocal = {
        maDG: "",
        hoLot: "",
        ten: "",
        ngaySinh: "",
        gioiTinh: false,
        password: "",
        email: "",
        soDienThoai: "",
        diaChi: "",
        vaiTro: "docgia"
      };
      this.$refs.veeForm.resetForm();
    },

    deleteDocGia() {
      if(confirm("Bạn chắc chắn muốn xóa độc giả này?")) {
         this.$emit("delete:docGia", this.docGiaLocal._id);
      }
    },

    cancel() {
      // Quay về trang danh sách độc giả
      // Bạn cần đảm bảo route 'docgia.list' (hoặc tên tương ứng) đã tồn tại trong router
      this.$router.push({ name: "docgiaindex" }); 
    },
  },
  watch: {
    // Theo dõi prop 'docGia' để cập nhật form khi load dữ liệu async
    docGia(newVal) {
      if (newVal) {
        this.docGiaLocal = { ...newVal };
        this.docGiaLocal.password = ""; // Reset pass
        if (this.docGiaLocal.ngaySinh) {
             this.docGiaLocal.ngaySinh = new Date(this.docGiaLocal.ngaySinh).toISOString().split('T')[0];
        }
      }
    },
  },
};
</script>

<style scoped>
 @import "@/assets/form.css";
 @import "@/assets/main.css";
</style>