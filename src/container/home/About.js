import React from "react";
import HeaderHome from "../../components/home/HeaderHome";
import FootterHome from "../../components/home/FootterHome";

const About = () => {
  return (
    <>
      <HeaderHome />
      <div className="container">
        <div className="row mt-5">
          <div className="col-12 text-center">Giới thiệu</div>
        </div>
        <div className="row">
          <div className="col">
            <p>CÔNG TY TNHH MỘT THÀNH VIÊN THÀNH PHÁT PC</p>
            <p>
              Địa chỉ: Số 357A, đường Điện Biên Phủ, Phường Bình Hàn, Thành phố
              Hải Dương, Hải Dương (Tìm vị trí)
            </p>
            <p>Mã số thuế: 0800975118</p>
            <p>Người ĐDPL: Cù Văn Tư</p>
            <p>Ngày hoạt động: 13/03/2012</p>
            <p>Giấy phép kinh doanh: 0800975118</p>
            <p>Tên công ty: CÔNG TY TNHH MTV THÀNH PHÁT PC</p>
            <p>Ngày thành lập: ngày 13 tháng 03 năm 2012</p>
            <p>CÔNG TY TNHH MỘT THÀNH VIÊN THÀNH PHÁT PC</p>
          </div>
        </div>
      </div>
      <FootterHome />
    </>
  );
};

export default About;
