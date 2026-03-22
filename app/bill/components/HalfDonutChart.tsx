'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import { COLOR } from '@/app/common/constants/theme';

// TODO: 툴팁 UI 수정 후 다시 활성화 — 관련 코드 제거됨, git history 참조

// 정당 투표 정보 인터페이스
interface PartyVote {
  party_info: {
    party_id: number;
    party_name: string;
    party_image_url: string;
  };
  party_approval_count: number;
}

// 차트 Props 인터페이스
interface HalfDonutChartProps {
  billResult: string;
  approvalCount: number;
  totalVoteCount: number;
  partyVoteList: PartyVote[];
  width?: number;
  height?: number;
}

// 차트 컬러 매핑 함수
const getChartColor = (index: number): string => {
  const colors = [
    'var(--color-chart-1)',
    'var(--color-chart-2)',
    'var(--color-chart-3)',
    'var(--color-chart-4)',
    'var(--color-chart-5)',
  ];
  return colors[index % colors.length];
};

export default function HalfDonutChart({
  billResult,
  approvalCount,
  totalVoteCount,
  partyVoteList,
  width = 300,
  height = 140,
}: HalfDonutChartProps) {
  // ----- 하프 도넛 최대값(의석 수) 고정 -----
  const MAX_COUNT = 300; // 전체 의석 수

  // 승인율 계산 (MAX_COUNT 대비 승인 비율)
  const approvalPercentage = useMemo(() => {
    const percentage = (approvalCount / MAX_COUNT) * 100;
    return Math.min(percentage, 100); // 100% 초과 방지
  }, [approvalCount]);

  // 애니메이션을 위한 상태
  const [animatedValue, setAnimatedValue] = useState(0);
  const prevTotalValueRef = useRef(0);

  // 애니메이션 효과
  useEffect(() => {
    const startValue = prevTotalValueRef.current;
    const duration = 1000;
    const startTime = Date.now();
    let rafId: number;

    const animateValue = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutProgress = 1 - (1 - progress) ** 3;
      const currentValue = startValue + (approvalPercentage - startValue) * easeOutProgress;
      setAnimatedValue(currentValue);

      if (progress < 1) {
        rafId = requestAnimationFrame(animateValue);
      } else {
        setAnimatedValue(approvalPercentage);
        prevTotalValueRef.current = approvalPercentage;
      }
    };

    rafId = requestAnimationFrame(animateValue);
    return () => cancelAnimationFrame(rafId);
  }, [approvalPercentage]);

  // SVG 크기와 반지름 정의
  const mainDonutThickness = 25; // 주 도넛 두께
  const subDonutThickness = 5; // 서브 도넛 두께
  const margin = 10; // 여백
  const cornerRadius = 10; // 도넛 끝의 둥근 반경

  // 반지름 계산 (메인 도넛의 바깥쪽 반지름)
  const outerRadius = Math.min(width, height * 2) / 2 - margin - 10; // 약간 더 작게 조정
  const innerRadius = outerRadius - mainDonutThickness;
  const subOuterRadius = outerRadius + margin;
  const subInnerRadius = subOuterRadius - subDonutThickness;

  // 중심점 설정
  const centerX = width / 2;
  const centerY = height;

  // 배경 아크 경로
  const backgroundArcPath = d3
    .arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)
    .startAngle(-Math.PI / 2)
    .endAngle(Math.PI / 2)
    .cornerRadius(cornerRadius)({
    innerRadius,
    outerRadius,
    startAngle: -Math.PI / 2,
    endAngle: Math.PI / 2,
  });

  // 진행 상태 아크 경로 (애니메이션 값 사용)
  const progressEndAngle = (animatedValue / 100) * Math.PI - Math.PI / 2;
  const progressArcPath = d3
    .arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)
    .startAngle(-Math.PI / 2)
    .endAngle(progressEndAngle)
    .cornerRadius(cornerRadius)({
    innerRadius,
    outerRadius,
    startAngle: -Math.PI / 2,
    endAngle: progressEndAngle,
  });

  // ----- 임계값(50%) 관련 계산 -----
  const thresholdValue = totalVoteCount * 0.5; // totalVoteCount의 50%
  const progressColor = approvalCount >= thresholdValue ? '#3CC692' : '#EB6969'; // 임계값 초과 여부에 따른 색상

  // 하프 도넛 스케일은 MAX_COUNT(300)를 100%로 보정하므로,
  // 임계값(투표수 절반)을 MAX_COUNT 대비 비율로 변환
  const thresholdFraction = thresholdValue / MAX_COUNT; // 0~0.5 범위

  // 임계값 각도
  const thresholdAngle = -Math.PI + thresholdFraction * Math.PI;

  // 임계선 길이를 좀 더 길게(메인 아크 두께를 넘어) 표시하기 위한 확장값
  const thresholdLineOuterExtension = 5; // 바깥 방향 확장(px)
  const thresholdLineInnerExtension = 5; // 안쪽 방향 확장(px)

  // 임계값 점선 좌표 (innerRadius - innerExtension) ~ (outerRadius + outerExtension)
  const thresholdX1 = centerX + Math.cos(thresholdAngle) * (innerRadius - thresholdLineInnerExtension);
  const thresholdY1 = centerY + Math.sin(thresholdAngle) * (innerRadius - thresholdLineInnerExtension);
  const thresholdX2 = centerX + Math.cos(thresholdAngle) * (outerRadius + thresholdLineOuterExtension);
  const thresholdY2 = centerY + Math.sin(thresholdAngle) * (outerRadius + thresholdLineOuterExtension);

  // 서브 아크를 위한 최소 각도 (라디안)
  const MIN_ARC_ANGLE = 0.08; // 약 4.58도

  // 정당별 누적 백분율 계산 및 서브 아크 생성
  const partyArcs = useMemo(() => {
    // 작은 정당들의 시각적 표현을 위한 크기 조정
    const MIN_VISUAL_PERCENTAGE = 5; // 최소 5% 시각적 크기

    // 먼저 모든 정당의 실제 백분율 계산
    const partiesWithPercentage = partyVoteList.map((party) => {
      const percentage = (party.party_approval_count / MAX_COUNT) * 100;
      return {
        party,
        percentage,
        // 표시 백분율: 실제 백분율이 최소값보다 작으면 최소값으로, 아니면 실제 백분율 사용
        visualPercentage: Math.max(percentage, MIN_VISUAL_PERCENTAGE),
      };
    });

    // 메인 아크의 현재 진행 상태에 맞춘 최대 각도 계산
    const maxAvailableAngle = (animatedValue / 100) * Math.PI; // 메인 아크의 현재 진행 각도

    // 정당 수에 따른 동적 최소 각도 계산
    const partyCount = partiesWithPercentage.length;
    const totalGapAngle = partyCount * 0.02; // 각 정당 간 간격 (0.01 * 2)
    const availableAngleForArcs = Math.max(0, maxAvailableAngle - totalGapAngle);

    // 동적 최소 각도: 사용 가능한 각도를 정당 수로 나눈 값과 기존 MIN_ARC_ANGLE 중 작은 값
    const dynamicMinArcAngle = Math.min(MIN_ARC_ANGLE, availableAngleForArcs / partyCount);

    // 시각적 백분율의 합계 계산
    const totalVisualPercentage = partiesWithPercentage.reduce((sum, item) => sum + item.visualPercentage, 0);

    // 시각적 백분율을 메인 아크의 현재 진행률에 맞춰 스케일링
    let scaleFactor = 1;
    if (totalVisualPercentage > animatedValue) {
      scaleFactor = animatedValue / totalVisualPercentage;
    }

    // 누적 백분율 계산 및 아크 생성
    let cumulativePercentage = 0;

    return partiesWithPercentage.map((item, index) => {
      const startPercentage = cumulativePercentage;
      // 시각적 백분율에 스케일 팩터 적용
      const adjustedVisualPercentage = item.visualPercentage * scaleFactor;
      cumulativePercentage += adjustedVisualPercentage;

      // 각도로 변환 (백분율을 메인 아크 진행 범위 내 각도로)
      const startAngle = (startPercentage / 100) * Math.PI - Math.PI / 2;
      const endAngle = (cumulativePercentage / 100) * Math.PI - Math.PI / 2;

      // 간격을 위한 조정
      const adjustedStartAngle = startAngle + 0.01;
      const maxEndAngle = (animatedValue / 100) * Math.PI - Math.PI / 2 - 0.01; // 메인 아크 최대 각도
      const adjustedEndAngle = Math.min(endAngle - 0.01, maxEndAngle);

      // 최소 각도 보장하되 메인 아크 범위를 넘지 않도록 제한
      const finalEndAngle = Math.min(Math.max(adjustedEndAngle, adjustedStartAngle + dynamicMinArcAngle), maxEndAngle);

      const arcPath = d3
        .arc()
        .innerRadius(subInnerRadius)
        .outerRadius(subOuterRadius)
        .startAngle(adjustedStartAngle)
        .endAngle(finalEndAngle)
        .cornerRadius(cornerRadius / 2)({
        innerRadius: subInnerRadius,
        outerRadius: subOuterRadius,
        startAngle: adjustedStartAngle,
        endAngle: finalEndAngle,
      });

      return {
        party: item.party,
        percentage: item.percentage,
        startPercentage,
        endPercentage: cumulativePercentage,
        color: getChartColor(index),
        arcPath,
      };
    });
  }, [partyVoteList, animatedValue]);

  return (
    <div className="flex relative flex-col items-center">
      {/* SVG 차트 */}
      <svg width={width} height={height}>
        {/* 배경 반원 */}
        <path d={backgroundArcPath ?? ''} fill="#e6e6e6" transform={`translate(${centerX}, ${centerY})`} />

        {/* 진행 상태를 표시하는 반원 */}
        <path d={progressArcPath ?? ''} fill={progressColor} transform={`translate(${centerX}, ${centerY})`} />

        {/* 임계값(50%) 점선 */}
        <line
          x1={thresholdX1}
          y1={thresholdY1}
          x2={thresholdX2}
          y2={thresholdY2}
          stroke="#FEC13F"
          strokeWidth={4}
          strokeDasharray="5,6"
          strokeLinecap="round"
        />

        {/* 정당별 서브 아크 */}
        {partyArcs.map((partyArc) => (
          <path
            key={partyArc.party.party_info.party_id}
            d={partyArc.arcPath ?? ''}
            fill={COLOR[partyArc.party.party_info.party_name as keyof typeof COLOR]}
            transform={`translate(${centerX}, ${centerY})`}
            aria-label={`${partyArc.party.party_info.party_name}: ${partyArc.party.party_approval_count}`}
            role="graphics-symbol"
          />
        ))}

        {/* 투표 상태 */}
        <text
          x={centerX}
          y={centerY - 55}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-lg font-semibold">
          {billResult}
        </text>

        {/* 투표 결과 비율 */}
        <text
          x={centerX}
          y={centerY - 20}
          textAnchor="middle"
          dominantBaseline="middle"
          className="flex items-end text-2xl font-medium">
          <tspan className="text-2xl font-bold">{approvalCount}</tspan>
          <tspan className="text-sm font-normal"> / {MAX_COUNT}</tspan>
        </text>
      </svg>
    </div>
  );
}
