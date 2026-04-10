 'use client';

import { useMemo, useState } from 'react';

import { RESULT_COPY, TYPE_IMAGES, specialQuestions } from '@/data/sbti-data';
import { buildDimensionSummary, computeResult, getQuestionMetaLabel, getVisibleQuestions, shuffle } from '@/lib/sbti';
import { questions } from '@/data/sbti-data';
import type { AnswerMap, Question } from '@/types/sbti';

type Screen = 'intro' | 'test' | 'result';

type AppState = {
  screen: Screen;
  shuffledQuestions: Question[];
  answers: AnswerMap;
  previewMode: boolean;
  currentIndex: number;
};

const initialState: AppState = {
  screen: 'intro',
  shuffledQuestions: [],
  answers: {},
  previewMode: false,
  currentIndex: 0,
};

function startQuestionSet(): Question[] {
  const shuffledRegular = shuffle(questions);
  const insertIndex = Math.floor(Math.random() * shuffledRegular.length) + 1;
  return [...shuffledRegular.slice(0, insertIndex), specialQuestions[0], ...shuffledRegular.slice(insertIndex)];
}

export function QuizApp() {
  const [state, setState] = useState<AppState>(initialState);

  const visibleQuestions = useMemo(
    () => getVisibleQuestions(state.shuffledQuestions, state.answers, specialQuestions),
    [state.shuffledQuestions, state.answers],
  );

  const done = visibleQuestions.filter((q) => state.answers[q.id] !== undefined).length;
  const total = visibleQuestions.length;
  const complete = total > 0 && done === total;
  const percent = total ? (done / total) * 100 : 0;

  const currentIndex = Math.min(state.currentIndex, Math.max(visibleQuestions.length - 1, 0));
  const currentQuestion = visibleQuestions[currentIndex];

  const result = state.screen === 'result' ? computeResult(state.answers) : null;
  const dimSummary = result ? buildDimensionSummary(result) : [];

  function startTest(preview = false) {
    setState({
      screen: 'test',
      previewMode: preview,
      answers: {},
      shuffledQuestions: startQuestionSet(),
      currentIndex: 0,
    });
  }

  function selectAnswer(questionId: string, value: number) {
    setState((prev) => {
      const nextAnswers = { ...prev.answers, [questionId]: value };
      if (questionId === 'drink_gate_q1' && value !== 3) {
        delete nextAnswers.drink_gate_q2;
      }
      const nextVisible = getVisibleQuestions(prev.shuffledQuestions, nextAnswers, specialQuestions);
      const nextIndex = prev.currentIndex < nextVisible.length - 1 ? prev.currentIndex + 1 : prev.currentIndex;
      return { ...prev, answers: nextAnswers, currentIndex: nextIndex };
    });
  }

  function submitResult() {
    if (!complete) return;
    setState((prev) => ({ ...prev, screen: 'result' }));
  }

  function toHome() {
    setState(initialState);
  }

  const posterSrc = result ? TYPE_IMAGES[result.finalType.code] : '';

  return (
    <div className="shell">
      <section id="intro" className={`screen intro-screen ${state.screen === 'intro' ? 'active' : ''}`}>
        <div className="intro-stack">
          <div className="hero card hero-minimal intro-card">
            <h1>SBTI 人格测试</h1>
            <p className="intro-subtitle">MBTI 已经过时，SBTI 来了。</p>
            <div className="hero-actions hero-actions-single">
              <button type="button" className="btn-primary" onClick={() => startTest(false)}>
                开始测试
              </button>
            </div>
          </div>
          <p className="intro-tagline">
            本测试已由凌晨三点清醒学家、地铁口算命大师与两只流浪猫联合评审；
            完成后你将获得官方认证的 SBTI 人格类型，在任何群聊里都能率先定义自己。
          </p>
        </div>
      </section>

      <section id="test" className={`screen ${state.screen === 'test' ? 'active' : ''}`}>
        <div className="test-wrap card">
          <div className="topbar">
            <div className="progress">
              <span style={{ width: `${percent}%` }} />
            </div>
            <div className="progress-text">{done} / {total}</div>
          </div>

          <div className="question-list">
            {currentQuestion ? (
              <article className="question" key={currentQuestion.id}>
                <div className="question-meta">
                  <div className="badge">第 {currentIndex + 1} 题</div>
                  <div>{getQuestionMetaLabel(currentQuestion, state.previewMode)}</div>
                </div>
                <div className="question-title">{currentQuestion.text}</div>
                <div className="options">
                  {currentQuestion.options.map((opt, i) => {
                    const code = ['A', 'B', 'C', 'D'][i] || String(i + 1);
                    return (
                      <label className="option" key={`${currentQuestion.id}-${opt.value}`}>
                        <input
                          type="radio"
                          name={currentQuestion.id}
                          value={opt.value}
                          checked={state.answers[currentQuestion.id] === opt.value}
                          onChange={() => selectAnswer(currentQuestion.id, opt.value)}
                        />
                        <div className="option-code">{code}</div>
                        <div>{opt.label}</div>
                      </label>
                    );
                  })}
                </div>
              </article>
            ) : null}
          </div>

          <div className="actions-bottom">
            <div className="hint">
              {complete ? '都做完了。现在可以把你的电子魂魄交给结果页审判。' : '全选完才会放行。世界已经够乱了，起码把题做完整。'}
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button type="button" className="btn-secondary" onClick={toHome}>
                返回首页
              </button>
              <button type="button" className="btn-primary" disabled={!complete} onClick={submitResult}>
                提交并查看结果
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="result" className={`screen ${state.screen === 'result' ? 'active' : ''}`}>
        {result ? (
          <div className="result-wrap card">
            <div className="result-layout">
              <div className="result-top">
                <div className={`poster-box ${posterSrc ? '' : 'no-image'}`.trim()}>
                  {posterSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="poster-image" src={posterSrc} alt="人格结果图" />
                  ) : null}
                  <div className="poster-caption">{result.finalType.intro}</div>
                </div>

                <div className="type-box">
                  <div className="type-kicker">{result.modeKicker}</div>
                  <div className="type-name">
                    {result.finalType.code}（{result.finalType.cn}）
                  </div>
                  <div className="match">{result.badge}</div>
                  <div className="type-subname">{result.sub}</div>
                </div>
              </div>

              <div className="analysis-box">
                <h3>该人格的简单解读</h3>
                <p>{result.finalType.desc}</p>
              </div>

              <div className="dim-box">
                <h3>十五维度评分</h3>
                <div className="dim-list">
                  {dimSummary.map((item) => (
                    <div className="dim-item" key={item.dim}>
                      <div className="dim-item-top">
                        <div className="dim-item-name">{item.name}</div>
                        <div className="dim-item-score">
                          {item.level} / {item.score}分
                        </div>
                      </div>
                      <p>{item.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="note-box">
                <h3>友情提示</h3>
                <p>{result.special ? RESULT_COPY.funNoteSpecial : RESULT_COPY.funNoteNormal}</p>
              </div>
            </div>

            <div className="result-actions">
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button type="button" className="btn-secondary" onClick={() => startTest(false)}>
                  重新测试
                </button>
                <button type="button" className="btn-primary" onClick={toHome}>
                  回到首页
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
