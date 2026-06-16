# Fraud Analysis Knowledge Base

---

## Phần 1 — Fraud Trend Detection Guideline

> **Mục tiêu:** Detect hành vi bất thường để pick ra các giao dịch cần phân tích.

### 1. Mục tiêu

- AI agent cần theo dõi fraud trend theo thời gian để phát hiện các dấu hiệu fraud tăng bất thường.
- Khi fraud amount, fraud count tăng vượt ngưỡng định nghĩa, agent cần trigger phân tích chi tiết.
- Mục tiêu của bước phân tích là xác định:
  - Fraud tăng ở đâu.
  - Dimension nào là nguyên nhân chính.
  - Fraud tăng do **amount** hay **count**.

---

### 2. Các dimension cần theo dõi

Agent cần breakdown fraud theo các dimension chính sau:

- **AppID**
- **Payment flow:** thanh toán qua Ví, thanh toán qua cổng.
- **Source of fund:** thẻ nội địa, thẻ quốc tế, số dư ví, bank account, MMF.
- **BIN thẻ:** 6 số đầu thẻ.
- **Issuer bank** hoặc ngân hàng phát hành thẻ.
- **User segment:** eKYC / non-eKYC.

---

### 3. Điều kiện trigger fraud trend analysis

Agent cần trigger fraud trend analysis nếu dimension có một trong các điều kiện sau.

#### Trigger theo fraud amount

| Điều kiện | Ngưỡng |
|---|---|
| Fraud amount tăng so với W-1 | >= 30% |
| Fraud amount tăng so với M-1 | >= 30% |
| Fraud amount tăng so với average 4 tuần gần nhất | >= 30% |
| Fraud amount tăng so với W-1 (tuyệt đối) | >= 100 triệu VND |
| Fraud amount tăng so với M-1 (tuyệt đối) | >= 300 triệu VND |
| Fraud amount trong ngày tăng so với D-1 | >= 50 triệu VND |
| Fraud amount rolling 7 ngày tăng so với rolling 7 ngày liền trước | >= 100 triệu VND |

#### Trigger theo fraud count

| Điều kiện | Ngưỡng |
|---|---|
| Fraud transaction count tăng so với W-1 | >= 30% |
| Fraud transaction count tăng so với M-1 | >= 30% |
| Fraud transaction count tăng so với average 4 tuần gần nhất | >= 50% |
| Fraud transaction count tăng so với W-1 (tuyệt đối) | >= 50 giao dịch |
| Fraud transaction count tăng so với M-1 (tuyệt đối) | >= 150 giao dịch |
| Fraud transaction count trong ngày tăng so với D-1 | >= 20 giao dịch |

#### Trigger theo concentration risk

| Entity | Điều kiện |
|---|---|
| Một AppID | Đóng góp >= 40% tổng fraud amount trong kỳ |
| Một AppID | Đóng góp >= 40% phần fraud amount tăng thêm so với W-1 |
| Một BIN | Đóng góp >= 30% tổng fraud amount trong kỳ |
| Một BIN | Đóng góp >= 30% phần fraud amount tăng thêm so với W-1 |
| Một issuer bank | Đóng góp >= 40% tổng fraud amount trong kỳ |
| Một source of fund | Đóng góp >= 50% tổng fraud amount trong kỳ |
| Một payment method / payment flow | Đóng góp >= 50% phần fraud amount tăng thêm so với W-1 |

---

## Phần 2 — Fraud Pattern Mining & Rule Strategy Reasoning Guideline

### 1. Mục tiêu của guideline

Guideline này dùng để hướng dẫn AI agent phân tích fraud pattern sau khi phase 1 đã detect được fraud trend bất thường.

Mục tiêu không chỉ là mô tả fraud tăng, mà phải tìm được:

- Fraud đang tập trung ở đâu.
- Pattern hành vi chung của nhóm fraud là gì.
- Có thể tạo rule từ metric nào.
- Rule đó cover được bao nhiêu fraud.
- Rule đó ảnh hưởng bao nhiêu giao dịch / user bình thường.
- Có cần kết hợp thêm user profile hoặc user journey không.

---

### 2. Data log agent được sử dụng

#### 2.1. translog

- Nguồn dữ liệu chính để phân tích giao dịch.
- Dùng để lấy toàn bộ thông tin liên quan đến transaction.
- Các field agent cần ưu tiên xem xét:
  - `transID`, `userID`, `appID`, `pmcID`, `transtype`
  - `source of fund`, `amount`
  - `transaction status`: success, fail, reject, challenge, approve
  - `transaction time`
  - `card information`: first6, last4, BIN, card type, issuer bank
  - `device ID`, `IP` (nếu có), `platform` (nếu có)
  - `product code` hoặc transaction type (nếu có)
  - `rule hit` (nếu có)
  - `fail reason` hoặc bank return code (nếu có)

#### 2.2. user_profile

