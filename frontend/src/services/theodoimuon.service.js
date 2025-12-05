import createApiClient from "./api.service";

class TheoDoiMuonService {
  constructor(baseUrl = "/api/theodoimuonsach") {
    this.api = createApiClient(baseUrl);
  }

  // Lấy tất cả phiếu mượn
  async getAll() {
    return (await this.api.get("/")).data;
  }

  // Tạo phiếu mượn mới (Quan trọng cho Giỏ hàng)
  async create(data) {
    return (await this.api.post("/", data)).data;
  }

  // Lấy chi tiết
  async get(id) {
    return (await this.api.get(`/${id}`)).data;
  }

  // Cập nhật (ví dụ: cập nhật trạng thái đã trả)
  async update(id, data) {
    return (await this.api.put(`/${id}`, data)).data;
  }

  // Xóa
  async delete(id) {
    return (await this.api.delete(`/${id}`)).data;
  }
}

export default new TheoDoiMuonService();