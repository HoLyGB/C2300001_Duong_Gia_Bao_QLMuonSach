<template>
  <div class="cart-page-wrapper">
    <section>
      <div class="banner">
        <div class="owl-carousel owl-theme" ref="mainBanner"></div>
      </div> 
      <img src="@/assets/img/banner.jpg" alt="Banner" style="width: 100%; display: block;">
      <br>
    </section>

    <div class="cart-page container">
      <div class="tile">
          
          <h3 class="tile-title mt-3 mb-4 text-center text-uppercase font-weight-bold">
              <i class="fa fa-shopping-cart"></i> Giỏ Mượn Sách
          </h3>

          <div v-if="cartItems.length > 0">
              <table class="table table-hover table-bordered">
                  <thead class="thead-light">
                      <tr>
                          <th>STT</th>
                          <th style="width: 100px;">Hình ảnh</th>
                          <th>Tên sách</th>
                          <th>Tác giả</th>
                          <th>Thao tác</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr v-for="(item, index) in cartItems" :key="item._id">
                          <td>{{ index + 1 }}</td>
                          <td>
                              <img :src="item.hinhAnh ? 'http://localhost:3000/uploads/' + item.hinhAnh : 'https://via.placeholder.com/100'" 
                                   alt="Bìa sách" class="img-book">
                          </td>
                          <td class="font-weight-bold">{{ item.tenSach }}</td>
                          <td>{{ item.tacGia }}</td>
                      
 
                          <td>
                              <button class="btn btn-danger btn-sm" @click="removeItem(index)">
                                  <i class="fa fa-trash"></i> Xóa
                              </button>
                          </td>
                      </tr>
                  </tbody>
              </table>

              <div class="borrow-info mt-4 p-4 bg-white border rounded shadow-sm">
                  <h4 class="mb-3 text-primary"><i class="fa fa-info-circle"></i> Thông tin mượn</h4>
                  <div class="row">
                      <div class="col-md-6 form-group">
                          <label><strong>Ngày mượn:</strong></label>
                          <input type="date" class="form-control" v-model="ngayMuon" disabled>
                      </div>
                      <div class="col-md-6 form-group">
                          <label><strong>Ngày trả dự kiến:</strong></label>
                          <input type="date" class="form-control" v-model="ngayTra">
                      </div>
                  </div>
                  <hr>
                  <div class="d-flex justify-content-between align-items-center mt-3">
                      <h5 class="text-dark">Tổng số sách: <span class="text-danger font-weight-bold">{{ totalQuantity }} cuốn</span></h5>
                      <button class="btn btn-success btn-lg" @click="submitBorrow">
                          <i class="fa fa-check-circle"></i> Xác nhận Mượn Sách
                      </button>
                  </div>
              </div>
          </div>

          <div v-else class="text-center p-5 bg-light rounded">
              <i class="fa fa-book fa-4x text-muted mb-3"></i>
              <h4 class="text-muted">Giỏ mượn của bạn đang trống.</h4>
              <p>Hãy lựa chọn những cuốn sách hay để thêm vào giỏ nhé!</p>
              <router-link to="/trangchu" class="btn btn-primary mt-3">
                  <i class="fa fa-arrow-left"></i> Đi chọn sách ngay
              </router-link>
          </div>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2';
