'use client';

import { useMemo } from 'react';
import type { ClientFactFindForm } from '@/lib/fact-find/form-state';
import { RATE_OPTIONS, type FactFindQuestion } from '@/components/fact-find/questions/question-registry';
import { calculateLTV } from '@ko/utils';

function LtvPanel({ value, mortgage }: { value: string; mortgage: string }) {
  const pv = parseFloat(value.replace(/,/g, '')) || 0;
  const ma = parseFloat(mortgage.replace(/,/g, '')) || 0;
  const ltv = pv > 0 ? calculateLTV(ma, pv) : 0;

  let panelClass = 'ff-ltv-panel';
  let numClass = 'ff-ltv-num';
  if (ltv > 0 && ltv <= 80) {
    panelClass += ' ff-ltv-ok';
    numClass += ' ff-ltv-ok';
  } else if (ltv > 80 && ltv <= 90) {
    panelClass += ' ff-ltv-warn';
    numClass += ' ff-ltv-warn';
  } else if (ltv > 90) {
    panelClass += ' ff-ltv-danger';
    numClass += ' ff-ltv-danger';
  }

  return (
    <div className={panelClass}>
      <p className="text-sm font-semibold text-[#71717a]">Loan to value (LTV)</p>
      <p className={numClass}>{ltv > 0 ? `${ltv}%` : '—'}</p>
      <p className="mt-1 text-xs text-[#71717a]">
        {ltv <= 80 ? 'Within typical lending range' : ltv <= 90 ? 'Higher LTV — more options may apply' : 'Very high LTV'}
      </p>
    </div>
  );
}