- Dùng để hiểu đặc điểm định danh và trạng thái tài khoản của user.
- Chỉ join **sau khi** các rule đơn giản từ translog chưa đủ tốt hoặc cần refine rule.
- Các field agent cần ưu tiên xem xét:
  - `userID`
  - `account created date`
  - `eKYC status`, `eKYC date`
  - `NFC status`, `NFC date`
  - `DOB` hoặc age group
  - `SĐT`
  - `CCCD/ID hash` (nếu có)
  - Trạng thái sở hữu financial services
  - Trạng thái linked bank/card

#### 2.3. user_journey

- Dùng để hiểu hành vi trước khi phát sinh fraud.
- Chỉ join sau khi translog và user_profile chưa tìm được rule đủ tốt, hoặc khi nghi ngờ fraud liên quan đến: account takeover, change phone, reset PIN, add card, map bank, eKYC/NFC abuse.
- Các event cần ưu tiên kiểm tra:
  - `register`, `login`, `login new device`
  - `change phone`, `reset PIN`
  - `map bank`, `unmap bank`
  - `eKYC`, `NFC`
  - `change device`
  - `lock account`, `unlock account`

---

### 3. Input đầu vào từ phase 1

Agent cần nhận tối thiểu các thông tin sau từ phase 1:

- Time range phát hiện bất thường.
- Dimension bất thường chính.
- Filter condition ban đầu.
- List fraud transID bất thường.
- Fraud amount/count/user tăng bao nhiêu so với W-1, M-1 hoặc baseline.
- Dimension nghi ngờ: appID, merchant, pmcID, source of fund, BIN, issuer bank, payment flow.

**Ví dụ input từ phase 1:**
- Fraud tăng tại `appID = X`.
- Fraud tập trung ở `pmcID = Y`.
- Fraud tập trung ở `source of fund = international card`.
- Fraud tập trung ở `BIN = 123456`.
- Fraud tăng 45% so với W-1, fraud amount tăng thêm 180 triệu VND.
- List fraud transID gồm 500 giao dịch.

---

### 4. Thinking flow tổng quan

Agent phải phân tích theo thứ tự từ đơn giản đến phức tạp. **Không được** bắt đầu bằng rule combine quá nhiều điều kiện ngay từ đầu.

| Bước | Hành động |
|---|---|
| 1 | Xác định chính xác fraud scope từ phase 1 |
| 2 | Lấy list fraud transID bất thường |
| 3 | Join fraud transID với translog để lấy full transaction detail |
| 4 | Tạo base population sample bằng cùng filter condition nhưng mở rộng time range (thường D-30) |
| 5 | Từ translog, tìm các pattern đơn giản dựa trên velocity, amount, count, fail, interval, device, IP, card, BIN, merchant |
| 6 | Sinh candidate rule đơn giản từ translog |
| 7 | Test recall, precision và business impact trên base population |
| 8 | Nếu rule translog-only chưa tốt → join **user_profile** để tìm thêm pattern định danh/tài khoản |
| 9 | Sinh candidate rule combine giữa velocity và user_profile |
| 10 | Nếu vẫn chưa tốt → join **user_journey** để tìm event xảy ra trước fraud |
| 11 | Sinh candidate rule combine giữa velocity, profile và journey |
| 12 | Chọn rule có precision/recall tốt nhất và đề xuất action phù hợp |
| 13 | Nếu không tìm được rule đủ tốt → kết luận rõ "không đủ pattern để tạo hard rule" và đề xuất monitor/challenge/review thêm data |

---

### 5. Bước 1 — Xác định fraud scope

Agent cần xác định fraud bất thường đến từ dimension nào. **Không được** lấy toàn bộ fraud hệ thống nếu phase 1 chỉ chỉ ra bất thường ở một nhóm cụ thể.

- **Nếu bất thường theo AppID:** Filter theo appID → breakdown tiếp theo pmcID, source of fund, BIN, issuer bank, amount band, user segment.
- **Nếu bất thường theo payment method / pmcID:** Filter theo pmcID → breakdown tiếp theo appID, merchant, BIN, source of fund, userID, device, IP.
- **Nếu bất thường theo BIN:** Filter theo BIN → breakdown tiếp theo appID, merchant, pmcID, issuer bank, userID, device, IP.
- **Nếu bất thường theo merchant/appID + source of fund:** Filter theo cả hai → đây là fraud scope chính.

Agent cần output rõ: fraud scope, filter condition, số fraud transID, fraud amount, số fraud user trong scope.

---

### 6. Bước 2 — Tạo fraud sample và base population

#### 6.1. Fraud sample

- List giao dịch gian lận bất thường đã detect ở phase 1.
- Fraud sample cần có: `fraud_trans_count`, `fraud_amount`, `fraud_user_count`, `fraud_card_count`, `fraud_device_count`, `fraud_ip_count`, `fraud time range`.

#### 6.2. Base population sample

- Toàn bộ giao dịch matching cùng filter condition nhưng time range rộng hơn.
- **Time range mặc định:**
  - D-30: phân tích impact theo tháng.
  - D-7: fraud tăng rất nhanh, cần phân tích ngắn hạn.
  - D-60/D-90: nếu D-30 sample quá nhỏ.
