# 아토링 서버
아토링 서버는 아토링 클라이언트 및 몽고디비랑 소통하며
클라이언트의 요청에 따라 데이터 조회 및 수정을 진행하게됨.

## 목차
- [API](#API)
- [린팅](#린팅)
- npm
  [설치](#설치)
  [실행](#실행)
  [테스트](#npm_test)
  [린팅](#린팅)
- [스키마](#스키마)
  - [어드민](#어드민)
  - [커리어정보스키마](#커리어정보스키마)
  - [멘터링스키마](#멘터링스키마)
  - [멘터스키마](#멘터스키마)
  - [결제내역스키마](#결제내역스키마)
  - [리뷰스키마](#리뷰스키마)
  - [토큰스키마](#토큰스키마)
  - [유저스키마](#유저스키마)

## API

[노션](https://www.notion.so/api-71b37f82a1e547639d43383db5f715d0)을 참고하면 됨.
하지만 노션문서의 업데이트가 필요함.

## 린팅
[세미 스탠다드](https://marketplace.visualstudio.com/items?itemName=flet.vscode-semistandard) 를 사용중이며,
작은 따옴표, 탭 사이즈 2를 사용중임.

또한 [npm 세미 스탠다드](https://www.npmjs.com/package/semistandard) 및 [snazzy](https://github.com/standard/snazzy)를 이용하여
린팅을 확인하고 수정할수 있음.
## npm_명령어
### 설치
`npm install`

### 실행
데브 서버인 경우 `nodemon app.js`를 사용해 주세요
`npm start`는 pm2를 실행시키게 되며 이경우 `npm delete app.js`를 이용해 pm2를 종료해야 할 수 있습니다.

### npm_test
TDD는 예정입니다.

### 린팅
`npm run lint` 세미스탠다드 룰에 위반한 코드를 콘솔에 출력.
`npm run lint-fix` 룰 위반한 코드 출력 및 일부 린팅 적용.
## 스키마

### 어드민

  - name: { type: String, required: true } 어드민의 이름.
  - email: { type: String, required: true, unique: true } 어드민 로그인에 필요한 이메일 정보.
  - pwd: { type: String, requried: true } 어드민 로그인에 필요한 비밀번호.
  - accessKey: { type: String, required: true, unique: true } 랜덤으로 지급되는 고유한 접근 키.
  - authorityLevel: { type: Number, required: true } 접근레벨. 기본으로는 0. 1이상 로그인 및 기능 접근 가능.
  - attempts: { type: Number, default: 5 } 로그인 시도 횟수. 부르트 포스 방지용. 0이하 일시 개발팀 수동 조절이 필요함.

### 커리어정보스키마
  - thumb: { type: String, required: true } 커리어정보 카드의 섬네일
  - title: { type: String, required: true } 커리어정보 카드의 타이틀
  - issuedDate: { type: Date, required: true } 커리어 정보 카드 작성일
  - createrName: { type: String, required: true } 작성자 이름. 아토링 작성자 혹은 원 작성자의 이름
  - category: String 카테고리 데이터. 현재는 사용중이지 않음.
  - subCategory: String 세부 카테고리 데이터. 현재 사용중이지 않음.
  - detailInfo: String 상세 정보. iframe은 유튜브만 허용됨.
  - textDetailInfo: String 상세 정보의 텍스트들만 남김. 검색엔진 서치용.
  - createdAt: { type: Date, required: true, default: new Date(date().add(9, 'hours').format()) } 데이터 생성일
  - updatedAt: { type: Date, required: true, default: new Date(date().add(9, 'hours').format()) } 데이터 업데이트 날짜
  - likesCount: { type: Number, default: 0 } 좋아요 수

### 멘터링스키마
각종 멘토링 프로그램들이 저장되는 양식
  - thumb: { type: String } 카드 섬네일
  - title: { type: String } 카드 타이틀
  - seq: { type: Number, default: 0 } - deprecated
  - startDate: { type: Date } 프로그램 시작 시간 정보
  - endDate: { type: Date } 프로그램 종료 시간 정보
  - moderatorId: { type: Schema.ObjectId, required: true } 진행자(멘터) _id 정보
  - category: [String] 카드 카테고리(커리어 클래스만)
  - subCategory: [String] 카드 세부 카테고리(현재 미사용)
  - tags: Schema.Types.Mixed 카드 테그들. 현재는 스트링 배열
  - detailInfo: String 프로그램 정보 html 스트링
  - textDetailInfo: String 프로그램 정보에서 텍스트들만 모아놓은 정보. 검색엔진 검색용
  - isGroup: Boolean 프로그램 클래스 여부
  - availableTime: { 2차 개발이후 진행할 예약 프로세스에서 사용할 예약 가능 정보.
    - mon: [String],
    - tue: [String],
    - wed: [String],
    - thu: [String],
    - fri: [String],
    - sat: [String],
    - sun: [String]
  },
  - likesCount: { type: Number, default: 0 } 좋아요 수
  - maximumParticipants: Number 최대 정원수
  - joinedParticipants: { type: Number, default: 0 } 현재 결제를 진행/완료 혹은 예약을 완료한 인원수
  - price: { type: Number, default: 0 } 프로그램 가격 정보
  - rate: { type: Number, default: 0 } 평점
  - rateCount: { type: Number, default: 0 } 평점 평균을 내기위한 평가의 횟수
  - reviews: [Schema.ObjectId], 평가를 남긴 유저들의 _id
  - createdAt: { type: Date, default: new Date(date().add(9, 'hours').format()) } 프로그램 생성일
  - updatedAt: { type: Date, default: new Date(date().add(9, 'hours').format()) } 프로그램 정보 변경일

## 멘터스키마

  **멘터 is 유저, 유저 is not 멘터**

  - thumb: { type: String, required: true } 어드민 관리용 섬네일. 
  - settledAmount: Number 정산 가능한 금액 정보
  - tags: [String] deprecated
  
  
  
  - category: {
    멘토링 가능한 영역, 연차정보.
    값이 -1 === 해당사항 없음 4 === 모든 년차 멘토링 가능 이하 내림차순.

    - employment: { type: Number, default: -1 }, 교육.
    - founded: { type: Number, default: -1 }, 창업.
    - professional: { type: Number, default: -1 }, 전문예술.
    - free: { type: Number, default: -1 }, 프리랜서.
    - edu: { type: Number, default: -1 }, 진학/유학
  },
  - descriptionForMentor: { type: String, required: true } 멘터 소개 html 스티링
  - descriptionText: { type: String, required: true }, // 한글만 존재하는 텍스트. 역시 엘라스틱 서치 검색용
  - availableTime: { mon: [String], tue: [String], wed: [String], thu: [String], fri: [String], sat: [String], sun: [String] } 어드민 카드 생성시 기본으로 집어넣을 가능한 시간 정보
  - paymentInfo: { bank: String, address: String, owner: String } 은행, 예금주 등 정산에 필요한 정보
  - likesCount: { type: Number, default: 0 } 좋아요 수
  - price: { type: Number, required: true } deprecated

## 결제내역스키마
  - userId: { type: Schema.ObjectId, required: true } 유저의 ID
  - targetId: { type: Schema.ObjectId, required: true } 멘토 혹은 커리어 교육의 ID
  - originType: { type: String, required: true } 구매한 대상의 타입. 멘토 || 커리어 || ...
  - price: { type: Number, required: true } 가격
  - bookedStartTime: { type: Date } 예약 시간정보. 1차개발에서는 어드민이 작성하게됨.
  - bookedEndTime: { type: Date } 예약 시간 정보. 1차 개발에서는 어드민이 작성하게됨.
  - merchantUid: { type: String, required: true } PG 결제 검증용 데이터
  - isReviewed: { type: Boolean, default: false } 프로그램 종료 이후 리뷰를 주었는지
  - isRefund: { type: Boolean, default: false } 환불 여부
  - progress: { type: String, default: 'inprogress' } 결제 진행 정보. inprogress = 결제 필요 paid = 결제 완료 completed = 예약 완료, ready = 가상계좌 발급 완료
  - zoomLink: String 멘토링 진행 확인을 위한 줌링크
  - questions: [{ type: String }] 예약자의 멘토링 시작 전 질문들
  - hopeTime: String 예약자가 희망하는 시간대 정보. 1차 개발에서만 사용될듯.
  - createdAt: { type: Date, default: new Date(date().add(9, 'hours').format()) } 데이터 생성일
  - paymentData: { type: Object }, 아임포트 결제 정보 저장

## 리뷰스키마
  - userThumb: { type: String, required: true } 유저 섬네일
  - userName: { type: String, required: true } 유저 이름
  - userId: { type: Schema.ObjectId, required: true } 유저의 _id
  - targetId: { type: Schema.ObjectId, required: true } 프로그램의 _id
  - originType: { type: String, required: true }, // 리뷰대상 구문용 (멘토 || 커리어교육 || ...)
  - text: { type: String, required: true } 리뷰 내용
  - rate: { type: Number, default: 0 } 평점 최대 5점.
  - createdAt: { type: Date, default: new Date(date().add(9, 'hours').format()) } 리뷰 생성일
  - modifiedAt: { type: Date, default: new Date(date().add(9, 'hours').format()) } 리뷰 변경일

## 토큰스키마
1회성 토큰을 관리해야하는 경우 사용됨.
  - name: { type: String, required: true } 토큰바디
  - isUsed: { type: Boolean, default: false } 1회 사용여부
  - createdAt: { type: Date, required: true, default: new Date(date().add(9, 'hours').format()) } 토큰 생성일

## 유저스키마
  성별, 생일, 전공정보는 프로그램 예약시 멘터가 볼수 있음.

  - thumb: { type: String, default: 'https://artoring.com/image/1626851218536.png' } 유저들이 보게되는 섬네일
  - name: { type: String } 유저 이름
  - sns: [] 소셜 로그인의 경우 appId, snsType이 객체 형태로 저장됨. 소셜로그인을 취소해야 하는경우 여기 데이터를 이용하여 연동 취소 API 요청을 보냄.
  - nickName: { type: String } 유저 닉네임. 현재 사용안함.
  - email: { type: String, required: true, unique: true } 로그인에 필요한 이메일 정보. 현재 검증중임.
  - verifiedEmail: { type: Boolean, default: false } 이메일 검증 성공 여부. 없으면 홈페이지 / 에서 인증관련 모달 렌더링
  - verifiedPhone: { type: Boolean, default: false } 향후 본인인증에 사용할 핸드폰 인증 여부.
  - gender: { type: String } 성별 여부
  - birth: { type: String } 생일
  - phone: { type: String } 핸드폰. 향후 인증이 필요함.
  - address: { type: String } 주소 정보
  - pwd: { type: String, required: true } 로그인에 필요한 비밀번호 정보
  - isMentor: { type: Boolean, default: false } 멘토 여부
  - isDrop: { type: Number, default: '-1'} 회원 탈퇴 여부. -1 = 탈퇴 안함 0 = (멘토한정)탈퇴요청중 1 = 탈퇴함
  - mentor: mentorSchema 멘토인 경우 해당 영역의 데이터가 있음. 자세한 내용은 [멘터스키마](#멘터스키마) 참고
  - major: { type: String } 전공 정보
  - current: {
    - jobTitle: { type: String },
    - belongs: { type: String },
    - howLong: { type: String },
    - dept: String
  }, 현재 직업 정보

  - interestedIn: [{
    - name: String,
    - val: Boolean
  }], 관심사 정보

  - likedCareerEdu: [Schema.ObjectId] 좋아요를 누른 커리어 클래스 _id
  - likedMentor: [Schema.ObjectId] 좋아요를 누른 커리어 멘토링 _id
  - likedInfo: [Schema.ObjectId] 좋아요를 누른 커리어 정보 _id
  - outdoorAct: String 대외내역 정보
  - workHistory: String 과거 이력 
  - createdAt: { type: Date, default: new Date(date().add(9, 'hours').format()) } 가입 정보
  - refOrLongTimeToken: String 혹시나 필요할지도 모를 리프레시 혹은 롱텀 토큰데이터
  - drop: {
    - name: String,
    - reason: {},
    - date: { type: Date, default: new Date(date().add(9, 'hours').format()) }
  },
  회원 탈퇴시 작성될 이름과, 그 사유, 날짜

