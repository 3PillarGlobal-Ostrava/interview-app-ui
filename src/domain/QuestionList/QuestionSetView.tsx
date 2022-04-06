import { LoadingOutlined } from '@ant-design/icons';
import { Col, List, Row, Spin } from 'antd';
import React from 'react';

import { QuestionModel, QuestionSetDetail } from '../../services/Client';
import QuestionCard from '../Question/QuestionCard/QuestionCard';
import AverageDifficultyCircle from './AverageDifficultyCircle';
import DistinctCategoryTags from './DistinctCategoryTags';
import styles from './QuestionSetView.module.scss';
import QuestionSetViewHeader from './QuestionSetViewHeader';

export default function QuestionSetView({
  list,
  removeQuestionFromListCallback,
  updateTitleCallback,
}: {
  list: QuestionSetDetail | undefined;
  removeQuestionFromListCallback: (id: number) => void;
  updateTitleCallback: (title: string) => void;
}): JSX.Element {
  if (!list) {
    return <Spin indicator={<LoadingOutlined />} />;
  }

  return (
    <Row className={`${styles.questionSetBackground} full-height`}>
      <Col span={1} />
      <Col span={22}>
        <QuestionSetViewHeader
          title={list?.questionSet?.title ?? ''}
          createdBy="anonymous"
          updateTitleCallback={updateTitleCallback}
        />
        <div className={styles.questionSetView}>
          <AverageDifficultyCircle percent={80} />
          <p>
            This set contains {list.questions?.length} questions with the
            following tags:
          </p>
          <DistinctCategoryTags />
        </div>
        <p>Questions in this set ({list.questions?.length}):</p>
        <List
          dataSource={list.questions}
          renderItem={(question: QuestionModel) => (
            <QuestionCard
              key={question.id}
              question={question}
              tagColor="cyan"
              deleteClickedCallback={removeQuestionFromListCallback}
            />
          )}
        />
      </Col>
      <Col span={1} />
    </Row>
  );
}