- Base population dùng để đo: rule hit bao nhiêu total transaction/amount, fraud transaction/amount, good transaction/user, precision, recall, business impact.

#### 6.3. Good sample

- Transaction trong base population nhưng không nằm trong fraud sample/fraud label.
- Dùng để tính false positive.
- Nếu fraud label chưa hoàn chỉnh, agent cần ghi rõ: "precision chỉ là estimated precision, cần human review hoặc complaint confirmation để xác nhận thêm."

---

### 7. Bước 3 — Join fraud sample với translog

Sau khi join, agent cần tạo transaction profile cho nhóm fraud. Các câu hỏi bắt buộc phải tự hỏi:

- Fraud chủ yếu nằm ở appID / merchant / source of fund nào?
- Fraud chủ yếu dùng thẻ nội địa, thẻ quốc tế hay số dư ví?
- Fraud tập trung ở BIN / issuer bank / amount band nào?
- Fraud phát sinh vào khung giờ nào?
- Fraud tập trung ở user mới hay user cũ?
- Fraud có nhiều giao dịch fail trước khi success không?
- Fraud có nhiều giao dịch liên tục trong thời gian ngắn không?
- Fraud có nhiều user dùng chung device/IP/card/BIN không?
- Có rule nào đã hit chưa?

---

### 8. Bước 4 — Metrics cần tính từ translog

#### 8.1. User-level velocity metrics

| Metric | Mô tả |
|---|---|
| `total_amount_user_{1h/6h/24h/7d/30d}` | Tổng amount theo user |
| `trans_count_user_{1h/6h/24h/7d/30d}` | Số giao dịch theo user |
| `success_count_user_{1h/24h/7d/30d}` | Số giao dịch success |
| `fail_count_user_{1h/24h/7d/30d}` | Số giao dịch fail |
| `reject_count_user_{1h/24h/7d/30d}` | Số giao dịch reject |
| `unique_merchant_user_{24h/7d/30d}` | Số merchant unique |
| `unique_pmc_user_{24h/7d/30d}` | Số pmcID unique |
| `unique_card_user_{24h/7d/30d}` | Số card unique |
| `unique_device_user_{24h/7d/30d}` | Số device unique |
| `unique_ip_user_{24h/7d/30d}` | Số IP unique |

**Candidate threshold nên test:**

| Metric | Ngưỡng |
|---|---|
| `total_amount_user_1h` | >= 3M, 5M, 10M, 20M |
| `total_amount_user_24h` | >= 10M, 20M, 50M, 100M |
| `total_amount_user_7d` | >= 30M, 50M, 100M, 200M |
| `total_amount_user_30d` | >= 60M, 100M, 200M, 500M |
| `trans_count_user_1h` | >= 3, 5, 10 |
| `trans_count_user_24h` | >= 5, 10, 20 |
| `trans_count_user_7d` | >= 10, 20, 50 |
| `fail_count_user_1h` | >= 3, 5 |
| `fail_count_user_24h` | >= 5, 10 |
| `unique_card_user_24h` | >= 2, 3, 5 |
| `unique_merchant_user_24h` | >= 3, 5, 10 |

#### 8.2. Card-level metrics

| Metric | Mô tả |
|---|---|
| `total_amount_card_{1h/24h/7d/30d}` | Tổng amount theo card |
| `trans_count_card_{1h/24h/7d/30d}` | Số giao dịch theo card |
| `user_count_per_card_{24h/7d/30d}` | Số user dùng cùng card |
| `device_count_per_card_{24h/7d/30d}` | Số device dùng card |
| `merchant_count_per_card_{24h/7d/30d}` | Số merchant |
| `fail_count_card_{1h/24h}` | Số lần fail |
| `same_amount_count_card_{1h/24h}` | Số giao dịch cùng amount |
| `card_success_after_fail_count` | Số success sau fail |

**Candidate threshold nên test:**

| Metric | Ngưỡng |
|---|---|
| `user_count_per_card_24h` | >= 2, 3, 5 |
| `trans_count_card_1h` | >= 3, 5, 10 |
| `trans_count_card_24h` | >= 5, 10, 20 |
| `fail_count_card_1h` | >= 3, 5 |
| `total_amount_card_24h` | >= 10M, 20M, 50M |
| `same_amount_count_card_24h` | >= 3, 5, 10 |

#### 8.3. BIN-level metrics

| Metric | Mô tả |
|---|---|
| `total_amount_bin_{1h/24h/7d}` | Tổng amount theo BIN |
| `trans_count_bin_{1h/24h/7d}` | Số giao dịch theo BIN |
| `fraud_amount_bin_{1h/24h/7d}` | Fraud amount theo BIN |
| `fraud_count_bin_{1h/24h/7d}` | Fraud count theo BIN |
| `user_count_bin_{24h/7d}` | Số user dùng BIN |
| `card_count_bin_{24h/7d}` | Số card theo BIN |
| `merchant_count_bin_{24h/7d}` | Số merchant |
| `fail_rate_bin_{1h/24h}` | Tỷ lệ fail |
| `challenge_pass_rate_bin` | (nếu có) |
| `approve_rate_bin` | (nếu có) |

