<template>

   <main class="app-content">
    <div class="app-title">
      <ul class="app-breadcrumb breadcrumb">
        <li class="breadcrumb-item">Danh sách nhà xuất bản</li>
        <li class="breadcrumb-item"><a href="#">{{ id ? "Chỉnh sửa nhà xuất bản" : "Thêm nhà xuát bản" }}</a></li>
      </ul>
    </div>
    <div class="row">
      <div class="col-md-12">

        <div class="tile">

          <h3 class="tile-title">
  {{ id ? "Chỉnh sửa nhà xuất bản" : "Tạo mới nhà xuất bản" }}
</h3>
          <div class="tile-body">
            <div class="row element-button">
              <div class="col-sm-2">
                    <button class="btn btn-sm btn-info" @click="goToNXBList">
        <i class="fas fa-list"></i> Danh sách nhà xuất bản
    </button>
              </div>

            </div>
             <Form ref="veeForm" @submit="submitNXB" :validation-schema="nxbFormSchema" class="row justify-content-center">
       
              <div class="form-group col-md-4">
                <label class="control-label"  for="tenNXB">Tên nhà xuất bản</label>
                <Field name="tenNXB" type="text" class="form-control" v-model="nxbLocal.tenNXB" />
                <ErrorMessage name="tenNXB" class="error-feedback" />
              </div>
        
              <div class="form-group col-md-4">
                <label class="control-label" for="diaChi">Địa chỉ</label>
                <Field name="diaChi" type="text" class="form-control" v-model="nxbLocal.diaChi" />
                <ErrorMessage name="diaChi" class="error-feedback" />
              </div>
          <div class="form-group col-12 text-center">
         <button class="btn btn-primary" type="submit">
                  <i class="fas fa-save"></i> Lưu nhà xuất bản
                </button>
        
        <button v-if="nxbLocal._id" type="button" class="ml-2 btn btn-danger" @click="deleteNXB"> Xóa</button>
          <button v-if="!nxbLocal._id" type="button" class="ml-2 btn btn-secondary" @click="resetForm">
                  <i class="fas fa-redo"></i> Làm lại
                </button>
        <button type="button" class="ml-2 btn btn-warning" @click="cancel">
          Thoát
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

export default {
  components: {
    Form,
    Field,
    ErrorMessage,
  },
  emits: ["submit:nxb", "delete:nxb"],
  props: {
   id: { type: String, default: null },
    nxb: { type: Object, required: true },
  },
  data() {
    const nxbFormSchema = yup.object().shape({
      tenNXB: yup
        .string()
        .required("Tên nhà xuất bản không được để trống.")
        .min(2, "Tên phải ít nhất 2 ký tự.")
        .max(50, "Tên tối đa 50 ký tự."),
      diaChi: yup
      .string().max(100, "Địa chỉ tối đa 100 ký tự.")
      .required("Địa chỉ nhà xuất bản không được để trống."),
    });

    return {
      nxbLocal: { ...this.nxb },
      nxbFormSchema,
    };
  },
  methods: {

    submitNXB() {
      this.$emit("submit:nxb", this.nxbLocal);
    },
    resetForm() {
      // 1. Xóa dữ liệu local
      this.nxbLocal = { tenNXB: "", diaChi: "" };
      
      // 2. Báo vee-validate reset trạng thái (để xóa lỗi)
      this.$refs.veeForm.resetForm();
    },
    deleteNXB() {
      this.$emit("delete:nxb", this.nxbLocal._id);
    },
    cancel() {
        this.$router.push({ name: "nxbindex" }); 
    },
     goToNXBList() {
      this.$router.push({ name: "nxbindex" });
    },

  },
      watch: {
    // Theo dõi prop 'nxb'
    nxb(newVal) {
      // Khi 'nxb' thay đổi, cập nhật 'nxbLocal'
      this.nxbLocal = { ...newVal }; 
    }},
};
</script>


<style scoped>
 @import "@/assets/form.css";
    @import "@/assets/main.css";
</style>



