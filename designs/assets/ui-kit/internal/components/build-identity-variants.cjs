/* PDF p.114–147 visual-audit supplements. Imported sources remain unchanged. */
module.exports = function(add) {
  add('masthead-verification', '정부기관 전용 · 공식 누리집 확인 방법', [114,115,116,117,118,119,120], `
<div data-ui="anchor-nav"><a class="ui-skip ui-skip-hidden" href="#government-main">본문 바로가기</a>
<div class="ui-masthead" data-government-only>
  <p><img src="../../upstream/resources/img/component/icon/ico_flag.svg" alt="" width="24" height="16"> 이 누리집은 대한민국 공식 전자정부 누리집입니다.</p>
  <details><summary>공식 누리집 확인방법</summary><section aria-labelledby="verification-title"><h2 id="verification-title">공식 누리집 주소 확인하기</h2><p>go.kr 주소를 사용하는 누리집은 대한민국 정부기관이 관리하는 누리집입니다.</p><p>그 밖의 도메인은 운영기관의 승인된 공식 누리집 목록에서 확인해 주세요.</p><a href="#government-domain-source">운영 중인 공식 누리집 보기</a></section></details>
</div><article id="government-main" tabindex="-1"><h2>정부기관용 배치 예제</h2><p>정부기관에서만 사용할 수 있습니다. 이 자산 미리보기는 정부 누리집이 아닙니다.</p><section id="government-domain-source" tabindex="-1"><h3>공식 누리집 목록 연결 위치</h3><p>도입 기관이 승인한 실제 확인 주소로 링크를 교체해야 합니다. 이 예제는 어떤 도메인도 인증하지 않습니다.</p></section></article></div>`, ['collapsed','expanded','keyboard','skip-first','target-focus'], 'masthead', 'verification-disclosure');
  for(const theme of ['light','dark']) add(`identifier-${theme}`, `정부기관 전용 · ${theme} 운영기관 식별 띠`, [121,122,123,124,125,126,127], `
<footer class="ui-identifier-footer" data-government-only><p>기관 서비스의 승인된 푸터 정보가 먼저 놓이는 위치입니다.</p><section class="ui-identifier ${theme}" aria-label="운영기관 식별 정보">
  <div class="ui-identifier-logos" data-approved-organization-logos><span role="img" aria-label="상위기관 승인 로고를 연결할 위치">[상위기관 승인 로고]</span></div>
  <p data-approved-organization-copy>이 누리집은 [운영기관명] 누리집입니다.</p>
</section></footer><p class="ui-hint">정부기관 전용 구조 템플릿입니다. 대괄호의 기관명·승인 로고·대체텍스트를 연결하기 전에는 실제 서비스에 배포하지 않습니다. 복수 기관은 최상위 기관부터 왼쪽에 배치합니다. 어두운 식별 띠는 페이지 전체 다크 모드가 아닙니다.</p>`, ['footer-last-section',theme,'approved-logo-slot','approved-copy-slot','mobile-wrap'], 'identifier', theme);
  add('footer-company', '회사 중립 푸터', [128,129,130,131,132,133,134], `
<div data-ui="anchor-nav" class="ui-page-shell"><div class="ui-page-body">
<section id="footer-privacy" tabindex="-1"><h2>개인정보 처리방침</h2><p>승인된 개인정보 처리방침의 실제 경로를 연결하는 위치입니다. 이 예제는 법률 문서를 생성하지 않습니다.</p></section>
<section id="footer-terms" tabindex="-1"><h2>이용약관</h2><p>서비스에 필요한 승인된 이용약관을 연결합니다. 전자상거래 등 해당 조건을 먼저 확인합니다.</p></section>
<section id="footer-support" tabindex="-1"><h2>문의 안내</h2><p>실제 운영팀의 문의 방법과 운영 시간을 연결합니다.</p></section></div>
<footer class="ui-company-footer" aria-label="서비스 운영 정보"><div class="ui-footer-identity"><strong data-company-name>서비스 이름</strong>
<address data-company-contact>연락처와 운영 시간: 회사의 승인된 정보를 연결해 주세요.</address>
<nav aria-label="운영 지원"><ul class="ui-nav-list"><li><a href="#footer-support">문의 안내</a></li></ul></nav></div>
<nav aria-label="정책"><ul class="ui-nav-list"><li><a href="#footer-privacy"><strong>개인정보 처리방침</strong></a></li><li><a href="#footer-terms">이용약관</a></li></ul></nav>
<p data-company-copyright>저작권 정보: 승인된 권리자·연도 표기를 연결해 주세요.</p></footer></div>`, ['policy-links','support-link','approved-contact-slot','approved-copyright-slot','short-page-bottom','mobile-wrap','target-focus'], 'footer','company');
  add('header-scroll-reveal','회사 컴팩트 헤더 · 위로 스크롤할 때 재노출',[135,139,143,145,146,147],`
<div data-ui="scroll-header" class="ui-scroll-shell"><div data-ui="anchor-nav"><a class="ui-skip ui-skip-hidden" href="#compact-main">본문 바로가기</a></div>
<header class="ui-header ui-header-compact" data-scroll-header><div class="ui-header-brand" data-ui="anchor-nav"><a href="#compact-main">서비스 이름</a><nav class="ui-header-actions" aria-label="주요 메뉴"><a href="#compact-main">자료</a><a href="#compact-help">이용 안내</a></nav></div></header>
<article id="compact-main" tabindex="-1"><h2>자료</h2><p>한 줄로 구성된 컴팩트 헤더에서 선택하는 동작입니다. 아래로 스크롤하면 화면에서 벗어나고 위로 스크롤하면 다시 나타납니다. 키보드 초점이 헤더 안에 있을 때는 숨기지 않습니다.</p><section id="compact-help" tabindex="-1"><h2>이용 안내</h2><p>원문 p.145의 선택적 고정 방식입니다. 정부 공식 배너는 이 고정 영역에 넣지 않습니다.</p></section></article></div>`,['at-top','scroll-down-hidden','scroll-up-visible','focus-visible','compact-only'], 'header','company-scroll-reveal');
};