**Candidate threshold nên test:**

| Metric | Ngưỡng |
|---|---|
| `fraud_amount_bin_24h` | >= 30M, 50M, 100M |
| `fraud_count_bin_24h` | >= 10, 20, 50 |
| `trans_count_bin_1h` | >= 20, 50, 100 |
| `fail_rate_bin_1h` | >= 30%, 50%, 70% |
| `user_count_bin_24h` | >= 10, 20, 50 |
| `merchant_count_bin_24h` | >= 3, 5, 10 |

#### 8.4. Device-level metrics

| Metric | Ngưỡng nên test |
|---|---|
| `user_count_device_24h` | >= 3, 5, 10 |
| `user_count_device_7d` | >= 5, 10, 20 |
| `card_count_device_24h` | >= 2, 3, 5 |
| `trans_count_device_1h` | >= 5, 10, 20 |
| `total_amount_device_24h` | >= 10M, 20M, 50M |
| `fraud_user_count_device_7d` | >= 2, 3, 5 |

#### 8.5. IP-level metrics

| Metric | Ngưỡng nên test |
|---|---|
| `user_count_ip_1h` | >= 3, 5, 10 |
| `user_count_ip_24h` | >= 5, 10, 20 |
| `trans_count_ip_1h` | >= 10, 20, 50 |
| `total_amount_ip_24h` | >= 20M, 50M, 100M |
| `fraud_user_count_ip_7d` | >= 2, 3, 5 |

#### 8.6. Time interval metrics

| Metric | Mô tả |
|---|---|
| `time_since_last_trans_user` | Khoảng cách giao dịch gần nhất |
| `time_since_last_success_user` | Khoảng cách success gần nhất |
| `time_since_last_fail_user` | Khoảng cách fail gần nhất |
| `min_interval_user_1h` | Khoảng cách min trong 1h |
| `avg_interval_user_1h` | Khoảng cách avg trong 1h |
| `time_since_add_card` | (nếu có journey) |
| `time_since_mapbank` | (nếu có journey) |
| `time_since_changephone` | (nếu có journey) |
| `time_since_resetpin` | (nếu có journey) |
| `time_since_register` | (nếu có journey) |

**Candidate threshold nên test:**
- `time_since_last_trans_user` <= 30 giây / 60 giây / 3 phút.
- Có >= 3 giao dịch trong 5 phút.
- Có >= 5 giao dịch trong 10 phút.
- Có >= 10 giao dịch trong 1 giờ.

#### 8.7. Amount pattern metrics

| Metric | Mô tả |
|---|---|
| `same_amount_count_user_{1h/24h}` | Số giao dịch cùng amount theo user |
| `same_amount_count_card_{1h/24h}` | Số giao dịch cùng amount theo card |
| `same_amount_count_device_{1h/24h}` | Số giao dịch cùng amount theo device |
| `amount_round_number_flag` | Amount là số tròn |
| `amount_near_limit_flag` | Amount gần hạn mức |
| `amount_band` | Nhóm amount |
| `max_amount_user_24h` | Max amount trong 24h |
| `avg_amount_user_24h` | Avg amount trong 24h |
| `amount_std_user_24h` | Std amount trong 24h |

**Candidate threshold nên test:**
- `same_amount_count_user_24h` >= 3, 5, 10.
- `same_amount_count_card_24h` >= 3, 5, 10.
- Amount gần hạn mức: 90%–100% hạn mức.
- Amount là số tròn: 500K, 1M, 2M, 5M, 10M.
- `max_amount_user_24h` >= 2 lần median amount của user trong 30 ngày.
- Transaction amount >= 3 lần average amount của user trong 30 ngày.

---

### 9. Bước 5 — Sinh candidate rule từ translog trước

Agent phải ưu tiên rule đơn giản từ translog trước khi join thêm profile/journey. Lý do: dễ explain, dễ implement, dễ estimate impact, dễ kiểm soát false positive, dễ tune threshold.

#### 9.1. Amount velocity rule

`total_amount_{user/card/device/ip}_{1h/24h/7d/30d} >= X`

#### 9.2. Count velocity rule

`trans_count_{user/card/device/ip}_{1h/24h} >= N`
`fail_count_{user/card}_{1h/24h} >= N`

#### 9.3. Entity overlap rule

| Rule | Ngưỡng mặc định |
|---|---|
| `user_count_device_24h` | >= 3 user |
| `user_count_device_7d` | >= 5 user |
| `user_count_ip_24h` | >= 5 user |
| `user_count_card_24h` | >= 3 user |
| `user_count_bin_24h` (per merchant) | >= 10 user |
| `trans_count_bin_24h` (per merchant) | >= 20 giao dịch |

#### 9.4. Time interval rule

| Rule | Ngưỡng |
|---|---|
| User >= 3 giao dịch trong 5 phút | — |
| User >= 5 giao dịch trong 10 phút | — |
| User >= 10 giao dịch trong 1 giờ | — |
| Card >= 5 giao dịch trong 1 giờ | — |
| Device >= 10 giao dịch trong 1 giờ | — |
| IP >= 20 giao dịch trong 1 giờ | — |

