import React, { useEffect, useState } from 'react';
import { Typography, List, Button, Popconfirm, Tooltip, Select } from 'antd';
import {
  PlusOutlined,
  CloseOutlined,
  QuestionCircleOutlined,
  QuestionOutlined,
} from '@ant-design/icons';
import '../style/App.global.scss';
import { PROCESS_STAT } from '../../constants';

const { Title } = Typography;
const { Option } = Select;

const { ipcRenderer } = electron;

const Exclude: React.FunctionComponent = () => {
  const [excludes, setExcludes] = useState<IExclude[]>([]);

  useEffect(() => {
    const data = ipcRenderer.getExcludes();
    setExcludes(data);
  }, []);

  useEffect(() => {
    ipcRenderer.on('selectedExcludeFile', () => {
      const data = ipcRenderer.getExcludes();
      setExcludes(data);
    });

    return () => {
      ipcRenderer.removeAllListeners('selectedExcludeFile');
    };
  }, []);

  const handleAddClick = () => {
    ipcRenderer.openExcludeDialog();
  };

  const handleRemoveClick = (index: number) => {
    const copyExcludes = [...excludes];
    copyExcludes.splice(index, 1);
    setExcludes(copyExcludes);
    ipcRenderer.updateExcludes(copyExcludes);
  };

  const handleStateChange = (value: number, index: number) => {
    const copyExcludes = [...excludes];
    copyExcludes[index].status = value;
    setExcludes(copyExcludes);
    ipcRenderer.updateExcludes(copyExcludes);
  };

  return (
    <div className="exclude">
      <div className="exclude-title">
        <Title level={4} style={{ margin: 0 }}>
          例外程序
        </Title>
        <Tooltip title="以下程序运行时，工作状态将暂停">
          <QuestionOutlined style={{ fontSize: 14, color: '#9a9a9a' }} />
        </Tooltip>
      </div>
      <List
        style={{
          background: '#fff',
          height: 400,
          overflow: 'auto',
        }}
        locale={{ emptyText: '暂无数据' }}
        bordered
        dataSource={excludes}
        renderItem={(item, index) => (
          <List.Item>
            <Typography.Text className="exclude-item">
              {item.name}
            </Typography.Text>
            <div>
              <Select
                style={{ width: 95 }}
                size="small"
                value={item.status}
                onChange={(value) => handleStateChange(value, index)}
              >
                <Option value={PROCESS_STAT.OPEN}>运行时</Option>
                <Option value={PROCESS_STAT.FOREGROUND}>前台运行</Option>
              </Select>
              <Popconfirm
                onConfirm={() => handleRemoveClick(index)}
                okText="确认"
                cancelText="取消"
                title="确认删除？"
                icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
              >
                <Button
                  type="text"
                  shape="circle"
                  icon={<CloseOutlined />}
                  size="small"
                />
              </Popconfirm>
            </div>
          </List.Item>
        )}
      />
      <div style={{ marginTop: 10 }}>
        <Button
          ghost
          size="small"
          icon={<PlusOutlined />}
          type="primary"
          onClick={handleAddClick}
        >
          添加
        </Button>
      </div>
    </div>
  );
};

export default Exclude;
