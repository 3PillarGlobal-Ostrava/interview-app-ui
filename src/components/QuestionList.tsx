import {
  ArrowLeftOutlined,
  DeleteOutlined,
  LoadingOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Button, Divider, Drawer, Input, Rate, Space, Spin } from 'antd';
import Table, { ColumnsType } from 'antd/lib/table';
import {
  ColumnFilterItem,
  ColumnTitle,
  FilterConfirmProps,
  FilterDropdownProps,
} from 'antd/lib/table/interface';
import { DataIndex } from 'rc-table/lib/interface';
import React, {
  Key,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link, useParams } from 'react-router-dom';

import {
  Client,
  InterviewQuestionModel,
  QuestionListModel,
  UpdateQuestionListRequest,
} from '../services/Client';
import { getDistinctValues } from '../utils/stringUtils';
import {
  createColumnFilterProps,
  createColumnSearchProps,
  createDefaultColumnProps,
} from '../utils/tableUtils';
import styles from './QuestionLists.module.scss';

export default function QuestionList(): JSX.Element {
  const { id } = useParams<'id'>();
  const searchInput = useRef<Input>();
  const client = useMemo(() => new Client(), []);
  const [isBeingEdited, setBeingEdited] = useState<boolean>(false);
  const [list, setList] = useState<QuestionListModel>();
  useEffect(() => {
    async function loadList(): Promise<void> {
      setList(
        (await client.questionLists(Number(id), undefined, undefined))[0]
      );
    }
    loadList();
  }, [client]);

  const [allQuestions, setAllQuestions] = useState<InterviewQuestionModel[]>(
    []
  );
  useEffect(() => {
    async function loadQuestions(): Promise<void> {
      setAllQuestions(
        await client.interviewQuestions(undefined, undefined, undefined)
      );
    }
    loadQuestions();
  }, [client]);

  const [isDrawerVisible, setDrawerVisible] = useState(false);
  const [questionsToAdd, setQuestionsToAdd] = useState<
    InterviewQuestionModel[]
  >([]);
  const [questionsToRemove, setQuestionsToRemove] = useState<
    InterviewQuestionModel[]
  >([]);
  function setDrawerVisibility(value: boolean | null = null): void {
    setDrawerVisible((isCurrentlyVisible) => value ?? !isCurrentlyVisible);
  }

  const [searchText, setSearchText] = useState<React.Key>('');

  const handleSearch = (
    selectedKeys: React.Key[],
    confirm: (param: FilterConfirmProps | undefined) => void
  ): void => {
    confirm({ closeDropdown: true });
    setSearchText(selectedKeys[0]);
  };

  const handleReset = (
    clearFilters: () => void,
    confirm: (param: FilterConfirmProps | undefined) => void
  ): void => {
    clearFilters();
    setSearchText('');
    confirm({ closeDropdown: true });
  };

  const tableColumns = useCallback(
    (data: InterviewQuestionModel[]): ColumnsType<InterviewQuestionModel> => {
      return [
        {
          ...createColumnSearchProps(
            'title',
            searchInput,
            handleSearch,
            handleReset
          ),
        },
        {
          ...createColumnFilterProps(
            'category',
            data
              .map((value) => value.category!.toString())
              .filter((value) => value !== undefined)!
          ),
        },
        {
          ...createColumnSearchProps(
            'content',
            searchInput,
            handleSearch,
            handleReset
          ),
        },
        {
          ...createColumnFilterProps(
            'difficulty',
            data
              .map((value) => value.difficulty!.toString())
              .filter((value) => value !== undefined)!
          ),
          sorter: (a: InterviewQuestionModel, b: InterviewQuestionModel) =>
            a.difficulty != null && b.difficulty != null
              ? a.difficulty - b.difficulty
              : 1,
          render: (value: number) => <Rate disabled value={value} />,
        },
      ];
    },
    [isBeingEdited, searchText, list]
  );

  const removeFromAddDrawer = (question: InterviewQuestionModel): void => {
    setQuestionsToAdd((old) => old.filter((q) => q.id !== question.id));
  };

  const removeFromRemoveDrawer = (question: InterviewQuestionModel): void => {
    setQuestionsToRemove((old) => old.filter((q) => q.id !== question.id));
  };

  const clearDrawerQuestions = (): void => {
    questionsToAdd.forEach((question) => removeFromAddDrawer(question));
    questionsToRemove.forEach((question) => removeFromRemoveDrawer(question));
    setBeingEdited(false);
  };

  const saveChanges = (): void => {
    client
      .update2(
        new UpdateQuestionListRequest({
          id: list?.id,
          title: list?.title,
          description: list?.description,
          questionsToAdd: questionsToAdd.map((q) => q.id!),
          questionsToRemove: questionsToRemove.map((q) => q.id!),
        })
      )
      .then(() => {
        setList(
          (old) =>
            new QuestionListModel({
              ...old,
              interviewQuestions: [
                ...(old?.interviewQuestions?.filter(
                  (q) => !questionsToRemove.map((rq) => rq.id).includes(q.id)
                ) ?? []),
                ...questionsToAdd,
              ],
            })
        );
        clearDrawerQuestions();
      });
  };

  const existingQuestionsTableColumns = useMemo(
    () => [
      {
        title: 'Questions added to list',
        children: [
          ...tableColumns(list?.interviewQuestions ?? []),
          {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
              <Button
                type="link"
                onClick={() => setQuestionsToRemove((old) => [...old, record])}
              >
                Remove
              </Button>
            ),
          },
        ],
      },
    ],
    [tableColumns, list]
  );

  const addableQuestionsTableColumns = useMemo(
    () => [
      {
        title: 'Questions you can add to list',
        children: [
          ...tableColumns(allQuestions),
          {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
              <Button
                type="link"
                onClick={() => setQuestionsToAdd((old) => [...old, record])}
              >
                Add
              </Button>
            ),
          },
        ],
      },
    ],
    [tableColumns, allQuestions]
  );

  const addableQuestions = useMemo(
    () =>
      allQuestions.filter(
        (question) =>
          !list?.interviewQuestions?.map((q) => q.id).includes(question.id) &&
          !questionsToAdd.map((q) => q.id).includes(question.id)
      ),
    [list, allQuestions, questionsToAdd]
  );

  const displayableQuestions = useMemo(() => {
    return list?.interviewQuestions?.filter(
      (question) => !questionsToRemove.map((q) => q.id).includes(question.id)
    );
  }, [list, questionsToRemove]);

  const questionsElement = useMemo(() => {
    if (list?.interviewQuestions) {
      return isBeingEdited ? (
        <Space direction="vertical">
          <Table
            dataSource={displayableQuestions}
            columns={existingQuestionsTableColumns}
          />
          <Table
            dataSource={addableQuestions}
            columns={addableQuestionsTableColumns}
          />
        </Space>
      ) : (
        <Table
          dataSource={displayableQuestions}
          columns={tableColumns(list.interviewQuestions)}
        />
      );
    }

    return <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} />} />;
  }, [
    isBeingEdited,
    list,
    allQuestions,
    tableColumns,
    displayableQuestions,
    addableQuestions,
    questionsToAdd,
    questionsToRemove,
  ]);

  const headerElement = useMemo(() => {
    if (isBeingEdited) {
      return (
        <>
          <h3>{list?.title}</h3>
          <Space>
            <Button onClick={() => setDrawerVisibility(true)}>Open</Button>
            <Button onClick={clearDrawerQuestions}>Discard</Button>
            <Button type="primary" onClick={saveChanges}>
              Save
            </Button>
          </Space>
        </>
      );
    }

    return (
      <>
        <Link to="/" style={{ color: 'black', padding: 5 }}>
          <ArrowLeftOutlined />
        </Link>
        <h3>{list?.title}</h3>
        <Button type="primary" onClick={() => setBeingEdited(true)}>
          Edit
        </Button>
      </>
    );
  }, [isBeingEdited, list, questionsToAdd, questionsToRemove]);

  return (
    <div className={styles.questionLists}>
      <div className={styles.questionListsHeader}>
        {headerElement}
        <Drawer
          title="Question Cart"
          placement="left"
          onClose={() => setDrawerVisibility(false)}
          visible={isDrawerVisible}
        >
          {questionsToAdd.map((question) => (
            <>
              <Space>
                <strong>Add: </strong>
                {question.title}
                <DeleteOutlined onClick={() => removeFromAddDrawer(question)} />
              </Space>
              <Divider />
            </>
          ))}
          {questionsToRemove.map((question) => (
            <>
              <Space>
                <strong>Remove: </strong>
                {question.title}
                <DeleteOutlined
                  onClick={() => removeFromRemoveDrawer(question)}
                />
              </Space>
              <Divider />
            </>
          ))}
        </Drawer>
      </div>
      <div className={styles.questionListsData}>{questionsElement}</div>
    </div>
  );
}