#### 9.5. Amount repetition rule

| Rule | Ngưỡng |
|---|---|
| `same_amount_count_user_24h` | >= 3 |
| `same_amount_count_card_24h` | >= 3 |
| `same_amount_count_device_24h` | >= 5 |
| Amount sát hạn mức | 90%–100% |
| Amount là số tròn và lặp lại nhiều lần | — |
| Amount hiện tại > 3 lần avg amount user 30 ngày | — |

---

### 10. Bước 6 — Đánh giá rule bằng recall, precision và impact

#### 10.1. Công thức bắt buộc

| Chỉ số | Công thức |
|---|---|
| TP | Fraud transaction bị rule hit |
| FP | Good transaction bị rule hit |
| FN | Fraud transaction không bị rule hit |
| **Precision** | TP / (TP + FP) |
| **Recall** | TP / (TP + FN) |
| Fraud amount recall | Fraud amount bị hit / Total fraud amount |
| Business transaction impact | Total transaction bị hit / Total transaction trong base population |
| Business amount impact | Total amount bị hit / Total amount trong base population |
| User impact | Số user bị hit / Tổng user trong base population |
| Good user impact | Số good user bị hit / Tổng good user trong base population |

#### 10.2. Acceptance criteria mặc định

| Tiêu chí | Reject rule | Challenge rule | Targeted high-precision rule |
|---|---|---|---|
| Precision | >= 90% | >= 70% | >= 95% |
| Recall | >= 20% | >= 20% | >= 5% |
| Fraud amount recall | >= 30% | >= 30% | >= 20% |
| Good transaction impact | <= 1% | <= 2% | — |
| Good user impact | <= 1% | <= 2% | ~0% |
| Business amount impact | <= 3% | <= 5% | — |

> **Lưu ý:** Nếu rule có `precision < 70%` và `recall < 20%` → **loại rule**, không implement.
> Nếu rule có `recall >= 50%` nhưng `precision < 70%` → chỉ đề xuất challenge/monitor, **không reject**.

#### 10.3. Cách chọn rule tốt nhất

Ưu tiên theo thứ tự:

1. Precision đủ cao để tránh ảnh hưởng good user.
2. Fraud amount recall tốt.
3. Business impact thấp.
4. Rule đơn giản, dễ implement và dễ explain.
5. Rule có thể apply tại đúng checkpoint.
6. Rule có thể tune threshold sau khi monitor.

Nếu có nhiều rule tương đương, chọn rule có ít điều kiện hơn, good user impact thấp hơn, fraud amount recall cao hơn.

---

### 11. Bước 7 — Khi rule từ translog chưa tốt

Nếu không có rule translog-only đạt acceptance criteria, agent không được dừng phân tích. Agent cần đánh giá lý do:

- Fraud quá phân tán.
- Fraud không có velocity rõ.
- Fraud amount / count không khác biệt với good user.
- Fraud và good user cùng dùng một merchant/source of fund.
- Pattern cần thêm thông tin profile hoặc journey mới phân biệt được.

→ Chuyển sang phân tích **user_profile**.

---

### 12. Bước 8 — Join user_profile để tìm pattern định danh/tài khoản

#### 12.1. Mục tiêu

Xem nhóm fraud có đặc điểm chung về account, KYC, NFC, DOB, CCCD, SĐT hoặc financial service ownership không. **Phải join cả good user** trong base population để so sánh.

#### 12.2. Metrics cần tính từ user_profile

**Account age:**
- `account_age_at_trans` với ngưỡng: <= 1d, <= 3d, <= 7d, <= 30d, > 30d.

**KYC / eKYC profile:**
- eKYC status.
- `eKYC_age_at_trans` với ngưỡng: <= 1d, <= 7d, <= 30d.

**NFC profile:**
- NFC status.
- `NFC_age_at_trans` với ngưỡng: <= 1d, <= 7d, <= 30d.

**DOB / Age group:**
- < 18, 18–22, 23–30, 31–45, > 45, DOB missing / bất thường.

**CCCD / ID:**
- Số account dùng cùng CCCD: >= 2, >= 3.

**Financial service ownership:**
- Có/không có: linked bank, linked card, credit limit, MMF, wallet balance activity, historical successful payment.

**Trust profile:**
- Trusted user, whitelist, blacklist/greylist flag, historical fraud flag.

#### 12.3. Candidate rule combine translog + user_profile

| Pattern | Ví dụ rule |
|---|---|
| Velocity + account age | `total_amount_user_24h >= 10M AND account_age <= 7d` |
| Velocity + non-NFC | `total_amount_user_30d >= 60M AND non-NFC` |
| Velocity + non-eKYC | `total_amount_user_7d >= 50M AND non-eKYC` |
| Velocity + newly eKYC | `total_amount_user_24h >= 10M AND eKYC_age <= 1d` |
| Velocity + CCCD multi-account | `total_amount_user_24h >= 10M AND CCCD linked >= 2 accounts` |
| Velocity + no behavior | `user has no historical successful payment AND amount >= 5M` |
| Source of fund + account age | `source_of_fund = card AND account_age <= 7d AND total_amount_user_24h >= 10M` |