function QuestionFields({
  question,
  form,
  onChange,
}: {
  question: FactFindQuestion;
  form: ClientFactFindForm;
  onChange: (updater: (prev: ClientFactFindForm) => ClientFactFindForm) => void;
}) {
  switch (question.fieldType) {
    case 'name-group':
      return (
        <div className="ff-grid-4">
          <div>
            <label className="ff-field-label">Title</label>
            <select
              className="ff-box-select w-full"
              value={form.client1Personal.title}
              onChange={(e) =>
                onChange((f) => ({
                  ...f,
                  client1Personal: { ...f.client1Personal, title: e.target.value },
                }))
              }
            >
              <option value="">Select</option>
              <option value="Mr">Mr</option>
              <option value="Mrs">Mrs</option>
              <option value="Ms">Ms</option>
              <option value="Miss">Miss</option>
              <option value="Dr">Dr</option>
            </select>
          </div>
          <div>
            <label className="ff-field-label">
              First name<span className="ff-req">*</span>
            </label>
            <div className="ff-box-wrap">
              <input
                className="ff-box-input"
                value={form.client1Personal.firstName}
                onChange={(e) =>
                  onChange((f) => ({
                    ...f,
                    client1Personal: { ...f.client1Personal, firstName: e.target.value },
                  }))
                }
                placeholder="Sarah"
              />
            </div>
          </div>
          <div>
            <label className="ff-field-label">Middle name</label>
            <div className="ff-box-wrap">
              <input
                className="ff-box-input"
                value={form.client1Personal.middleName}
                onChange={(e) =>
                  onChange((f) => ({
                    ...f,
                    client1Personal: { ...f.client1Personal, middleName: e.target.value },
                  }))
                }
                placeholder="Optional"
              />
            </div>
          </div>
          <div>
            <label className="ff-field-label">
              Surname<span className="ff-req">*</span>
            </label>
            <div className="ff-box-wrap">
              <input
                className="ff-box-input"
                value={form.client1Personal.lastName}
                onChange={(e) =>
                  onChange((f) => ({
                    ...f,
                    client1Personal: { ...f.client1Personal, lastName: e.target.value },
                  }))
                }
                placeholder="Johnson"
              />
            </div>
          </div>
        </div>
      );

    case 'text':
      if (question.id === 'c1-dob') {
        return (
          <div className="ff-uinput-wrap">
            <input
              className="ff-uinput"
              type="date"
              value={form.client1Personal.dateOfBirth}
              onChange={(e) =>
                onChange((f) => ({
                  ...f,
                  client1Personal: { ...f.client1Personal, dateOfBirth: e.target.value },
                }))
              }
            />
          </div>
        );
      }
      return (
        <div className="ff-uinput-wrap">
          <input
            className="ff-uinput"
            value={form.client1Income.niNumber}
            onChange={(e) =>
              onChange((f) => ({
                ...f,
                client1Income: { ...f.client1Income, niNumber: e.target.value },
              }))
            }
            placeholder="QQ 12 34 56 C"
          />
        </div>
      );

    case 'contact-group':
      return (
        <div className="ff-grid-2">
          <div>
            <label className="ff-field-label">
              Phone<span className="ff-req">*</span>
            </label>
            <div className="ff-box-wrap">
              <input
                className="ff-box-input"
                value={form.client1Personal.phone}
                onChange={(e) =>
                  onChange((f) => ({
                    ...f,
                    client1Personal: { ...f.client1Personal, phone: e.target.value },
                  }))
                }
              />
            </div>
          </div>
          <div>
            <label className="ff-field-label">Email</label>
            <div className="ff-box-wrap">
              <input
                className="ff-box-input"
                type="email"
                value={form.client1Personal.email}
                onChange={(e) =>
                  onChange((f) => ({
                    ...f,
                    client1Personal: { ...f.client1Personal, email: e.target.value },
                  }))
                }
              />
            </div>
          </div>
        </div>
      );

    case 'pills': {
      const isJoint = question.id === 'joint';
      const isMarital = question.id === 'c1-marital';
      const isEmp = question.id === 'c1-emp';
      const isPropType = question.id === 'prop-type';

      const value = isJoint
        ? form.hasJointApplicant
          ? 'yes'
          : 'no'
        : isMarital
          ? form.client1Personal.maritalStatus
          : isEmp
            ? form.client1Employment.status
            : isPropType
              ? form.property.propertyType
              : '';

      return (
        <div className="ff-pills-wrap">
          {(question.pillOptions ?? []).map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`ff-pill ${value === opt.value ? 'ff-active' : ''}`}
              onClick={() => {
                onChange((f) => {
                  if (isJoint) {
                    return { ...f, hasJointApplicant: opt.value === 'yes' };
                  }
                  if (isMarital) {
                    return {
                      ...f,
                      client1Personal: { ...f.client1Personal, maritalStatus: opt.value },
                    };
                  }
                  if (isEmp) {
                    return {
                      ...f,
                      client1Employment: { ...f.client1Employment, status: opt.value },
                    };
                  }
                  if (isPropType) {
                    return {
                      ...f,
                      property: { ...f.property, propertyType: opt.value },
                    };
                  }
                  return f;
                });
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      );
    }

    case 'employer-group':
      return (
        <div className="ff-grid-2">
          <div>
            <label className="ff-field-label">Employer name</label>
            <div className="ff-box-wrap">
              <input
                className="ff-box-input"
                value={form.client1Employment.employerName}
                onChange={(e) =>
                  onChange((f) => ({
                    ...f,
                    client1Employment: { ...f.client1Employment, employerName: e.target.value },
                  }))
                }
              />
            </div>
          </div>
          <div>
            <label className="ff-field-label">Job title</label>
            <div className="ff-box-wrap">
              <input
                className="ff-box-input"
                value={form.client1Employment.jobTitle}
                onChange={(e) =>
                  onChange((f) => ({
                    ...f,
                    client1Employment: { ...f.client1Employment, jobTitle: e.target.value },
                  }))
                }
              />
            </div>
          </div>
        </div>
      );

    case 'currency':
      return (
        <div className="ff-box-wrap max-w-xs">
          <span className="ff-box-pfx">£</span>
          <input
            className="ff-box-input"
            inputMode="decimal"
            value={form.client1Income.grossSalary}
            onChange={(e) =>
              onChange((f) => ({
                ...f,
                client1Income: { ...f.client1Income, grossSalary: e.target.value },
              }))
            }
            placeholder="45,000"
          />
        </div>
      );

    case 'property-value-group':
      return (
        <>
          <div className="ff-grid-2">
            <div>
              <label className="ff-field-label">
                Property value<span className="ff-req">*</span>
              </label>
              <div className="ff-box-wrap">
                <span className="ff-box-pfx">£</span>
                <input
                  className="ff-box-input"
                  value={form.property.propertyValue}
                  onChange={(e) =>
                    onChange((f) => ({
                      ...f,
                      property: { ...f.property, propertyValue: e.target.value },
                    }))
                  }
                />
              </div>
            </div>
            <div>
              <label className="ff-field-label">
                Mortgage amount<span className="ff-req">*</span>
              </label>
              <div className="ff-box-wrap">
                <span className="ff-box-pfx">£</span>
                <input
                  className="ff-box-input"
                  value={form.property.mortgageAmount}
                  onChange={(e) =>
                    onChange((f) => ({
                      ...f,
                      property: { ...f.property, mortgageAmount: e.target.value },
                    }))
                  }
                />
              </div>
            </div>
          </div>
          <LtvPanel value={form.property.propertyValue} mortgage={form.property.mortgageAmount} />
        </>
      );

    case 'textarea':
      return (
        <textarea
          className="ff-utextarea"
          value={form.preferences.goals}
          onChange={(e) =>
            onChange((f) => ({
              ...f,
              preferences: { ...f.preferences, goals: e.target.value },
            }))
          }
          placeholder="e.g. Buy my first home, remortgage to a better rate…"
        />
      );

    case 'rate-prefs':
      return (
        <div className="ff-pills-wrap">
          {RATE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`ff-pill ${form.preferences.ratePreference === opt.value ? 'ff-active' : ''}`}
                onClick={() =>
                  onChange((f) => ({
                    ...f,
                    preferences: { ...f.preferences, ratePreference: opt.value },
                  }))
                }
              >
                {opt.label}
            </button>
          ))}
        </div>
      );

    case 'yesno-detail': {
      const isMissed = question.id === 'ac-c1-missed';
      const isCcj = question.id === 'ac-c1-ccj';
      const yes = isMissed ? form.adverseCredit.missedPayments : form.adverseCredit.ccjOrIva;
      const detail = isMissed
        ? form.adverseCredit.missedPaymentsDetail
        : form.adverseCredit.ccjOrIvaDetail;

      return (
        <>
          <div className="ff-yesno-wrap">
            <button
              type="button"
              className={`ff-yn ${yes ? 'ff-yn-yes' : ''}`}
              onClick={() =>
                onChange((f) => ({
                  ...f,
                  adverseCredit: {
                    ...f.adverseCredit,
                    ...(isMissed
                      ? { missedPayments: true }
                      : { ccjOrIva: true }),
                  },
                }))
              }
            >
              Yes
            </button>
            <button
              type="button"
              className={`ff-yn ${!yes ? 'ff-yn-no' : ''}`}
              onClick={() =>
                onChange((f) => ({
                  ...f,
                  adverseCredit: {
                    ...f.adverseCredit,
                    ...(isMissed
                      ? { missedPayments: false, missedPaymentsDetail: '' }
                      : { ccjOrIva: false, ccjOrIvaDetail: '' }),
                  },
                }))
              }
            >
              No
            </button>
          </div>
          {yes && (
            <textarea
              className="ff-detail-ta"
              value={detail}
              onChange={(e) =>
                onChange((f) => ({
                  ...f,
                  adverseCredit: {
                    ...f.adverseCredit,
                    ...(isMissed
                      ? { missedPaymentsDetail: e.target.value }
                      : { ccjOrIvaDetail: e.target.value }),
                  },
                }))
              }
              placeholder="Please provide details…"
            />
          )}
        </>
      );
    }

    case 'vulnerability':
      return (
        <div className="max-h-[420px] overflow-y-auto pr-1">
          {form.vulnerabilityScores.map((domain, di) => (
            <div key={domain.domain} className="ff-vuln-domain">
              <div className="ff-vuln-dh">{domain.domain}</div>
              <div className="ff-vuln-db">
                {['How much does this affect you day to day?', 'How confident do you feel managing this?'].map(
                  (qt, qi) => (
                    <div key={qt} className="mb-3">
                      <p className="ff-vuln-qt">{qt}</p>
                      <div className="ff-vbtns">
                        {[0, 1, 2].map((score) => {
                          const selected = qi === 0 ? domain.q1 === score : domain.q2 === score;
                          return (
                            <button
                              key={score}
                              type="button"
                              className={`ff-vbtn ${selected ? `ff-vs${score}` : ''}`}
                              onClick={() =>
                                onChange((f) => {
                                  const next = [...f.vulnerabilityScores];
                                  const row = { ...next[di]! };
                                  if (qi === 0) row.q1 = score;
                                  else row.q2 = score;
                                  next[di] = row;
                                  return { ...f, vulnerabilityScores: next };
                                })
                              }
                            >
                              {score === 0 ? 'Not at all' : score === 1 ? 'Somewhat' : 'Significantly'}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      );

    default:
      return null;
  }
}

export function FactFindQuestionCard({
  question,
  questionNumber,
  form,
  onChange,
  onNext,
  onBack,
  onSkip,
  isFirst,
  isLast,
  error,
  direction,
}: {
  question: FactFindQuestion;
  questionNumber: number;
  form: ClientFactFindForm;
  onChange: (updater: (prev: ClientFactFindForm) => ClientFactFindForm) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip?: () => void;
  isFirst: boolean;
  isLast: boolean;
  error: string | null;
  direction: 'forward' | 'back';
}) {
  const sectionLabel = useMemo(() => {
    const map: Record<string, string> = {
      personal: 'PERSONAL',
      employment: 'EMPLOYMENT',
      income: 'INCOME',
      commitments: 'COMMITMENTS',
      property: 'PROPERTY',
      adverseCredit: 'ADVERSE CREDIT',
      goals: 'GOALS',
      vulnerability: 'VULNERABILITY',
    };
    return map[question.section] ?? question.section.toUpperCase();
  }, [question.section]);

  return (
    <div className={direction === 'forward' ? 'ff-slide-in' : 'ff-slide-back'}>
      <p className="ff-section-label">{sectionLabel}</p>
      <div className="ff-q-row">
        <div className="ff-q-num-wrap">
          <span>{questionNumber}</span>
          <span aria-hidden>›</span>
        </div>
        <h2 className="ff-q-label">{question.title}</h2>
      </div>
      {question.subtitle && <p className="ff-q-sub">{question.subtitle}</p>}
      <div className="ff-q-input">
        <QuestionFields question={question} form={form} onChange={onChange} />
        {question.id === 'c1-name' && (
          <label className="ff-co-applicant mt-4 flex cursor-pointer items-center gap-2 text-sm text-[#18181b]">
            <input
              type="checkbox"
              checked={form.hasJointApplicant}
              onChange={(e) =>
                onChange((f) => ({ ...f, hasJointApplicant: e.target.checked }))
              }
              className="h-4 w-4 rounded border-[#d4d4d8] accent-brand-teal-700"
            />
            Do you have a co-applicant?
          </label>
        )}
        {error && <p className="ff-field-error">{error}</p>}
      </div>
      <div id="ff-action-row">
        <button
          type="button"
          className={`ff-btn-back ${isFirst ? 'ff-invisible' : ''}`}
          onClick={onBack}
        >
          ← Back
        </button>
        <button type="button" className="ff-btn-ok" onClick={onNext}>
          {isLast ? 'Complete ✓' : 'OK ✓'}
        </button>
        <span className="ff-kbd-hint">
          press <span className="ff-kbd">Enter</span> ↵
        </span>
        <span className="ff-spacer" />
        {onSkip && !isLast && (
          <button type="button" className="ff-btn-skip" onClick={onSkip}>
            Skip &gt;
          </button>
        )}
      </div>
    </div>
  );
}
