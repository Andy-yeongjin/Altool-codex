'use strict';
// Authored interaction alternatives for PDF p430–436, p459–467 and p485–497.
// The caller owns wrappers, dependencies and registry publication.
module.exports = function(add) {
  add('step-adaptive', '적응형 단계 이동과 선택 단계 건너뛰기', [430,431,433,434,435,436], `
<section data-guided="steps">
  <h2>자료 정리 · 로컬 예제</h2><p>필수 분류를 정한 뒤 선택 메모를 건너뛰거나 완료한 단계로 돌아갈 수 있습니다. 서버에 제출하지 않습니다.</p>
  <ol class="guided-steps" aria-label="자료 정리 단계">
    <li><button type="button" data-step-link="0" aria-current="step">1. 분류 선택 <span data-step-state="0">현재 단계</span></button></li>
    <li><button type="button" data-step-link="1" disabled>2. 메모 (선택) <span data-step-state="1">대기</span></button></li>
    <li><button type="button" data-step-link="2" disabled>3. 확인 <span data-step-state="2">대기</span></button></li>
  </ol><p data-step-status role="status">현재 1 / 3 단계</p>
  <form data-step-form novalidate>
    <section data-step-panel="0"><h3 tabindex="-1">1. 분류 선택</h3><label for="adaptive-category">자료 분류 (필수)</label><select id="adaptive-category" data-step-category aria-describedby="adaptive-error"><option value="">선택해 주세요</option><option value="안내">안내</option><option value="서식">서식</option></select></section>
    <section data-step-panel="1" hidden><h3 tabindex="-1">2. 메모 (선택)</h3><label for="adaptive-memo">내 메모</label><textarea id="adaptive-memo" data-step-memo maxlength="100"></textarea><p>입력하지 않고 건너뛰어도 됩니다. 최대 100자입니다.</p></section>
    <section data-step-panel="2" hidden><h3 tabindex="-1">3. 확인</h3><p data-step-summary></p><p>완료 버튼은 이 예제의 로컬 확인만 끝냅니다.</p></section>
    <p id="adaptive-error" data-step-error class="ui-error" role="alert"></p>
    <div class="ui-controls"><button type="button" data-step-previous hidden>이전</button><button type="button" data-step-skip hidden>선택 단계 건너뛰기</button><button type="submit" data-step-next>다음</button><button type="button" data-step-reset>처음부터 다시</button></div>
  </form><p data-step-result role="status"></p>
</section>`, ['initial','required-invalid','forward','back','adaptive-jump','optional-skipped','input-preserved','local-complete','reset'], 'step-indicator','adaptive-optional');

  const tasks = prefix => `<div class="guided-task-body">
    <h2>자료 카드 만들기 · 로컬 예제</h2><p>제목·분류로 화면 안의 미리보기만 만듭니다. 서버 전송이나 저장은 하지 않습니다.</p>
    <div data-tour-target="0" class="guided-target"><form data-tour-title-form novalidate><label for="${prefix}-title">자료 제목</label><p id="${prefix}-title-hint">1~40자 제목을 입력하고 적용해 주세요.</p><input id="${prefix}-title" data-tour-title maxlength="40" aria-describedby="${prefix}-title-hint ${prefix}-error"><button type="submit">제목 적용</button></form></div>
    <div data-tour-target="1" class="guided-target"><label for="${prefix}-category">자료 분류</label><select id="${prefix}-category" data-tour-category><option value="">선택해 주세요</option><option value="안내">안내</option><option value="서식">서식</option></select></div>
    <div data-tour-target="2" class="guided-target"><button type="button" data-tour-preview>미리보기 생성</button><section data-tour-output aria-label="자료 카드 미리보기" hidden><h3 data-tour-output-title></h3><p data-tour-output-category></p></section></div>
    <p id="${prefix}-error" data-tour-error class="ui-error" role="alert"></p><p data-tour-status role="status">따라하기를 시작하지 않았습니다.</p>
    <section data-tour-balloon class="guided-balloon" aria-label="현재 따라하기 안내" hidden><h3 data-tour-heading tabindex="-1"></h3><p data-tour-description></p><p data-tour-count></p><div class="ui-controls"><button type="button" data-tour-stop>그만보기</button><button type="button" data-tour-previous>이전 안내</button><button type="button" data-tour-next>다음 안내</button><button type="button" data-tour-finish hidden>따라하기 마치기</button></div></section>
  </div>`;
  add('coach-action', '실제 대상 행동에 연결된 코치마크', [485,486,487,488,489,490,491,492,493,494,495,496,497], `
<section data-guided="tour"><button type="button" data-tour-start>따라하기 시작</button>${tasks('coach')}</section>`, ['not-started','user-started','one-spotlight','actual-action-advance','required-invalid','previous','completed-step-next','stopped','focus-returned','local-preview','finished','restart'], 'coach-mark','action-driven');

  add('tutorial-retained', '접기·탭 전환 후 이어지는 따라하기 패널', [459,460,461,462,463,464,465,466,467,494,497], `
<section data-guided="tour" class="guided-tutorial">
  <button type="button" data-guide-open aria-expanded="false" aria-controls="retained-panel">도움말 열기</button>
  <div class="guided-layout">${tasks('tutorial')}
    <dialog id="retained-panel" data-guide-panel aria-labelledby="retained-heading"><h2 id="retained-heading" tabindex="-1">자료 카드 도움말</h2>
      <div role="tablist" aria-label="도움 종류" class="ui-controls"><button id="retained-help-tab" role="tab" type="button" aria-selected="true" aria-controls="retained-help" data-guide-tab="help">도움말</button><button id="retained-tour-tab" role="tab" type="button" aria-selected="false" aria-controls="retained-tour" tabindex="-1" data-guide-tab="tour">따라하기</button></div>
      <section id="retained-help" role="tabpanel" aria-labelledby="retained-help-tab" data-guide-tabpanel="help"><h3>자료 카드란?</h3><p>제목과 분류를 요약한 미리보기입니다. 실제 자료는 업로드하거나 저장하지 않습니다.</p></section>
      <section id="retained-tour" role="tabpanel" aria-labelledby="retained-tour-tab" data-guide-tabpanel="tour" hidden><h3>자료 카드 만들기</h3><ol><li>제목 적용</li><li>분류 선택</li><li>미리보기 생성</li></ol><p data-guide-progress role="status">시작 전</p><button type="button" data-tour-start>따라하기 시작</button><button type="button" data-guide-continue hidden>본문에서 계속하기</button><button type="button" data-tour-stop hidden>그만 따라하기</button></section>
      <p>접기와 탭 전환은 현재 진행을 유지합니다. 그만하기는 안내를 중단합니다. 새로고침하면 초기 상태로 돌아갑니다.</p><button type="button" data-guide-close>도움말 접어두기</button>
    </dialog>
  </div>
</section>`, ['desktop-open-help','mobile-modal','tab-keyboard','started','collapsed-retained','reopened-retained','tab-switch-retained','resume-target','stopped','restart','local-preview'], 'tutorial-panel','retained-session');
};