#### 12.4. Acceptance criteria sau khi thêm user_profile

Rule combine được xem là tốt nếu:
- Precision >= 90%, Recall >= 20%, Fraud amount recall >= 30%, Good user impact <= 1%.
- **Hoặc:** Precision tăng ít nhất 15 điểm % so với rule translog-only mà recall không giảm quá 50%.

---

### 13. Bước 9 — Khi user_profile vẫn chưa đủ

Dấu hiệu cần join **user_journey**:
- Fraud liên quan đến account takeover.
- Fraud xảy ra ngay sau: change phone, reset PIN, add card/map bank, eKYC/NFC, login new device, register.
- Fraud không có velocity mạnh nhưng có journey event bất thường trước giao dịch.

---

### 14. Bước 10 — Join user_journey để tìm event trước fraud

#### 14.1. Cách join

- Lấy list userID trong base population → join với user_journey theo userID.
- **Chỉ lấy event xảy ra TRƯỚC transaction time** (tránh look-ahead bias).
- Tính time difference giữa event và transaction.

#### 14.2. Time window cần kiểm tra

5 phút, 30 phút, 1 giờ, 6 giờ, 24 giờ, 3 ngày, 7 ngày, 30 ngày trước transaction.

#### 14.3. Journey metrics cần tính

Với từng user/transaction, tính `had_{event}_before_trans` và `time_since_{event}` cho các event:
`register`, `login`, `login_new_device`, `changephone`, `resetpin`, `mapcard`, `unmapcard`, `mapbank`, `unmapbank`, `ekyc`, `nfc`, `lock/unlock`.

Thêm: `journey_event_count_{1h/24h/7d}`, `sensitive_event_count_{24h/7d}`.

#### 14.4. Sensitive journey events

| Event |
|---|
| change phone |
| reset PIN / forgot PIN |
| login new device |
| map card / unmap card |
| map bank / unmap bank |
| eKYC / NFC |
| unlock account |
| passkey remove/setup (nếu có) |
| biometric change (nếu có) |

**Candidate threshold:**
- Có sensitive event trong vòng 1 giờ / 24 giờ trước transaction.
- Có >= 2 sensitive events trong 24 giờ.
- Có >= 3 sensitive events trong 7 ngày.
- Transaction phát sinh trong 24 giờ sau: change phone, reset PIN, login new device, map card/bank.
- Transaction phát sinh trong 7 ngày sau: eKYC/NFC.

---

### 15. Bước 11 — Candidate rule combine velocity + profile + journey

#### 15.1. Change phone

| Rule | — |
|---|---|
| `total_amount_user_24h >= 5M AND changephone_age <= 24h` | |
| `total_amount_user_24h >= 10M AND changephone_age <= 7d` | |
| `trans_count_user_24h >= 5 AND changephone_age <= 24h` | |
| `source_of_fund = card AND changephone_age <= 24h AND amount >= 3M` | |
| `payment_amount >= 5M AND changephone_age <= 24h AND device_age <= 7d` | |

#### 15.2. Reset PIN

| Rule | — |
|---|---|
| `amount >= 3M AND resetpin_age <= 1h` | |
| `amount >= 5M AND resetpin_age <= 24h` | |
| `total_amount_user_24h >= 10M AND resetpin_age <= 24h` | |
| `resetpin_age <= 24h AND login_new_device_age <= 24h AND amount >= 3M` | |

#### 15.3. Login new device

| Rule | — |
|---|---|
| `amount >= 3M AND login_new_device_age <= 1h` | |
| `amount >= 5M AND login_new_device_age <= 24h` | |
| `total_amount_user_24h >= 10M AND login_new_device_age <= 24h` | |
| `login_new_device_age <= 24h AND source_of_fund = card AND amount >= 3M` | |

#### 15.4. Map card / Map bank

| Rule | — |
|---|---|
| `amount >= 3M AND mapcard_age <= 1h` | |
| `amount >= 5M AND mapcard_age <= 24h` | |
| `total_amount_user_24h >= 10M AND mapcard_age <= 24h` | |
| `amount >= 5M AND mapbank_age <= 24h` | |
| `total_amount_user_24h >= 10M AND newly_mapped_bank_or_card = true` | |

#### 15.5. Register / Onboarding

| Rule | — |
|---|---|
| `account_age <= 1d AND amount >= 3M` | |
| `account_age <= 3d AND total_amount_user_24h >= 5M` | |
| `account_age <= 7d AND total_amount_user_24h >= 10M` | |
| `account_age <= 7d AND trans_count_user_24h >= 5` | |
| `account_age <= 30d AND total_amount_user_30d >= 60M` | |
| `account_age <= 7d AND source_of_fund = card AND amount >= 3M` | |

#### 15.6. eKYC / NFC

