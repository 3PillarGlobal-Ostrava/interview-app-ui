import { LoadingOutlined } from '@ant-design/icons';
import { Button, Empty, Input, Modal, Space, Spin, Table, Tag } from 'antd';
import React, { useEffect, useState } from 'react';

import {
  Client,
  CreateQuestionListRequest,
  InterviewQuestionModel,
  QuestionListModel,
} from '../services/ApiClient';
import styles from './QuestionListsView.module.scss';

const { TextArea } = Input;

export default function QuestionLists(): JSX.Element {
  const client = new Client('https://localhost:5001');
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [lists, setLists] = useState<QuestionListModel[] | null>();
  const colors: string[] = [
    'red',
    'blue',
    'green',
    'orange',
    'purple',
    'yellow',
    'black',
  ];
  const colorIndex = 0;
  let hashmap = new Map<string, string>();

  useEffect(() => {
    async function loadLists(): Promise<void> {
      const data = await client.questionLists(undefined, undefined);
      setLists(data);
    }
    loadLists();
  }, []);

  function setModalVisibility(value: boolean | null = null): void {
    setPopupVisible((isCurrentlyVisible) => value || !isCurrentlyVisible);
  }

  function createList(): void {
    const request = new CreateQuestionListRequest({
      title: titleInput,
      description: descriptionInput,
    });
    client.create2(request).then((model) => {
      setLists([...lists!, model]);
    });
    setModalVisibility(false);
  }

  function nextColor(): string {
    return colors[(colorIndex + 1) % colors.length];
  }

  function colorByCategory(category: string): string {
    if (!hashmap.has(category)) {
      hashmap = hashmap.set(category, nextColor());
    }
    return hashmap.get(category)!;
  }

  function getDistinctCategories(
    questions: InterviewQuestionModel[]
  ): string[] {
    const set = new Set<string>();
    questions
      ?.map((question) => question.category)
      .filter((category) => category !== undefined)
      .forEach((category) => {
        set.add(category!);
      });
    return Array.from(set);
  }

  const tableColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Categories',
      dataIndex: 'interviewQuestions',
      key: 'categories',
      render: (interviewQuestions: InterviewQuestionModel[]) => (
        <>
          {getDistinctCategories(interviewQuestions).map((category, index) => {
            return (
              <Tag key={index} color={colorByCategory(category)}>
                {category}
              </Tag>
            );
          })}
        </>
      ),
    },
    {
      title: 'Options',
      key: 'options',
      render: () => (
        <div>
          <Button type="link">View</Button>
          <Button type="link">Start Interview</Button>
          <Button type="link" danger>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.questionLists}>
      <div className={styles.questionListsHeader}>
        <h3>Question Lists</h3>
        <Button type="primary" onClick={() => setModalVisibility(true)}>
          Create a New List
        </Button>
      </div>
      <Modal
        title="New Question List"
        visible={isPopupVisible}
        okButtonProps={{ disabled: titleInput === '' }}
        onOk={createList}
        onCancel={() => setModalVisibility(false)}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input
            placeholder="Title"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
          />
          <TextArea
            placeholder="Description"
            value={descriptionInput}
            onChange={(e) => setDescriptionInput(e.target.value)}
            rows={4}
          />
        </Space>
      </Modal>
      <div className={styles.questionListsData}>
        {lists ? (
          lists.length ? (
            <Table dataSource={lists} columns={tableColumns} />
          ) : (
            <Empty description="No question lists" />
          )
        ) : (
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} />} />
        )}
      </div>
    </div>
  );
}
