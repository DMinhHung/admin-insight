import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const CarouselComponent = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
  };

  const slideStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '300px', // Điều chỉnh chiều cao của slider theo ý muốn
  };

  const imgStyle = {
    maxWidth: '100%',
    height: 'auto',
    objectFit: 'contain', // Đảm bảo ảnh không bị méo khi thay đổi kích thước
  };

  return (
    <Slider {...settings}>
      <div style={slideStyle}>
        <img
          src="https://www.anphatpc.com.vn/media/news/1308_Laptop-Gaming-tot-nhat-2022.jpg"
          alt="Slide 1"
          style={imgStyle}
        />
      </div>
      <div style={slideStyle}>
        <img
          src="https://anhphuongit.com/DATA/Images/top-laptop-gaming-danh-cho-hoc-sinh-sinh-vien.jpg"
          alt="Slide 2"
          style={imgStyle}
        />
      </div>
      <div style={slideStyle}>
        <img
          src="https://no1computer.vn/upload_images/images/2022/03/01/acer-nitro-5-2022-news-1(1).jpg"
          alt="Slide 3"
          style={imgStyle}
        />
      </div>
    </Slider>
  );
};

export default CarouselComponent;
