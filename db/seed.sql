-- Development-only content. Authentication users should be created through /dang-ky.
PRAGMA foreign_keys = ON;

INSERT OR IGNORE INTO user (id,name,email,emailVerified,image,role,createdAt,updatedAt) VALUES
  ('seed-user-khang','Nguyễn Minh Khang','khang.seed@example.test',1,NULL,'seller',1788494400000,1788494400000),
  ('seed-user-linh','Trần Hoài Linh','linh.seed@example.test',1,NULL,'seller',1788494400000,1788494400000),
  ('seed-admin','Quản trị NHÀ ĐẸP CHẤT','admin.seed@example.test',1,NULL,'admin',1788494400000,1788494400000);

INSERT OR IGNORE INTO user_profiles (id,user_id,slug,display_name,avatar_key,bio,phone,zalo,location,role,created_at,updated_at) VALUES
  ('seed-profile-khang','seed-user-khang','nguyen-minh-khang','Nguyễn Minh Khang',NULL,'Kiến trúc sư chuyên hồ sơ nhà phố và biệt thự hiện đại.',NULL,NULL,'TP. Hồ Chí Minh','seller',1788494400000,1788494400000),
  ('seed-profile-linh','seed-user-linh','tran-hoai-linh','Trần Hoài Linh',NULL,'Kỹ sư kết cấu, triển khai hồ sơ thi công dân dụng.',NULL,NULL,'Đà Nẵng','seller',1788494400000,1788494400000),
  ('seed-profile-admin','seed-admin','quan-tri-nha-dep-chat','Quản trị NHÀ ĐẸP CHẤT',NULL,'Tài khoản quản trị dữ liệu development.',NULL,NULL,'Việt Nam','admin',1788494400000,1788494400000);

INSERT OR IGNORE INTO seller_profiles (id,user_id,seller_type,professional_title,experience_years,company,location,website,verification_status,verified_at,created_at,updated_at) VALUES
  ('seed-seller-khang','seed-user-khang','architect','Kiến trúc sư chủ trì',9,'Khang Studio','TP. Hồ Chí Minh',NULL,'verified',1788494400000,1788494400000,1788494400000),
  ('seed-seller-linh','seed-user-linh','engineer','Kỹ sư kết cấu',7,'HL Engineering','Đà Nẵng',NULL,'verified',1788494400000,1788494400000,1788494400000);

INSERT OR IGNORE INTO products (id,seller_id,slug,title,short_description,description,category,building_type,width,length,floors,area,price,is_free,status,rejection_reason,created_at,submitted_at,approved_at,updated_at) VALUES
  ('seed-product-1','seed-seller-khang','ho-so-nha-pho-5x20m-3-tang','Hồ sơ nhà phố 5x20m 3 tầng','Hồ sơ kiến trúc nhà phố hiện đại, bố trí tối ưu cho gia đình trẻ.','Bộ hồ sơ development gồm mặt bằng, mặt đứng, mặt cắt và các bản vẽ triển khai kiến trúc cơ bản.','Kiến trúc','Nhà phố',5,20,3,250,0,1,'approved',NULL,1788494400000,1788498000000,1788501600000,1788501600000),
  ('seed-product-2','seed-seller-linh','ket-cau-biet-thu-2-tang-8x12m','Kết cấu biệt thự 2 tầng 8x12m','Hồ sơ kết cấu tham khảo cho biệt thự hai tầng mái Nhật.','Bản vẽ móng, cột, dầm, sàn và thống kê cốt thép phục vụ tham khảo triển khai.','Kết cấu','Biệt thự',8,12,2,192,350000,0,'approved',NULL,1788494400000,1788498000000,1788505200000,1788505200000),
  ('seed-product-3','seed-seller-khang','nha-cap-4-mai-nhat-7x15m','Nhà cấp 4 mái Nhật 7x15m','Phương án nhà cấp 4 ba phòng ngủ có sân vườn.','Hồ sơ đang chờ quản trị viên kiểm tra nội dung và chất lượng file.','Kiến trúc','Nhà cấp 4',7,15,1,105,0,1,'pending',NULL,1788508800000,1788512400000,NULL,1788512400000),
  ('seed-product-4','seed-seller-linh','mep-nha-pho-4-tang','MEP nhà phố 4 tầng','Hồ sơ điện nước và cấp thoát nước cho nhà phố bốn tầng.','Bản nháp dùng để thử luồng chỉnh sửa và gửi duyệt trong development.','MEP','Nhà phố',5,18,4,300,0,1,'draft',NULL,1788516000000,NULL,NULL,1788516000000);

INSERT OR IGNORE INTO product_formats (product_id,format) VALUES
  ('seed-product-1','DWG'),('seed-product-1','PDF'),('seed-product-2','DWG'),('seed-product-2','XLSX'),('seed-product-3','SKP'),('seed-product-3','DWG'),('seed-product-4','DWG');
INSERT OR IGNORE INTO product_disciplines (product_id,discipline) VALUES
  ('seed-product-1','Kiến trúc'),('seed-product-2','Kết cấu'),('seed-product-3','Kiến trúc'),('seed-product-4','Điện'),('seed-product-4','Nước');

INSERT OR IGNORE INTO downloads (id,user_id,product_id,created_at) VALUES
  ('seed-download-1','seed-user-linh','seed-product-1',1788520000000),
  ('seed-download-2','seed-user-khang','seed-product-2',1788522000000);
