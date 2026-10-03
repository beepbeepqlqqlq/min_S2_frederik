# Our Special Day

기본 설정
한국어+영어 모바일 청첩장 웹사이트를 만들어줘. 최대 너비 480px, 중앙 정렬, 세로 스크롤 원페이지 형태야. 폰트는 '프리텐다드'이고,  다크그린 (#14201A)배경에 오렌지 (#FF4E4E) 포인트 컬러를 써줘.  영어랑 한국어 화자를 모두 동시에 이해시켜야 해서, 모든 글에 한국어/영어 순서로 영어 텍스트도 덧붙여줘. 만약 영어 텍스트를 내가 제시하지 않았다면 자연스러운 영어 번역을 덧붙여줘. 

섹션 구성 (위→아래 순서)
다음 섹션들을 순서대로 배치하고, 섹션 사이에는 작은 별 아이콘 구분선을 넣어줘:

1. 히어로 섹션 — 전체 화면 커버 이미지, 하단에 스크롤 인디케이터 (바운스 애니메이션), 내가 업로드하는 <hero.png> 이름의 파일을 사용해

2. 초대장 카드 — 신랑신부 이름, 초대 메시지, 투명 배경
Text content:
<강민><Min Kang> 
<프레데릭 랭><Frederik Lanng> 



3. 날짜 & 카운트다운 — 달력 (해당 날짜 하이라이트), D-day 카운터
Text content: <Min> ❤️ <Frederik>의 결혼식이 [X]일 남았습니다
영어 텍스트: [X] days until ~~
Real-time countdown to <2027>년 <10>월 <10>일 <17>시
Calendar widget showing <결혼날짜> highlighted in <포인트컬러>

4. 오시는 길 — 지도 이미지, 주소, 구글/카카오 지도 링크, 주차 안내
Kakao Map embedded
<map.png> 파일을 먼저 넣어줘, 못생겼다고 생각하면 너가 더 예쁘게 약도를 고쳐도 돼. 
그 다음 링크를 두개 넣어줘, 버튼을 누르면 링크가 나오게. 버튼은 포인트 컬러로 만들어줘. 
 <카카오 맵 Kakao Map>  < https://kko.to/x4Wa2tk9Ff>
<구글 맵 Google Maps> https://maps.app.goo.gl/oJ8YhbjoMeEfbXGz9
Address: <서울 종로구 삼청로 22-7> <22-7 samcheong-ro, Jongno District, Seoul>


5. 예식장 안내 — 예식장 사진·정보 카드
White card with details
내가 업로드한 RSVP, Schedule, Dinner.png 사진을 사용해
Text content:
RSVP:  <지정석으로 진행됩니다. 예식 2개월 전까지 참석 여부를 알려주세요.
Assigned seating · Please RSVP at least two months in advance.>
Schedule: <SCHEDULE & DRESS CODE

5:00-8:00 PM · Wedding
9:00 PM - · After Party
드레스/정장 Cocktail / Formal>
Dinner: <Seafood & Beef
식이 제한이 있으신 경우 미리 알려주세요.
Please let us know of any dietary restrictions.>

6. 참석 여부 (RSVP) — 바텀시트 모달, 2초 후 자동 팝업 (하루 한번)
Trigger button: "참석 의사 전달하기" 
Modal form with <포인트 컬러> accents:
Toggle buttons: 구분 (신부측 Min's Guests/신랑측 Frederik's Guest) - <포인트 컬러> when selected
Radio: 성함 Name (참석 Joyfully Accept /불참석 Regretfully Decline)
Input: Plus one (placeholder: N/A 누르거나 "Name of the guest")
Submit button: "참석 의사 전달하기 Submit" 
Checkbox: "오늘 하루 보지 않기"
Reference uploaded RSVP images for exact layout
여기가 가장 복잡한데... 신랑/신부측 참석인을 +1 정보까지 (있으면 이름까지, 없으면 N/A누르게) 해서 업데이트하고싶어


8. 축하 메시지 (방명록) — 이름+메시지 입력, 컬러 포스트잇 카드 (랜덤 색상, 톤다운된 빈티지 색상·살짝 회전), 
2열 메이슨리 레이아웃, 텍스트 길이에 따라 카드 크기 자동 조절
<혹은 레퍼런스 이미지 같은게 있다면 방명록레퍼런스.jpg를 보고 너가 만들어줘.>

8. 푸터 — 카카오톡 공유, 링크 복사 버튼

백엔드 (Lovable Cloud)
데이터베이스에 두 개 테이블 만들어줘:
* `rsvp_submissions`: name, phone, attendance, guest_count, 
* `guestbook_messages`: author, content, color_index (랜덤 0-5)
방명록은 실시간(Realtime) 구독으로 새 메시지 즉시 반영. RLS는 누구나 INSERT/SELECT 가능하게.

디자인 키워드
미니멀, 따뜻한 다크톤, 한국 전통 느낌보다는 모던·세련된 스타일, 부드러운 페이드인 애니메이션, shadcn/ui 컴포넌트 활용

TECHNICAL DETAILS:
All interactive elements use <포인트 컬러> on hover/active
Modal animations: slide up from bottom
Close buttons: X in <포인트 컬러> or dark color
Smooth scroll between sections
Mobile-optimized touch interactions
Form validation with <포인트 컬러> success states
Make site display as 480px fixed width on desktop, centered with shadow

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f0944599-9ff0-4cf1-bfbf-a8a8c8ee0780).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
