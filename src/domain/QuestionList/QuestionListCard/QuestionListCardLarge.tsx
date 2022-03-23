import { MoreOutlined } from '@ant-design/icons';
import { Col, Dropdown, Progress, Row, Space } from 'antd';
import React from 'react';

import {
  average,
  difficultyPercentageToColor,
} from '../../../services/mathUtils';
import AverageDifficultyContent from './AverageDifficultyContent';
import styles from './QuestionListCard.module.scss';
import { QuestionListCardLargeProps } from './QuestionListCardLargeProps';

export default function QuestionListCardLarge(
  props: QuestionListCardLargeProps
): JSX.Element {
  const { list, categories, onCardClickedCallback, moreIconContent } = props;

  const percentage =
    average(
      list.interviewQuestions
        ?.filter((value) => value.difficulty !== undefined)
        ?.map((value) => value.difficulty ?? 0) ?? []
    ) * 20;

  const averageDifficultyContentElement = (
    percent: number | undefined
  ): JSX.Element => <AverageDifficultyContent percent={percent} />;

  return (
    <Row
      onClick={onCardClickedCallback}
      className={`${styles.card} ${styles.cardLarge}`}
    >
      <Col span={9}>
        <Progress
          type="circle"
          format={(percent: number | undefined) =>
            averageDifficultyContentElement(percent)
          }
          percent={Number(percentage.toFixed(2))}
          strokeColor={difficultyPercentageToColor(percentage)}
        />
      </Col>
      <Col span={13}>
        <div className={styles.cardContent}>
          <Space direction="vertical" size={0}>
            <h3>{list.title}</h3>
            <span>By Anonymous</span>
          </Space>
          <div className={styles.categories}>{categories}</div>
        </div>
      </Col>
      <Col span={2}>
        <div
          role="presentation"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={() => {
            // do nothing
          }}
        >
          <Dropdown overlay={moreIconContent} placement="topLeft">
            <MoreOutlined
              className={styles.threeDots}
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        </div>
      </Col>
    </Row>
  );
}