| Rule | — |
|---|---|
| `non-NFC AND total_amount_user_30d >= 60M` | |
| `non-NFC AND total_amount_user_24h >= 10M` | |
| `eKYC_age <= 24h AND amount >= 5M` | |
| `NFC_age <= 24h AND amount >= 10M` | |
| `eKYC_age <= 7d AND trans_count_user_24h >= 5` | |
| `non-NFC AND source_of_fund = card AND total_amount_user_7d >= 30M` | |

#### 15.7. Sensitive event cluster

| Rule | — |
|---|---|
| `sensitive_event_count_24h >= 2 AND amount >= 3M` | |
| `sensitive_event_count_24h >= 2 AND total_amount_user_24h >= 5M` | |
| `sensitive_event_count_7d >= 3 AND total_amount_user_7d >= 20M` | |
| `login_new_device_age <= 24h AND resetpin_age <= 24h AND amount >= 3M` | |
| `changephone_age <= 24h AND mapbank_age <= 24h AND amount >= 3M` | |
| `register_age <= 7d AND mapcard_age <= 24h AND amount >= 3M` | |

---

### 16. Bước 12 — Rule action mapping

#### 16.1. Khi nên đề xuất MONITOR

- Precision < 70%, Recall < 20%.
- Pattern chưa rõ, fraud amount impact chưa lớn.
- Good user impact > 2%.
- Rule chưa đủ chắc để challenge/reject.

#### 16.2. Khi nên đề xuất CHALLENGE

- Precision 70%–89%, Recall >= 20%, Fraud amount recall >= 30%, Good user impact <= 2%.
- Phù hợp khi fraud pattern liên quan đến: new device, change phone/reset PIN, newly mapped card/bank, non-NFC/non-eKYC.
- Rule có recall tốt nhưng precision chưa đủ cao để reject.

#### 16.3. Khi nên đề xuất REJECT

- Precision >= 90%, Recall >= 20%, Fraud amount recall >= 30%.
- Good transaction impact <= 1%, Good user impact <= 1%.
- Pattern rõ, false positive risk thấp.
- Phù hợp khi: fraud tập trung vào entity rõ (card/device/IP/BIN), một device/IP liên quan nhiều fraud user, BIN attack/card testing rõ.

#### 16.4. Khi nên đề xuất BLACKLIST

- Entity đã liên quan trực tiếp đến fraud confirmed.
- Precision của entity-based rule >= 95%, good user impact gần bằng 0.
- Entity có thể blacklist: card fingerprint, device ID, IP/range (nếu chắc chắn), bank account, BIN (nếu kiểm soát được), userID (nếu fraud confirmed).

#### 16.5. Khi nên đề xuất WHITELIST EXCLUSION

- >= 30% fraud amount hoặc fraud count đang được whitelist/bypass.
- Fraud user có trusted flag nhưng phát sinh sensitive journey event gần đây.
- Fraud nằm trong nhóm low-risk rule nhưng hành vi thực tế đã thay đổi.
- Ví dụ: trusted user vừa change phone trong 24h, whitelisted user login new device trong 24h.

---

### 17. Bước 13 — Output cuối cùng agent phải trả ra

#### 17.1. Fraud scope

- Filter condition, time range fraud sample, time range base population.
- Số fraud transaction, fraud amount, số fraud user.
- Dimension bất thường chính.

#### 17.2. Pattern finding summary

| Nguồn | Pattern cần report |
|---|---|
| translog | Amount velocity, count velocity, fail velocity, time interval, device/IP/card overlap, BIN/merchant/SOF concentration |
| user_profile | Account age, KYC/NFC status, new eKYC/NFC, CCCD linkage, trusted/non-trusted, FS ownership |
| user_journey | Change phone, reset PIN, login new device, map card/bank, eKYC/NFC, sensitive event cluster |

#### 17.3. Candidate rules tested

Với mỗi rule phải có đầy đủ: Rule condition, TP, FP, FN, Precision, Recall, Fraud amount recall, Good transaction impact, Good user impact, Business amount impact, Recommended action.

#### 17.4. Recommended rule

Chọn 1–3 rule tốt nhất. Với mỗi rule cần nêu: rule logic, lý do chọn, fraud coverage, good user impact, action đề xuất, checkpoint apply, risk nếu implement, cách monitor sau implement.

#### 17.5. Nếu không tìm được rule đủ tốt

Agent không được cố đề xuất rule yếu. Phải kết luận rõ và đề xuất:
- Monitor thêm 3–7 ngày.
- Gắn tag case để collect thêm label.
- Dùng challenge thay vì reject nếu vẫn cần kiểm soát.
- Bổ sung data device/IP/card fingerprint/journey nếu thiếu.
- Escalate human review nếu fraud amount tiếp tục tăng.

---

### 18. Nguyên tắc thinking bắt buộc cho AI agent