import TheoDoiMuonService from "@/services/theodoimuon.service";
import SachService from "@/services/sach.service"; 
export default {
    name: "GioHang",
    data() {
        return {
            cartItems: [],
            ngayMuon: new Date().toISOString().split('T')[0], 
            ngayTra: "",
            currentUser: null
        }
    },
    computed: {
        totalQuantity() {
            return this.cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
        },
        maxDate() {
            if (!this.ngayMuon) return "";
            const date = new Date(this.ngayMuon);
            date.setDate(date.getDate() + 14); // Cộng thêm 14 ngày
            return date.toISOString().split('T')[0]; // Format về YYYY-MM-DD
        }
    },
    watch: {
        // --- THÊM: THEO DÕI NGÀY MƯỢN ĐỂ RESET NGÀY TRẢ NẾU KHÔNG HỢP LỆ ---
        ngayMuon(newVal) {
            // Nếu đổi ngày mượn mà ngày trả hiện tại lại nhỏ hơn ngày mượn -> Reset
            if (this.ngayTra && this.ngayTra < newVal) {
                this.ngayTra = "";
            }
            // Nếu đổi ngày mượn mà ngày trả hiện tại lại lớn hơn maxDate mới -> Reset
            if (this.ngayTra && this.ngayTra > this.maxDate) {
                this.ngayTra = "";
            }
        }
    },
    mounted() {
        this.loadCart();
        this.checkLogin();
        // Cuộn lên đầu trang khi vào giỏ hàng
        window.scrollTo(0, 0);
    },
    methods: {
        getCartKey() {
            const maDG = localStorage.getItem('maDG'); 
            return maDG ? `cart_${maDG}` : 'cart_guest';
        },
   loadCart() {
    const maDG = localStorage.getItem('maDG');
    const cartKey = maDG ? `cart_${maDG}` : 'cart'; // Tạo key riêng
    
    const cart = localStorage.getItem(cartKey);
    if (cart) {
        this.cartItems = JSON.parse(cart);
    } else {
        this.cartItems = [];
    }
},

        checkLogin() {
            const token = localStorage.getItem('token');
            if (!token) {
                 Swal.fire({
                    icon: 'warning',
                    title: 'Chưa đăng nhập',
                    text: 'Vui lòng đăng nhập để xem giỏ mượn!',
                    confirmButtonText: 'Đăng nhập ngay'
                }).then(() => {
                    this.$router.push('/dangnhap');
                });
            }
        },

        removeItem(index) {
            const tenSach = this.cartItems[index].tenSach || "sách này";
    Swal.fire({
        title: 'Bạn có chắc chắn?',
        text: `Bạn muốn xóa cuốn "${tenSach}" khỏi giỏ mượn?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',     // Màu đỏ cảnh báo cho hành động xóa
        cancelButtonColor: '#3085d6',   // Màu xanh cho hành động hủy
        confirmButtonText: 'Vâng, xóa nó!',
        cancelButtonText: 'Hủy bỏ'
    }).then((result) => {
        if (result.isConfirmed) {
            this.cartItems.splice(index, 1);
            
            // Lấy key động để lưu lại
            const maDG = localStorage.getItem('maDG');
            const cartKey = maDG ? `cart_${maDG}` : 'cart';
            
            localStorage.setItem(cartKey, JSON.stringify(this.cartItems));
            
            // Dispatch event cũng phải sửa nếu bên Header muốn bắt đúng
            // Tạm thời cứ để 'storage' chung, nhưng Header cần logic lọc lại
            window.dispatchEvent(new Event('storage')); 
            Swal.fire('Đã xóa!', 'Sách đã được xóa khỏi giỏ.', 'success');
        }
    });
},

        formatPrice(price) {
            if (!price) return "0 VNĐ";
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
        },
validateNgayTra() {
            if (!this.ngayTra) return;

            // 1. Kiểm tra không được nhỏ hơn ngày mượn
            if (this.ngayTra < this.ngayMuon) {
                Swal.fire('Ngày không hợp lệ', 'Ngày trả phải sau ngày mượn!', 'error');
                this.ngayTra = "";
                return;
            }

            // 2. Kiểm tra không được quá 14 ngày
            if (this.ngayTra > this.maxDate) {
                Swal.fire('Quá hạn mức', 'Bạn chỉ được mượn tối đa 14 ngày!', 'warning');
                this.ngayTra = this.maxDate; // Tự động set về ngày tối đa
            }
        },
       async submitBorrow() {
    // 1. KIỂM TRA INPUT CƠ BẢN
    if (this.cartItems.length === 0) return;
    
    // Cấu hình số lượng tối đa
    const MAX_QUOTA = 5; 

    // Kiểm tra ngay nếu riêng giỏ hàng đã > 5 (trường hợp hiếm nhưng nên chặn)
    if (this.cartItems.length > MAX_QUOTA) {
        return Swal.fire('Quá giới hạn', `Mỗi lần chỉ được mượn tối đa ${MAX_QUOTA} cuốn!`, 'error');
    }

    if (!this.ngayMuon || !this.ngayTra) {
        return Swal.fire('Thiếu thông tin', 'Vui lòng chọn ngày mượn và ngày trả!', 'warning');
    }
    if (this.ngayTra < this.ngayMuon) {
        return Swal.fire('Lỗi', 'Ngày trả không được nhỏ hơn ngày mượn', 'error');
    }
    if (this.ngayTra > this.maxDate) {
        return Swal.fire('Lỗi', 'Thời gian mượn không được quá 14 ngày', 'error');
    }

    const maDG = localStorage.getItem('maDG'); 
    const token = localStorage.getItem('token');
    if (!token) return Swal.fire('Lỗi', 'Bạn chưa đăng nhập!', 'error');

    // Show loading
    Swal.fire({ title: 'Đang kiểm tra...', didOpen: () => { Swal.showLoading() } });

    try {
        // --- STEP 2: GỌI API & KIỂM TRA LOGIC ---
        
        const response = await TheoDoiMuonService.getAll(maDG); 
        
        // SỬA LỖI "filter undefined": Đảm bảo luôn lấy được mảng
        const tatCaPhieuMuon = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);

        // Lọc ra danh sách sách ĐANG MƯỢN (chưa trả)
        const dangMuon = tatCaPhieuMuon.filter(phieu => phieu.trangThai === "Đang mượn");
        const soluongDangMuon = dangMuon.length;
        const soluongGioHang = this.cartItems.length;

        // --- CHECK 1: KIỂM TRA HẠN MỨC (QUAN TRỌNG) ---
        if (soluongDangMuon + soluongGioHang > MAX_QUOTA) {
            Swal.close();
            const conLai = MAX_QUOTA - soluongDangMuon;
            return Swal.fire({
                icon: 'warning',
                title: 'Vượt quá hạn mức',
                html: `
                    Bạn đang mượn <b>${soluongDangMuon}</b> cuốn chưa trả.<br>
                    Quy định tối đa là <b>${MAX_QUOTA}</b> cuốn.<br>
                    Bạn chỉ có thể mượn thêm <b>${conLai > 0 ? conLai : 0}</b> cuốn nữa.
                `
            });
        }

        // --- CHECK 2: KIỂM TRA SÁCH TRÙNG (KHÔNG MƯỢN LẠI CUỐN ĐANG GIỮ) ---
        const sachTrung = this.cartItems.find(itemGio => {
            return dangMuon.some(phieu => {
                const idSachDangMuon = (phieu.maSach && phieu.maSach._id) ? phieu.maSach._id : phieu.maSach;
                return idSachDangMuon === itemGio._id;
            });
        });

        if (sachTrung) {
            Swal.close();
            return Swal.fire({
                icon: 'error',
                title: 'Không thể mượn',
                text: `Bạn đang giữ cuốn "${sachTrung.tenSach}". Vui lòng trả trước khi mượn lại!`,
            });
        }

        // --- STEP 3: NẾU THỎA MÃN TẤT CẢ -> GỬI YÊU CẦU ---
        for (const item of this.cartItems) {
            const payload = {
                maDocGia: maDG, 
                maSach: item._id, 
                ngayMuon: this.ngayMuon,
                ngayTra: this.ngayTra,
                trangThai: "Chờ duyệt" 
            };
            await TheoDoiMuonService.create(payload);
            if (item.quantity > 0) {
            const dataUpdate = {
                ...item,
                soQuyen: item.soQuyen - 1, 
            };
            delete dataUpdate._id;
            // Gọi API update sách
            await SachService.update(item._id, dataUpdate);
        }
        }

        Swal.fire({
    icon: 'success',
    title: 'Gửi yêu cầu thành công!',
    text: 'Vui lòng chờ thủ thư duyệt yêu cầu mượn sách của bạn.',
}).then(() => {
           this.cartItems = [];
        
        // Xóa đúng key của người đó
        const maDG = localStorage.getItem('maDG');
        const cartKey = maDG ? `cart_${maDG}` : 'cart';
        localStorage.removeItem(cartKey);
        
        window.dispatchEvent(new Event('storage')); 
        this.$router.push('/trangchu');
        });

    } catch (error) {
        console.error("Lỗi xử lý:", error);
        // Tắt loading và báo lỗi
        if (error.response && error.response.data) {
             const serverMessage = error.response.data.message || JSON.stringify(error.response.data);
             Swal.fire('Lỗi từ Server', serverMessage, 'error');
        } else {
             Swal.fire('Lỗi kết nối', 'Không thể kiểm tra trạng thái mượn sách.', 'error');
        }
    }
}
    }
}
</script>

<style scoped>
/* Import CSS Banner (Giống trang chủ) */
@import '@/assets/css/banner.css'; 
@import '@/assets/css/style.css';
/* Style riêng cho trang giỏ hàng */
.cart-page-wrapper {
    background-color: #f5f5fa; /* Màu nền nhẹ cho toàn trang */
    min-height: 100vh;
    padding-bottom: 50px;
}

.cart-page {
    margin-top: 20px;
}

.tile {
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    padding: 20px;
}

.img-book {
    width: 60px;
    height: 80px;
    object-fit: cover;
    border-radius: 4px;
    border: 1px solid #eee;
}

.table td, .table th {
    vertical-align: middle; /* Căn giữa nội dung bảng theo chiều dọc */
    text-align: center;
}
</style>