- Đi từ **simple rule → complex rule**.
- Không combine quá nhiều điều kiện nếu một rule đơn giản đã đủ tốt.
- Không chỉ nhìn fraud sample — phải so sánh với base population.
- Không đánh giá rule chỉ bằng recall — phải luôn tính precision và good user impact.
- Ưu tiên rule dễ explain và dễ implement.
- Phân biệt rõ: Rule gap, Challenge gap, Checkpoint gap, Bypass/whitelist gap, Data gap.
- Luôn kiểm tra fraud đang được approve, challenge hay reject.
- **Tránh look-ahead bias** khi dùng user_journey — chỉ được dùng event xảy ra trước transaction.
- Nêu rõ time window, threshold, action và lý do chọn/loại rule cho mọi candidate rule.

---

### 19. Ví dụ thinking flow hoàn chỉnh

**Phase 1 detect:**
- Fraud tại AppID X tăng 45% so với W-1, amount tăng thêm 180 triệu VND.
- Fraud tập trung ở source of fund = international card.
- 70% phần fraud tăng thêm đến từ 3 BIN.

**Step 1:** Lấy fraud transID với filter `appID = X, source_of_fund = international card, BIN in [3 BIN bất thường]`, time range = tuần bất thường.

**Step 2:** Join với translog, tính fraud sample (count, amount, user, card, device, IP).

**Step 3:** Tạo base population: cùng filter, time range = D-30 (bao gồm fraud và non-fraud).

**Step 4:** Test translog-only rules. Rule tốt nhất: `total_amount_user_24h >= 10M AND source_of_fund = international card` → Precision 68%, Recall 42%, Fraud amount recall 55%, Good user impact 4%. → **Kết luận:** Cần join user_profile.

**Step 5:** Join user_profile → 80% fraud user có `account_age <= 7d`, good user cùng điều kiện chỉ 8%. Test rule: `total_amount_user_24h >= 10M AND account_age <= 7d AND source_of_fund = international card` → Precision 91%, Recall 28%, Fraud amount recall 43%, Good user impact 0.7%. → **Đạt acceptance criteria.**

**Step 6:** Join user_journey → 60% fraud user có `mapcard_age <= 24h`. Test rule: `total_amount_user_24h >= 10M AND account_age <= 7d AND mapcard_age <= 24h` → Precision 96%, Recall 18%, Fraud amount recall 35%, Good user impact 0.2%. → **Targeted reject rule.**

**Final recommendation:**

| Rule | Action | Lý do |
|---|---|---|
| `SOF = intl card AND amount_24h >= 10M AND account_age <= 7d` | **Challenge** | Precision 91%, recall 28%, good user impact 0.7% |
| `SOF = intl card AND amount_24h >= 10M AND account_age <= 7d AND mapcard_age <= 24h` | **Reject** | Precision 96%, fraud amount recall 35%, good user impact 0.2% |

**Next step:** Implement tại checkpoint payment authorization. Monitor fraud amount, challenge pass rate, false positive, TPV impact trong 7 ngày sau implement. Nếu fraud shift sang BIN khác → mở rộng rule theo `source_of_fund + account_age` thay vì fixed BIN.

---

### 20. Default threshold summary

#### Precision mục tiêu

| Loại rule | Precision |
|---|---|
| Reject rule | >= 90% |
| Challenge rule | >= 70% |
| Blacklist / entity rule | >= 95% |

#### Recall mục tiêu

| Loại rule | Recall |
|---|---|
| Rule chính | >= 20% |
| Targeted high-precision rule | >= 5% (nếu fraud amount recall >= 20%) |
| Rule có recall tốt | >= 30% |

#### Fraud amount recall mục tiêu

| Mức | Ngưỡng |
|---|---|
| Tối thiểu | >= 30% |
| Tốt | >= 50% |
| Targeted rule (precision >= 95%) | >= 20% |

#### Good user / Business impact

| Loại rule | Good user impact | Business amount impact |
|---|---|---|
| Reject rule | <= 1% | <= 3% |
| Challenge rule | <= 2% | <= 5% |
| Monitor rule | có thể > 2% (không auto reject) | — |

> Nếu business amount impact > 5% → cần human approval hoặc thêm điều kiện refine.

#### Time window default

| Window | Dùng khi |
|---|---|
| 5 phút, 10 phút, 1 giờ | Short burst |
| 24 giờ | Daily velocity |
| 7 ngày | Medium-term velocity |
| 30 ngày | Monthly velocity |

#### Default amount thresholds

| Window | Ngưỡng |
|---|---|
| 1h | 3M, 5M, 10M, 20M |
| 24h | 10M, 20M, 50M, 100M |
| 7d | 30M, 50M, 100M, 200M |
| 30d | 60M, 100M, 200M, 500M |

#### Default count thresholds

| Window | Ngưỡng |
|---|---|
| 1h | 3, 5, 10 giao dịch |
| 24h | 5, 10, 20 giao dịch |
| 7d | 10, 20, 50 giao dịch |
| Fail 1h | 3, 5, 10 |
| Fail 24h | 5, 10, 20 |

#### Default journey thresholds

| Điều kiện | Ngưỡng |
|---|---|
| Event trước transaction | <= 1 giờ / <= 24 giờ / <= 7 ngày |
| Sensitive event count 24h | >= 2 |
| Sensitive event count 7d | >= 3 |
